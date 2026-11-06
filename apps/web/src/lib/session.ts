import { apiFetch, getApiBaseUrl } from "./api";

/**
 * Response of GET /api/auth/get-session (see docs/auth-contract.md).
 * Dates are ISO 8601 strings.
 */
export type Session = {
	session: {
		id: string;
		token: string;
		userId: string;
		expiresAt: string;
		createdAt: string;
		updatedAt: string;
		ipAddress?: string | null;
		userAgent?: string | null;
		impersonatedBy?: string | null;
	};
	user: {
		id: string;
		name: string;
		email: string;
		emailVerified: boolean;
		image?: string | null;
		createdAt: string;
		updatedAt: string;
		role?: string | null;
		banned?: boolean | null;
		banReason?: string | null;
		banExpires?: string | null;
		/** Site a client user belongs to; null/absent for admins. */
		site_id?: string | null;
	};
};

/** The current session, or null when not signed in. Works in SSR and in the browser. */
export async function getSession(): Promise<Session | null> {
	const response = await apiFetch(
		new Request(`${getApiBaseUrl()}/api/auth/get-session`),
	);

	if (!response.ok)
		throw new Error(`Failed to load session (${response.status})`);

	return (await response.json()) as Session | null;
}
