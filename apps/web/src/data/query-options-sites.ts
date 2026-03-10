import { queryOptions } from "@tanstack/react-query";
import { api } from "#/lib/api";

export const siteQueryOptions = queryOptions({
  queryKey: ["sites"],
  queryFn: async () => {
    const { data, error } = await api.sites.get();
    if (error) throw error;
    return data;
  },
});
