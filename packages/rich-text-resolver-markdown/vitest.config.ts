import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
});
