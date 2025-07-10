import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		projects: [
			{
				extends: true,
				test: {
					name: "unit",
					include: ["**/*.unit.spec.ts"],
					exclude: ["node_modules"],
					root: "./",
				},
			},
		],
	},
});
