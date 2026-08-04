---
"@kontent-ai/rich-text-resolver-html": patch
---

Escape HTML attribute values in `toHTML`

Attribute values were interpolated unescaped, so a quote in a link title or asset description
could break out of its attribute, and `?a=1&copy=2` rendered as `?a=1©=2`.

Only `toHTML` escapes. `toManagementApiFormat` and the core HTML transformers write values out
as parsed and are documented as not being sanitizers.

`toHTMLImageDefault` now emits `alt=""` instead of `alt="undefined"` when an asset has no
description.
