import { Elements, ElementType } from "@kontent-ai/delivery-sdk";
import {
  escapeHTML,
  PortableTextMarkComponentOptions,
  PortableTextOptions,
  PortableTextTypeComponentOptions,
  toHTML,
} from "@portabletext/to-html";

import {
browserParse,
nodeParse,
PortableTextComponent,
PortableTextExternalLink,
PortableTextImage,
PortableTextInternalLink,
PortableTextTable,
ResolverFunction,
transformToPortableText
} from "../../../src"

import { resolveImage, resolveTable, toHTMLImageDefault } from "../../../src/utils/resolution/html";

jest.mock('short-unique-id', () => {
    return {
      default: jest.fn().mockImplementation(() => {
        return () => 'guid';
      })
    }
  });

  type CustomResolvers = {
    image?: ResolverFunction<PortableTextImage>;
    block?: ResolverFunction<PortableTextBlock>;
    table?: ResolverFunction<PortableTextTable>;
    component?: ResolverFunction<PortableTextComponent>;
    internalLink?: ResolverFunction<PortableTextInternalLink>;
    link?: ResolverFunction<PortableTextExternalLink>;
};

const customResolvers: Partial<CustomResolvers> = {
    image: (image) => `<img src="${image.asset.url} alt="${image.asset.rel ?? ""} height="800">`
}

describe("HTML converter", () => {

    const richTextTemplate: Elements.RichTextElement = {
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
                    workflowStep: "published",
                    workflow: "default"
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

    const getPortableTextComponents = (element: Elements.RichTextElement, customResolvers: CustomResolvers = {}): PortableTextOptions => ({
        components: {
            types: {
                image: ({ value }) => {
                        return customResolvers.image ? customResolvers.image(value) : resolveImage(value, toHTMLImageDefault);
                },
                component: ({ value }: PortableTextTypeComponentOptions<PortableTextComponent>) => {
                    const linkedItem = element.linkedItems.find(item => item.system.codename === value.component._ref);
                    switch (linkedItem?.system.type) {
                        case ('test'): {
                            return `<p>resolved value of text_element: <strong>${linkedItem.elements.text_element.value}</strong></p>`;
                        }
                        default: {
                            return `Resolver for type ${linkedItem?.system.type} not implemented.`
                        }
                    }
                },
                table: ({ value }: PortableTextTypeComponentOptions<PortableTextTable>) => {
                    const tableHtml = resolveTable(value, toHTML);
                    return tableHtml;
                }
            },
            marks: {
                internalLink: ({ children, value }: PortableTextMarkComponentOptions<PortableTextInternalLink>) => {
                    return `<a href="https://website.com/${value?.reference._ref}">${children}</a>`
                },
                link: ({ children, value }: PortableTextMarkComponentOptions<PortableTextExternalLink>) => {
                    return `<a href=${escapeHTML(value?.href!)}">${children}</a>`
                }
            }
        }
    });

    it("builds basic portable text into HTML", () => {
        const richTextInput = { ...richTextTemplate }
        richTextInput.value = '<p><br></p><p>text<a href="http://google.com" data-new-window="true" title="linktitle" target="_blank" rel="noopener noreferrer"><strong>link</strong></a></p><h1>heading</h1><p><br></p>';

        const browserTree = browserParse(richTextInput.value);
        const nodeTree = nodeParse(richTextInput.value);
        const nodePortableText = transformToPortableText(nodeTree);
        const browserPortableText = transformToPortableText(browserTree);
        const nodeResult = toHTML(nodePortableText, getPortableTextComponents(richTextInput));
        const browserResult = toHTML(browserPortableText, getPortableTextComponents(richTextInput));

        expect(nodeResult).toMatchSnapshot();
        expect(nodeResult).toEqual(browserResult);
    })

    it("resolves internal link", () => {
        const richTextInput = { ...richTextTemplate }
        richTextInput.value = `<p><a data-item-id="23f71096-fa89-4f59-a3f9-970e970944ec" href=""><em>item</em></a></p>`

        const browserTree = browserParse(richTextInput.value);
        const nodeTree = nodeParse(richTextInput.value);
        const nodePortableText = transformToPortableText(nodeTree);
        const browserPortableText = transformToPortableText(browserTree);
        const nodeResult = toHTML(nodePortableText, getPortableTextComponents(richTextInput));
        const browserResult = toHTML(browserPortableText, getPortableTextComponents(richTextInput));

        expect(nodeResult).toMatchSnapshot();
        expect(nodeResult).toEqual(browserResult);
    })

    it("resolves a linked item", () => {
        const richTextInput = { ...richTextTemplate }
        richTextInput.value = '<object type="application/kenticocloud" data-type="item" data-rel="link" data-codename="test_item"></object><p>text after component</p>'
        const browserTree = browserParse(richTextInput.value);
        const nodeTree = nodeParse(richTextInput.value);
        const nodePortableText = transformToPortableText(nodeTree);
        const browserPortableText = transformToPortableText(browserTree);
        const nodeResult = toHTML(nodePortableText, getPortableTextComponents(richTextInput));
        const browserResult = toHTML(browserPortableText, getPortableTextComponents(richTextInput));

        expect(nodeResult).toMatchSnapshot();
        expect(nodeResult).toEqual(browserResult);
    })

    it("resolves a table", () => {
        const richTextInput = { ...richTextTemplate }
        richTextInput.value = "<table><tbody>\n  <tr><td>Ivan</td><td>Jiri</td></tr>\n  <tr><td>Ondra</td><td>Dan</td></tr>\n</tbody></table>";
        const browserTree = browserParse(richTextInput.value);
        const nodeTree = nodeParse(richTextInput.value);
        const nodePortableText = transformToPortableText(nodeTree);
        const browserPortableText = transformToPortableText(browserTree);
        const nodeResult = toHTML(nodePortableText, getPortableTextComponents(richTextInput));
        const browserResult = toHTML(browserPortableText, getPortableTextComponents(richTextInput));

        expect(nodeResult).toMatchSnapshot();
        expect(nodeResult).toEqual(browserResult);
    })

    it("resolves an asset", () => {
        const richTextInput = { ...richTextTemplate }
        richTextInput.value = `<figure data-asset-id="62ba1f17-13e9-43c0-9530-6b44e38097fc" data-image-id="62ba1f17-13e9-43c0-9530-6b44e38097fc"><img src="https://assets-us-01.kc-usercontent.com:443/cec32064-07dd-00ff-2101-5bde13c9e30c/3594632c-d9bb-4197-b7da-2698b0dab409/Riesachsee_Dia_1_1963_%C3%96sterreich_16k_3063.jpg" data-asset-id="62ba1f17-13e9-43c0-9530-6b44e38097fc" data-image-id="62ba1f17-13e9-43c0-9530-6b44e38097fc" alt=""></figure>`;
        const browserTree = browserParse(richTextInput.value);
        const nodeTree = nodeParse(richTextInput.value);
        const nodePortableText = transformToPortableText(nodeTree);
        const browserPortableText = transformToPortableText(browserTree);
        const nodeResult = toHTML(nodePortableText, getPortableTextComponents(richTextInput));
        const browserResult = toHTML(browserPortableText, getPortableTextComponents(richTextInput));

        expect(nodeResult).toMatchSnapshot();
        expect(nodeResult).toEqual(browserResult);
    })

    it("resolves an asset with custom resolver", () => {
        const richTextInput = { ...richTextTemplate }
        richTextInput.value = `<figure data-asset-id="62ba1f17-13e9-43c0-9530-6b44e38097fc" data-image-id="62ba1f17-13e9-43c0-9530-6b44e38097fc"><img src="https://assets-us-01.kc-usercontent.com:443/cec32064-07dd-00ff-2101-5bde13c9e30c/3594632c-d9bb-4197-b7da-2698b0dab409/Riesachsee_Dia_1_1963_%C3%96sterreich_16k_3063.jpg" data-asset-id="62ba1f17-13e9-43c0-9530-6b44e38097fc" data-image-id="62ba1f17-13e9-43c0-9530-6b44e38097fc" alt=""></figure>`;
        const browserTree = browserParse(richTextInput.value);
        const nodeTree = nodeParse(richTextInput.value);
        const nodePortableText = transformToPortableText(nodeTree);
        const browserPortableText = transformToPortableText(browserTree);
        const nodeResult = toHTML(nodePortableText, getPortableTextComponents(richTextInput, customResolvers));
        const browserResult = toHTML(browserPortableText, getPortableTextComponents(richTextInput, customResolvers));

        expect(nodeResult).toMatchSnapshot();
        expect(nodeResult).toEqual(browserResult);
    })
})