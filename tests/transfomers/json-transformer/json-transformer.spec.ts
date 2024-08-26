import { Elements, ElementType } from "@kontent-ai/delivery-sdk";

import { ResolveDomHtmlNodeType, ResolveDomTextNodeType, transformToJson } from "../../../src";
import { browserParse, ParseResult } from "../../../src/parser";

const dummy: Elements.RichTextElement = {
  images: [
    {
      description: null,
      imageId: "7d866175-d3db-4a02-b0eb-891fb06b6ab0",
      url:
        "https://assets-eu-01.kc-usercontent.com:443/6d864951-9d19-0138-e14d-98ba886a4410/236ecb7f-41e3-40c7-b0db-ea9c2c44003b/sharad-bhat-62p19OGT2qg-unsplash.jpg",
      height: 5812,
      width: 3875,
    },
  ],
  linkedItemCodenames: [
    "e53bff4f_0f6e_0168_a2fe_5ec0eaa032de",
  ],
  linkedItems: [
    {
      elements: {
        text_test: {
          name: "Text Test",
          type: ElementType.Text,
          value: "JUST DO IT",
        },
      },
      system: {
        codename: "e53bff4f_0f6e_0168_a2fe_5ec0eaa032de",
        collection: "default",
        id: "e53bff4f-0f6e-0168-a2fe-5ec0eaa032de",
        language: "default",
        lastModified: "2023-03-20T09:52:14.8675247Z",
        name: "e53bff4f-0f6e-0168-a2fe-5ec0eaa032de",
        sitemapLocations: [],
        type: "contenttype_with_simple_text",
        workflowStep: null,
        workflow: "default",
      },
    },
  ],
  links: [],
  name: "RichText",
  type: ElementType.RichText,
  value:
    "<p>Test from rich text</p>\n<figure data-asset-id=\"7d866175-d3db-4a02-b0eb-891fb06b6ab0\" data-image-id=\"7d866175-d3db-4a02-b0eb-891fb06b6ab0\"><img src=\"https://assets-eu-01.kc-usercontent.com:443/6d864951-9d19-0138-e14d-98ba886a4410/236ecb7f-41e3-40c7-b0db-ea9c2c44003b/sharad-bhat-62p19OGT2qg-unsplash.jpg\" data-asset-id=\"7d866175-d3db-4a02-b0eb-891fb06b6ab0\" data-image-id=\"7d866175-d3db-4a02-b0eb-891fb06b6ab0\" alt=\"\"></figure>\n<object type=\"application/kenticocloud\" data-type=\"item\" data-rel=\"component\" data-codename=\"e53bff4f_0f6e_0168_a2fe_5ec0eaa032de\"></object>",
};

const transformJsonWithCustomResolvers = (result: ParseResult) =>
  transformToJson(result, {
    resolveDomTextNode: customResolveDomTextNode,
    resolveDomHtmlNode: customResolveDomHtmlNode,
  });

const customResolveDomTextNode: ResolveDomTextNodeType = node => {
  return {
    text: node.content,
  };
};

const customResolveDomHtmlNode: ResolveDomHtmlNodeType = (node, traverse) => {
  let result = {
    tag: node.tagName,
  };

  switch (node.tagName) {
    case "figure": {
      const figureObject = {
        imageId: node.attributes["data-image-id"],
      };
      result = { ...result, ...figureObject };
      break;
    }
    case "img": {
      const imgObject = {
        src: node.attributes["src"],
        alt: node.attributes["alt"],
      };
      result = { ...result, ...imgObject };
      break;
    }
    case "table": {
      const tableObject = {
        tag: "tableName",
      };
      result = { ...result, ...tableObject };
      break;
    }
    case "tbody": {
      const tbodyObject = {
        tag: "tbody",
      };
      result = { ...result, ...tbodyObject };
      break;
    }
    case "tr": {
      const trObject = {
        tag: "tr",
      };
      result = { ...result, ...trObject };
      break;
    }
    case "ol": {
      const tdObject = {
        tag: "ol",
      };
      result = { ...result, ...tdObject };
      break;
    }
    case "ul": {
      const tdObject = {
        tag: "ul",
      };
      result = { ...result, ...tdObject };
      break;
    }
    case "li": {
      let tdObject = {
        tag: "li",
        text: node.children[0].type === "text" ? node.children[0].content : "",
      };
      if (node.children.length > 1) {
        tdObject = { ...tdObject, ...{ children: node.children.slice(1).map(node => traverse(node)) } };
      }
      return { ...result, ...tdObject };
    }
    case "td": {
      const tdObject = {
        tag: "td",
        content: node.children.map(node => traverse(node)),
      };
      result = { ...result, ...tdObject };
      break;
    }
    case "object": {
      if (node.attributes["type"] === "application/kenticocloud") {
        const linkedItemObject = {
          codeName: node.attributes["data-codename"],
        };
        result = { ...result, ...linkedItemObject };
      }
      break;
    }
    default: {
      break;
    }
  }
  if (node.tagName != "td") {
    result = {
      ...result,
      ...{
        children: node.children.map(node => traverse(node)),
      },
    };
  }

  return result;
};

describe("Json Transfomer Tests", () => {
  it("No custom resolvers provided", () => {
    const parsed = browserParse(dummy.value);
    const result = transformToJson(parsed);

    expect(result).toEqual(parsed.children);
  });

  it("Test empty", () => {
    const testValue: ParseResult = {
      children: [],
    };

    const output = transformJsonWithCustomResolvers(testValue);

    expect(output).toEqual([]);
  });

  it("Test only DomTextNode", () => {
    const testValue: ParseResult = {
      children: [
        {
          type: "text",
          content: "test value",
        },
      ],
    };

    const output = transformJsonWithCustomResolvers(testValue)[0];

    const expectedOutput = {
      text: "test value",
    };

    expect(output).toEqual(expectedOutput);
  });

  it("Test only DomHtmlNode", () => {
    const testValue: ParseResult = {
      children: [
        {
          type: "tag",
          tagName: "p",
          attributes: {},
          children: [],
        },
      ],
    };

    const output = transformJsonWithCustomResolvers(testValue)[0];

    const expectedOutput = {
      tag: "p",
      children: [],
    };

    expect(output).toEqual(expectedOutput);
  });

  it("Test text transformer returning null", () => {
    const testValue: ParseResult = {
      children: [
        {
          type: "text",
          content: "test value",
        },
      ],
    };

    const result = transformToJson(testValue, {
      resolveDomTextNode: () => null,
      resolveDomHtmlNode: null,
    });

    const expected = [null];

    expect(result).toEqual(expected);
  });

  it("Test RichText", () => {
    const parsed = browserParse(dummy.value);
    const transformed = transformJsonWithCustomResolvers(parsed);

    const expectedOutput = JSON.parse(`
        [
            {
               "tag":"p",
               "children":[
                  {
                     "text":"Test from rich text"
                  }
               ]
            },
            {
               "tag":"figure",
               "imageId":"7d866175-d3db-4a02-b0eb-891fb06b6ab0",
               "children":[
                  {
                     "tag":"img",
                     "src":"https://assets-eu-01.kc-usercontent.com:443/6d864951-9d19-0138-e14d-98ba886a4410/236ecb7f-41e3-40c7-b0db-ea9c2c44003b/sharad-bhat-62p19OGT2qg-unsplash.jpg",
                     "alt":"",
                     "children":[
                        
                     ]
                  }
               ]
            },
            {
               "tag":"object",
               "codeName":"e53bff4f_0f6e_0168_a2fe_5ec0eaa032de",
               "children":[]
            }
         ]`);

    expect(transformed).toEqual(expectedOutput);
  });

  it("test resolving table", () => {
    const inputValue =
      "<table><tbody>\n  <tr><td>Ivan</td><td>Jiri</td></tr>\n  <tr><td>Ondra</td><td>Dan</td></tr>\n</tbody></table>";
    const parsed = browserParse(inputValue);

    const result = transformJsonWithCustomResolvers(parsed);
    const expectedOutput = JSON.parse(`[
      {
         "tag":"tableName",
         "children":[
            {
               "tag":"tbody",
               "children":[
                  {
                     "tag":"tr",
                     "children":[
                        {
                           "tag":"td",
                           "content":[
                              {
                                 "text":"Ivan"
                              }
                           ]
                        },
                        {
                           "tag":"td",
                           "content":[
                              {
                                 "text":"Jiri"
                              }
                           ]
                        }
                     ]
                  },
                  {
                     "tag":"tr",
                     "children":[
                        {
                           "tag":"td",
                           "content":[
                              {
                                 "text":"Ondra"
                              }
                           ]
                        },
                        {
                           "tag":"td",
                           "content":[
                              {
                                 "text":"Dan"
                              }
                           ]
                        }
                     ]
                  }
               ]
            }
         ]
      }
   ]`);

    expect(result).toEqual(expectedOutput);
  });

  it("test transofrming list", () => {
    const parsed = browserParse(
      "<ul>\n  <li>Ivan</li>\n  <li>Jiri</li>\n  <li>Dan</li>\n  <li>Ondra\n    <ul>\n      <ul>\n        <li>Rosta</li>\n      </ul>\n      <li>Ondra</li>\n    </ul>\n  </li>\n</ul>",
    );

    const result = transformJsonWithCustomResolvers(parsed);
    const expectedOutput = JSON.parse(`[
      {
         "tag":"ul",
         "children":[
            {
               "tag":"li",
               "text":"Ivan"
            },
            {
               "tag":"li",
               "text":"Jiri"
            },
            {
               "tag":"li",
               "text":"Dan"
            },
            {
               "tag":"li",
               "text":"Ondra",
               "children":[
                  {
                     "tag":"ul",
                     "children":[
                        {
                           "tag":"ul",
                           "children":[
                              {
                                 "tag":"li",
                                 "text":"Rosta"
                              }
                           ]
                        },
                        {
                           "tag":"li",
                           "text":"Ondra"
                        }
                     ]
                  }
               ]
            }
         ]
      }
   ]`);
    expect(result).toEqual(expectedOutput);
  });
});
