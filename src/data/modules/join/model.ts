import { t, type UnwrapSchema } from "elysia";

export const JoinModel = {
	joinModel: t.Object({
		code: t.String(),
		name: t.String(),
		email: t.String(),
		password: t.String(),
		siteId: t.String(),
	}),
};

export type JoinModelType = {
	[k in keyof typeof JoinModel]: UnwrapSchema<(typeof JoinModel)[k]>;
};
