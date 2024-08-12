import {
  ArbitraryTypedObject,
  browserParse,
  nodeParse,
  PortableTextSpan,
  transformToPortableText,
  traversePortableText,
} from "../../../src";
import { toManagementApiFormat } from "../../../src/utils/resolution/mapi";

jest.mock("short-unique-id", () => {
  return {
    default: jest.fn().mockImplementation(() => {
      return () => "guid";
    }),
  };
});

const isSpan = (object: ArbitraryTypedObject): object is PortableTextSpan =>
  object._type === "span";

const sortMarks = (obj: ArbitraryTypedObject) =>
  isSpan(obj) ? { ...obj, marks: obj.marks?.sort() } : obj;

describe("portabletext to MAPI resolver", () => {
  const convertAndCompare = (richTextContent: string) => {
    // Parse the rich text content into a tree
    const browserTree = browserParse(richTextContent);
    const nodeTree = nodeParse(richTextContent);

    // Convert the tree to Portable Text
    const nodePortableText = transformToPortableText(nodeTree);
    const browserPortableText = transformToPortableText(browserTree);

    // Convert Portable Text to MAPI format
    const nodeManagementApiFormat = toManagementApiFormat(nodePortableText);
    const browserManagementApiFormat =
      toManagementApiFormat(browserPortableText);

    // Parse the MAPI format back into a tree and convert it to Portable Text
    const secondParseTree = nodeParse(nodeManagementApiFormat);
    const secondParsePortableText = transformToPortableText(secondParseTree);

    // Compare the MAPI formats to ensure consistency across platforms
    expect(nodeManagementApiFormat).toEqual(browserManagementApiFormat);

    // Compare the original Portable Text to the re-parsed Portable Text after MAPI conversion
    expect(
      secondParsePortableText.map((p) => traversePortableText(p, sortMarks))
    ).toStrictEqual(
      nodePortableText.map((p) => traversePortableText(p, sortMarks))
    );
  };

  it("handles nested style marks", () => {
    const richTextContent = `<p><strong>Bold text.</strong><em><strong>Bold italic text. </strong></em><em><sup>Superscript italic </sup></em><em><strong><sub>subscript bold</sub></strong></em></p>`;
    convertAndCompare(richTextContent);
  });

  it("handles rich text with internal links", () => {
    const richTextContent = `<p>Here is an <a data-item-id="12345"><strong>internal link</strong></a> in some text.</p>`;
    convertAndCompare(richTextContent);
  });

  it("handles rich text with external links", () => {
    const richTextContent = `<p>Here is an <a href="https://example.com" target="_blank" data-new-window="true" title="linktitle">external link</a> in some text.</p>`;
    convertAndCompare(richTextContent);
  });

  it("handles images correctly", () => {
    const richTextContent = `<figure data-asset-id="12345"><img src="#" data-asset-id="12345"></figure>`;
    convertAndCompare(richTextContent);
  });

  it("handles a complex rich text", () => {
    const richTextContent = `<p><em><strong>also italic and this is also </strong></em><strong><em><sup>superscript</sup></em></strong></p>`;
    convertAndCompare(richTextContent);
  });
});
