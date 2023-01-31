"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const delivery_sdk_1 = require("@kontent-ai/delivery-sdk");
const RichTextBrowserParser_1 = require("../src/RichTextBrowserParser");
const RichTextNodeParser_1 = require("../src_old/parsers/RichTextNodeParser");
const RichTextHtmlResolver_1 = require("../src_old/resolvers/RichTextHtmlResolver");
const RichTextObjectResolver_1 = require("../src_old/resolvers/RichTextObjectResolver");
let richTextNodeParser = new RichTextNodeParser_1.RichTextNodeParser();
let richTextHtmlResolverBrowserParser = new RichTextHtmlResolver_1.RichTextHtmlResolver({
    contentItemResolver: (itemCodename, contentItem) => {
        switch (contentItem === null || contentItem === void 0 ? void 0 : contentItem.system.type) {
            case 'test':
                return {
                    resolvedContent: `<p>resolved item of type:  ${contentItem === null || contentItem === void 0 ? void 0 : contentItem.system.type}</p>`
                };
            default:
                return {
                    resolvedContent: `<p>no resolver implemented for type: ${contentItem === null || contentItem === void 0 ? void 0 : contentItem.system.type}</p>`
                };
        }
    },
});
let richTextHtmlResolverNodeParser = new RichTextHtmlResolver_1.RichTextHtmlResolver({
    contentItemResolver: (itemCodename, contentItem) => {
        switch (contentItem === null || contentItem === void 0 ? void 0 : contentItem.system.type) {
            case 'test':
                return {
                    resolvedContent: `<p>resolved item of type:  ${contentItem === null || contentItem === void 0 ? void 0 : contentItem.system.type}</p>`
                };
            default:
                return {
                    resolvedContent: `<p>no resolver implemented for type: ${contentItem === null || contentItem === void 0 ? void 0 : contentItem.system.type}</p>`
                };
        }
    },
    parser: richTextNodeParser
});
let richTextObjectResolver = new RichTextObjectResolver_1.RichTextObjectResolver({
    contentItemResolver: (itemCodename, contentItem) => {
        switch (contentItem === null || contentItem === void 0 ? void 0 : contentItem.system.type) {
            case 'test':
                return {
                    resolvedContent: {
                        type: contentItem.system.type,
                        codename: contentItem.system.codename
                    }
                };
            default:
                return {
                    resolvedContent: {
                        error: "no resolver implemented for this type"
                    }
                };
        }
    }
});
const dummyRichText = {
    value: "<p class=\"test\" id=3><object type=\"application/kenticocloud\" data-type=\"item\" data-rel=\"component\" data-codename=\"test_item\"></object>before text<a href=\"mailto:email@abc.test\">email</a>after text line break <br></p>",
    type: delivery_sdk_1.ElementType.RichText,
    images: [],
    linkedItemCodenames: [],
    linkedItems: [
        {
            system: {
                id: "99e17fe7-a215-400d-813a-dc3608ee0294",
                name: "test item",
                codename: "test_item",
                language: "default",
                type: "test",
                collection: "default",
                sitemapLocations: [],
                lastModified: "2022-10-11T11:27:25.4033512Z",
                workflowStep: "published"
            },
            elements: {
                text_element: {
                    type: delivery_sdk_1.ElementType.Text,
                    name: "text element",
                    value: "random text value"
                }
            }
        }
    ],
    links: [],
    name: "dummy"
};
describe("Rich text resolver with Node parser", () => {
    it("returns parsed tree", () => {
        const result = richTextNodeParser.parse(dummyRichText);
        expect(result).toMatchInlineSnapshot(`
Object {
  "content": Array [
    Object {
      "attributes": Object {
        "class": "test",
        "id": "3",
      },
      "children": Array [
        Object {
          "attributes": Object {
            "data-codename": "test_item",
            "data-rel": "component",
            "data-type": "item",
            "type": "application/kenticocloud",
          },
          "children": Array [],
          "name": "object",
          "type": "tag",
        },
        Object {
          "content": "before text",
          "type": "text",
        },
        Object {
          "attributes": Object {
            "href": "mailto:email@abc.test",
          },
          "children": Array [
            Object {
              "content": "email",
              "type": "text",
            },
          ],
          "name": "a",
          "type": "tag",
        },
        Object {
          "content": "after text line break ",
          "type": "text",
        },
        Object {
          "attributes": Object {},
          "children": Array [],
          "name": "br",
          "type": "tag",
        },
      ],
      "name": "p",
      "type": "tag",
    },
  ],
}
`);
    });
    it("parses empty rich text correctly", () => {
        dummyRichText.value = `<p><br></p>`;
        const result = richTextHtmlResolverNodeParser.resolve(dummyRichText);
        expect(result).toMatchInlineSnapshot(`"<p><br></p>"`);
    });
    it("returns HTML resolved rich text", () => {
        dummyRichText.value = "<p class=\"test\" id=3><object type=\"application/kenticocloud\" data-type=\"item\" data-rel=\"component\" data-codename=\"test_item\"></object>before text<a href=\"mailto:email@abc.test\">email</a>after text line break <br></p>";
        const result = richTextHtmlResolverNodeParser.resolve(dummyRichText);
        expect(result).toMatchInlineSnapshot(`"<p class=\\"test\\" id=\\"3\\"><p>resolved item of type:  test</p>before text<a href=\\"mailto:email@abc.test\\">email</a>after text line break <br></p>"`);
    });
    it("returns the same content in both node and browser", () => {
        const browserParsedResolution = richTextHtmlResolverBrowserParser.resolve(dummyRichText);
        const nodeParsedResolution = richTextHtmlResolverNodeParser.resolve(dummyRichText);
        expect(nodeParsedResolution).toEqual(browserParsedResolution);
    });
});
const richText = {
    value: "<p class=\"test\" id=3><object type=\"application/kenticocloud\" data-type=\"item\" data-rel=\"component\" data-codename=\"test_item\"></object>before text<a href=\"mailto:email@abc.test\">email</a>after text line break <br></p><span>text span</span>",
    images: {},
    modular_content: [],
    links: {}
};
describe('new rich text parser', () => {
    it('parses rich text', () => {
        const richTextBrowserParser = new RichTextBrowserParser_1.RichTextBrowserParser();
        const result = richTextBrowserParser.parse(richText.value);
        expect(result).toMatchSnapshot();
    });
});
