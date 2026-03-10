import { eq } from "drizzle-orm";
import { db } from "../../db";
import {
  invite as inviteTable,
  inviteUse as inviteUseTable,
} from "../../db/schema";
import { ulid } from "ulidx";

export abstract class Invite {
  static getInvite({ code }: { code: string }) {
    const invite = db
      .select()
      .from(inviteTable)
      .where(eq(inviteTable.code, code));

    return invite;
  }

  static async createInvite({
    maxUses,
    siteId,
  }: {
    maxUses?: string;
    siteId: string;
  }) {
    const id = ulid();
    const code = ulid();

    const res = await db
      .insert(inviteTable)
      .values({ id, code, maxUses, siteId, createdAt: new Date() })
      .returning();

    return res;
  }

  static async checkInvite({ code }: { code: string }) {
    const res = await db
      .select()
      .from(inviteTable)
      .where(eq(inviteTable.code, code));

    if (res.length <= 0) {
      return { valid: false };
    } else {
      // check if it has been used before
      const uses = await db
        .select()
        .from(inviteUseTable)
        .where(eq(inviteUseTable.inviteCode, res[0].code));

      if (uses.length >= 1) {
        return { valid: false };
      }

      return { valid: true, invite: res[0] };
    }
  }
}
