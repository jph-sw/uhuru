import { queryOptions } from "@tanstack/react-query";
import { api } from "#/lib/api";

export const siteByIdQueryOptions = ({ siteId }: { siteId: string }) =>
	queryOptions({
		queryKey: ["site", siteId],
		queryFn: async () => {
			const { data, error } = await api.sites({ id: siteId }).get();
			if (error) throw error;
			return data;
		},
	});
