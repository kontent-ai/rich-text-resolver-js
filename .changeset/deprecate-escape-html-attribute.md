---
"@kontent-ai/rich-text-resolver-html": minor
---

Deprecate `escapeHtmlAttribute` in favor of `escapeHtml` exported from `@kontent-ai/rich-text-resolver`, and require `@kontent-ai/rich-text-resolver` `^3.1.0` as a peer dependency.

`toManagementApiFormat` now HTML-escapes external link attribute values, so quotes or `<` in values such as a link title no longer produce invalid rich text.
