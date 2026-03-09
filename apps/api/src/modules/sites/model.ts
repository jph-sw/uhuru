import { t, type UnwrapSchema } from "elysia";

export const SitesModel = {
  createSiteBody: t.Object({
    name: t.String(),
    domain: t.String(),
  }),
} as const;
