import { queryOptions } from "@tanstack/react-query";
import { api } from "#/lib/api";

export const usersQueryOptions = ({ siteId }: { siteId: string }) =>
  queryOptions({
    queryKey: ["users", siteId],
    queryFn: async () => {
      const { data, error } = await api.users.site({ site_id: siteId }).get();
      if (error) throw error;
      return data;
    },
  });
