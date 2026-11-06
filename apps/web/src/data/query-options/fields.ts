import { queryOptions } from "@tanstack/react-query";
import { api, unwrap } from "#/lib/api";

export const fieldQueryOptions = ({
	siteId,
	language,
}: {
	siteId: string;
	language?: string;
}) =>
	queryOptions({
		queryKey: ["fields", siteId, language],
		queryFn: async () =>
			unwrap(
				await api.GET("/api/fields/site/{siteId}", {
					params: {
						path: { siteId },
						query: language ? { language } : undefined,
					},
				}),
			),
	});
