import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "tests/",
        "**/*.spec.ts",
        "**/*.spec.tsx",
        "**/*.config.*",
        "create-cjs-package-json.cjs",
      ],
    },
  },
  resolve: {
    // Handle .js extensions for TypeScript imports (ESM compatibility)
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
});
