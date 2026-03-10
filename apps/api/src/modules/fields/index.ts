import { Elysia } from "elysia";
import { Fields } from "./service";
import { FieldsModel } from "./model";
import { macros } from "../../macros";

export const fields = new Elysia({ prefix: "fields" })
  .use(macros)
  .guard({ admin: true }, (app) =>
    app
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
      ),
  );
