import { queryOptions } from "@tanstack/react-query";
import { type Site } from "@uhuru/types";
import { api } from "#/lib/api";

export const siteQueryOptions = queryOptions({
  queryKey: ["sites"],
  queryFn: () => api<Site[]>("/sites"),
});
