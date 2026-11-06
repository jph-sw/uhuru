import { t } from "elysia";

export const UsersModel = {
	selectUsersBody: t.Object({ siteId: t.String() }),
};
