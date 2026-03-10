import { t } from "elysia";
import { site as siteTable } from "../../db/schema";
import { spread } from "../../db/utils";

const { name, domain } = spread(siteTable, "insert");

export const SitesModel = {
  createSiteBody: t.Object({ name, domain }),
};
