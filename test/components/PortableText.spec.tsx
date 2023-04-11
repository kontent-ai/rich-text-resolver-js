import { Elements, ElementType } from '@kontent-ai/delivery-sdk';
import React from 'react';
import TestRenderer from 'react-test-renderer';
import { PortableText, toPlainText } from '@portabletext/react';
import { nodeParse, resolveTable, transform } from '../../src';

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

const portableTextComponents = {
  types: {
    component: (block: any) => {
      const item = dummyRichText.linkedItems.find(item => item.system.codename === block.value.component._ref);
      return <div>{item?.elements.text_element.value}</div>;
    },
    table: ({ value }: any) => {
      let tableString = resolveTable(value, toPlainText);
      return <>{tableString}</>;
    }
  },
  marks: {
    link: ({ value, children }: any) => {
      const target = (value?.href || '').startsWith('http') ? '_blank' : undefined
      return (
        <a href={value?.href} target={target} rel={value?.rel} title={value?.title} data-new-window={value['data-new-window']}>
          {children}
        </a>
      )
    },
    internalLink: ({ value, children }: any) => {
      const item = dummyRichText.linkedItems.find(item => item.system.id === value.reference._ref);
      return (
        <a href={"https://somerandomwebsite.xyz/" + item?.system.codename}>
          {children}
        </a>
      )
    }
  }
}

describe("portable text React resolver", () => {
  it("renders simple HTML", () => {
    const jsonTree = nodeParse(dummyRichText.value);
    const portableText = transform(jsonTree);
    const renderer = TestRenderer.create(<PortableText value={portableText} />)

    let tree = renderer.toJSON();
    expect(tree).toMatchInlineSnapshot(`
    <p>
      some text in a paragraph
    </p>
    `);
  })

  it("renders a resolved linked item", () => {
    dummyRichText.value = '<object type=\"application/kenticocloud\" data-type=\"item\" data-rel=\"link\" data-codename=\"test_item\"></object>';
    const jsonTree = nodeParse(dummyRichText.value);
    const portableText = transform(jsonTree);
    const renderer = TestRenderer.create(<PortableText value={portableText} components={portableTextComponents} />);

    let tree = renderer.toJSON();
    expect(tree).toMatchInlineSnapshot(`
<div>
  random text value
</div>
`);
  })

  it("renders internal and external links", () => {
    dummyRichText.value = "<p><a href=\"http://google.com\" title=\"linktitle\" target=\"_blank\" >external link</a><a data-item-id=\"99e17fe7-a215-400d-813a-dc3608ee0294\" href=\"\"><strong>item link</strong></a></p>"
    const jsonTree = nodeParse(dummyRichText.value);
    const portableText = transform(jsonTree);
    const renderer = TestRenderer.create(<PortableText value={portableText} components={portableTextComponents} />);

    let tree = renderer.toJSON();
    expect(tree).toMatchInlineSnapshot(`
<p>
  <a
    href="http://google.com"
    target="_blank"
    title="linktitle"
  >
    external link
    <a
      href="https://somerandomwebsite.xyz/test_item"
    >
      <strong>
        item link
      </strong>
    </a>
  </a>
</p>
`);
  })

  it("renders a table", () => {
    dummyRichText.value = "<table><tbody>\n  <tr><td>Ivan</td><td>Jiri</td></tr>\n  <tr><td>Ondra</td><td>Dan</td></tr>\n</tbody></table>";
    const jsonTree = nodeParse(dummyRichText.value);
    const portableText = transform(jsonTree);
    const renderer = TestRenderer.create(<PortableText value={portableText} components={portableTextComponents} />);

    let tree = renderer.toJSON();
    expect(tree).toMatchInlineSnapshot(`"<table><tbody><tr><td>Ivan</td><td>Jiri</td></tr><tr><td>Ondra</td><td>Dan</td></tr></tbody></table>"`);
  })
})