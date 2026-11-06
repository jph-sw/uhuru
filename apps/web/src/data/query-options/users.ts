import { queryOptions } from "@tanstack/react-query";
import { api, unwrap } from "#/lib/api";

export const usersQueryOptions = ({ siteId }: { siteId: string }) =>
	queryOptions({
		queryKey: ["users", siteId],
		queryFn: async () =>
			unwrap(
				await api.GET("/api/users/site/{siteId}", {
					params: { path: { siteId } },
				}),
			),
	});
