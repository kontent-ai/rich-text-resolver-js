import { Elements, ElementType } from "@kentico/kontent-delivery";
import { transformer } from "../src/RichTextToJsonTransformer";

describe("rich-text-to-json-converter", () => {

    it("empty rich text converts properly", () => {
        const dummyRichText: Elements.RichTextElement = {
            value: "<p><br></p>",
            type: ElementType.RichText,
            images: [],
            linkedItemCodenames: [],
            linkedItems: [],
            links: [],
            name: "dummy"
        };

        const result: any = transformer.transform(dummyRichText);

        expect(result).toEqual<any>([
            {
                tagName: "",
                attributes: {},
                textContent: "<p><br></p>",
                children: [
                    {
                        tagName: "p",
                        attributes: {},
                        textContent: "<br>",
                        children: [
                            {
                                tagName: "br",
                                attributes: {},
                                textContent: "",
                                children: []
                            }
                        ]
                    }
                ],
            }
        ]);

    });

    it("nested link is parsed correctly", () => {
        const dummyRichText: Elements.RichTextElement = {
            value: "<p class=\"test\"><a href=\"mailto:email@abc.test\">email</a></p>",
            type: ElementType.RichText,
            images: [],
            linkedItemCodenames: [],
            linkedItems: [],
            links: [],
            name: "dummy"
        }

        const result: any = transformer.transform(dummyRichText);

        expect(result).toEqual<any>([
            {
                tagName: "",
                attributes: {},
                textContent: "<p class=\"test\"><a href=\"mailto:email@abc.test\">email</a></p>",
                children: [{
                    tagName: "p",
                    attributes: {
                        "class": "test"
                    },
                    textContent: '<a href=\"mailto:email@abc.test\">email</a>',
                    children: [{
                        tagName: "a",
                        attributes: {
                            "href": "mailto:email@abc.test"
                        },
                        textContent: 'email',
                        children: []
                    }]
                }]
            }
        ])
    })

    it("multiple child tags are parsed correctly", () => {
        const dummyRichText: Elements.RichTextElement = {
            value: "<p><b>bold text</b><i>italic text</i></p>",
            type: ElementType.RichText,
            images: [],
            linkedItemCodenames: [],
            linkedItems: [],
            links: [],
            name: "dummy"
        }
    
        const result: any = transformer.transform(dummyRichText);
    
        expect(result).toEqual<any>([
            {
                tagName: "",
                attributes: {},
                textContent: "<p><b>bold text</b><i>italic text</i></p>",
                children: [{
                    tagName: "p",
                    attributes: {},
                    textContent: '<b>bold text</b><i>italic text</i>',
                    children: [{
                        tagName: "b",
                        attributes: {},
                        textContent: 'bold text',
                        children: []
                    },{
                        tagName: "i",
                        attributes: {},
                        textContent: 'italic text',
                        children: []
                    }]
                }]
            }
        ])
    })

    it("complex rich text is parsed correctly", () => {
        const dummyRichText: Elements.RichTextElement = {
            value: "<p>Some text at the first level, followed by a component.&nbsp;</p>\n<object type=\"application/kenticocloud\" data-type=\"item\" data-rel=\"component\" data-codename=\"n27ec1626_93ac_0129_64e5_1beeda45416c\"></object>\n<p>and a linked item</p>\n<object type=\"application/kenticocloud\" data-type=\"item\" data-rel=\"link\" data-codename=\"commercet\"></object>\n<p>and a table</p>\n<table><tbody>\n  <tr><td>1</td><td>2</td><td>3</td></tr>\n  <tr><td>4</td><td>5</td><td>6</td></tr>\n  <tr><td>a</td><td>b</td><td>c</td></tr>\n</tbody></table>\n<p>and some <strong>bold</strong> and <em><strong>bold italic</strong></em></p>\n<h1>and some heading 1</h1>\n<h2>and h2</h2>\n<h5>and h5</h5>",
            //value: "<p>text<b>bold text</b> text after</p>",
            type: ElementType.RichText,
            images: [],
            linkedItemCodenames: [],
            linkedItems: [],
            links: [],
            name: "dummy"
        }

        const result: any = transformer.transform(dummyRichText);

        expect(result).toMatchInlineSnapshot(`
Array [
  Object {
    "attributes": Object {},
    "children": Array [
      Object {
        "attributes": Object {},
        "children": Array [],
        "tagName": "p",
        "textContent": "Some text at the first level, followed by a component.&nbsp;",
      },
      Object {
        "attributes": Object {
          "data-codename": "n27ec1626_93ac_0129_64e5_1beeda45416c",
          "data-rel": "component",
          "data-type": "item",
          "type": "application/kenticocloud",
        },
        "children": Array [],
        "tagName": "object",
        "textContent": "",
      },
      Object {
        "attributes": Object {},
        "children": Array [],
        "tagName": "p",
        "textContent": "and a linked item",
      },
      Object {
        "attributes": Object {
          "data-codename": "commercet",
          "data-rel": "link",
          "data-type": "item",
          "type": "application/kenticocloud",
        },
        "children": Array [],
        "tagName": "object",
        "textContent": "",
      },
      Object {
        "attributes": Object {},
        "children": Array [],
        "tagName": "p",
        "textContent": "and a table",
      },
      Object {
        "attributes": Object {},
        "children": Array [
          Object {
            "attributes": Object {},
            "children": Array [
              Object {
                "attributes": Object {},
                "children": Array [
                  Object {
                    "attributes": Object {},
                    "children": Array [],
                    "tagName": "td",
                    "textContent": "1",
                  },
                  Object {
                    "attributes": Object {},
                    "children": Array [],
                    "tagName": "td",
                    "textContent": "2",
                  },
                  Object {
                    "attributes": Object {},
                    "children": Array [],
                    "tagName": "td",
                    "textContent": "3",
                  },
                ],
                "tagName": "tr",
                "textContent": "<td>1</td><td>2</td><td>3</td>",
              },
              Object {
                "attributes": Object {},
                "children": Array [
                  Object {
                    "attributes": Object {},
                    "children": Array [],
                    "tagName": "td",
                    "textContent": "4",
                  },
                  Object {
                    "attributes": Object {},
                    "children": Array [],
                    "tagName": "td",
                    "textContent": "5",
                  },
                  Object {
                    "attributes": Object {},
                    "children": Array [],
                    "tagName": "td",
                    "textContent": "6",
                  },
                ],
                "tagName": "tr",
                "textContent": "<td>4</td><td>5</td><td>6</td>",
              },
              Object {
                "attributes": Object {},
                "children": Array [
                  Object {
                    "attributes": Object {},
                    "children": Array [],
                    "tagName": "td",
                    "textContent": "a",
                  },
                  Object {
                    "attributes": Object {},
                    "children": Array [],
                    "tagName": "td",
                    "textContent": "b",
                  },
                  Object {
                    "attributes": Object {},
                    "children": Array [],
                    "tagName": "td",
                    "textContent": "c",
                  },
                ],
                "tagName": "tr",
                "textContent": "<td>a</td><td>b</td><td>c</td>",
              },
            ],
            "tagName": "tbody",
            "textContent": "
  <tr><td>1</td><td>2</td><td>3</td></tr>
  <tr><td>4</td><td>5</td><td>6</td></tr>
  <tr><td>a</td><td>b</td><td>c</td></tr>
",
          },
        ],
        "tagName": "table",
        "textContent": "<tbody>
  <tr><td>1</td><td>2</td><td>3</td></tr>
  <tr><td>4</td><td>5</td><td>6</td></tr>
  <tr><td>a</td><td>b</td><td>c</td></tr>
</tbody>",
      },
      Object {
        "attributes": Object {},
        "children": Array [
          Object {
            "attributes": Object {},
            "children": Array [],
            "tagName": "strong",
            "textContent": "bold",
          },
          Object {
            "attributes": Object {},
            "children": Array [
              Object {
                "attributes": Object {},
                "children": Array [],
                "tagName": "strong",
                "textContent": "bold italic",
              },
            ],
            "tagName": "em",
            "textContent": "<strong>bold italic</strong>",
          },
        ],
        "tagName": "p",
        "textContent": "and some <strong>bold</strong> and <em><strong>bold italic</strong></em>",
      },
      Object {
        "attributes": Object {},
        "children": Array [],
        "tagName": "h1",
        "textContent": "and some heading 1",
      },
      Object {
        "attributes": Object {},
        "children": Array [],
        "tagName": "h2",
        "textContent": "and h2",
      },
      Object {
        "attributes": Object {},
        "children": Array [],
        "tagName": "h5",
        "textContent": "and h5",
      },
    ],
    "tagName": "",
    "textContent": "<p>Some text at the first level, followed by a component.&nbsp;</p>
<object type=\\"application/kenticocloud\\" data-type=\\"item\\" data-rel=\\"component\\" data-codename=\\"n27ec1626_93ac_0129_64e5_1beeda45416c\\"></object>
<p>and a linked item</p>
<object type=\\"application/kenticocloud\\" data-type=\\"item\\" data-rel=\\"link\\" data-codename=\\"commercet\\"></object>
<p>and a table</p>
<table><tbody>
  <tr><td>1</td><td>2</td><td>3</td></tr>
  <tr><td>4</td><td>5</td><td>6</td></tr>
  <tr><td>a</td><td>b</td><td>c</td></tr>
</tbody></table>
<p>and some <strong>bold</strong> and <em><strong>bold italic</strong></em></p>
<h1>and some heading 1</h1>
<h2>and h2</h2>
<h5>and h5</h5>",
  },
]
`);
    })
});