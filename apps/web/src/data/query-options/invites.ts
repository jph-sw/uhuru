import { queryOptions } from "@tanstack/react-query";
import { api, unwrap } from "#/lib/api";

export const inviteQueryOptions = ({ siteId }: { siteId: string }) =>
	queryOptions({
		queryKey: ["invites", siteId],
		queryFn: async () =>
			unwrap(
				await api.GET("/api/invite/site/{siteId}", {
					params: { path: { siteId } },
				}),
			),
	});
