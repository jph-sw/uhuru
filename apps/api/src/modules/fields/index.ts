import { Elysia, t } from "elysia";
import { Fields } from "./service";
import { FieldsModel } from "./model";

export const fields = new Elysia({ prefix: "fields" })
  .get(
    "/:siteId",
    ({ params }) => Fields.getFields({ siteId: params.siteId }),
    {
      params: FieldsModel.selectFieldBody,
    },
  )
  .post(
    "/",
    ({ body }) =>
      Fields.createField({
        key: body.key,
        content: body.content,
        siteId: body.siteId,
      }),
    { body: FieldsModel.createFieldBody },
  );
