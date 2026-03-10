import { Elysia, t } from "elysia";
import { Sites } from "./service";
import { SitesModel } from "./model";

export const sites = new Elysia({ prefix: "sites" })
  .get("/", () => Sites.getSites())
  .post(
    "/",
    ({ body }) => Sites.createSite({ name: body.name, domain: body.domain }),
    { body: SitesModel.createSiteBody },
  );
