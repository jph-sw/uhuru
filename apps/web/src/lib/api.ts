import { createIsomorphicFn } from "@tanstack/react-start";
import type { paths } from "@uhuru/openapi";
import createClient from "openapi-fetch";

/**
 * Where API requests go.
 *
 * Browser: the page's own origin. The Vite dev server (development) or
 * server.ts (production) proxies /api/* to the API, so the session cookie
 * stays first-party.
 *
 * Server (SSR, loaders, beforeLoad): straight to API_URL.
 */
export const getApiBaseUrl = createIsomorphicFn()
	.server(() => process.env.API_URL ?? "http://localhost:3001")
	.client(() => window.location.origin);

/**
 * fetch for API requests.
 *
 * During SSR there's no browser to attach cookies, so the incoming request's
 * cookie header is forwarded to the API. Any Set-Cookie headers the API sends
 * back (for example a refreshed session) are passed on to the page response.
 */
export const apiFetch = createIsomorphicFn()
	.server(async (request: Request) => {
		const { getRequestHeader, getResponseHeaders } = await import(
			"@tanstack/react-start/server"
		);

		const headers = new Headers(request.headers);
		const cookie = getRequestHeader("cookie");
		if (cookie) headers.set("cookie", cookie);

		const response = await fetch(new Request(request, { headers }));

		const setCookies = response.headers.getSetCookie();
		if (setCookies.length > 0) {
			const responseHeaders = getResponseHeaders();
			for (const value of setCookies)
				responseHeaders.append("set-cookie", value);
		}

		return response;
	})
	.client((request: Request) => fetch(request));

/** Typed client for the Uhuru API, generated from packages/openapi/uhuru.yaml. */
export const api = createClient<paths>({
	baseUrl: getApiBaseUrl(),
	fetch: (request) => apiFetch(request),
});

/** Thrown by query functions when the API answers with an error status. */
export class ApiError extends Error {
	constructor(
		readonly status: number,
		readonly body: unknown,
	) {
		super(typeof body === "string" ? body : `API request failed (${status})`);
	}
}

/** Returns the data of an openapi-fetch result, or throws an ApiError. */
export function unwrap<T>(result: {
	data?: T;
	error?: unknown;
	response: Response;
}): T {
	if (result.error !== undefined || !result.response.ok)
		throw new ApiError(result.response.status, result.error);
	return result.data as T;
}
