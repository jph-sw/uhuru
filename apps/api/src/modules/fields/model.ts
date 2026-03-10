import { t } from "elysia";
import { field as fieldTable } from "../../db/schema";
import { spread } from "../../db/utils";

const { key, content, siteId } = spread(fieldTable, "insert");

export const FieldsModel = {
  createFieldBody: t.Object({ key, content, siteId }),
  selectFieldBody: t.Object({ siteId }),
};
