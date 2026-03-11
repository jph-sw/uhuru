import { t } from "elysia";
import { user as userTable } from "../../db/schema";
import { spread } from "../../db/utils";

const { site_id } = spread(userTable, "insert");

export const UsersModel = {
	selectUsersBody: t.Object({ site_id }),
};
