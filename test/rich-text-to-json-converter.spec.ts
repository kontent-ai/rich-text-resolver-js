import { Elements, ElementType } from "@kontent-ai/delivery-sdk";
import { RichTextNodeParser } from "../src/parser/node";
import { escapeHTML, toHTML } from '@portabletext/to-html';
import TestRenderer from 'react-test-renderer';
import { PortableText } from '@portabletext/react';
import { RichTextBrowserParser } from "../src/parser";
import { flatten, mergeAllItems, mergeBlocksAndSpans, mergeSpansAndMarks } from "../src/transformer";

jest.mock('crypto', () => {
  return {
    randomUUID: jest.fn(() => 'guid')
  }
});

const dummyRichText: Elements.RichTextElement = {
  value: "<p>text</p>",
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

describe("new transformer", () => {
  it("converts json to portable text array", () => {
    const tree = richTextBrowserParser.parse(dummyRichText.value);
    //const result = tree.children.flatMap(node => flatten(node, []));
    const result = flatten(tree);

    expect(result).toMatchInlineSnapshot(`
Array [
  Object {
    "_key": "guid",
    "_type": "block",
    "children": Array [],
    "markDefs": Array [],
    "style": "normal",
  },
  Object {
    "_key": "guid",
    "_type": "span",
    "marks": Array [],
    "text": "text",
  },
]
`);
  })

  it("combines flattened blocks to a portable text", () => {
    const tree = richTextBrowserParser.parse(dummyRichText.value);
    //const flattened = tree.children.flatMap(node => flatten(node, []));
    //const result = transform(flattened);
    const flattened = flatten(tree);
    const result = mergeAllItems(flattened);
    // const merged = mergeSpansAndMarks(flattened);
    // const result = mergeBlocksAndSpans(merged);

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
        "text": "text",
      },
    ],
    "markDefs": Array [],
    "style": "normal",
  },
]
`);
  })

  it("transforms tables", () => {
    dummyRichText.value = `<table><tbody>\n  <tr><td><p>paragraph 1</p><p>paragraph 2</p></td><td><p>text</p></td><td><p>text</p></td></tr>\n<tr><td><p>text</p></td><td><p>text</p></td><td><p>text</p></td></tr>\n<tr><td><p>text</p></td><td><p>text</p></td><td><p>text</p></td></tr>\n</tbody></table>`
    const tree = richTextBrowserParser.parse(dummyRichText.value);
    const flattened = flatten(tree);
    const result = mergeAllItems(flattened);

    expect(result).toMatchInlineSnapshot(`
Array [
  Object {
    "_key": "guid",
    "_type": "table",
    "numColumns": 3,
    "rows": Array [
      Object {
        "_key": "guid",
        "_type": "row",
        "cells": Array [
          Object {
            "_key": "guid",
            "_type": "cell",
            "childBlocksCount": 2,
            "content": Array [
              [Circular],
              Object {
                "_key": "guid",
                "_type": "block",
                "children": Array [
                  Object {
                    "_key": "guid",
                    "_type": "span",
                    "marks": Array [],
                    "text": "paragraph 2",
                  },
                ],
                "markDefs": Array [],
                "style": "normal",
              },
            ],
          },
          Object {
            "_key": "guid",
            "_type": "cell",
            "childBlocksCount": 1,
            "content": Array [
              [Circular],
            ],
          },
          Object {
            "_key": "guid",
            "_type": "cell",
            "childBlocksCount": 1,
            "content": Array [
              [Circular],
            ],
          },
        ],
      },
      Object {
        "_key": "guid",
        "_type": "row",
        "cells": Array [
          Object {
            "_key": "guid",
            "_type": "cell",
            "childBlocksCount": 1,
            "content": Array [
              [Circular],
            ],
          },
          Object {
            "_key": "guid",
            "_type": "cell",
            "childBlocksCount": 1,
            "content": Array [
              [Circular],
            ],
          },
          Object {
            "_key": "guid",
            "_type": "cell",
            "childBlocksCount": 1,
            "content": Array [
              [Circular],
            ],
          },
        ],
      },
      Object {
        "_key": "guid",
        "_type": "row",
        "cells": Array [
          Object {
            "_key": "guid",
            "_type": "cell",
            "childBlocksCount": 1,
            "content": Array [
              [Circular],
            ],
          },
          Object {
            "_key": "guid",
            "_type": "cell",
            "childBlocksCount": 1,
            "content": Array [
              [Circular],
            ],
          },
          Object {
            "_key": "guid",
            "_type": "cell",
            "childBlocksCount": 1,
            "content": Array [
              [Circular],
            ],
          },
        ],
      },
    ],
  },
]
`);
  })

  it("transforms item links", () => {
    dummyRichText.value = `<p><a data-item-id=\"23f71096-fa89-4f59-a3f9-970e970944ec\" href=\"\">text<strong>link to an item</strong></a></p>`
    const tree = richTextBrowserParser.parse(dummyRichText.value);
    const flattened = flatten(tree);
    const result = mergeAllItems(flattened);

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
        ],
        "text": "text",
      },
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [
          "strong",
          "guid",
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

  it("transforms nested styles", () => {
    dummyRichText.value = `<p><strong>all text is bold and last part is </strong><em><strong>also italic and this is also </strong></em><em><strong><sup>superscript</sup></strong></em></p>`
    const tree = richTextBrowserParser.parse(dummyRichText.value);
    const flattened = flatten(tree);
    const result = mergeAllItems(flattened);

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
          "strong",
        ],
        "text": "all text is bold and last part is ",
      },
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [
          "em",
          "strong",
        ],
        "text": "also italic and this is also ",
      },
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [
          "em",
          "strong",
          "sup",
        ],
        "text": "superscript",
      },
    ],
    "markDefs": Array [],
    "style": "normal",
  },
]
`);
  })

  it("transforms lists", () => {
    dummyRichText.value = `<ul><li>first level bullet</li><li>first level bullet</li><ol><li>nested number in bullet list</li></ol></ul><ol><li>first level item</li><li>first level item</li><ol><li>second level item</li><li><strong>second level item </strong></li></ol>`;
    const tree = richTextBrowserParser.parse(dummyRichText.value);
    const flattened = flatten(tree);
    const result = mergeAllItems(flattened);

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
        "text": "first level bullet",
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
        "text": "first level bullet",
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
        "text": "nested number in bullet list",
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
    ],
    "level": 2,
    "listItem": "number",
    "markDefs": Array [],
    "style": "normal",
  },
]
`);
  })

  it("transforms images", () => {
    dummyRichText.value = `<figure data-asset-id=\"7d866175-d3db-4a02-b0eb-891fb06b6ab0\" data-image-id=\"7d866175-d3db-4a02-b0eb-891fb06b6ab0\"><img src=\"https://assets-eu-01.kc-usercontent.com:443/6d864951-9d19-0138-e14d-98ba886a4410/236ecb7f-41e3-40c7-b0db-ea9c2c44003b/sharad-bhat-62p19OGT2qg-unsplash.jpg\" data-asset-id=\"7d866175-d3db-4a02-b0eb-891fb06b6ab0\" data-image-id=\"7d866175-d3db-4a02-b0eb-891fb06b6ab0\" alt=\"\"></figure><p><em>text in a paragraph</em></p>`;
    const tree = richTextBrowserParser.parse(dummyRichText.value);
    const flattened = flatten(tree);
    const result = mergeAllItems(flattened);

    expect(result).toMatchInlineSnapshot(`
Array [
  Object {
    "_key": "guid",
    "_type": "image",
    "asset": Object {
      "_ref": "7d866175-d3db-4a02-b0eb-891fb06b6ab0",
      "_type": "reference",
      "url": "https://assets-eu-01.kc-usercontent.com:443/6d864951-9d19-0138-e14d-98ba886a4410/236ecb7f-41e3-40c7-b0db-ea9c2c44003b/sharad-bhat-62p19OGT2qg-unsplash.jpg",
    },
  },
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
        "text": "text in a paragraph",
      },
    ],
    "markDefs": Array [],
    "style": "normal",
  },
]
`);
  })
})

describe("Rich text parser", () => {
  it("parses empty rich text into portable text", () => {
    dummyRichText.value = "<p><br></p>";
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
    dummyRichText.value = `<table><tbody><tr><td><figure data-asset-id=\"7d866175-d3db-4a02-b0eb-891fb06b6ab0\" data-image-id=\"7d866175-d3db-4a02-b0eb-891fb06b6ab0\"><img src=\"https://assets-eu-01.kc-usercontent.com:443/6d864951-9d19-0138-e14d-98ba886a4410/236ecb7f-41e3-40c7-b0db-ea9c2c44003b/sharad-bhat-62p19OGT2qg-unsplash.jpg\" data-asset-id=\"7d866175-d3db-4a02-b0eb-891fb06b6ab0\" data-image-id=\"7d866175-d3db-4a02-b0eb-891fb06b6ab0\" alt=\"\"></figure></td><td>xcvzxcsddzczx</td><td>fdsafsdaafsf</td></tr><tr><td><ol><li>fdsaf</li><li>fdsafsda</li><li>sdafasdfsa</li><li>f<ol><li>dfafsad<ol><li>fdsfdasewf</li>\n        </ol>\n      </li>\n    </ol>\n  </li>\n</ol>\n</td><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td><td><br></td></tr>\n</tbody></table>\n<h4><em><strong>dufam ze to nerozbijem</strong></em></h4>\n<figure data-asset-id=\"7d866175-d3db-4a02-b0eb-891fb06b6ab0\" data-image-id=\"7d866175-d3db-4a02-b0eb-891fb06b6ab0\"><img src=\"https://assets-eu-01.kc-usercontent.com:443/6d864951-9d19-0138-e14d-98ba886a4410/236ecb7f-41e3-40c7-b0db-ea9c2c44003b/sharad-bhat-62p19OGT2qg-unsplash.jpg\" data-asset-id=\"7d866175-d3db-4a02-b0eb-891fb06b6ab0\" data-image-id=\"7d866175-d3db-4a02-b0eb-891fb06b6ab0\" alt=\"\"></figure>\n<object type=\"application/kenticocloud\" data-type=\"item\" data-rel=\"component\" data-codename=\"f876cf42_beb9_01ee_82f5_3ddf5b885633\"></object>`
    const result = richTextNodeParser.parse(dummyRichText.value);
    //console.log(JSON.stringify(result, undefined, 2));
    expect(result).toMatchInlineSnapshot(`
Array [
  Object {
    "_key": "guid",
    "_type": "image",
    "asset": Object {
      "_ref": "7d866175-d3db-4a02-b0eb-891fb06b6ab0",
      "_type": "reference",
      "url": "https://assets-eu-01.kc-usercontent.com:443/6d864951-9d19-0138-e14d-98ba886a4410/236ecb7f-41e3-40c7-b0db-ea9c2c44003b/sharad-bhat-62p19OGT2qg-unsplash.jpg",
    },
  },
  Object {
    "_key": "guid",
    "_type": "block",
    "children": Array [
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [],
        "text": "xcvzxcsddzczx",
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
        "text": "fdsafsdaafsf",
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
        "text": "fdsaf",
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
        "text": "fdsafsda",
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
        "text": "sdafasdfsa",
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
        "text": "f",
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
        "text": "dfafsad",
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
        "marks": Array [],
        "text": "fdsfdasewf",
      },
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [],
        "text": "        ",
      },
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [],
        "text": "      ",
      },
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [],
        "text": "    ",
      },
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [],
        "text": "  ",
      },
    ],
    "level": 3,
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
        "text": "fdsfdasewf",
      },
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [],
        "text": "        ",
      },
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [],
        "text": "      ",
      },
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [],
        "text": "    ",
      },
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [],
        "text": "  ",
      },
    ],
    "level": 3,
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
        "text": "fdsfdasewf",
      },
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [],
        "text": "        ",
      },
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [],
        "text": "      ",
      },
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [],
        "text": "    ",
      },
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [],
        "text": "  ",
      },
    ],
    "level": 3,
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
        "text": "fdsfdasewf",
      },
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [],
        "text": "        ",
      },
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [],
        "text": "      ",
      },
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [],
        "text": "    ",
      },
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [],
        "text": "  ",
      },
    ],
    "level": 3,
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
        "text": "fdsfdasewf",
      },
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [],
        "text": "        ",
      },
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [],
        "text": "      ",
      },
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [],
        "text": "    ",
      },
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [],
        "text": "  ",
      },
    ],
    "level": 3,
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
        "marks": Array [
          "em",
          "strong",
        ],
        "text": "dufam ze to nerozbijem",
      },
    ],
    "markDefs": Array [],
    "style": "h4",
  },
  Object {
    "_key": "guid",
    "_type": "image",
    "asset": Object {
      "_ref": "7d866175-d3db-4a02-b0eb-891fb06b6ab0",
      "_type": "reference",
      "url": "https://assets-eu-01.kc-usercontent.com:443/6d864951-9d19-0138-e14d-98ba886a4410/236ecb7f-41e3-40c7-b0db-ea9c2c44003b/sharad-bhat-62p19OGT2qg-unsplash.jpg",
    },
  },
  Object {
    "_key": "guid",
    "_type": "component",
    "component": Object {
      "_ref": "f876cf42_beb9_01ee_82f5_3ddf5b885633",
      "_type": "reference",
    },
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
    dummyRichText.value = `<p><a data-item-id=\"23f71096-fa89-4f59-a3f9-970e970944ec\" href=\"\">text<strong>link to an item</strong></a></p>`;
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
        ],
        "text": "text",
      },
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [
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
  Object {
    "_key": "guid",
    "_type": "block",
    "children": Array [
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [
          "guid",
        ],
        "text": "text",
      },
      Object {
        "_key": "guid",
        "_type": "span",
        "marks": Array [
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

  it("parses lists to portable text properly", () => {
    dummyRichText.value = `<ul><li>bullet<li><ul><li>second level</li></ul></ul><ol><li>first level item</li><li>first level item</li><ol><li>second level item</li><li><strong>second level item </strong><a href="http://google.com" data-new-window="true" title="linktitle" target="_blank" rel="noopener noreferrer"><strong>bold</strong></a></li></ol>`;
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
        "text": "second level",
      },
    ],
    "level": 2,
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
          "strong",
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
        "data-new-window": "true",
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
          "strong",
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
        "data-new-window": "true",
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

  it("parses complex rich text into portable text", () => {
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
        "data-new-window": "true",
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
        "data-new-window": "true",
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
          link: ({ children, value }) => {
            return `\<a href=${escapeHTML(value.href)}">${children}</a>`
          }
        }
      }
    });
    expect(result).toMatchSnapshot();
  })

  it("resolves internal link", () => {
    dummyRichText.value = `<p><a data-item-id=\"23f71096-fa89-4f59-a3f9-970e970944ec\" href=\"\"><em>item</em></a></p>`
    const portableText = richTextNodeParser.parse(dummyRichText.value);
    const result = toHTML(portableText, {
      components: {
        marks: {
          internalLink: ({children, value}) => {
            return `\<a href=\"https://website.com/${value.reference._ref}">item link</a>`
          }
        }
      }
    }
    )
    expect(result).toMatchSnapshot();
  })

  it("resolves a linked item", () => {
    dummyRichText.value = '<object type=\"application/kenticocloud\" data-type=\"item\" data-rel=\"link\" data-codename=\"test_item\"></object>'
    const portableText = richTextNodeParser.parse(dummyRichText.value);
    const result = toHTML(portableText, {
      components: {
        types: {
          component: ({value}) => {
            const linkedItem = dummyRichText.linkedItems.find(item => item.system.codename === value.component._ref);
            switch(linkedItem?.system.type) {
              case('test'): {
                return `<p>resolved value of text_element: <strong>${linkedItem?.elements.text_element.value}</strong></p>`;
              }
              default: {
                return `Resolver for type ${linkedItem?.system.type} not implemented.`
              }
            }
          }
        }
      }
    })
    expect(result).toMatchSnapshot();
  })

  it("resolves a table", () => {
    dummyRichText.value = `<p><br></p><table><tbody><tr><td><strong>Emil</strong></td><td>Cyril</td></tr><tr><td><ul><li>Jarda</li><li>Luda</li></ul></td><td>Cyril</td></tr></tbody></table>`;
    const portableText = richTextNodeParser.parse(dummyRichText.value);
    const result = toHTML(portableText, {
      components: {
        types: {
          table: ({value}) => {
            let numCells = value.rows*value.columns;
            let htmlTable = `<table><tbody><tr>`;
            // for(let i = 1; i <= value.rows; i++) {
            //   htmlTable += `<tr>`;
            //   for(let j = 1; j <= value.columns; j++) {
            //     toHTML(value.childBlocks[j]);
            //   }              
            // }
            for(let i = 0; i < numCells; i++) {
              if((value.columns-1)%i === 0) {
                htmlTable += `</tr><tr>`;
              }
              htmlTable += `<td>${toHTML(value.childBlocks[i])}</td>`;
            }
            htmlTable += `</tr></tbody></table>`;

            return htmlTable;
          }
        }
      }
    })
    expect(result).toMatchSnapshot();
  })

  it("resolves an asset", () => {
    dummyRichText.value = `<figure data-asset-id=\"62ba1f17-13e9-43c0-9530-6b44e38097fc\" data-image-id=\"62ba1f17-13e9-43c0-9530-6b44e38097fc\"><img src=\"https://assets-us-01.kc-usercontent.com:443/cec32064-07dd-00ff-2101-5bde13c9e30c/3594632c-d9bb-4197-b7da-2698b0dab409/Riesachsee_Dia_1_1963_%C3%96sterreich_16k_3063.jpg\" data-asset-id=\"62ba1f17-13e9-43c0-9530-6b44e38097fc\" data-image-id=\"62ba1f17-13e9-43c0-9530-6b44e38097fc\" alt=\"\"></figure>`;
    const portableText = richTextNodeParser.parse(dummyRichText.value);
    const result = toHTML(portableText, {
      components: {
        types: {
          image: ({value}) => {
            return `<img src="${value.asset.url}"></img>`;
          }
        }
      }
    })

    expect(result).toMatchSnapshot();
  })
})


