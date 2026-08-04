# @kontent-ai/rich-text-resolver-html

## 3.0.4

### Patch Changes

- Escape HTML attribute values in `toHTML`

  Attribute values were interpolated unescaped, so a quote in a link title or asset description
  could break out of its attribute, and `?a=1&copy=2` rendered as `?a=1©=2`.

  Only `toHTML` escapes. `toManagementApiFormat` and the core HTML transformers write values out
  as parsed and are documented as not being sanitizers.

  `toHTMLImageDefault` now emits `alt=""` instead of `alt="undefined"` when an asset has no
  description.

## 3.0.3

### Patch Changes

- bump packages

## 3.0.2

### Patch Changes

- update packages

## 3.0.1

### Patch Changes

- Update release workflow

## 3.0.0

### Major Changes

- Breaking change: Restructure project into modular monorepo with separate packages for core, HTML, React, Vue, and Markdown functionality
- Breaking change: remove legacy browser and CommonJS build support; all packages now ship ESM-only
- Breaking change: update package exports to use public barrel files and remove subpath imports from package.json

### Migration Guide from v2.0.4

#### Installation

**Before (v2.0.4):**

```bash
npm install @kontent-ai/rich-text-resolver
```

**After (v3.0.0):**

```bash
# Install core package (required)
npm install @kontent-ai/rich-text-resolver

# Plus framework-specific packages as needed:
npm install @kontent-ai/rich-text-resolver-html    # For HTML/MAPI
npm install @kontent-ai/rich-text-resolver-react   # For React
npm install @kontent-ai/rich-text-resolver-vue     # For Vue
npm install @kontent-ai/rich-text-resolver-markdown # For Markdown
```

#### Import Changes

The following table shows how old subpath imports map to new packages:

| Old Import (v2.0.4)                                         | New Package (v3.0.0)                   | New Import                             |
| ----------------------------------------------------------- | -------------------------------------- | -------------------------------------- |
| `@kontent-ai/rich-text-resolver`                            | `@kontent-ai/rich-text-resolver`       | `@kontent-ai/rich-text-resolver`       |
| `@kontent-ai/rich-text-resolver/parser`                     | `@kontent-ai/rich-text-resolver`       | `@kontent-ai/rich-text-resolver`       |
| `@kontent-ai/rich-text-resolver/transformers/html`          | `@kontent-ai/rich-text-resolver`       | `@kontent-ai/rich-text-resolver`       |
| `@kontent-ai/rich-text-resolver/transformers/portable-text` | `@kontent-ai/rich-text-resolver`       | `@kontent-ai/rich-text-resolver`       |
| `@kontent-ai/rich-text-resolver/utils`                      | `@kontent-ai/rich-text-resolver`       | `@kontent-ai/rich-text-resolver`       |
| `@kontent-ai/rich-text-resolver/utils/html`                 | `@kontent-ai/rich-text-resolver-html`  | `@kontent-ai/rich-text-resolver-html`  |
| `@kontent-ai/rich-text-resolver/utils/mapi`                 | `@kontent-ai/rich-text-resolver-html`  | `@kontent-ai/rich-text-resolver-html`  |
| `@kontent-ai/rich-text-resolver/utils/react`                | `@kontent-ai/rich-text-resolver-react` | `@kontent-ai/rich-text-resolver-react` |
| `@kontent-ai/rich-text-resolver/utils/vue`                  | `@kontent-ai/rich-text-resolver-vue`   | `@kontent-ai/rich-text-resolver-vue`   |
| `@kontent-ai/rich-text-resolver/types/transformer`          | `@kontent-ai/rich-text-resolver`       | `@kontent-ai/rich-text-resolver`       |
| `@kontent-ai/rich-text-resolver/types/parser`               | `@kontent-ai/rich-text-resolver`       | `@kontent-ai/rich-text-resolver`       |

**Example: React**

Before (v2.0.4):

```typescript
import { transformToPortableText } from "@kontent-ai/rich-text-resolver/transformers/portable-text";
import { PortableTextReactRenderer } from "@kontent-ai/rich-text-resolver/utils/react";
```

After (v3.0.0):

```typescript
import { transformToPortableText } from "@kontent-ai/rich-text-resolver";
import { PortableTextReactRenderer } from "@kontent-ai/rich-text-resolver-react";
```

**Example: Vue**

Before (v2.0.4):

```typescript
import { transformToPortableText } from "@kontent-ai/rich-text-resolver/transformers/portable-text";
import { usePortableTextVueRenderer } from "@kontent-ai/rich-text-resolver/utils/vue";
```

After (v3.0.0):

```typescript
import { transformToPortableText } from "@kontent-ai/rich-text-resolver";
import { usePortableTextVueRenderer } from "@kontent-ai/rich-text-resolver-vue";
```

**Example: HTML/MAPI**

Before (v2.0.4):

```typescript
import { transformToHtml } from "@kontent-ai/rich-text-resolver/transformers/html";
import { transformToMapi } from "@kontent-ai/rich-text-resolver/utils/mapi";
```

After (v3.0.0):

```typescript
import { transformToHtml } from "@kontent-ai/rich-text-resolver";
import { transformToMapi } from "@kontent-ai/rich-text-resolver-html";
```
