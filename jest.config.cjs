module.exports = {
  projects: [
    '<rootDir>/packages/core/jest.config.cjs',
    '<rootDir>/packages/react/jest.config.cjs'
  ],
  collectCoverageFrom: [
    "packages/*/src/**/*.{ts,tsx}",
    "!packages/*/src/**/*.d.ts",
    "!packages/*/src/**/*.test.{ts,tsx}",
    "!packages/*/src/**/*.spec.{ts,tsx}"
  ],
};