---
"@kontent-ai/rich-text-resolver": minor
---

`nodesToHTML` and `nodesToHTMLAsync` now HTML-escape text and attribute values, so parser-decoded characters such as `<` or `"` no longer produce invalid rich text (e.g. rejected by the Management API). Custom transformers receive escaped `children`; `node.attributes` remain decoded. The escaping function is exported as `escapeHtml`. Attributes are no longer separated by a double space.
