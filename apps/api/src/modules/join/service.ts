import { eq } from "drizzle-orm";
import { SelectiveStatus } from "elysia";
import { ulid } from "ulidx";
import { auth } from "../../auth";
import { db } from "../../db";
import {
	invite as inviteTable,
	inviteUse as inviteUseTable,
} from "../../db/schema";
import { Invite } from "../invite/service";
import type { JoinModelType } from "./model";

export abstract class Join {
	static async join({
		code,
		name,
		email,
		password,
		siteId,
	}: JoinModelType["joinModel"]) {
		const { valid } = await Invite.checkInvite({ code: code });

		if (valid) {
			const res = await auth.api.createUser({
				body: { name, email, password, data: { site_id: siteId } },
			});

			if (res) {
				const usedRes = await db
					.insert(inviteUseTable)
					.values({ id: ulid(), userId: res.user.id, inviteCode: code })
					.returning();

				if (usedRes) return { success: true };
			} else {
				return { success: false };
			}
		}
	}
}
