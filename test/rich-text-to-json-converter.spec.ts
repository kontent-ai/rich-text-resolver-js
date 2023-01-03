import { Elements, ElementType } from "@kontent-ai/delivery-sdk";
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

        expect(result).toMatchInlineSnapshot(`
Array [
  Object {
    "attributes": Object {},
    "children": Array [
      Object {
        "attributes": Object {},
        "children": Array [
          Object {
            "attributes": Object {},
            "children": Array [],
            "innerContent": "",
            "tagName": "br",
          },
        ],
        "innerContent": "<br>",
        "tagName": "p",
      },
    ],
    "innerContent": "<p><br></p>",
    "tagName": "",
  },
]
`);

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

        expect(result).toMatchInlineSnapshot(`
Array [
  Object {
    "attributes": Object {},
    "children": Array [
      Object {
        "attributes": Object {
          "class": "test",
        },
        "children": Array [
          Object {
            "attributes": Object {
              "href": "mailto:email@abc.test",
            },
            "children": Array [],
            "innerContent": "email",
            "tagName": "a",
          },
        ],
        "innerContent": "<a href=\\"mailto:email@abc.test\\">email</a>",
        "tagName": "p",
      },
    ],
    "innerContent": "<p class=\\"test\\"><a href=\\"mailto:email@abc.test\\">email</a></p>",
    "tagName": "",
  },
]
`)
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
    
        expect(result).toMatchInlineSnapshot(`
Array [
  Object {
    "attributes": Object {},
    "children": Array [
      Object {
        "attributes": Object {},
        "children": Array [
          Object {
            "attributes": Object {},
            "children": Array [],
            "innerContent": "bold text",
            "tagName": "b",
          },
          Object {
            "attributes": Object {},
            "children": Array [],
            "innerContent": "italic text",
            "tagName": "i",
          },
        ],
        "innerContent": "<b>bold text</b><i>italic text</i>",
        "tagName": "p",
      },
    ],
    "innerContent": "<p><b>bold text</b><i>italic text</i></p>",
    "tagName": "",
  },
]
`)
    })

    it("complex rich text is parsed correctly", () => {
        const dummyRichText: Elements.RichTextElement = {
            value: "<p>Some text at the first level, followed by a component.&nbsp;</p>\n<object type=\"application/kenticocloud\" data-type=\"item\" data-rel=\"component\" data-codename=\"n27ec1626_93ac_0129_64e5_1beeda45416c\"></object>\n<p>and a linked item</p>\n<object type=\"application/kenticocloud\" data-type=\"item\" data-rel=\"link\" data-codename=\"commercet\"></object>\n<p>and a table</p>\n<table><tbody>\n  <tr><td>1</td><td>2</td><td>3</td></tr>\n  <tr><td>4</td><td>5</td><td>6</td></tr>\n  <tr><td>a</td><td>b</td><td>c</td></tr>\n</tbody></table>\n<p>and some <strong>bold</strong> and <em><strong>bold italic </strong></em>text</p>\n<p><a data-item-id=\"23f71096-fa89-4f59-a3f9-970e970944ec\" href=\"\"><strong>link to an item</strong></a></p>\n<ul>\n  <li><a href=\"https://www.google.com/\" data-new-window=\"true\" title=\"google\" target=\"_blank\" rel=\"noopener noreferrer\">link to a URL</a></li>\n  <li>bullet point</li>\n</ul>\n<ol>\n  <li>numbered list</li>\n  <li><em>numbered list links to an </em><a data-item-id=\"23f71096-fa89-4f59-a3f9-970e970944ec\" href=\"\"><em>item</em></a></li>\n</ol>\n<p><br></p>\n<p><br></p>\n<h1>and some heading 1</h1>\n<h2>and h2</h2>\n<h5>and h5</h5>",
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
        "innerContent": "Some text at the first level, followed by a component.&nbsp;",
        "tagName": "p",
      },
      Object {
        "attributes": Object {
          "data-codename": "n27ec1626_93ac_0129_64e5_1beeda45416c",
          "data-rel": "component",
          "data-type": "item",
          "type": "application/kenticocloud",
        },
        "children": Array [],
        "innerContent": "",
        "tagName": "object",
      },
      Object {
        "attributes": Object {},
        "children": Array [],
        "innerContent": "and a linked item",
        "tagName": "p",
      },
      Object {
        "attributes": Object {
          "data-codename": "commercet",
          "data-rel": "link",
          "data-type": "item",
          "type": "application/kenticocloud",
        },
        "children": Array [],
        "innerContent": "",
        "tagName": "object",
      },
      Object {
        "attributes": Object {},
        "children": Array [],
        "innerContent": "and a table",
        "tagName": "p",
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
                    "innerContent": "1",
                    "tagName": "td",
                  },
                  Object {
                    "attributes": Object {},
                    "children": Array [],
                    "innerContent": "2",
                    "tagName": "td",
                  },
                  Object {
                    "attributes": Object {},
                    "children": Array [],
                    "innerContent": "3",
                    "tagName": "td",
                  },
                ],
                "innerContent": "<td>1</td><td>2</td><td>3</td>",
                "tagName": "tr",
              },
              Object {
                "attributes": Object {},
                "children": Array [
                  Object {
                    "attributes": Object {},
                    "children": Array [],
                    "innerContent": "4",
                    "tagName": "td",
                  },
                  Object {
                    "attributes": Object {},
                    "children": Array [],
                    "innerContent": "5",
                    "tagName": "td",
                  },
                  Object {
                    "attributes": Object {},
                    "children": Array [],
                    "innerContent": "6",
                    "tagName": "td",
                  },
                ],
                "innerContent": "<td>4</td><td>5</td><td>6</td>",
                "tagName": "tr",
              },
              Object {
                "attributes": Object {},
                "children": Array [
                  Object {
                    "attributes": Object {},
                    "children": Array [],
                    "innerContent": "a",
                    "tagName": "td",
                  },
                  Object {
                    "attributes": Object {},
                    "children": Array [],
                    "innerContent": "b",
                    "tagName": "td",
                  },
                  Object {
                    "attributes": Object {},
                    "children": Array [],
                    "innerContent": "c",
                    "tagName": "td",
                  },
                ],
                "innerContent": "<td>a</td><td>b</td><td>c</td>",
                "tagName": "tr",
              },
            ],
            "innerContent": "
  <tr><td>1</td><td>2</td><td>3</td></tr>
  <tr><td>4</td><td>5</td><td>6</td></tr>
  <tr><td>a</td><td>b</td><td>c</td></tr>
",
            "tagName": "tbody",
          },
        ],
        "innerContent": "<tbody>
  <tr><td>1</td><td>2</td><td>3</td></tr>
  <tr><td>4</td><td>5</td><td>6</td></tr>
  <tr><td>a</td><td>b</td><td>c</td></tr>
</tbody>",
        "tagName": "table",
      },
      Object {
        "attributes": Object {},
        "children": Array [
          Object {
            "attributes": Object {},
            "children": Array [],
            "innerContent": "bold",
            "tagName": "strong",
          },
          Object {
            "attributes": Object {},
            "children": Array [
              Object {
                "attributes": Object {},
                "children": Array [],
                "innerContent": "bold italic ",
                "tagName": "strong",
              },
            ],
            "innerContent": "<strong>bold italic </strong>",
            "tagName": "em",
          },
        ],
        "innerContent": "and some <strong>bold</strong> and <em><strong>bold italic </strong></em>text",
        "tagName": "p",
      },
      Object {
        "attributes": Object {},
        "children": Array [
          Object {
            "attributes": Object {
              "data-item-id": "23f71096-fa89-4f59-a3f9-970e970944ec",
              "href": "",
            },
            "children": Array [
              Object {
                "attributes": Object {},
                "children": Array [],
                "innerContent": "link to an item",
                "tagName": "strong",
              },
            ],
            "innerContent": "<strong>link to an item</strong>",
            "tagName": "a",
          },
        ],
        "innerContent": "<a data-item-id=\\"23f71096-fa89-4f59-a3f9-970e970944ec\\" href=\\"\\"><strong>link to an item</strong></a>",
        "tagName": "p",
      },
      Object {
        "attributes": Object {},
        "children": Array [
          Object {
            "attributes": Object {},
            "children": Array [
              Object {
                "attributes": Object {
                  "data-new-window": "true",
                  "href": "https://www.google.com/",
                  "rel": "noopener noreferrer",
                  "target": "_blank",
                  "title": "google",
                },
                "children": Array [],
                "innerContent": "link to a URL",
                "tagName": "a",
              },
            ],
            "innerContent": "<a href=\\"https://www.google.com/\\" data-new-window=\\"true\\" title=\\"google\\" target=\\"_blank\\" rel=\\"noopener noreferrer\\">link to a URL</a>",
            "tagName": "li",
          },
          Object {
            "attributes": Object {},
            "children": Array [],
            "innerContent": "bullet point",
            "tagName": "li",
          },
        ],
        "innerContent": "
  <li><a href=\\"https://www.google.com/\\" data-new-window=\\"true\\" title=\\"google\\" target=\\"_blank\\" rel=\\"noopener noreferrer\\">link to a URL</a></li>
  <li>bullet point</li>
",
        "tagName": "ul",
      },
      Object {
        "attributes": Object {},
        "children": Array [
          Object {
            "attributes": Object {},
            "children": Array [],
            "innerContent": "numbered list",
            "tagName": "li",
          },
          Object {
            "attributes": Object {},
            "children": Array [
              Object {
                "attributes": Object {},
                "children": Array [],
                "innerContent": "numbered list links to an ",
                "tagName": "em",
              },
              Object {
                "attributes": Object {
                  "data-item-id": "23f71096-fa89-4f59-a3f9-970e970944ec",
                  "href": "",
                },
                "children": Array [
                  Object {
                    "attributes": Object {},
                    "children": Array [],
                    "innerContent": "item",
                    "tagName": "em",
                  },
                ],
                "innerContent": "<em>item</em>",
                "tagName": "a",
              },
            ],
            "innerContent": "<em>numbered list links to an </em><a data-item-id=\\"23f71096-fa89-4f59-a3f9-970e970944ec\\" href=\\"\\"><em>item</em></a>",
            "tagName": "li",
          },
        ],
        "innerContent": "
  <li>numbered list</li>
  <li><em>numbered list links to an </em><a data-item-id=\\"23f71096-fa89-4f59-a3f9-970e970944ec\\" href=\\"\\"><em>item</em></a></li>
",
        "tagName": "ol",
      },
      Object {
        "attributes": Object {},
        "children": Array [
          Object {
            "attributes": Object {},
            "children": Array [],
            "innerContent": "",
            "tagName": "br",
          },
        ],
        "innerContent": "<br>",
        "tagName": "p",
      },
      Object {
        "attributes": Object {},
        "children": Array [
          Object {
            "attributes": Object {},
            "children": Array [],
            "innerContent": "",
            "tagName": "br",
          },
        ],
        "innerContent": "<br>",
        "tagName": "p",
      },
      Object {
        "attributes": Object {},
        "children": Array [],
        "innerContent": "and some heading 1",
        "tagName": "h1",
      },
      Object {
        "attributes": Object {},
        "children": Array [],
        "innerContent": "and h2",
        "tagName": "h2",
      },
      Object {
        "attributes": Object {},
        "children": Array [],
        "innerContent": "and h5",
        "tagName": "h5",
      },
    ],
    "innerContent": "<p>Some text at the first level, followed by a component.&nbsp;</p>
<object type=\\"application/kenticocloud\\" data-type=\\"item\\" data-rel=\\"component\\" data-codename=\\"n27ec1626_93ac_0129_64e5_1beeda45416c\\"></object>
<p>and a linked item</p>
<object type=\\"application/kenticocloud\\" data-type=\\"item\\" data-rel=\\"link\\" data-codename=\\"commercet\\"></object>
<p>and a table</p>
<table><tbody>
  <tr><td>1</td><td>2</td><td>3</td></tr>
  <tr><td>4</td><td>5</td><td>6</td></tr>
  <tr><td>a</td><td>b</td><td>c</td></tr>
</tbody></table>
<p>and some <strong>bold</strong> and <em><strong>bold italic </strong></em>text</p>
<p><a data-item-id=\\"23f71096-fa89-4f59-a3f9-970e970944ec\\" href=\\"\\"><strong>link to an item</strong></a></p>
<ul>
  <li><a href=\\"https://www.google.com/\\" data-new-window=\\"true\\" title=\\"google\\" target=\\"_blank\\" rel=\\"noopener noreferrer\\">link to a URL</a></li>
  <li>bullet point</li>
</ul>
<ol>
  <li>numbered list</li>
  <li><em>numbered list links to an </em><a data-item-id=\\"23f71096-fa89-4f59-a3f9-970e970944ec\\" href=\\"\\"><em>item</em></a></li>
</ol>
<p><br></p>
<p><br></p>
<h1>and some heading 1</h1>
<h2>and h2</h2>
<h5>and h5</h5>",
    "tagName": "",
  },
]
`);
    })
});