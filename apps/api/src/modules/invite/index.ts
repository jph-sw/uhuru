import { Elysia, t } from "elysia";
import { Invite } from "./service";
import { InviteModel } from "./model";

export const invite = new Elysia({ prefix: "invite" })
  .get(
    "/site/:siteId",
    ({ params }) => Invite.getInviteBySiteId({ siteId: params.siteId }),
    {
      params: InviteModel.selectInviteBySiteBody,
      response: t.Array(InviteModel.invite),
    },
  )
  .get("/:code", ({ params }) => Invite.getInvite({ code: params.code }), {
    params: InviteModel.selectInviteBody,
  })
  .get(
    "/check/:code",
    ({ params }) => Invite.checkInvite({ code: params.code }),
    {
      response: t.Object({
        valid: t.Boolean(),
        invite: t.Optional(InviteModel.invite),
      }),
    },
  )
  .post(
    "/",
    ({ body }) =>
      Invite.createInvite({
        maxUses: body.maxUses,
        siteId: body.siteId,
      }),
    { body: InviteModel.createInviteBody },
  );
