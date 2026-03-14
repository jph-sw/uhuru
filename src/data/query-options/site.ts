import { queryOptions } from "@tanstack/react-query";
import { getTreaty } from "#/routes/api/$";

export const siteByIdQueryOptions = ({ siteId }: { siteId: string }) =>
	queryOptions({
		queryKey: ["site", siteId],
		queryFn: async () => {
			const { api } = await getTreaty();

			const { data, error } = await api.sites({ id: siteId }).get();
			if (error) throw error;
			return data;
		},
	});
