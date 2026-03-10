import { Elysia, t } from "elysia";
import { Content } from "./service";

export const content = new Elysia({ prefix: "content" }).get(
  "/:siteId",
  ({ params }) => Content.getContent({ siteId: params.siteId }),
  { params: t.Object({ siteId: t.String() }) },
);
