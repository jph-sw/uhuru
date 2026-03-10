import { queryOptions } from "@tanstack/react-query";
import { api } from "#/lib/api";

export const fieldQueryOptions = ({ siteId }: { siteId: string }) =>
  queryOptions({
    queryKey: ["fields", siteId],
    queryFn: async () => {
      const { data, error } = await api.fields.site({ siteId }).get();
      if (error) throw error;
      return data;
    },
  });
