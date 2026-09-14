const htmlEscapes: ReadonlyMap<string, string> = new Map([
  ["&", "&amp;"],
  ["<", "&lt;"],
  [">", "&gt;"],
  ['"', "&quot;"],
  ["'", "&#39;"],
]);

/**
 * Escapes a value for use inside a double-quoted HTML attribute.
 *
 * Values arrive decoded from the parser. Escape literal entity spellings too, so the
 * next HTML parse preserves them instead of decoding them again.
 */
export const escapeHtmlAttribute = (value: string): string =>
  value.replace(/[&<>"']/g, (character) => htmlEscapes.get(character) ?? character);

/**
 * Serializes attributes into a space separated `key="value"` string, escaping every value.
 * Only strings are rendered; everything else, including `undefined` and `null`, is omitted.
 * Mark definitions allow `unknown` values, but HTML attributes are always strings.
 * Attribute names and URL schemes are not validated here.
 */
export const formatAttributes = (attributes: Readonly<Record<string, unknown>>): string =>
  Object.entries(attributes)
    .filter((entry): entry is [string, string] => typeof entry[1] === "string")
    .map(([key, value]) => `${key}="${escapeHtmlAttribute(value)}"`)
    .join(" ");
