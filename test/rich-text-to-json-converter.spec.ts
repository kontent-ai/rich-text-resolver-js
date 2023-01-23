import { Elements, ElementType, Responses } from "@kontent-ai/delivery-sdk";
import { Transformer } from "../src/RichTextTransformer";
import { RichTextHtmlResolver } from "../src/RichTextHtmlResolver";
import { RichTextObjectResolver } from "../src/RichTextObjectResolver";
import { IResolverInput, IRichTextHtmlContentItemResult } from "../src/models/resolver-models";

let richTextHtmlResolver = new RichTextHtmlResolver({
  contentItemResolver: (itemCodename, contentItem) => {
      switch (contentItem?.system.type) {
          case 'test':
              return {
                  resolvedContent: `<p>resolved item of type:  ${contentItem?.system.type}</p>`
              }       
          default:
              return {
                  resolvedContent: `<p>no resolver implemented for type: ${contentItem?.system.type}`
              }

      }
  }
});

let richTextObjectResolver = new RichTextObjectResolver({
  contentItemResolver: (itemCodename, contentItem) => {
    switch (contentItem?.system.type) {
      case 'test':
        return {
          resolvedContent: {
            type: contentItem.system.type,
            codename: contentItem.system.codename
          }
        }
      default:
        return {
          resolvedContent: {
            error: "no resolver implemented for this type"
          }
        }
    }
  }
})

let richTextTransformer = new Transformer();

const dummyRichText: Elements.RichTextElement = {
  value: "<p class=\"test\" id=3><object type=\"application/kenticocloud\" data-type=\"item\" data-rel=\"component\" data-codename=\"test_item\"></object>before text<a href=\"mailto:email@abc.test\">email</a>after text line break <br></p>",
  type: ElementType.RichText,
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
          type: ElementType.Text,
          name: "text element",
          value: "random text value"
          }
        }
    }
  ],
  links: [],
  name: "dummy"
};

describe("rich-text-transformer", () => {
  it("returns parsed tree", () => {
    const result = richTextTransformer.transform(richTextTransformer.parse(dummyRichText));

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
  })
})

describe("rich-text-html-resolver", () => {
  it("resolves empty rich text correctly", () => {
    dummyRichText.value = `<p><br></p>`;
    const result = richTextHtmlResolver.resolve(dummyRichText);

    expect(result).toMatchInlineSnapshot(`"<p><br></p>"`);
  })

  it("returns returns resolved rich text", () => {
    dummyRichText.value = "<p class=\"test\" id=3><object type=\"application/kenticocloud\" data-type=\"item\" data-rel=\"component\" data-codename=\"test_item\"></object>before text<a href=\"mailto:email@abc.test\">email</a>after text line break <br></p>"
    const result = richTextHtmlResolver.resolve(dummyRichText);

    expect(result).toMatchInlineSnapshot(`"<p class=\\"test\\" id=\\"3\\"><p>resolved item of type:  test</p>before text<a href=\\"mailto:email@abc.test\\">email</a>after text line break <br></p>"`);
  })

  it("returns rich text as JSON", () => {
    const result = JSON.stringify(richTextTransformer.transform(richTextTransformer.parse(dummyRichText)));

    expect(result).toMatchInlineSnapshot(`"{\\"content\\":[{\\"name\\":\\"p\\",\\"attributes\\":{\\"class\\":\\"test\\",\\"id\\":\\"3\\"},\\"children\\":[{\\"name\\":\\"object\\",\\"attributes\\":{\\"type\\":\\"application/kenticocloud\\",\\"data-type\\":\\"item\\",\\"data-rel\\":\\"component\\",\\"data-codename\\":\\"test_item\\"},\\"children\\":[],\\"type\\":\\"tag\\"},{\\"content\\":\\"before text\\",\\"type\\":\\"text\\"},{\\"name\\":\\"a\\",\\"attributes\\":{\\"href\\":\\"mailto:email@abc.test\\"},\\"children\\":[{\\"content\\":\\"email\\",\\"type\\":\\"text\\"}],\\"type\\":\\"tag\\"},{\\"content\\":\\"after text line break \\",\\"type\\":\\"text\\"},{\\"name\\":\\"br\\",\\"attributes\\":{},\\"children\\":[],\\"type\\":\\"tag\\"}],\\"type\\":\\"tag\\"}]}"`);
  })
});

describe("rich-text-object-resolver", () => {
  it("resolves linked item into an object", () => {
    const result = richTextObjectResolver.resolve(dummyRichText);

    expect(result).toMatchInlineSnapshot(`
Array [
  Object {
    "attributes": Object {
      "class": "test",
      "id": "3",
    },
    "children": Array [
      Object {
        "codename": "test_item",
        "type": "test",
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
]
`);
  })
})
