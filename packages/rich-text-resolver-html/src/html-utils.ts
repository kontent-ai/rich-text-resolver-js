import { escapeHtml } from "@kontent-ai/rich-text-resolver";

/**
 * @deprecated Use `escapeHtml` from `@kontent-ai/rich-text-resolver` instead.
 */
export const escapeHtmlAttribute = escapeHtml;

/**
 * Serializes attributes into a space separated `key="value"` string, escaping every value.
 * Only strings are rendered; everything else, including `undefined` and `null`, is omitted.
 * Mark definitions allow `unknown` values, but HTML attributes are always strings.
 */
export const formatAttributes = (attributes: Readonly<Record<string, unknown>>): string =>
  Object.entries(attributes)
    .filter((entry): entry is [string, string] => typeof entry[1] === "string")
    .map(([key, value]) => `${key}="${escapeHtml(value)}"`)
    .join(" ");
