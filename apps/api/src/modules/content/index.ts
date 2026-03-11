import { Elysia, t } from "elysia";
import { Content } from "./service";

export const content = new Elysia({ prefix: "content" }).get(
  "/:siteId",
  ({ params, query }) =>
    Content.getContent({
      siteId: params.siteId,
      language: query.language,
    }),
  {
    params: t.Object({ siteId: t.String() }),
    query: t.Object({ language: t.Optional(t.String()) }),
  },
);
