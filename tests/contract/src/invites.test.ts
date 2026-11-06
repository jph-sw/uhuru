import { beforeAll, describe, expect, test } from "bun:test";
import {
	Client,
	createInvite,
	createSite,
	type Invite,
	ISO_DATE,
	RUN,
	type Site,
	signedInAdmin,
} from "./client";

describe("invites and joining", () => {
	let admin: Client;
	let site: Site;

	beforeAll(async () => {
		admin = await signedInAdmin();
		site = await createSite(admin, "invites");
	});

	test("POST /api/invite returns an array with the new invite", async () => {
		const res = await admin.post("/api/invite", {
			maxUses: "3",
			siteId: site.id,
		});
		expect(res.status).toBe(200);

		const invites = res.json as Invite[];
		expect(invites).toHaveLength(1);
		expect(invites[0]).toMatchObject({ maxUses: "3", siteId: site.id });
		expect(invites[0].code).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/); // ULID
		expect(invites[0].id).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
		expect(invites[0].createdAt).toMatch(ISO_DATE);
	});

	test('maxUses defaults to "1"', async () => {
		const res = await admin.post("/api/invite", { siteId: site.id });
		expect((res.json as Invite[])[0].maxUses).toBe("1");
	});

	test("GET /api/invite/site/:siteId lists the site's invites", async () => {
		const invite = await createInvite(admin, site.id);
		const res = await admin.get(`/api/invite/site/${site.id}`);
		expect(res.status).toBe(200);
		expect(res.json).toContainEqual(invite);
		for (const i of res.json as Invite[]) expect(i.siteId).toBe(site.id);
	});

	test("GET /api/invite/:code returns an array with the invite", async () => {
		const invite = await createInvite(admin, site.id);
		const res = await new Client().get(`/api/invite/${invite.code}`);
		expect(res.status).toBe(200);
		expect(res.json).toEqual([invite]);

		const unknown = await new Client().get(`/api/invite/unknown-${RUN}`);
		expect(unknown.status).toBe(200);
		expect(unknown.json).toEqual([]);
	});

	test("GET /api/invite/check/:code is {valid:false} for unknown codes", async () => {
		const res = await new Client().get(`/api/invite/check/unknown-${RUN}`);
		expect(res.status).toBe(200);
		expect(res.json).toEqual({ valid: false });
	});

	test("join creates a client for the site and uses up the invite", async () => {
		const invite = await createInvite(admin, site.id, "1");
		const anon = new Client();

		const check = await anon.get(`/api/invite/check/${invite.code}`);
		expect(check.json).toEqual({ valid: true, invite });

		const email = `joiner-${RUN}@contract.test`;
		const join = await anon.post("/api/join", {
			code: invite.code,
			name: "Joiner",
			email,
			password: "joiner-password",
			siteId: site.id,
		});
		expect(join.status).toBe(200);
		expect(join.json).toEqual({ success: true });

		// the invite is used up (maxUses "1")
		const after = await anon.get(`/api/invite/check/${invite.code}`);
		expect(after.json).toEqual({ valid: false });

		// the new user can sign in and belongs to the site
		const client = new Client();
		const signIn = await client.signIn(email, "joiner-password");
		expect((signIn.json as { user: unknown }).user).toMatchObject({
			name: "Joiner",
			email,
			role: "user",
			site_id: site.id,
		});
		const session = await client.get("/api/auth/get-session");
		expect(session.json).toMatchObject({
			user: { email, role: "user", site_id: site.id },
		});
	});

	test("an invite can be used maxUses times", async () => {
		const invite = await createInvite(admin, site.id, "2");
		for (const n of [1, 2]) {
			const res = await new Client().post("/api/join", {
				code: invite.code,
				name: `Multi ${n}`,
				email: `multi-${n}-${RUN}@contract.test`,
				password: "multi-password",
				siteId: site.id,
			});
			expect(res.json).toEqual({ success: true });
		}
		const check = await new Client().get(`/api/invite/check/${invite.code}`);
		expect(check.json).toEqual({ valid: false });
	});

	test("joining with a used-up or unknown code answers 200 with an empty body", async () => {
		const invite = await createInvite(admin, site.id, "1");
		const join = (code: string, n: string) =>
			new Client().post("/api/join", {
				code,
				name: n,
				email: `${n}-${RUN}@contract.test`,
				password: "password-123",
				siteId: site.id,
			});

		expect((await join(invite.code, "first")).json).toEqual({ success: true });

		const used = await join(invite.code, "second");
		expect(used.status).toBe(200);
		expect(used.text).toBe("");

		const unknown = await join(`unknown-${RUN}`, "third");
		expect(unknown.status).toBe(200);
		expect(unknown.text).toBe("");

		// no account was created
		const signIn = await new Client().post("/api/auth/sign-in/email", {
			email: `second-${RUN}@contract.test`,
			password: "password-123",
		});
		expect(signIn.status).toBe(401);
	});

	test("joining with an existing email does not create a user (quirk: 200 text/plain)", async () => {
		const invite = await createInvite(admin, site.id, "5");
		const body = {
			code: invite.code,
			name: "Dup",
			email: `dup-${RUN}@contract.test`,
			password: "dup-password",
			siteId: site.id,
		};
		expect((await new Client().post("/api/join", body)).json).toEqual({
			success: true,
		});

		const again = await new Client().post("/api/join", {
			...body,
			password: "other-password",
		});
		expect(again.status).toBe(200);
		expect(again.text).toBe("User already exists. Use another email.");

		// the original password still works, the new one doesn't
		expect(
			(
				await new Client().post("/api/auth/sign-in/email", {
					email: body.email,
					password: "other-password",
				})
			).status,
		).toBe(401);
	});

	test("POST /api/join validates the body (422)", async () => {
		const res = await new Client().post("/api/join", { code: "x" });
		expect(res.status).toBe(422);
	});
});
