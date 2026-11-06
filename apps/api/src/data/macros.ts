import { Elysia } from "elysia";
import { auth } from "#/lib/auth";

/**
 * Resolves the Better Auth session for a request. If Better Auth refreshes the
 * session while reading it, the refreshed cookie is passed on to the response
 * (inside TanStack Start, the tanstackStartCookies plugin used to do this).
 */
async function resolveSession(
	headers: Headers,
	set: { headers: Record<string, unknown> },
) {
	const { headers: authHeaders, response } = await auth.api.getSession({
		headers,
		returnHeaders: true,
	});

	const cookies = authHeaders.getSetCookie();
	if (cookies.length > 0) set.headers["set-cookie"] = cookies;

	return response;
}

export const macros = new Elysia().macro({
	auth: {
		async resolve({ status, set, request: { headers } }) {
			const session = await resolveSession(headers, set);

			if (!session) return status(401);

			return { user: session.user, session: session.session };
		},
	},
	admin: {
		async resolve({ status, set, request: { headers } }) {
			const session = await resolveSession(headers, set);

			if (!session) return status(401);
			if (session.user.role !== "admin") return status(403);

			return { user: session.user, session: session.session };
		},
	},
});
