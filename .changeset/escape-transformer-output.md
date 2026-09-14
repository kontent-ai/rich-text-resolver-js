---
"@kontent-ai/rich-text-resolver": patch
---

Escape text nodes and default HTML attribute values in `nodesToHTML` and `nodesToHTMLAsync` so decoded entities remain text and quotes remain inside attribute values.

Escaping is enabled by default. To retain the previous unescaped behavior, pass `{ escapeHtml: false }` as the fifth argument, after context and context handler: `nodesToHTML(nodes, transformers, undefined, undefined, { escapeHtml: false })`. The same option is available in the async variant.

Custom transformers now receive escaped child text by default; their return values remain verbatim and node attributes remain decoded. Callers producing plain text, preserving trusted script/style source, or already compensating for missing escaping should review their transformations or opt out. These functions remain transformation utilities, not sanitizers.
