import { t } from "elysia";
import { site as siteTable } from "#/db/schema";
import { spread } from "#/db/utils";

const { name, domain, languages } = spread(siteTable, "insert");
const { id } = spread(siteTable, "select");

export const SitesModel = {
	createSiteBody: t.Object({ name, domain }),
	updateSiteBody: t.Object({
		name: t.Optional(name),
		domain: t.Optional(domain),
		languages: t.Optional(languages),
	}),
	updateSiteParams: t.Object({ id }),
};
