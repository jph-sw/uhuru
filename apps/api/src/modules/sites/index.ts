import { Elysia } from "elysia";
import { macros } from "../../macros";
import { SitesModel } from "./model";
import { Sites } from "./service";

export const sites = new Elysia({ prefix: "sites" })
	.use(macros)
	.get("/", () => Sites.getSites(), { admin: true })
	.post(
		"/",
		({ body }) => Sites.createSite({ name: body.name, domain: body.domain }),
		{ body: SitesModel.createSiteBody, admin: true },
	)
	.get("/:id", ({ params }) => Sites.getSite({ id: params.id }), {
		params: SitesModel.updateSiteParams,
		auth: true,
	})
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
