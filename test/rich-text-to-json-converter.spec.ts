import { Elements, ElementType } from "@kontent-ai/delivery-sdk";
import { RichTextInput } from "../src/resolver/resolver-models";
import { RichTextBrowserParser } from "../src/parser/browser/RichTextBrowserParser";
import { RichTextResolver } from "../src/resolver/RichTextResolver";

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

describe("Rich text resolver with Node parser", () => {
  it("returns parsed tree", () => {
    const result = null

    expect(result).toMatchInlineSnapshot();
  })

  it("parses empty rich text correctly", () => {
    dummyRichText.value = `<p><br></p>`;
    const result = null

    expect(result).toMatchInlineSnapshot(`"<p><br></p>"`);
  })

  it("returns HTML resolved rich text", () => {
    dummyRichText.value = "<p class=\"test\" id=3><object type=\"application/kenticocloud\" data-type=\"item\" data-rel=\"component\" data-codename=\"test_item\"></object>before text<a href=\"mailto:email@abc.test\">email</a>after text line break <br></p>"
    const result = null

    expect(result).toMatchInlineSnapshot(`"<p class=\\"test\\" id=\\"3\\"><p>resolved item of type:  test</p>before text<a href=\\"mailto:email@abc.test\\">email</a>after text line break <br></p>"`);
  })

  it("returns the same content in both node and browser", () => {

  })
})

const richText: RichTextInput = {
  value: "<p class=\"test\" id=3><object type=\"application/kenticocloud\" data-type=\"item\" data-rel=\"component\" data-codename=\"test_item\"></object>before text<a href=\"mailto:email@abc.test\">email</a>after text line break <br></p><span>text span</span>",
  images: {},
  modular_content: [],
  links: {}
};
describe('new rich text parser', () => {
  it('parses rich text', () => {
    const richTextBrowserParser = new RichTextBrowserParser();
    const result = richTextBrowserParser.parse(richText.value);

    expect(result).toMatchSnapshot();
  })


})

describe('new rich text resolver', () => {
  it('resolve all domnodes', async() => {
    const resolver = new RichTextResolver<string>();

    const result = null

    expect(result).toMatchSnapshot();
  })
 })
