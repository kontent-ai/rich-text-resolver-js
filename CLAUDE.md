# CLAUDE.md

## Project Overview

This is a pnpm monorepo for transforming Kontent.ai rich text into structured formats. The architecture follows a modular approach with a core transformation package and framework-specific resolution packages.

**Core flow**: Kontent.ai rich text HTML → Portable Text (via core package) → Framework-specific output (HTML, React, Vue, Markdown)

## Monorepo Structure

- **packages/rich-text-resolver** - Core package that parses HTML and transforms it to Portable Text format
- **packages/rich-text-resolver-html** - HTML resolution and Management API transformation
- **packages/rich-text-resolver-react** - React components and helpers
- **packages/rich-text-resolver-vue** - Vue composables and helpers
- **packages/rich-text-resolver-markdown** - Markdown transformation utilities

Each framework package has a peer dependency on `@kontent-ai/rich-text-resolver` (the core package).

## Common Commands
```bash
# Build all packages (uses Turbo for caching and parallelization)
pnpm build
# Build specific package
pnpm --filter rich-text-resolver build
# Run all tests (parallel via Turbo)
pnpm test
# Run tests sequentially (useful for debugging)
pnpm test:seq
# Test specific package
pnpm --filter rich-text-resolver test
# Check formatting and linting with Biome
pnpm biome:check
# Auto-fix formatting issues
pnpm biome
# Lint (via Turbo)
pnpm lint
```

### Publishing
- This repository uses changesets to manage versioning and publishing.
- DO NOT BUMP VERSIONS OR PUBLISH BY YOURSELF, UNLESS ASKED.

## Architecture Details

### Core Package (`rich-text-resolver`)
The core package has two main responsibilities:
1. **Parsing** - Environment-aware HTML parsing
2. **Transformation** - transforms back to html or to portable text

### Framework Packages
Framework packages (html, react, vue, markdown) depend on the core package and provide:
- Default resolutions for Kontent.ai-specific blocks
- Framework-specific components/helpers
- Resolution for tags unsupported in base Portable Text libraries (sub, sup, tables, etc.)

## Development Notes

### TypeScript Configuration
- Uses project references (tsconfig.json has references to all packages)
- Module system: `NodeNext` with ESM modules
- Strict mode enabled with `noUncheckedIndexedAccess`
- All imports must use `.js` extensions (enforced by Biome rule `useImportExtensions`)

### Testing
- Vitest for all testing
- React/Vue packages use jsdom environment
- Test files: `*.spec.ts` or `*.test.ts` (excluded from build)

### Build System
- Turbo for task orchestration and caching
- Each package builds independently with TypeScript compiler
- Build outputs to `dist/` in each package

### Package Manager
- **Must use pnpm** (specified in packageManager field)
- Workspace structure defined in `pnpm-workspace.yaml`

## Core Principles
- Be honest about limitations - If uncertain or don't know something, say so explicitly
- Search in the repository, whether there isn't already similar implementation first.

## General Code Quality
- Always prefer functions and composition over classes and inheritance
- Use functional programming principles like pure functions, immutable data structures, and function composition
- Use early returns to reduce nesting
- Use type instead of interface unless necessary
- Use clear, self-documenting variable and function names
- Always prefix boolean variables with `should`, `is`, `has`, `does` or similar
- Define all type properties as readonly:
  ```typescript
  type Type = Readonly<{
   id: Uuid;
   items: ReadonlyArray<Item>;
   ids: ReadonlySet<Uuid>;
  }>
  ```

## Import Organization
- Always include file extensions in relative imports
