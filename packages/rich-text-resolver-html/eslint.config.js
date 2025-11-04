import kontentAiConfig from "@kontent-ai/eslint-config";

export default [
  {
    ignores: [
      "dist/**",
      "coverage/**",
      "**/*.spec.ts",
      "**/*.spec.tsx",
      "**/*.config.ts",
      "**/*.config.js",
      "tests/setup.ts",
    ],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    ...kontentAiConfig,
    languageOptions: {
      ...kontentAiConfig.languageOptions,
      parserOptions: {
        ...kontentAiConfig.languageOptions.parserOptions,
        project: "./tsconfig.json",
      },
    },
  },
];
