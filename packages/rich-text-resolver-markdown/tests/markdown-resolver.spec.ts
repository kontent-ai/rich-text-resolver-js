import { transformToPortableText } from "@kontent-ai/rich-text-resolver";
import { describe, expect, it } from "vitest";
import { toMarkdown } from "../src/markdown.js";

describe("Markdown conversion from Kontent.ai content", () => {
  
  describe("Headings", () => {
    it("converts all heading levels to markdown", () => {
      const html = `<h1>Main Title</h1>
<h2>Section Title</h2>
<h3>Subsection Title</h3>
<h4>Sub-subsection Title</h4>
<h5>Minor Heading</h5>
<h6>Smallest Heading</h6>
<p>This is a normal paragraph at the end.</p>`;
      const expectedMarkdown = `# Main Title

## Section Title

### Subsection Title

#### Sub-subsection Title

##### Minor Heading

###### Smallest Heading

This is a normal paragraph at the end.\n\n`;
      
      const portableText = transformToPortableText(html);
      const markdown = toMarkdown(portableText);
      
      expect(markdown).toEqual(expectedMarkdown);
    });
  });

  describe("Text Formatting", () => {
    it("converts all inline text marks to markdown", () => {
      const html = `<p>This paragraph contains <strong>bold text</strong> for testing.</p>
<p>This paragraph contains <em>italic text</em> for testing.</p>
<p>This paragraph contains <code>inline code</code> for testing.</p>
<p>This paragraph contains an <a href="https://kontent.ai">external link</a> for testing.</p>
<p>This paragraph contains <sup>superscript text</sup> for testing.</p>
<p>This paragraph contains <sub>subscript text</sub> for testing.</p>
<p>Combined formatting: <em><strong>Bold and Italic</strong></em>, <code><strong>Bold code</strong></code>, and <a href="https://example.com"><strong>Bold link</strong></a>.</p>`;
      const expectedMarkdown = `This paragraph contains **bold text** for testing.

This paragraph contains _italic text_ for testing.

This paragraph contains \`inline code\` for testing.

This paragraph contains an [external link](https://kontent.ai) for testing.

This paragraph contains <sup>superscript text</sup> for testing.

This paragraph contains <sub>subscript text</sub> for testing.

Combined formatting: **_Bold and Italic_**, **\`Bold code\`**, and [**Bold link**](https://example.com).\n\n`;
      
      const portableText = transformToPortableText(html);
      const markdown = toMarkdown(portableText);
      
      expect(markdown).toEqual(expectedMarkdown);
    });
  });

  describe("Lists", () => {
    it("converts nested unordered lists to markdown", () => {
      const html = `<ul>
  <li>Bullet item 1</li>
  <li>Bullet item 2
    <ul>
      <li>Nested bullet item 2.1</li>
      <li>Nested bullet item 2.2
        <ul>
          <li>Double nested bullet item 2.2.1</li>
        </ul>
      </li>
    </ul>
  </li>
  <li>Bullet item 3</li>
</ul>`;
      const expectedMarkdown = `- Bullet item 1
- Bullet item 2
   - Nested bullet item 2.1
   - Nested bullet item 2.2
      - Double nested bullet item 2.2.1
- Bullet item 3\n\n`;
      
      const portableText = transformToPortableText(html);
      const markdown = toMarkdown(portableText);
      
      expect(markdown).toEqual(expectedMarkdown);
    });
    
    it("converts nested ordered lists to markdown", () => {
      const html = `<ol>
  <li>First item</li>
  <li>Second item
    <ol>
      <li>Nested item 2.1</li>
      <li>Nested item 2.2
        <ol>
          <li>Double nested item 2.2.1</li>
        </ol>
      </li>
    </ol>
  </li>
  <li>Third item</li>
</ol>`;
      const expectedMarkdown = `1. First item
1. Second item
   1. Nested item 2.1
   1. Nested item 2.2
      1. Double nested item 2.2.1
1. Third item

`;
      
      const portableText = transformToPortableText(html);
      const markdown = toMarkdown(portableText);

      expect(markdown).toEqual(expectedMarkdown);
    });
    
    it("converts mixed nested lists with formatting to markdown", () => {
      const html = `<ol>
  <li>Ordered item with <strong>bold text</strong></li>
  <li>Ordered item with <a href="https://kontent.ai">link</a>
    <ul>
      <li>Nested unordered item</li>
      <li>Nested unordered with <code>code</code></li>
    </ul>
  </li>
  <li>Ordered item with <em>italic</em></li>
</ol>`;
      const expectedMarkdown = `1. Ordered item with **bold text**
1. Ordered item with [link](https://kontent.ai)
   - Nested unordered item
   - Nested unordered with \`code\`
1. Ordered item with _italic_

`;
      
      const portableText = transformToPortableText(html);
      const markdown = toMarkdown(portableText);
      
      expect(markdown).toEqual(expectedMarkdown);
    });
  });

  describe("Tables", () => {
    it("converts simple table to markdown", () => {
      const html = `<table><tbody>
  <tr><td>Header 1</td><td>Header 2</td><td>Header 3</td></tr>
  <tr><td>Cell 1.1</td><td>Cell 1.2</td><td>Cell 1.3</td></tr>
  <tr><td>Cell 2.1</td><td>Cell 2.2</td><td>Cell 2.3</td></tr>
</tbody></table>`;
      const expectedMarkdown = `| Header 1 | Header 2 | Header 3 |
| --- | --- | --- |
| Cell 1.1 | Cell 1.2 | Cell 1.3 |
| Cell 2.1 | Cell 2.2 | Cell 2.3 |

`;    
      const portableText = transformToPortableText(html);
      const markdown = toMarkdown(portableText);
      
      expect(markdown).toEqual(expectedMarkdown);
    });
    
    it("converts table with inline marks to markdown", () => {
      const html = `<table><tbody>
  <tr><td><strong>Bold Header</strong></td><td><em>Italic Header</em></td><td><code>Code Header</code></td></tr>
  <tr><td><strong>Bold cell</strong></td><td><em>Italic cell</em></td><td><a href="https://kontent.ai">Link cell</a></td></tr>
  <tr><td>Normal text</td><td><code>inline code</code></td><td>Text with <sup>superscript</sup></td></tr>
</tbody></table>`;
      const expectedMarkdown = `| **Bold Header** | _Italic Header_ | \`Code Header\` |
| --- | --- | --- |
| **Bold cell** | _Italic cell_ | [Link cell](https://kontent.ai) |
| Normal text | \`inline code\` | Text with <sup>superscript</sup> |\n\n`;
      
      const portableText = transformToPortableText(html);
      const markdown = toMarkdown(portableText);
      
      expect(markdown).toEqual(expectedMarkdown);
    });
    
    it("converts table with complex content to markdown", () => {
      const html = `<table><tbody>
  <tr><td><h2>Cell with heading</h2>
<p>Paragraph below heading</p>
</td><td><ul>
  <li>List item 1</li>
  <li>List item 2</li>
</ul>
</td></tr>
  <tr><td><p>First paragraph</p>
<p>Second paragraph</p>
</td><td><h3>Another heading</h3>
<p>More content</p>
</td></tr>
</tbody></table>`;
      const expectedMarkdown = `| <h2>Cell with heading</h2><p>Paragraph below heading</p> | <ul><li>List item 1</li><li>List item 2</li></ul> |
| --- | --- |
| <p>First paragraph</p><p>Second paragraph</p> | <h3>Another heading</h3><p>More content</p> |\n\n`;
      
      const portableText = transformToPortableText(html);
      const markdown = toMarkdown(portableText);
      
      expect(markdown).toEqual(expectedMarkdown);
    });
  });

  describe("Images", () => {
    it("converts images to markdown image syntax", () => {
      const html = `<p>Paragraph before image.</p>
<figure data-asset-id="15bc9c92-21bb-4c66-9434-cea53dd8ece3" data-image-id="15bc9c92-21bb-4c66-9434-cea53dd8ece3"><img src="https://picsum.photos/id/237/800/400" data-asset-id="15bc9c92-21bb-4c66-9434-cea53dd8ece3" data-image-id="15bc9c92-21bb-4c66-9434-cea53dd8ece3" alt=""></figure>
<p>Paragraph after image.</p>
<figure data-asset-id="15bc9c92-21bb-4c66-9434-cea53dd8ece3" data-image-id="15bc9c92-21bb-4c66-9434-cea53dd8ece3"><img src="https://picsum.photos/id/237/800/400" data-asset-id="15bc9c92-21bb-4c66-9434-cea53dd8ece3" data-image-id="15bc9c92-21bb-4c66-9434-cea53dd8ece3" alt=""></figure>
<p>Final paragraph.</p>`;
      const expectedMarkdown = `Paragraph before image.

![](https://picsum.photos/id/237/800/400)

Paragraph after image.

![](https://picsum.photos/id/237/800/400)

Final paragraph.\n\n`;
      
      const portableText = transformToPortableText(html);
      const markdown = toMarkdown(portableText);
      
      expect(markdown).toEqual(expectedMarkdown);
    });
  });

  describe("Line Breaks", () => {
    it("handles line breaks and empty paragraphs", () => {
      const html = `<p>First paragraph with content.</p>
<p><br></p>
<p>Second paragraph after empty paragraph.</p>
<p>Paragraph with explicit<br>line break in the middle.</p>`;
      const expectedMarkdown = `First paragraph with content.

<br/>

Second paragraph after empty paragraph.

Paragraph with explicit<br/>line break in the middle.\n\n`;
      
      const portableText = transformToPortableText(html);
      const markdown = toMarkdown(portableText);
      
      expect(markdown).toEqual(expectedMarkdown);
    });
  });

  describe("Components and Item Links", () => {
    const richTextHtml = `<p>This is a test of rich text with embedded components and item links.</p>
<object type="application/kenticocloud" data-type="item" data-rel="link" data-codename="quote_component"></object>
<p>You can also reference items inline, like this <a data-item-id="752c9cf5-7f93-4672-a7e8-30f4bc1c9afd" href="">important note</a> within the text.</p>
<object type="application/kenticocloud" data-type="item" data-rel="link" data-codename="note_component"></object>
<p>Final paragraph with <strong>bold text</strong> and <em>italic text</em> for good measure.</p>`;

    const linkedItems = {
      quote_component: {
        system: {
          id: "ead8db94-24c2-4d7e-8483-b1156964f7c9",
          name: "Quote Component",
          codename: "quote_component",
          type: "simple_text_component",
        },
        elements: {
          title: {
            type: "text",
            name: "Title",
            value: "Famous Quote",
          },
          content: {
            type: "text",
            name: "Content",
            value: "Knowledge is power",
          },
        },
      },
      note_component: {
        system: {
          id: "752c9cf5-7f93-4672-a7e8-30f4bc1c9afd",
          name: "Note Component",
          codename: "note_component",
          type: "simple_text_component",
        },
        elements: {
          title: {
            type: "text",
            name: "Title",
            value: "Important Note",
          },
          content: {
            type: "text",
            name: "Content",
            value: "This is an important note to remember",
          },
        },
      },
    };

    const itemLinks = {
      "752c9cf5-7f93-4672-a7e8-30f4bc1c9afd": {
        codename: "note_component",
        type: "simple_text_component",
        url_slug: "",
      },
    };

    it("combines components, item links, and text formatting", async () => {
      const portableText = transformToPortableText(richTextHtml);
      const markdown = toMarkdown(portableText, {
        components: {
          types: {
            componentOrItem: ({ value }) => {
              const itemCodename = value.componentOrItem._ref;
              const item = linkedItems[itemCodename as keyof typeof linkedItems];
              if (!item) {
                return "";
              }
              return `> **${item.elements.title.value}**: ${item.elements.content.value}\n\n`;
            },
          },
          marks: {
            contentItemLink: ({ value, children }) => {
              if (!value) {
                return `[${children}]()`;
              }
              const itemId = value.contentItemLink._ref;
              const linkInfo = itemLinks[itemId as keyof typeof itemLinks];
              if (!linkInfo) {
                return `[${children}]()`;
              }
              return `[${children}](${linkInfo.codename})`;
            },
          },
        },
      });

      await expect(markdown).toMatchFileSnapshot("__snapshots__/markdownComponents.md");
    });
  });

  describe("Integration", () => {
    it("converts complex combined content to markdown - snapshot test", async () => {
      const html = `<h1>Integration Test Document</h1>
<h2>Introduction Section</h2>
<p>This paragraph demonstrates all text marks: <strong>bold</strong>, <em>italic</em>, <code>code</code>, <a href="https://kontent.ai">external link</a>, <sup>superscript</sup>, and <sub>subscript</sub>.</p>
<h3>Lists Section</h3>
<ol>
  <li>First ordered item</li>
  <li>Second ordered item with <strong>bold</strong>
    <ul>
      <li>Nested unordered item</li>
      <li>Another nested item</li>
    </ul>
  </li>
  <li>Third ordered item</li>
</ol>
<h3>Image Section</h3>
<p>Here is an embedded image:</p>
<figure data-asset-id="15bc9c92-21bb-4c66-9434-cea53dd8ece3" data-image-id="15bc9c92-21bb-4c66-9434-cea53dd8ece3"><img src="https://picsum.photos/id/237/800/400" data-asset-id="15bc9c92-21bb-4c66-9434-cea53dd8ece3" data-image-id="15bc9c92-21bb-4c66-9434-cea53dd8ece3" alt=""></figure>
<h3>Table Section</h3>
<table><tbody>
  <tr><td><strong>Header 1</strong></td><td><em>Header 2</em></td></tr>
  <tr><td>Data 1</td><td><a href="https://example.com">Link</a></td></tr>
</tbody></table>
<h3>Conclusion</h3>
<p>Final paragraph with <code>inline code</code> and <em><strong>bold italic</strong></em> text.</p>`;
      
      const portableText = transformToPortableText(html);
      const markdown = toMarkdown(portableText);
      
      await expect(markdown).toMatchFileSnapshot("__snapshots__/markdown-integration.md");
    });
  });
});

