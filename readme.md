# TypeScript rich text parser for Kontent.ai

This tool provides an alternative to rich text parsing and resolution built into the JS SDK, allowing more control over the resolution process, such as specifying the output type and structure.

## Installation

Install the package via npm

`npm i @pokornyd/kontent-ai-rich-text-parser`

---

## Usage

Module provides two functions to parse rich text HTML into a simplified JSON tree: `browserParse` for client-side resolution and `nodeParse` for server-side use with Node.js.

Their use is identical, the only difference is the underlying parsing logic. Each exposes a single `parse` function, which accepts rich text HTML value in string format.

```ts
const parsedTree1 = browserParse(richTextValue); // for browsers

const parsedTree2 = nodeParse(richTextValue); // for Node.js
```

Result is a simple tree structure, defined by the following interface:

```ts
interface IOutputResult {
  children: IDomNode[];
}
```

`IDomNode` is a union of `IDomHtmlNode` and `IDomTextNode`, which together define the full HTML tree structure:

![Resolved DOMTree](./media/domtree.jpg)

### Resolution

Resolution is achieved by traversing the output tree returned from one of the parse functions and manipulating it as per contextual requirements.

To identify each node, you may use helper functions included in the module (`isText`, `isElement` (with type guard) and `isLinkedItem`, `isImage`, `isItemLink`, `isUnpairedElement` (boolean)) as in the below example, or manually, based on the domNode type and attributes, see examples:

#### HTML string (TypeScript)

```ts
const parsedTree = browserParse(richTextValue);

const resolve = (domNode: IDomNode): string => {
  switch (node.type) {
    case "tag": {
      if (isLinkedItem(node)) {
        return resolveLinkedItem(node);
      } else if (isImage(node)) {
        return resolveImage(node);
      } else if (isItemLink(node)) {
        return resolveItemLink(node);
      } else {
        // Recursively calls `resolve` for node's children
        return resolveHtmlElement(node);
      }
    }

    case "text":
      return node.content;

    default:
      throw new Error("Invalid input.");
  }
};

const resolvedHtml = parsedTree.children.map(resolve).join("");
```

##### Helper resolution methods

Resolution method implementation varies based on the use cases. This is just a showcase to present how to get information for node specific data.

```ts
const resolveHtmlElement = (node: IDomHtmlNode): string => {
  const attributes = Object.entries(node.attributes)
    .map(([key, value]) => `${key}="${value}"`)
    .join(" ");
  const openingTag = `<${node.tagName} ${attributes}>`;
  const closingTag = `</${node.tagName}>`;

  // Recursively calls `resolve` for node's children
  return `${openingTag}${node.children.map(link).join("")}${closingTag}`;
};
```

[Image attributes](https://kontent.ai/learn/reference/openapi/delivery-api/#section/Images-in-rich-text) contain just the information parsed from HTML. Image context is being returned as a [part of the Delivery API response](https://kontent.ai/learn/reference/openapi/delivery-api/#section/Rich-text-element) - in the sample below being loaded by `getImage` method.

```ts
resolveImage = (node: IDomHtmlNode): string => {
  const imageId = node.attributes["data-asset-id"];

  const image = getImage(imageId);
  return `<img src=${image.url}/>`;
};
```

[Link attributes](https://kontent.ai/learn/reference/openapi/delivery-api/#section/Links-in-rich-text) contain just the information parsed from HTML. Link context is being returned as a [part of the Delivery API response](https://kontent.ai/learn/reference/openapi/delivery-api/#section/Rich-text-element) - in the sample below being loaded by `getLink` method.

```ts
const resolveItemLink = (node: IDomHtmlNode): string => {
  const linkId = node.attributes["data-item-id"];

  const link = getLink(linkId);

  return `<a href="${resolveLink(link)}">${node.children.map(link).join()}</a>`;
};
```

[Linked item attributes](https://kontent.ai/learn/reference/openapi/delivery-api/#section/Content-items-and-components-in-rich-text) contain just the information parsed from HTML. Linked item context is being returned as a [part of the Delivery API response](https://kontent.ai/learn/reference/openapi/delivery-api/#section/Rich-text-element) - in the sample below being loaded by `getLinkedContentItem` method.

```ts
const resolveLinkedItem = (node: IDomHtmlNode): string => {
  const itemCodeName = node.attributes["data-codename"];

  const item = getLinkedContentItem(itemCodeName);
  switch (item.system.type) {
    case "quote":
      return `<quote>${item.elements.quote_text.value}</quote>`;
    //  ...
    default:
      return `<strong>UNSUPPORTED CONTENT ITEM</strong>`;
  }
};
```

### React with JS SDK

```tsx
// assumes element prop comes from JS SDK

type Props = Readonly<{
    element: Elements.RichTextElement;
    className: string;
}>;

const RichText: React.FC<Props> = ({element, className}) => {
  const [richTextContent, setRichTextContent] = useState<JSX.Element[] | null>(null);

  useEffect(() => {
    const parsedTree = browserParse(element.value);
    const resolve = (domNode: IDomNode, index: number): JSX.Element => {
      switch (domNode.type) {
        case 'tag': {
          // traverse tree recursively
          const resolvedChildElements = domNode.children.map(node => resolve(node, index));
          // omit children parameter for non-pair elements like <br>
          if (isUnpairedElement(domNode)) {
            return React.createElement(domNode.tagName, {...domNode.attributes});
          }

          if (isLinkedItem(domNode)) {
            const linkedItem = element.linkedItems.find(item => item.system.codename === domNode.attributes['data-codename']);

            switch (linkedItem?.system.type) {
              case 'youtube_video': {
                  return <YoutubeVideo key={index} id={linkedItem.elements.videoId.value} />;
              }
              // resolution for other types
              default: {
                  return <div key={index}>Failed resolving item {linkedItem.system.codename}. Resolver for type {linkedItem.system.type} not implemented.</div>;
              }
            }
            // if (isImage(domNode)) {...}
            // if (isLink(domNode)) {...}
          }

          const attributes = { ...domNode.attributes, key: index };
          return React.createElement(domNode.tagName, attributes, resolvedChildElements);
        }

        case: 'text': {
          return <React.Fragment key={index}>{domNode.content}</React.Fragment>
        }

        default: throw new Error("Invalid input.")
      }
    }

    const result = parsedTree.children.map((node, index) => resolve(node, index));
    setRichTextContent(result);
  }, [element]);

  return (
    <div className={className}>
      {richTextContent}
    </div>
  );
};
```
