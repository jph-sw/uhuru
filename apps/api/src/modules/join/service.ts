import { eq } from "drizzle-orm";
import { db } from "../../db";
import {
  invite as inviteTable,
  inviteUse as inviteUseTable,
} from "../../db/schema";
import { ulid } from "ulidx";
import { SelectiveStatus } from "elysia";
import type { JoinModelType } from "./model";
import { auth } from "../../auth";
import { Invite } from "../invite/service";

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
