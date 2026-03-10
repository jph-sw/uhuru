import { Elysia, t } from "elysia";
import { Join } from "./service";
import { JoinModel } from "./model";

export const join = new Elysia({ prefix: "join" }).post(
  "/",
  ({ body }) =>
    Join.join({
      code: body.code,
      name: body.name,
      email: body.email,
      password: body.password,
      siteId: body.siteId,
    }),
  { body: JoinModel.joinModel },
);
