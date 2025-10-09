---
"@kontent-ai/rich-text-resolver": major
"@kontent-ai/rich-text-resolver-util": major
"@kontent-ai/rich-text-resolver-react": major
"@kontent-ai/rich-text-resolver-vue": major
---

# v3.0.0 - Monorepo Architecture

This is a major release that restructures the package into a monorepo with separate packages for different use cases.

## Breaking Changes

**Package Split:**
- Core functionality (parser, transformer) → `@kontent-ai/rich-text-resolver`
- Output formatters (toHTML, toMapi) → `@kontent-ai/rich-text-resolver-util`
- React components → `@kontent-ai/rich-text-resolver-react`
- Vue helpers → `@kontent-ai/rich-text-resolver-vue`

**Import Path Changes:**
- `/utils/html` → `@kontent-ai/rich-text-resolver-util`
- `/utils/mapi` → `@kontent-ai/rich-text-resolver-util`
- `/utils/react` → `@kontent-ai/rich-text-resolver-react`
- `/utils/vue` → `@kontent-ai/rich-text-resolver-vue`

**Dependency Changes:**
- React and Vue are now peer dependencies only in their respective packages
- Reduced bundle size when not using all features

## Migration

See [MIGRATION.md](./MIGRATION.md) for detailed migration instructions.

## Benefits

- ✅ Install only what you need
- ✅ Smaller bundle sizes
- ✅ Better tree-shaking
- ✅ Clearer dependencies
