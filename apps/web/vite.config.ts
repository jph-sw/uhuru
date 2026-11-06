import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const config = defineConfig({
	plugins: [
		devtools(),
		tsconfigPaths({ projects: ["./tsconfig.json"] }),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
	],
	server: {
		proxy: {
			// The browser talks to the API through the dev server, so auth cookies
			// stay same-origin. In production, server.ts does the same.
			"/api": {
				target: process.env.API_URL ?? "http://localhost:3001",
				xfwd: true,
			},
		},
	},
});

export default config;
