import { queryOptions } from "@tanstack/react-query";
import { api, unwrap } from "#/lib/api";

export const siteQueryOptions = queryOptions({
	queryKey: ["sites"],
	queryFn: async () => unwrap(await api.GET("/api/sites")),
});
