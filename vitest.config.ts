import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: ["packages/*"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: "coverage",
      include: ["packages/**/*.ts", "packages/**/*.tsx"],
      exclude: [
        "packages/**/node_modules/",
        "packages/**/dist/",
        "packages/**/tests/",
        "packages/**/*.spec.ts",
        "packages/**/*.spec.tsx",
        "packages/**/*.config.*",
      ],
    },
  },
});
