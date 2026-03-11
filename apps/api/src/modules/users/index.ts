import { Elysia, t } from "elysia";
import { macros } from "../../macros";
import { UsersModel } from "./model";
import { Users } from "./service";

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
