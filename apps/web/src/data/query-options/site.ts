import { queryOptions } from "@tanstack/react-query";
import { api, unwrap } from "#/lib/api";

export const siteByIdQueryOptions = ({ siteId }: { siteId: string }) =>
	queryOptions({
		queryKey: ["site", siteId],
		queryFn: async () =>
			unwrap(
				await api.GET("/api/sites/{id}", {
					params: { path: { id: siteId } },
				}),
			),
	});
