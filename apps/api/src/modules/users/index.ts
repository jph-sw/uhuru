import { Elysia, t } from "elysia";
import { Users } from "./service";
import { UsersModel } from "./model";
import { macros } from "../../macros";

export const users = new Elysia({ prefix: "users" })
  .use(macros)
  .guard({ admin: true }, (app) =>
    app.get(
      "/site/:site_id",
      ({ params }) => Users.getUsers({ siteId: params.site_id! }),
      {
        params: UsersModel.selectUsersBody,
      },
    ),
  );
