import { Elysia } from "elysia";
import { macros } from "#/data/macros";
import { UsersModel } from "./model";
import { Users } from "./service";

export const users = new Elysia({ prefix: "users" })
	.use(macros)
	.guard({ admin: true }, (app) =>
		app.get(
			"/site/:site_id",
			({ params }) => Users.getUsers({ siteId: params.siteId ?? "" }),
			{
				params: UsersModel.selectUsersBody,
			},
		),
	);
