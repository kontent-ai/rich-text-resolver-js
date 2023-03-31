import { Elements, ElementType } from '@kontent-ai/delivery-sdk';
import React from 'react';
import TestRenderer from 'react-test-renderer';
import { RichTextNodeParser } from '../../src/parser';
import { PortableText } from '@portabletext/react';

const dummyRichText: Elements.RichTextElement = {
    value: "<p>some text in a paragraph</p>",
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

const richTextNodeParser = new RichTextNodeParser();

describe("portable text React resolver", () => {
    it("renders simple HTML", () => {
      const portableText = richTextNodeParser.parse(dummyRichText.value);
      const renderer = TestRenderer.create(<PortableText value={portableText}/>)
    
      let tree = renderer.toJSON();
      expect(tree).toMatchInlineSnapshot(`
<p>
  some text in a paragraph
</p>
`);
    })
  })