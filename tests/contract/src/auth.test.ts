import { describe, expect, test } from "bun:test";
import {
	ADMIN_EMAIL,
	ADMIN_PASSWORD,
	Client,
	ISO_DATE,
	ORIGIN,
	sessionCookieName,
} from "./client";

/** See docs/auth-contract.md */
describe("auth", () => {
	test("sign-in with valid credentials sets a signed session cookie", async () => {
		const client = new Client();
		const res = await client.post("/api/auth/sign-in/email", {
			email: ADMIN_EMAIL,
			password: ADMIN_PASSWORD,
		});

		expect(res.status).toBe(200);
		const body = res.json as Record<string, unknown> & {
			user: Record<string, unknown>;
		};
		expect(body.redirect).toBe(false);
		expect(typeof body.token).toBe("string");
		expect(body.user).toMatchObject({
			email: ADMIN_EMAIL.toLowerCase(),
			role: "admin",
			emailVerified: false,
			banned: false,
		});
		expect(body.user.site_id ?? null).toBeNull();
		expect(body.user.createdAt).toMatch(ISO_DATE);

		const header = res.headers
			.getSetCookie()
			.find((c) => /better-auth\.session_token=/.test(c));
		expect(header).toBeDefined();
		expect(header).toMatch(/; Max-Age=604800/);
		expect(header).toMatch(/; Path=\//);
		expect(header).toMatch(/; HttpOnly/);
		expect(header).toMatch(/; SameSite=Lax/i);

		const cookie = client.cookies.get(sessionCookieName(client) ?? "");
		const [token, signature] = decodeURIComponent(cookie ?? "").split(".");
		expect(token).toBe(body.token as string);
		expect(signature?.length).toBeGreaterThan(0);
	});

	test("sign-in matches the email case-insensitively", async () => {
		const res = await new Client().post("/api/auth/sign-in/email", {
			email: ADMIN_EMAIL.toUpperCase(),
			password: ADMIN_PASSWORD,
		});
		expect(res.status).toBe(200);
	});

	test("sign-in with a wrong password is 401 INVALID_EMAIL_OR_PASSWORD", async () => {
		const client = new Client();
		const res = await client.post("/api/auth/sign-in/email", {
			email: ADMIN_EMAIL,
			password: `${ADMIN_PASSWORD}-wrong`,
		});
		expect(res.status).toBe(401);
		expect(res.json).toMatchObject({ code: "INVALID_EMAIL_OR_PASSWORD" });
		expect(sessionCookieName(client)).toBeUndefined();
	});

	test("sign-in with an unknown email is 401 INVALID_EMAIL_OR_PASSWORD", async () => {
		const res = await new Client().post("/api/auth/sign-in/email", {
			email: "nobody@contract.test",
			password: "whatever-password",
		});
		expect(res.status).toBe(401);
		expect(res.json).toMatchObject({ code: "INVALID_EMAIL_OR_PASSWORD" });
	});

	test("sign-in with a malformed email is 400 INVALID_EMAIL", async () => {
		const res = await new Client().post("/api/auth/sign-in/email", {
			email: "not-an-email",
			password: "whatever",
		});
		expect(res.status).toBe(400);
		expect(res.json).toMatchObject({ code: "INVALID_EMAIL" });
	});

	test("sign-in without a password is 400 VALIDATION_ERROR", async () => {
		const res = await new Client().post("/api/auth/sign-in/email", {
			email: ADMIN_EMAIL,
		});
		expect(res.status).toBe(400);
		expect(res.json).toMatchObject({ code: "VALIDATION_ERROR" });
	});

	test("get-session without a cookie is 200 null", async () => {
		const res = await new Client().get("/api/auth/get-session");
		expect(res.status).toBe(200);
		expect(res.json).toBeNull();
	});

	test("get-session returns session and user", async () => {
		const client = new Client();
		const signIn = await client.signIn(ADMIN_EMAIL, ADMIN_PASSWORD);
		const res = await client.get("/api/auth/get-session");

		expect(res.status).toBe(200);
		const body = res.json as {
			session: Record<string, unknown>;
			user: Record<string, unknown>;
		};
		expect(body.user).toEqual(
			(signIn.json as { user: Record<string, unknown> }).user,
		);
		expect(body.session.token).toBe((signIn.json as { token: string }).token);
		expect(body.session.userId).toBe(body.user.id);
		expect(body.session.expiresAt).toMatch(ISO_DATE);

		const days =
			(Date.parse(body.session.expiresAt as string) -
				Date.parse(body.session.createdAt as string)) /
			86_400_000;
		expect(days).toBeCloseTo(7, 2);
	});

	test("a cookie with a wrong signature is treated as no session", async () => {
		const client = new Client();
		await client.signIn(ADMIN_EMAIL, ADMIN_PASSWORD);
		const name = sessionCookieName(client) as string;
		const [token] = decodeURIComponent(client.cookies.get(name) ?? "").split(
			".",
		);

		const tampered = new Client();
		tampered.cookies.set(
			name,
			encodeURIComponent(`${token}.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=`),
		);
		expect((await tampered.get("/api/auth/get-session")).json).toBeNull();

		const unsigned = new Client();
		unsigned.cookies.set(name, token);
		expect((await unsigned.get("/api/auth/get-session")).json).toBeNull();
	});

	test("POST with a session cookie from an untrusted origin is 403 INVALID_ORIGIN", async () => {
		const client = new Client();
		await client.signIn(ADMIN_EMAIL, ADMIN_PASSWORD);

		const res = await client.post(
			"/api/auth/sign-out",
			{},
			{ headers: { Origin: "http://untrusted.contract.test" } },
		);
		expect(res.status).toBe(403);
		expect(res.json).toMatchObject({ code: "INVALID_ORIGIN" });

		// still signed in
		expect((await client.get("/api/auth/get-session")).json).not.toBeNull();
	});

	test("POST with a session cookie and no Origin is 403 MISSING_OR_NULL_ORIGIN", async () => {
		const client = new Client();
		await client.signIn(ADMIN_EMAIL, ADMIN_PASSWORD);

		const res = await fetch(
			`${process.env.BASE_URL ?? "http://localhost:3001"}/api/auth/sign-out`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Cookie: client.cookieHeader,
				},
				body: "{}",
			},
		);
		expect(res.status).toBe(403);
		expect(await res.json()).toMatchObject({ code: "MISSING_OR_NULL_ORIGIN" });
	});

	test("sign-out ends the session and clears the cookie", async () => {
		const client = new Client();
		await client.signIn(ADMIN_EMAIL, ADMIN_PASSWORD);
		const cookiesBefore = new Map(client.cookies);

		const res = await client.post("/api/auth/sign-out", {});
		expect(res.status).toBe(200);
		expect(res.json).toEqual({ success: true });
		expect(
			res.headers
				.getSetCookie()
				.some((c) => /better-auth\.session_token=;.*Max-Age=0/i.test(c)),
		).toBe(true);
		expect(sessionCookieName(client)).toBeUndefined();

		// the old cookie no longer works
		const replay = new Client();
		for (const [name, value] of cookiesBefore) replay.cookies.set(name, value);
		expect((await replay.get("/api/auth/get-session")).json).toBeNull();
		expect((await replay.get("/api/sites")).status).toBe(401);
	});

	test("sign-out without a session still answers 200", async () => {
		const res = await new Client().post("/api/auth/sign-out", {});
		expect(res.status).toBe(200);
		expect(res.json).toEqual({ success: true });
	});

	test("public sign-up is disabled", async () => {
		const res = await new Client().post("/api/auth/sign-up/email", {
			name: "Nope",
			email: "signup@contract.test",
			password: "password123",
		});
		expect(res.status).toBe(400);
		expect(res.json).toMatchObject({ code: "EMAIL_PASSWORD_SIGN_UP_DISABLED" });
	});

	test("ORIGIN is a trusted origin (test setup sanity check)", () => {
		expect(ORIGIN).toMatch(/^https?:\/\//);
	});
});
