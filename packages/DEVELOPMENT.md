# Development Guide

This monorepo contains the following packages:

- `@kontent-ai/rich-text-resolver` - The core package with HTML and Vue utilities
- `@kontent-ai/rich-text-resolver-react` - React-specific utilities

## Setup

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test
```

## Development Workflow

1. Make changes to the code
2. Run `npm run build` to build all packages
3. Run `npm test` to ensure everything works
4. Run `npm run lint` to check for linting issues

## Package Structure

### Core Package

The core package contains the main functionality and utilities for HTML and Vue.

```
packages/core/
├── src/
│   ├── parser/
│   ├── transformers/
│   └── utils/
│       └── resolution/
│           ├── html.ts
│           ├── mapi.ts
│           ├── react.ts (re-exports from React package)
│           └── vue.ts
└── tests/
```

### React Package

The React package contains only React-specific utilities.

```
packages/react/
├── src/
│   └── react.tsx (React components and utilities)
└── tests/
```

## Import Paths

The package maintains backward compatibility with the following import paths:

```js
// Core functionality
import { transformToPortableText } from '@kontent-ai/rich-text-resolver';

// React utilities
import { PortableText } from '@kontent-ai/rich-text-resolver/utils/react';
// or
import { PortableText } from '@kontent-ai/rich-text-resolver-react';
``` 