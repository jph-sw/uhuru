import { queryOptions } from "@tanstack/react-query";
import { api } from "#/lib/api";

export const fieldQueryOptions = ({
	siteId,
	language,
}: {
	siteId: string;
	language?: string;
}) =>
	queryOptions({
		queryKey: ["fields", siteId, language],
		queryFn: async () => {
			const { data, error } = await api.fields.site({ siteId }).get({
				query: language ? { language } : undefined,
			});
			if (error) throw error;
			return data;
		},
	});
