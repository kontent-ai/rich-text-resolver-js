---
"@kontent-ai/rich-text-resolver-vue": patch
---

Require `@kontent-ai/rich-text-resolver` `^3.1.0` as a peer dependency. The bundled `@kontent-ai/rich-text-resolver-html` now imports `escapeHtml` from the core package, which older core versions do not export.
