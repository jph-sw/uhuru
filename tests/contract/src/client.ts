/**
 * Minimal HTTP client for the contract tests: a cookie jar plus helpers to
 * set up data through the API. Everything goes over HTTP against BASE_URL,
 * so the tests run unchanged against any backend.
 */

export const BASE_URL = (
	process.env.BASE_URL ?? "http://localhost:3001"
).replace(/\/$/, "");

/**
 * Origin sent with requests. Better Auth only accepts cookie-carrying POSTs
 * from trusted origins (BETTER_AUTH_URL / TRUSTED_ORIGINS), so this must be
 * one of those.
 */
export const ORIGIN = new URL(
	process.env.ORIGIN ?? process.env.BETTER_AUTH_URL ?? BASE_URL,
).origin;

export const ADMIN_EMAIL = required("ADMIN_EMAIL");
export const ADMIN_PASSWORD = required("ADMIN_PASSWORD");

function required(name: string) {
	const value = process.env[name];
	if (!value) throw new Error(`${name} must be set for the contract tests`);
	return value;
}

/** Unique suffix so repeated runs against the same database don't collide. */
export const RUN = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export type Res = {
	status: number;
	headers: Headers;
	text: string;
	/** Parsed JSON body, or undefined if the body isn't JSON. */
	json: unknown;
};

type RequestOptions = {
	body?: unknown;
	headers?: Record<string, string>;
	/** Raw body; sent as-is instead of JSON-encoding `body`. */
	rawBody?: string;
};

export class Client {
	readonly cookies = new Map<string, string>();

	get cookieHeader() {
		return [...this.cookies].map(([k, v]) => `${k}=${v}`).join("; ");
	}

	async request(
		method: string,
		path: string,
		{ body, headers = {}, rawBody }: RequestOptions = {},
	): Promise<Res> {
		const init: RequestInit = {
			method,
			redirect: "manual",
			headers: {
				Origin: ORIGIN,
				...(body !== undefined || rawBody !== undefined
					? { "Content-Type": "application/json" }
					: {}),
				...(this.cookies.size > 0 ? { Cookie: this.cookieHeader } : {}),
				...headers,
			},
			body: rawBody ?? (body !== undefined ? JSON.stringify(body) : undefined),
		};

		const response = await fetch(`${BASE_URL}${path}`, init);

		for (const cookie of response.headers.getSetCookie()) {
			const [pair, ...attributes] = cookie.split(";");
			const index = pair.indexOf("=");
			const name = pair.slice(0, index).trim();
			const value = pair.slice(index + 1).trim();
			const expired = attributes.some((a) => /^\s*max-age=0\s*$/i.test(a));
			if (expired || value === "") this.cookies.delete(name);
			else this.cookies.set(name, value);
		}

		const text = await response.text();
		let json: unknown;
		try {
			json = text === "" ? undefined : JSON.parse(text);
		} catch {
			json = undefined;
		}

		return { status: response.status, headers: response.headers, text, json };
	}

	get = (path: string, options?: RequestOptions) =>
		this.request("GET", path, options);
	post = (path: string, body?: unknown, options?: RequestOptions) =>
		this.request("POST", path, { ...options, body });
	patch = (path: string, body?: unknown, options?: RequestOptions) =>
		this.request("PATCH", path, { ...options, body });
	delete = (path: string, options?: RequestOptions) =>
		this.request("DELETE", path, options);

	async signIn(email: string, password: string) {
		const res = await this.post("/api/auth/sign-in/email", { email, password });
		if (res.status !== 200)
			throw new Error(`Sign-in as ${email} failed: ${res.status} ${res.text}`);
		return res;
	}
}

/** Name of the session cookie (prefixed with __Secure- on https). */
export function sessionCookieName(client: Client) {
	return [...client.cookies.keys()].find((name) =>
		name.endsWith("better-auth.session_token"),
	);
}

export async function signedInAdmin() {
	const admin = new Client();
	await admin.signIn(ADMIN_EMAIL, ADMIN_PASSWORD);
	return admin;
}

export type Site = {
	id: string;
	name: string;
	domain: string;
	languages: string[];
	createdAt: string;
	updatedAt: string;
};

/** Creates a site with a unique name; returns the API's site object. */
export async function createSite(admin: Client, label: string) {
	const name = `Contract ${label} ${RUN}`;
	const res = await admin.post("/api/sites", {
		name,
		domain: `${label}-${RUN}.contract.test`,
	});
	if (res.status !== 200)
		throw new Error(`Creating site failed: ${res.status} ${res.text}`);
	return res.json as Site;
}

export type Invite = {
	id: string;
	code: string;
	maxUses: string;
	siteId: string;
	createdAt: string;
	updatedAt: string;
};

export async function createInvite(
	client: Client,
	siteId: string,
	maxUses = "1",
) {
	const res = await client.post("/api/invite", { maxUses, siteId });
	if (res.status !== 200)
		throw new Error(`Creating invite failed: ${res.status} ${res.text}`);
	return (res.json as Invite[])[0];
}

let users = 0;

/** Creates a client user for a site through an invite and signs them in. */
export async function joinedClient(admin: Client, siteId: string) {
	const invite = await createInvite(admin, siteId);
	const email = `client-${++users}-${RUN}@contract.test`;
	const password = "contract-password";
	const res = await new Client().post("/api/join", {
		code: invite.code,
		name: `Client ${users}`,
		email,
		password,
		siteId,
	});
	if (
		res.status !== 200 ||
		(res.json as { success?: boolean })?.success !== true
	)
		throw new Error(`Joining failed: ${res.status} ${res.text}`);

	const client = new Client();
	await client.signIn(email, password);
	return { client, email, password };
}

export const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
