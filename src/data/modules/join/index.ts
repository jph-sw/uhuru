import { Elysia, t } from "elysia";
import { JoinModel } from "./model";
import { Join } from "./service";

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
