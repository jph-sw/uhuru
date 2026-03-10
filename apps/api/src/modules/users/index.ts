import { Elysia, t } from "elysia";
import { Users } from "./service";
import { UsersModel } from "./model";

export const users = new Elysia({ prefix: "users" }).get(
  "/site/:site_id",
  ({ params }) => Users.getUsers({ siteId: params.site_id! }),
  {
    params: UsersModel.selectUsersBody,
  },
);
