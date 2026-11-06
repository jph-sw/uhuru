/**
 * Runs the contract tests against apps/api with a fresh, temporary database:
 * migrate, start the API on a free port, run `bun test`, then clean up.
 * Your development database is never touched.
 *
 * Usage: bun run test:contract (from the repo root)
 */
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const apiDir = resolve(import.meta.dir, "../../../apps/api");
const testsDir = resolve(import.meta.dir, "..");
const tmp = mkdtempSync(join(tmpdir(), "uhuru-contract-"));
const port = 30000 + Math.floor(Math.random() * 20000);
const baseUrl = `http://localhost:${port}`;

const env = {
	...process.env,
	DATABASE_PATH: join(tmp, "database.sqlite"),
	API_PORT: String(port),
	BETTER_AUTH_URL: baseUrl,
	BETTER_AUTH_SECRET: "contract-tests-secret-at-least-32-characters",
	TRUSTED_ORIGINS: "",
	ADMIN_NAME: "Contract Admin",
	ADMIN_EMAIL: "admin@contract.test",
	ADMIN_PASSWORD: "contract-admin-password",
	BASE_URL: baseUrl,
};

let api: Bun.Subprocess | undefined;
let exitCode = 1;

try {
	const migrate = Bun.spawnSync(["bun", "--bun", "drizzle-kit", "migrate"], {
		cwd: apiDir,
		env,
		stdout: "inherit",
		stderr: "inherit",
	});
	if (!migrate.success) throw new Error("Migrations failed");

	api = Bun.spawn(["bun", "src/index.ts"], {
		cwd: apiDir,
		env,
		stdout: "inherit",
		stderr: "inherit",
	});

	await waitForApi(baseUrl);

	const tests = Bun.spawn(["bun", "test", "--timeout", "20000", ...process.argv.slice(2)], {
		cwd: testsDir,
		env,
		stdout: "inherit",
		stderr: "inherit",
	});
	exitCode = await tests.exited;
} catch (error) {
	console.error(error);
} finally {
	api?.kill();
	await api?.exited;
	rmSync(tmp, { recursive: true, force: true });
}

process.exit(exitCode);

async function waitForApi(url: string) {
	for (let i = 0; i < 100; i++) {
		try {
			if ((await fetch(`${url}/api/content/health-check`)).ok) return;
		} catch {}
		await Bun.sleep(100);
	}
	throw new Error(`API did not start on ${url}`);
}
