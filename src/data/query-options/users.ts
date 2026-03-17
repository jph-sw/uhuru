import { queryOptions } from "@tanstack/react-query";
import { getTreaty } from "#/routes/api/$";

export const usersQueryOptions = ({ siteId }: { siteId: string }) =>
	queryOptions({
		queryKey: ["users", siteId],
		queryFn: async () => {
			const { api } = await getTreaty();

			const { data, error } = await api.users.site({ site_id: siteId }).get();
			if (error) throw error;
			return data;
		},
	});
