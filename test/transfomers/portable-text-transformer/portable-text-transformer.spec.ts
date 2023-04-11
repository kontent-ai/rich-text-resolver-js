import { Elements, ElementType } from "@kontent-ai/delivery-sdk";
import { escapeHTML, PortableTextOptions, toHTML } from '@portabletext/to-html';
import { nodeParse, resolveTable, transform } from "../../../src";

jest.mock('crypto', () => {
  return {
    randomUUID: jest.fn(() => 'guid')
  }
});

const dummyRichText: Elements.RichTextElement = {
  value: "<p><br></p>",
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

const portableTextComponents: PortableTextOptions = {
  components: {
    types: {
      image: ({value}) => {
        return `<img src="${value.asset.url}"></img>`;
      },
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
      },
      table: ({value}) => {
        const tableHtml = resolveTable(value, toHTML);
        return tableHtml;
      }
    },
    marks: {
      internalLink: ({children, value}) => {
        return `\<a href=\"https://website.com/${value.reference._ref}">${children}</a>`
      },
      link: ({ children, value }) => {
        return `\<a href=${escapeHTML(value.href)}">${children}</a>`
      }
    }
  }
}

describe("portable text transformer", () => {
  it("transforms empty rich text", () => {
    const tree = nodeParse(dummyRichText.value);
    const result = transform(tree);

    expect(result).toMatchSnapshot();
  })

  it("transforms tables", () => {
    dummyRichText.value = `<table><tbody>\n  <tr><td><p>paragraph 1</p><p>paragraph 2</p></td><td><ul>\n  <li>bulit</li>\n</ul>\n</td><td><a href=\"http://google.com\" data-new-window=\"true\" title=\"linktitle\" target=\"_blank\" rel=\"noopener noreferrer\">this is a<strong>strong</strong>link</a></td></tr>\n<tr><td><h1><strong>nadpis</strong></h1></td><td><p>text</p></td><td><p>text</p></td></tr>\n<tr><td><p>text</p></td><td><p>text</p></td><td><p>text</p></td></tr>\n</tbody></table>`
    const tree = nodeParse(dummyRichText.value);
    const result = transform(tree);

    expect(result).toMatchSnapshot();
  })

  it("transforms item links", () => {
    dummyRichText.value = `<p><a data-item-id=\"23f71096-fa89-4f59-a3f9-970e970944ec\" href=\"\">text<strong>link to an item</strong></a></p>`
    const tree = nodeParse(dummyRichText.value);
    const result = transform(tree);

    expect(result).toMatchSnapshot();
 
  })

  it("transforms external links", () => {
    dummyRichText.value = `<h2><strong>Kontent supports portable text!</strong></h2>\n<p>For more information, check out the related <a href=\"https://github.com/portabletext/portabletext\" data-new-window=\"true\" title=\"Portable text repo\" target=\"_blank\" rel=\"noopener noreferrer\"><strong>GitHub repository.</strong></a></p>`
    const tree = nodeParse(dummyRichText.value);
    const result = transform(tree);

    expect(result).toMatchSnapshot();
  })

  it("transforms nested styles", () => {
    dummyRichText.value = `<p><strong>all text is bold and last part is </strong><em><strong>also italic and this is also </strong></em><em><strong><sup>superscript</sup></strong></em></p>`
    const tree = nodeParse(dummyRichText.value);
    const result = transform(tree);

    expect(result).toMatchSnapshot();
  })

  it("transforms lists", () => {
    dummyRichText.value = `<ul><li>first level bullet</li><li>first level bullet</li><ol><li>nested number in bullet list</li></ol></ul><ol><li>first level item</li><li>first level item</li><ol><li>second level item</li><li><strong>second level item </strong></li></ol>`;
    const tree = nodeParse(dummyRichText.value);
    const result = transform(tree);

    expect(result).toMatchSnapshot();
  })

  it("transforms images", () => {
    dummyRichText.value = `<figure data-asset-id=\"7d866175-d3db-4a02-b0eb-891fb06b6ab0\" data-image-id=\"7d866175-d3db-4a02-b0eb-891fb06b6ab0\"><img src=\"https://assets-eu-01.kc-usercontent.com:443/6d864951-9d19-0138-e14d-98ba886a4410/236ecb7f-41e3-40c7-b0db-ea9c2c44003b/sharad-bhat-62p19OGT2qg-unsplash.jpg\" data-asset-id=\"7d866175-d3db-4a02-b0eb-891fb06b6ab0\" data-image-id=\"7d866175-d3db-4a02-b0eb-891fb06b6ab0\" alt=\"\"></figure><p><em>text in a paragraph</em></p>`;
    const tree = nodeParse(dummyRichText.value);
    const result = transform(tree);

    expect(result).toMatchSnapshot();
  })

  it("transforms complex rich text into portable text", () => {
    dummyRichText.value = "<table><tbody><tr><td><ul><li>list item</li><ol><li>nested list item</li></ol></ul></td></tr></tbody></table><table><tbody>\n  <tr><td><p>paragraph 1</p><p>paragraph 2</p></td><td><ul>\n  <li>list item\n     </li>\n</ul>\n</td><td><a href=\"http://google.com\" data-new-window=\"true\" title=\"linktitle\" target=\"_blank\" rel=\"noopener noreferrer\">this is a<strong>strong</strong>link</a></td></tr>\n<tr><td><h1><strong>nadpis</strong></h1></td><td><p>text</p></td><td><p>text</p></td></tr>\n<tr><td><em>italic text</em></td><td><p>text</p></td><td><p>text</p></td></tr>\n</tbody></table><p>text<a href=\"http://google.com\" data-new-window=\"true\" title=\"linktitle\" target=\"_blank\" rel=\"noopener noreferrer\">normal and<strong>bold</strong>link</a></p><h1>heading</h1><object type=\"application/kenticocloud\" data-type=\"item\" data-rel=\"link\" data-codename=\"test_item\"></object>";
    const tree = nodeParse(dummyRichText.value);
    const result = transform(tree);

    expect(result).toMatchSnapshot();
  })

  it("transforms linked items/components", () => {
    dummyRichText.value = "<object type=\"application/kenticocloud\" data-type=\"item\" data-rel=\"link\" data-codename=\"test_item\"></object>";
    const tree = nodeParse(dummyRichText.value);
    const result = transform(tree);

    expect(result).toMatchSnapshot();
  })

  it("ignores unknown html tags", () => {
    dummyRichText.value = "<p>text in a paragraph</p><div>text in a div, which doesnt exist in kontent RTE</div>"
    const tree = nodeParse(dummyRichText.value);
    const result = transform(tree);

    expect(result).toMatchSnapshot();
  })
})

describe("HTML converter", () => {
  it("builds basic portable text into HTML", () => {
    dummyRichText.value = '<p><br></p><p>text<a href=\"http://google.com\" data-new-window=\"true\" title=\"linktitle\" target=\"_blank\" rel=\"noopener noreferrer\"><strong>link</strong></a></p><h1>heading</h1><p><br></p>';
    const tree = nodeParse(dummyRichText.value);
    const portableText = transform(tree);
    const result = toHTML(portableText, portableTextComponents);

    expect(result).toMatchSnapshot();
  })

  it("resolves internal link", () => {
    dummyRichText.value = `<p><a data-item-id=\"23f71096-fa89-4f59-a3f9-970e970944ec\" href=\"\"><em>item</em></a></p>`
    const tree = nodeParse(dummyRichText.value);
    const portableText = transform(tree);
    const result = toHTML(portableText, portableTextComponents);

    expect(result).toMatchSnapshot();
  })

  it("resolves a linked item", () => {
    dummyRichText.value = '<object type=\"application/kenticocloud\" data-type=\"item\" data-rel=\"link\" data-codename=\"test_item\"></object><p>text after component</p>'
    const tree = nodeParse(dummyRichText.value);
    const portableText = transform(tree);
    const result = toHTML(portableText, portableTextComponents);
    
    expect(result).toMatchSnapshot();
  })

  it("resolves a table", () => {
    dummyRichText.value = "<table><tbody>\n  <tr><td>Ivan</td><td>Jiri</td></tr>\n  <tr><td>Ondra</td><td>Dan</td></tr>\n</tbody></table>";
    const jsonTree = nodeParse(dummyRichText.value);
    const portableText = transform(jsonTree);
    const result = toHTML(portableText, portableTextComponents);

    expect(result).toMatchSnapshot();
  })

  it("resolves an asset", () => {
    dummyRichText.value = `<figure data-asset-id=\"62ba1f17-13e9-43c0-9530-6b44e38097fc\" data-image-id=\"62ba1f17-13e9-43c0-9530-6b44e38097fc\"><img src=\"https://assets-us-01.kc-usercontent.com:443/cec32064-07dd-00ff-2101-5bde13c9e30c/3594632c-d9bb-4197-b7da-2698b0dab409/Riesachsee_Dia_1_1963_%C3%96sterreich_16k_3063.jpg\" data-asset-id=\"62ba1f17-13e9-43c0-9530-6b44e38097fc\" data-image-id=\"62ba1f17-13e9-43c0-9530-6b44e38097fc\" alt=\"\"></figure>`;
    const tree = nodeParse(dummyRichText.value);
    const portableText = transform(tree);
    const result = toHTML(portableText, portableTextComponents)

    expect(result).toMatchSnapshot();
  })
})