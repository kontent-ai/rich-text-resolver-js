import { browserParser, Elements, ElementType } from "@kontent-ai/delivery-sdk";
import { RichTextInput } from "../src/resolver/resolver-models";
import { RichTextBrowserParser } from "../src/parser/browser/RichTextBrowserParser";
import { RichTextResolver } from "../src/resolver/RichTextResolver";
import { RichTextNodeParser } from "../src/parser/node/RichTextNodeParser"
import { getElementInputFromSdk } from "../src/utils";
import { IDomNode } from "../src/parser";

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


const richTextInput = getElementInputFromSdk(dummyRichText);
const richTextBrowserResolver = new RichTextResolver();
const richTextNodeResolver = new RichTextResolver(new RichTextNodeParser());

describe("Rich text resolver", () => {
  it("converts SDK input, returns parsed tree", () => {
    const result = richTextBrowserResolver.parse(richTextInput);

    expect(result).toMatchInlineSnapshot(`
Object {
  "childNodes": Array [
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
          "tagName": "object",
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
          "tagName": "a",
          "type": "tag",
        },
        Object {
          "content": "after text line break ",
          "type": "text",
        },
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

  it("browser and node parser output match", () => { 
    const nodeResult = richTextNodeResolver.parse(richTextInput);
    const browserResult = richTextBrowserResolver.parse(richTextInput);

    expect(nodeResult).toEqual(browserResult);
  })

  it("parses empty rich text", () => {
    dummyRichText.value = "<p><br></p>"
    const result = richTextBrowserResolver.parse(getElementInputFromSdk(dummyRichText));
    expect(result).toMatchInlineSnapshot(`
Object {
  "childNodes": Array [
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

        const parsedTree = richTextBrowserResolver.parse(getElementInputFromSdk(dummyRichText));
        const result = parsedTree.childNodes.map(node => resolve(node)).toString();

        expect(result).toMatchInlineSnapshot(`
"<p  class=\\"test\\" id=\\"3\\">
              <div>
                resolved type: test, value of text element: random text value
              </div>

            before text<a  href=\\"mailto:email@abc.test\\">email</a>after text line break <br ></br></p>"
`);
  })

})



