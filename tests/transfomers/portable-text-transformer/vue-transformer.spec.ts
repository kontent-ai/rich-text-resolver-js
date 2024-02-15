import { Elements,ElementType } from "@kontent-ai/delivery-sdk";
import { PortableText, PortableTextComponentProps, PortableTextComponents, toPlainText } from "@portabletext/vue"
import { mount } from "@vue/test-utils";
import { h } from "vue";

import { nodeParse, transformToPortableText } from "../../../src"
import { PortableTextImage, PortableTextTable } from "../../../src/transformers/transformer-models";
import { resolveImage, resolveTable,toVueImageDefault } from '../../../src/utils/resolution/vue';

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
        workflowStep: "published",
        workflow: "default"
      },
      elements: {
        text_element: {
          type: ElementType.Text,
          name: "text element",
          value: "random text value",
        },
      },
    },
  ],
  links: [],
  name: "dummy",
};

const components: PortableTextComponents = {
  types: {
    image: ({ value }: PortableTextComponentProps<PortableTextImage>) =>
      resolveImage(value, h, toVueImageDefault),
    table: ({ value }: PortableTextComponentProps<PortableTextTable>) =>
      resolveTable(value, h, toPlainText),
  },
};

describe("PortableText Vue Renderer", () => {
  it("renders simple HTML from portable text", () => {
    const jsonTree = nodeParse(dummyRichText.value);
    const portableText = transformToPortableText(jsonTree);

    const wrapper = mount(PortableText, {
      props: {
        value: portableText,
      },
    });

    expect(wrapper.html()).toMatchInlineSnapshot(
      `"<p>some text in a paragraph</p>"`
    );
  });

  it("renders an image", () => {
    dummyRichText.value = `<p>some text before an asset</p><figure data-asset-id="bc6f3ce5-935d-4446-82d4-ce77436dd412" data-image-id="bc6f3ce5-935d-4446-82d4-ce77436dd412"><img src="https://assets-us-01.kc-usercontent.com:443/cec32064-07dd-00ff-2101-5bde13c9e30c/7d534724-edb8-4a6d-92f6-feb52be61d37/image1_w_metadata.jpg" data-asset-id="bc6f3ce5-935d-4446-82d4-ce77436dd412" data-image-id="bc6f3ce5-935d-4446-82d4-ce77436dd412" alt="alternative_text"></figure>`;
    const jsonTree = nodeParse(dummyRichText.value);
    const portableText = transformToPortableText(jsonTree);

    const wrapper = mount(PortableText, {
      props: {
        value: portableText,
        components: components,
      },
    });

    expect(wrapper.html()).toMatchInlineSnapshot(`
"<p>some text before an asset</p>
<img src="https://assets-us-01.kc-usercontent.com:443/cec32064-07dd-00ff-2101-5bde13c9e30c/7d534724-edb8-4a6d-92f6-feb52be61d37/image1_w_metadata.jpg" alt="alternative_text">"
`);
  });

  it("renders a table", () => {
    dummyRichText.value = "<table><tbody>\n  <tr><td>Ivan</td><td>Jiri</td></tr>\n  <tr><td>Ondra</td><td>Dan</td></tr>\n</tbody></table>";
    const jsonTree = nodeParse(dummyRichText.value);
    const portableText = transformToPortableText(jsonTree);

    const wrapper = mount(PortableText, {
      props: {
        value: portableText,
        components: components,
      },
    });

    expect(wrapper.html()).toMatchInlineSnapshot(`
"<table>
  <tr>
    <td>Ivan</td>
    <td>Jiri</td>
  </tr>
  <tr>
    <td>Ondra</td>
    <td>Dan</td>
  </tr>
</table>"
`);
  });
});
