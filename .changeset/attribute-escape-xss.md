---
"@kontent-ai/rich-text-resolver": patch
"@kontent-ai/rich-text-resolver-html": patch
---

Escape HTML attribute values on emit to prevent stored XSS via attribute breakout.

Attribute values (e.g. a link `title`, image `alt`/`src`, MAPI data attributes) are now HTML-escaped when serialized, so entity-decoded rich-text content can no longer break out of an attribute and inject markup. A new `escapeHtmlAttribute` helper is exported from the core package.

Note: `nodesToHTML`/`nodesToHTMLAsync` remain unescaped by design (low-level transformers for producing Kontent.ai-compatible markup, e.g. migrations) and are now documented as unsafe to render as trusted HTML.

This changes the raw output string for values containing `&`, `"`, or `'` (now emitted as entities). Rendered output is visually unchanged; consumers with exact-string or snapshot assertions may need to refresh fixtures.
