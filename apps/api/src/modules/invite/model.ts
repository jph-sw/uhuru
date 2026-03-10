import { t } from "elysia";
import { invite as inviteTable } from "../../db/schema";
import { spread } from "../../db/utils";

const { code, maxUses, siteId } = spread(inviteTable, "insert");

export const InviteModel = {
  createInviteBody: t.Object({ maxUses, siteId }),
  selectInviteBody: t.Object({ code }),
  invite: t.Object(spread(inviteTable, "select")),
  codeInvalid: t.Object({ code: t.String(), message: t.String() }),
  codeValid: t.Object({ code: t.String() }),
};
