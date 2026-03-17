import { queryOptions } from "@tanstack/react-query";
import { getTreaty } from "#/routes/api/$";

export const siteQueryOptions = queryOptions({
	queryKey: ["sites"],
	queryFn: async () => {
		const { api } = await getTreaty();

		const { data, error } = await api.sites.get();
		if (error) throw error;
		return data;
	},
});
