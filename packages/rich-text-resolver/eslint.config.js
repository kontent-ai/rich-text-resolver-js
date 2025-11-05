import kontentAiConfig from "@kontent-ai/eslint-config";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["coverage", "dist"]),
  {
    extends: [kontentAiConfig],
    files: ["src/**/*.ts", "src/**/*.tsx"],
  },
]);
