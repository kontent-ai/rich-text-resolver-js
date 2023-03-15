import { Elements, ElementType } from "@kontent-ai/delivery-sdk";
import { RichTextBrowserParser } from "../src/parser/browser";
import { RichTextNodeParser } from "../src/parser/node";
import { IDomNode, NodeParser } from "../src/parser";
import { escapeHTML, toHTML } from '@portabletext/to-html';

jest.mock('crypto', () => {
  return {
    randomUUID: jest.fn(() => 'guid')
  }
});

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

const richTextBrowserParser = new RichTextBrowserParser();
const richTextNodeParser = new RichTextNodeParser();
const nodeParser = new NodeParser();

describe("Rich text parser", () => {
  it("returns parsed tree", () => {
    dummyRichText.value = "<p><br></p><p>text<a href=\"http://google.com\" data-new-window=\"true\" title=\"linktitle\" target=\"_blank\" rel=\"noopener noreferrer\"><strong>link</strong></a><p>heading</p><p><br></p>";
    const result = richTextBrowserParser.parse(dummyRichText.value);

    expect(result).toMatchInlineSnapshot(`
Object {
  "children": Array [
    Object {
      "attributes": Object {},
      "children": Array [
        Object {
          "attributes": Object {},
          "children": Array [],
          "tagName": "br",
          "type": "tag",
        },
      ],
      "tagName": "p",
      "type": "tag",
    },
    Object {
      "attributes": Object {},
      "children": Array [
        Object {
          "content": "text",
          "type": "text",
        },
        Object {
          "attributes": Object {
            "data-new-window": "true",
            "href": "http://google.com",
            "rel": "noopener noreferrer",
            "target": "_blank",
            "title": "linktitle",
          },
          "children": Array [
            Object {
              "attributes": Object {},
              "children": Array [
                Object {
                  "content": "link",
                  "type": "text",
                },
              ],
              "tagName": "strong",
              "type": "tag",
            },
          ],
          "tagName": "a",
          "type": "tag",
        },
      ],
      "tagName": "p",
      "type": "tag",
    },
    Object {
      "attributes": Object {},
      "children": Array [
        Object {
          "content": "heading",
          "type": "text",
        },
      ],
      "tagName": "p",
      "type": "tag",
    },
    Object {
      "attributes": Object {},
      "children": Array [
        Object {
          "attributes": Object {},
          "children": Array [],
          "tagName": "br",
          "type": "tag",
        },
      ],
      "tagName": "p",
      "type": "tag",
    },
  ],
}
`);
  })
  it("parses empty rich text into portable text", () => {
    dummyRichText.value= "<p><br></p>";
    const result = richTextNodeParser.parse(dummyRichText.value);
    expect(result).toMatchInlineSnapshot(`
Array [
  Object {
    "_key": "guid",
    "_type": "block",
    "children": Array [
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [],
        "text": "
",
      },
    ],
    "markDefs": Array [],
    "style": "normal",
  },
]
`);
  })

  it("parses tables into portable text", () => {
    dummyRichText.value = `<p><br></p><table><tbody><tr><td><strong>Emil</strong></td><td>Cyril</td></tr><tr><td><ul><li>Jarda</li><li>Luda</li></ul></td><td>Cyril</td></tr></tbody></table>`
    const result = richTextNodeParser.parse(dummyRichText.value);
    expect(result).toMatchInlineSnapshot(`
Array [
  Object {
    "_key": "guid",
    "_type": "block",
    "children": Array [
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [],
        "text": "
",
      },
    ],
    "markDefs": Array [],
    "style": "normal",
  },
  Object {
    "_key": "guid",
    "_type": "table",
    "childBlocks": Array [
      Object {
        "_key": "guid",
        "_type": "block",
        "children": Array [
          Object {
            "_key": "guid",
            "_type": "span",
            "marks": Array [
              "strong",
            ],
            "text": "Emil",
          },
        ],
        "markDefs": Array [],
        "style": "normal",
      },
      Object {
        "_key": "guid",
        "_type": "block",
        "children": Array [
          Object {
            "_key": "guid",
            "_type": "span",
            "marks": Array [],
            "text": "Cyril",
          },
        ],
        "markDefs": Array [],
        "style": "normal",
      },
      Object {
        "_key": "guid",
        "_type": "block",
        "children": Array [
          Object {
            "_key": "guid",
            "_type": "span",
            "marks": Array [],
            "text": "Jarda",
          },
        ],
        "level": 1,
        "listItem": "bullet",
        "markDefs": Array [],
        "style": "normal",
      },
      Object {
        "_key": "guid",
        "_type": "block",
        "children": Array [
          Object {
            "_key": "guid",
            "_type": "span",
            "marks": Array [],
            "text": "Luda",
          },
        ],
        "level": 1,
        "listItem": "bullet",
        "markDefs": Array [],
        "style": "normal",
      },
      Object {
        "_key": "guid",
        "_type": "block",
        "children": Array [
          Object {
            "_key": "guid",
            "_type": "span",
            "marks": Array [],
            "text": "Cyril",
          },
        ],
        "markDefs": Array [],
        "style": "normal",
      },
    ],
    "columns": 2,
    "rows": 2,
  },
]
`);
  })

  it("parses linked items/components into portable text", () => {
    dummyRichText.value = '<p><em>text</em></p><object type=\"application/kenticocloud\" data-type=\"item\" data-rel=\"link\" data-codename=\"product_2\"></object><object type=\"application/kenticocloud\" data-type=\"item\" data-rel=\"component\" data-codename=\"c0354b5f_3fb7_014c_6784_44ec74410197\"></object>';
    const result = richTextNodeParser.parse(dummyRichText.value);
    expect(result).toMatchInlineSnapshot(`
Array [
  Object {
    "_key": "guid",
    "_type": "block",
    "children": Array [
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [
          "em",
        ],
        "text": "text",
      },
    ],
    "markDefs": Array [],
    "style": "normal",
  },
  Object {
    "_key": "guid",
    "_type": "component",
    "component": Object {
      "_ref": "product_2",
      "_type": "reference",
    },
  },
  Object {
    "_key": "guid",
    "_type": "component",
    "component": Object {
      "_ref": "c0354b5f_3fb7_014c_6784_44ec74410197",
      "_type": "reference",
    },
  },
]
`);

  })


  it("parses internal links to portable text properly", () => {
    dummyRichText.value = `<p><a data-item-id=\"23f71096-fa89-4f59-a3f9-970e970944ec\" href=\"\"><strong>link to an item</strong></a></p>`;
    const result = richTextNodeParser.parse(dummyRichText.value);
    expect(result).toMatchInlineSnapshot(`
Array [
  Object {
    "_key": "guid",
    "_type": "block",
    "children": Array [
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [
          "guid",
          "strong",
        ],
        "text": "link to an item",
      },
    ],
    "markDefs": Array [
      Object {
        "_key": "guid",
        "_type": "internalLink",
        "reference": Object {
          "_ref": "23f71096-fa89-4f59-a3f9-970e970944ec",
          "_type": "reference",
        },
      },
    ],
    "style": "normal",
  },
]
`);
  })

  it("parses images to portable text properly", () => {
    dummyRichText.value = `<figure data-asset-id=\"62ba1f17-13e9-43c0-9530-6b44e38097fc\" data-image-id=\"62ba1f17-13e9-43c0-9530-6b44e38097fc\"><img src=\"https://assets-us-01.kc-usercontent.com:443/cec32064-07dd-00ff-2101-5bde13c9e30c/3594632c-d9bb-4197-b7da-2698b0dab409/Riesachsee_Dia_1_1963_%C3%96sterreich_16k_3063.jpg\" data-asset-id=\"62ba1f17-13e9-43c0-9530-6b44e38097fc\" data-image-id=\"62ba1f17-13e9-43c0-9530-6b44e38097fc\" alt=\"\"></figure>`;
    const result = richTextNodeParser.parse(dummyRichText.value);
    expect(result).toMatchInlineSnapshot(`
Array [
  Object {
    "_key": "guid",
    "_type": "image",
    "asset": Object {
      "_ref": "62ba1f17-13e9-43c0-9530-6b44e38097fc",
      "_type": "reference",
      "url": "https://assets-us-01.kc-usercontent.com:443/cec32064-07dd-00ff-2101-5bde13c9e30c/3594632c-d9bb-4197-b7da-2698b0dab409/Riesachsee_Dia_1_1963_%C3%96sterreich_16k_3063.jpg",
    },
  },
]
`);
  })

  it("parses lists properly", () => {
    dummyRichText.value = `<ul><li>bullet<li></ul><ol><li>first level item</li><li>first level item</li><ol><li>second level item</li><li><strong>second level item <a href="http://google.com" data-new-window="true" title="linktitle" target="_blank" rel="noopener noreferrer">bold</a></strong></li></ol>`;
    const result = richTextNodeParser.parse(dummyRichText.value);
    expect(result).toMatchInlineSnapshot(`
Array [
  Object {
    "_key": "guid",
    "_type": "block",
    "children": Array [
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [],
        "text": "bullet",
      },
    ],
    "level": 1,
    "listItem": "bullet",
    "markDefs": Array [],
    "style": "normal",
  },
  Object {
    "_key": "guid",
    "_type": "block",
    "children": Array [
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [],
        "text": "first level item",
      },
    ],
    "level": 1,
    "listItem": "number",
    "markDefs": Array [],
    "style": "normal",
  },
  Object {
    "_key": "guid",
    "_type": "block",
    "children": Array [
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [],
        "text": "first level item",
      },
    ],
    "level": 1,
    "listItem": "number",
    "markDefs": Array [],
    "style": "normal",
  },
  Object {
    "_key": "guid",
    "_type": "block",
    "children": Array [
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [],
        "text": "second level item",
      },
    ],
    "level": 2,
    "listItem": "number",
    "markDefs": Array [],
    "style": "normal",
  },
  Object {
    "_key": "guid",
    "_type": "block",
    "children": Array [
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [
          "strong",
        ],
        "text": "second level item ",
      },
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [
          "guid",
        ],
        "text": "bold",
      },
    ],
    "level": 2,
    "listItem": "number",
    "markDefs": Array [
      Object {
        "_key": "guid",
        "_type": "link",
        "href": "http://google.com",
        "rel": "noopener noreferrer",
        "target": "_blank",
        "title": "linktitle",
      },
    ],
    "style": "normal",
  },
  Object {
    "_key": "guid",
    "_type": "block",
    "children": Array [
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [
          "strong",
        ],
        "text": "second level item ",
      },
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [
          "guid",
        ],
        "text": "bold",
      },
    ],
    "level": 2,
    "listItem": "number",
    "markDefs": Array [
      Object {
        "_key": "guid",
        "_type": "link",
        "href": "http://google.com",
        "rel": "noopener noreferrer",
        "target": "_blank",
        "title": "linktitle",
      },
    ],
    "style": "normal",
  },
]
`);
  })

  it("parses rich text into portable text", () => {
    dummyRichText.value = "<p><br></p><p>text<a href=\"http://google.com\" data-new-window=\"true\" title=\"linktitle\" target=\"_blank\" rel=\"noopener noreferrer\"><strong>link</strong></a></p><h1>heading</h1><p><br></p>";
    const result = richTextNodeParser.parse(dummyRichText.value);
    expect(result).toMatchInlineSnapshot(`
Array [
  Object {
    "_key": "guid",
    "_type": "block",
    "children": Array [
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [],
        "text": "
",
      },
    ],
    "markDefs": Array [],
    "style": "normal",
  },
  Object {
    "_key": "guid",
    "_type": "block",
    "children": Array [
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [],
        "text": "text",
      },
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [
          "guid",
          "strong",
        ],
        "text": "link",
      },
    ],
    "markDefs": Array [
      Object {
        "_key": "guid",
        "_type": "link",
        "href": "http://google.com",
        "rel": "noopener noreferrer",
        "target": "_blank",
        "title": "linktitle",
      },
    ],
    "style": "normal",
  },
  Object {
    "_key": "guid",
    "_type": "block",
    "children": Array [
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [],
        "text": "text",
      },
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [
          "guid",
          "strong",
        ],
        "text": "link",
      },
    ],
    "markDefs": Array [
      Object {
        "_key": "guid",
        "_type": "link",
        "href": "http://google.com",
        "rel": "noopener noreferrer",
        "target": "_blank",
        "title": "linktitle",
      },
    ],
    "style": "normal",
  },
  Object {
    "_key": "guid",
    "_type": "block",
    "children": Array [
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [],
        "text": "heading",
      },
    ],
    "markDefs": Array [],
    "style": "h1",
  },
  Object {
    "_key": "guid",
    "_type": "block",
    "children": Array [
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [],
        "text": "
",
      },
    ],
    "markDefs": Array [],
    "style": "normal",
  },
]
`);
  })

  it("parses empty rich text", () => {
    dummyRichText.value = "<p><br></p>"
    const result = richTextBrowserParser.parse(dummyRichText.value);
    expect(result).toMatchInlineSnapshot(`
Object {
  "children": Array [
    Object {
      "attributes": Object {},
      "children": Array [
        Object {
          "attributes": Object {},
          "children": Array [],
          "tagName": "br",
          "type": "tag",
        },
      ],
      "tagName": "p",
      "type": "tag",
    },
  ],
}
`);
  })

  it("resolves linked item to a string", () => {
        dummyRichText.value = "<p class=\"test\" id=3><object type=\"application/kenticocloud\" data-type=\"item\" data-rel=\"component\" data-codename=\"test_item\"></object>before text<a href=\"mailto:email@abc.test\">email</a>after text line break <br></p>"
          const spreadAttributes = (attributes: Record<string,string>): string => {
            let convertedAttributes = ``;
            for (const attribute in attributes) {
                convertedAttributes += ` ${attribute}="${attributes[attribute]}"`
            }
    
            return convertedAttributes;
        }
        
        const resolve = (domNode: IDomNode): string => {
          let result = '';
          if (domNode.type === 'text')
            result += domNode.content;

          else if(domNode.tagName === 'object' && domNode.attributes['type'] === 'application/kenticocloud') {
            const linkedItem = dummyRichText.linkedItems.find(item => item.system.codename === domNode.attributes['data-codename']);
            if(linkedItem?.system.type === 'test') {
              result += `
              <div>
                resolved type: ${linkedItem.system.type}, value of text element: ${linkedItem.elements.text_element.value}
              </div>

            `
            }

            else result += `Resolver not implemented.`;
          }

          else {
            result += `<${domNode.tagName + ' ' + spreadAttributes(domNode.attributes)}>`;

            if (domNode.children.length > 0) {
              domNode.children.forEach((node) => (result += resolve(node)));
            }

            result+= `</${domNode.tagName}>`;
          }
          return result;
        }

        const parsedTree = richTextBrowserParser.parse(dummyRichText.value);
        const result = parsedTree.children.map(node => resolve(node)).toString();

        expect(result).toMatchInlineSnapshot(`
"<p  class=\\"test\\" id=\\"3\\">
              <div>
                resolved type: test, value of text element: random text value
              </div>

            before text<a  href=\\"mailto:email@abc.test\\">email</a>after text line break <br ></br></p>"
`);
  })


})


describe("HTML converter", () => {
  it("builds basic portable text into HTML", () => {
    dummyRichText.value = '<p><br></p><p>text<a href=\"http://google.com\" data-new-window=\"true\" title=\"linktitle\" target=\"_blank\" rel=\"noopener noreferrer\"><strong>link</strong></a></p><h1>heading</h1><p><br></p>';
    const portableText = richTextNodeParser.parse(dummyRichText.value);
    const result = toHTML(portableText, {
      components: {
        marks: {
          link: ({children, value}) => {
            return `\<a href=${escapeHTML(value.href)}">${children}</a>`
          }
        }
      }
    });
    expect(result).toMatchInlineSnapshot(`"<p><br/></p><p>text<a href=http://google.com\\"><strong>link</strong></a></p><p>text<a href=http://google.com\\"><strong>link</strong></a></p><h1>heading</h1><p><br/></p>"`);
  })
})


