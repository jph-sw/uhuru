import { t } from "elysia";
import { field as fieldTable } from "#/db/schema";
import { spread } from "#/db/utils";

const { key, content, siteId, language } = spread(fieldTable, "insert");
const { id } = spread(fieldTable, "select");

export const FieldsModel = {
	createFieldBody: t.Object({
		key,
		content,
		siteId,
		language: t.Optional(language),
	}),
	selectFieldParams: t.Object({ siteId }),
	selectFieldQuery: t.Object({ language: t.Optional(t.String()) }),
	updateFieldBody: t.Object({ content }),
	updateFieldParams: t.Object({ id }),
};
