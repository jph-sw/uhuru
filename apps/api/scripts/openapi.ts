/**
 * Writes the OpenAPI spec of the Uhuru API to packages/openapi/uhuru.yaml.
 *
 * Request schemas come from the routes' validation schemas. Response schemas
 * are inferred from the handlers' TypeScript return types: the script emits
 * declarations for src/app.ts with tsc and converts the route types to JSON
 * schema with @elysiajs/openapi's generator. (The plugin's own `fromTypes`
 * can't parse our declaration, because the `=>` in the macro types breaks its
 * angle-bracket matching. Only the extraction step is reimplemented here.)
 *
 * Better Auth routes (/api/auth/*) are not included; docs/auth-contract.md
 * specifies them.
 *
 * Usage: bun run openapi (from apps/api or the repo root)
 */
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { openapi } from "@elysiajs/openapi";
import type { AdditionalReference } from "@elysiajs/openapi/types";
import {
	declarationToJSONSchema,
	flattenNestedIntersections,
} from "@elysiajs/openapi/gen";
import { Elysia } from "elysia";
import { app } from "../src/app";

const root = resolve(import.meta.dir, "..");
const output = resolve(root, "../../packages/openapi/uhuru.yaml");

/** Emits declarations for src/app.ts and returns the route type of `app`. */
function routeDeclaration() {
	const tmp = mkdtempSync(join(tmpdir(), "uhuru-openapi-"));
	try {
		const tsconfig = join(tmp, "tsconfig.json");
		writeFileSync(
			tsconfig,
			JSON.stringify({
				extends: join(root, "tsconfig.json"),
				compilerOptions: {
					noEmit: false,
					declaration: true,
					emitDeclarationOnly: true,
					rootDir: root,
					outDir: join(tmp, "dist"),
					typeRoots: [join(root, "node_modules")],
				},
				include: [join(root, "src/app.ts")],
			}),
		);

		const tsc = Bun.spawnSync(["bun", "x", "tsc", "-p", tsconfig], {
			cwd: root,
			stdout: "inherit",
			stderr: "inherit",
		});
		if (!tsc.success) throw new Error("tsc failed to emit declarations");

		const declaration = readFileSync(join(tmp, "dist/src/app.d.ts"), "utf8");
		const marker = "const app: Elysia<";
		const start = declaration.indexOf(marker);
		if (start === -1) throw new Error("`app` not found in app.d.ts");

		// Elysia<Prefix, Singleton, Definitions, Metadata, Routes, ...>
		const routes = genericParam(declaration.slice(start + marker.length), 4);
		if (!routes) throw new Error("Couldn't find the route type of `app`");

		return routes;
	} finally {
		rmSync(tmp, { recursive: true, force: true });
	}
}

/** Returns the n-th generic argument; `text` starts right after the `<`. */
function genericParam(text: string, index: number) {
	let depth = 0;
	let current = 0;
	let start = 0;

	for (let i = 0; i < text.length; i++) {
		const ch = text[i];
		if (ch === ">" && text[i - 1] === "=") continue; // arrow function
		if ("<{[(".includes(ch)) depth++;
		else if (">}])".includes(ch)) {
			if (depth === 0)
				return current === index ? text.slice(start, i).trim() : undefined;
			depth--;
		} else if (ch === "," && depth === 0) {
			if (current === index) return text.slice(start, i).trim();
			current++;
			start = i + 1;
		}
	}
}

/** Turns TypeScript-only schema types into valid JSON schema. */
function normalize(schema: unknown): unknown {
	if (Array.isArray(schema)) return schema.map(normalize);
	if (!schema || typeof schema !== "object") return schema;

	const node = schema as Record<string, unknown>;

	// JSON responses serialize Date as an ISO 8601 string
	if (node.type === "Date") return { type: "string", format: "date-time" };

	if (Array.isArray(node.anyOf)) {
		const options = node.anyOf.filter(
			(option) => (option as { type?: string }).type !== "undefined",
		);
		if (options.length === 1) return normalize(options[0]);
		node.anyOf = options;
	}

	return Object.fromEntries(
		Object.entries(node).map(([key, value]) => [key, normalize(value)]),
	);
}

const text = (value: string) => ({
	description: value,
	content: { "text/plain": { schema: { const: value, type: "string" } } },
});
const unauthorized = text("Unauthorized");
const forbidden = text("Forbidden");
const empty = { description: "Success, empty body" };

/**
 * Responses the TypeScript types don't reveal: routes inside `.guard()` lose
 * the macro's 401/403 in their types, and handlers that return nothing (or
 * sometimes nothing) have no 200 in their types.
 */
const supplements: Record<string, Record<string, Record<string, unknown>>> = {
	"/api/fields": {
		post: { 200: empty, 401: unauthorized, 403: forbidden },
	},
	"/api/fields/site/{siteId}": { get: { 401: unauthorized } },
	"/api/fields/{id}": {
		patch: { 200: empty, 401: unauthorized },
		delete: { 200: empty, 401: unauthorized },
	},
	"/api/users/site/{siteId}": {
		get: { 401: unauthorized, 403: forbidden },
	},
	"/api/join": {
		post: {
			200: {
				description:
					"`{ success: true }` when the user was created. If the invite code is invalid or used up, the body is empty.",
				content: {
					"application/json": {
						schema: {
							type: "object",
							required: ["success"],
							properties: { success: { type: "boolean" } },
						},
					},
				},
			},
		},
	},
};

const references = normalize(
	declarationToJSONSchema(flattenNestedIntersections(routeDeclaration())),
) as AdditionalReference;

const documented = new Elysia()
	.use(
		openapi({
			path: "/openapi",
			references,
			exclude: { paths: [/^\/api\/auth/, "/openapi", "/openapi/json"] },
			documentation: {
				info: {
					title: "Uhuru API",
					version: "0.1.0",
					description:
						"HTTP API of Uhuru. Authentication (/api/auth/*) is specified in docs/auth-contract.md. Routes that answer 401/403 need the Better Auth session cookie (`better-auth.session_token`); 403 means the user is not an admin.",
				},
			},
		}),
	)
	.use(app);

const response = await documented.handle(
	new Request("http://localhost/openapi/json"),
);
if (!response.ok) throw new Error(`Spec request failed: ${response.status}`);

type Operation = {
	parameters?: { name: string; in: string }[];
	requestBody?: { content?: Record<string, { schema?: JsonSchema }> };
	responses?: Record<string, unknown>;
	security?: unknown[];
};
type JsonSchema = { properties?: Record<string, unknown>; required?: unknown[] };
const spec = normalize(await response.json()) as {
	paths: Record<string, Record<string, Operation>>;
	components?: Record<string, unknown>;
};

// Elysia lists prefixed index routes with a trailing slash (/api/sites/).
// The API accepts both forms; the spec uses the form without the slash.
spec.paths = Object.fromEntries(
	Object.entries(spec.paths).map(([path, item]) => [
		path.length > 1 ? path.replace(/\/$/, "") : path,
		item,
	]),
);

for (const [path, methods] of Object.entries(supplements))
	for (const [method, responses] of Object.entries(methods)) {
		const operation = spec.paths[path]?.[method];
		if (!operation) throw new Error(`Unknown operation ${method} ${path}`);
		operation.responses = { ...responses, ...operation.responses };
	}

for (const [path, methods] of Object.entries(spec.paths))
	for (const operation of Object.values(methods)) {
		// Every {param} in the path is a required string parameter, also on
		// routes without a params schema
		for (const [, name] of path.matchAll(/\{([^}]+)\}/g)) {
			operation.parameters ??= [];
			if (!operation.parameters.some((p) => p.in === "path" && p.name === name))
				operation.parameters.unshift({
					name,
					in: "path",
					required: true,
					schema: { type: "string" },
				} as never);
		}

		// Inferred empty bodies (e.g. on DELETE) aren't real request bodies
		const bodies = Object.values(operation.requestBody?.content ?? {});
		if (
			bodies.length > 0 &&
			bodies.every(
				({ schema }) =>
					Object.keys(schema?.properties ?? {}).length === 0 &&
					(schema?.required ?? []).length === 0,
			)
		)
			delete operation.requestBody;

		const responses = operation.responses ?? {};
		operation.responses = Object.fromEntries(
			Object.entries(responses).sort(([a], [b]) => a.localeCompare(b)),
		);

		// Operations that can answer 401 need the session cookie
		if ("401" in responses) operation.security = [{ session: [] }];
	}

spec.components = {
	...spec.components,
	securitySchemes: {
		session: {
			type: "apiKey",
			in: "cookie",
			name: "better-auth.session_token",
			description:
				"Session cookie set by POST /api/auth/sign-in/email (see docs/auth-contract.md).",
		},
	},
};

// JSON round trip: shared objects would otherwise become YAML anchors/aliases
await Bun.write(
	output,
	`# Generated by apps/api/scripts/openapi.ts. Do not edit by hand.\n${Bun.YAML.stringify(JSON.parse(JSON.stringify(spec)), null, 2)}`,
);
console.log(`[SUCCESS] Wrote ${output}`);
