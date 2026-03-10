import { Elysia, t } from "elysia";
import { macros } from "../../macros";
import { Sites } from "./service";
import { SitesModel } from "./model";

export const sites = new Elysia({ prefix: "sites" })
  .use(macros)
  .guard({ admin: true }, (app) =>
    app
      .get("/", () => Sites.getSites())
      .post(
        "/",
        ({ body }) =>
          Sites.createSite({ name: body.name, domain: body.domain }),
        { body: SitesModel.createSiteBody },
      ),
  );
