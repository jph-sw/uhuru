import { Elysia } from "elysia";
import { macros } from "#/data/macros";
import { SitesModel } from "./model";
import { Sites } from "./service";

export const sites = new Elysia({ prefix: "sites" })
	.use(macros)
	.get("/", () => Sites.getSites(), { admin: true })
	.post(
		"/",
		async ({ body }) => {
			console.log("createing site");
			const site = await Sites.createSite({
				name: body.name,
				domain: body.domain,
			});

			return site;
		},
		{ body: SitesModel.createSiteBody, admin: true },
	)
	.get(
		"/:id",
		({ params, status }) => {
			const site = Sites.getSite({ id: params.id });

			if (!site) return status(404);

			return site;
		},
		{
			params: SitesModel.updateSiteParams,
			auth: true,
		},
	)
	.patch(
		"/:id",
		({ params, body }) =>
			Sites.updateSite({
				id: params.id,
				name: body.name,
				domain: body.domain,
				languages: body.languages,
			}),
		{
			params: SitesModel.updateSiteParams,
			body: SitesModel.updateSiteBody,
			admin: true,
		},
	);
