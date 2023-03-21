import { Elements, ElementType, ParsedItemIndexReferenceWrapper } from "@kontent-ai/delivery-sdk"
import { customResolveIDomHtmlNode, customResolveIDomTextNode, transformIOuputToJson } from "../../src/ivan-vole/json-transformer"
import { IOutputResult, RichTextBrowserParser } from "../../src/parser"
import { dummyWithTables } from "./dummy"

const dummy: Elements.RichTextElement  = {
    "images": [
        {
            "description": null,
            "imageId": "7d866175-d3db-4a02-b0eb-891fb06b6ab0",
            "url": "https://assets-eu-01.kc-usercontent.com:443/6d864951-9d19-0138-e14d-98ba886a4410/236ecb7f-41e3-40c7-b0db-ea9c2c44003b/sharad-bhat-62p19OGT2qg-unsplash.jpg",
            "height": 5812,
            "width": 3875
        }
    ],
    "linkedItemCodenames": [
        "e53bff4f_0f6e_0168_a2fe_5ec0eaa032de"
    ],
    "linkedItems": [
        {
            "elements": {
                "text_test": {
                    "name": "Text Test",
                    "type": ElementType.Text,
                    "value": "JUST DO IT"
                }
            },
            "system": {
                "codename": "e53bff4f_0f6e_0168_a2fe_5ec0eaa032de",
                "collection": "default",
                "id": "e53bff4f-0f6e-0168-a2fe-5ec0eaa032de",
                "language": "default",
                "lastModified": "2023-03-20T09:52:14.8675247Z",
                "name": "e53bff4f-0f6e-0168-a2fe-5ec0eaa032de",
                "sitemapLocations": [

                ],
                "type": "contenttype_with_simple_text",
                "workflowStep": null
            }
        }
    ],
    "links": [

    ],
    "name": "RichText",
    "type": ElementType.RichText,
    "value": "<p>Test from rich text</p>\n<figure data-asset-id=\"7d866175-d3db-4a02-b0eb-891fb06b6ab0\" data-image-id=\"7d866175-d3db-4a02-b0eb-891fb06b6ab0\"><img src=\"https://assets-eu-01.kc-usercontent.com:443/6d864951-9d19-0138-e14d-98ba886a4410/236ecb7f-41e3-40c7-b0db-ea9c2c44003b/sharad-bhat-62p19OGT2qg-unsplash.jpg\" data-asset-id=\"7d866175-d3db-4a02-b0eb-891fb06b6ab0\" data-image-id=\"7d866175-d3db-4a02-b0eb-891fb06b6ab0\" alt=\"\"></figure>\n<object type=\"application/kenticocloud\" data-type=\"item\" data-rel=\"component\" data-codename=\"e53bff4f_0f6e_0168_a2fe_5ec0eaa032de\"></object>"
}

const transformJsonWithCustomResolvers = (result: IOutputResult) => transformIOuputToJson(result, customResolveIDomTextNode, customResolveIDomHtmlNode)

describe("Json Transfomer Tests", () => {
    it("Test empty", () => {
        const testValue: IOutputResult = {
            children: []
        }

        const output = transformJsonWithCustomResolvers(testValue);

        expect(output).toEqual([]);
    })

    it("Test only IDomTextNode", () => {
        const testValue: IOutputResult = {
            children: [
                {
                    type:"text",
                    content:"test value",
                }
            ]
        }

        const output = transformJsonWithCustomResolvers(testValue)[0];

        const expectedOutput = {
            text: "test value"
        };


        expect(output).toEqual(expectedOutput);
    })

    it("Test only IDomHtmlNode", () => {
        const testValue: IOutputResult = {
            children: [
                {
                    type:"tag",
                    tagName:"p",
                    attributes: {},
                    children: []
                }
            ]
        }

        const output = transformJsonWithCustomResolvers(testValue)[0];

        const expectedOutput = {
            tag: "p",
            children: []
        };


        expect(output).toEqual(expectedOutput);
    })

    it("Test RichText", () => {
        const parsed = (new RichTextBrowserParser()).parse(dummy.value);
        const trasnformed = transformJsonWithCustomResolvers(parsed);
        
        const expectedOutput= JSON.parse(`
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
         ]`  
        )

        expect(trasnformed).toEqual(expectedOutput);
    })

    it("test resolving table", () => {
        const inputValue = "<table><tbody>\n  <tr><td>Ivan</td><td>Jiri</td></tr>\n  <tr><td>Ondra</td><td>Dan</td></tr>\n</tbody></table>";
        const parsed = (new RichTextBrowserParser()).parse(inputValue);
        
        const result = transformJsonWithCustomResolvers(parsed);
        const expectedOutput = JSON.parse(`[{"tag":"tableName","children":[{"tag":"tbody","children":[{"text":"\\n  "},{"tag":"tr","children":[{"tag":"td","content":[{"text":"Ivan"}]},{"tag":"td","content":[{"text":"Jiri"}]}]},{"text":"\\n  "},{"tag":"tr","children":[{"tag":"td","content":[{"text":"Ondra"}]},{"tag":"td","content":[{"text":"Dan"}]}]},{"text":"\\n"}]}]}]`)
        
          expect(result).toEqual(expectedOutput);
        })

    it ("test transofrming list", () => {
        const parsed = (new RichTextBrowserParser()).parse("<ul>\n  <li>Ivan</li>\n  <li>Jiri</li>\n  <li>Dan</li>\n  <li>Ondra\n    <ul>\n      <ul>\n        <li>Rosta</li>\n      </ul>\n      <li>Ondra</li>\n    </ul>\n  </li>\n</ul>");
        
        const result = transformJsonWithCustomResolvers(parsed);
        const expectedOutput = JSON.parse(`[
  {
    "tag": "ul",
    "children": [
      {
        "text": "\\n  "
      },
      {
        "tag": "li",
        "text": "Ivan"
      },
      {
        "text": "\\n  "
      },
      {
        "tag": "li",
        "text": "Jiri"
      },
      {
        "text": "\\n  "
      },
      {
        "tag": "li",
        "text": "Dan"
      },
      {
        "text": "\\n  "
      },
      {
        "tag": "li",
        "text": "Ondra\\n    ",
        "children": [
          {
            "tag": "ul",
            "children": [
              {
                "text": "\\n      "
              },
              {
                "tag": "ul",
                "children": [
                  {
                    "text": "\\n        "
                  },
                  {
                    "tag": "li",
                    "text": "Rosta"
                  },
                  {
                    "text": "\\n      "
                  }
                ]
              },
              {
                "text": "\\n      "
              },
              {
                "tag": "li",
                "text": "Ondra"
              },
              {
                "text": "\\n    "
              }
            ]
          },
          {
            "text": "\\n  "
          }
        ]
      },
      {
        "text": "\\n"
      }
    ]
  }
]`);
    expect(result).toEqual(expectedOutput)
    })
})