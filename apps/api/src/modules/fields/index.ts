import { Elysia } from "elysia";
import { Fields } from "./service";
import { FieldsModel } from "./model";
import { macros } from "../../macros";

export const fields = new Elysia({ prefix: "fields" })
  .use(macros)
  .guard({ admin: true }, (app) =>
    app.post(
      "/",
      ({ body }) =>
        Fields.createField({
          key: body.key,
          content: body.content,
          siteId: body.siteId,
          language: body.language,
        }),
      { body: FieldsModel.createFieldBody },
    ),
  )
  .guard({ auth: true }, (app) =>
    app
      .get(
        "/site/:siteId",
        ({ params, query }) =>
          Fields.getFields({
            siteId: params.siteId,
            language: query.language,
          }),
        {
          params: FieldsModel.selectFieldParams,
          query: FieldsModel.selectFieldQuery,
        },
      )
      .patch(
        "/:id",
        ({ params, body }) =>
          Fields.updateField({ id: params.id, content: body.content }),
        {
          params: FieldsModel.updateFieldParams,
          body: FieldsModel.updateFieldBody,
        },
      ),
  );
