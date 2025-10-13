import * as runtimeEnvironment from "browser-or-node";
import { parse as browserParseImpl } from "./browser/rich-text-browser-parser.js";
import { parse as nodeParseImpl } from "./node/rich-text-node-parser.js";

/**
 * Parses HTML string into DOM nodes.
 * Automatically uses the appropriate parser based on runtime environment (browser or Node.js).
 *
 * @param htmlInput - HTML string to parse
 * @returns Array of parsed DOM nodes
 */
export const parseHTML = (htmlInput: string) =>
  runtimeEnvironment.isBrowser ? browserParseImpl(htmlInput) : nodeParseImpl(htmlInput);
