# TypeScript rich text parser for Kontent.ai

This tool provides an alternative to rich text parsing and resolution built into the JS SDK, allowing more control over the resolution process, such as specifying the output type and structure.

## Installation

Install the package via npm

`npm i @pokornyd/kontent-ai-rich-text-parser`

---

## Usage

Module provides two classes to parse rich text HTML into a simplified JSON tree: `RichTextBrowserParser` for client-side resolution and `RichTextNodeParser` for server-side use with Node.js.

Both classes are initialized with empty constructor and their use is identical, only difference is the underlying parsing logic. Each exposes a single `parse` method, which accepts rich text HTML value in string format.

```ts
const parser = new RichTextBrowserParser(); // RichTextNodeParser();

const parsedTree = parser.parse(richTextValue);
```

Result is a simple tree structure, defined by the following interface:

```ts
interface IOutputResult {
  childNodes: IDomNode[];
}
```

`IDomNode` is further extended by `IDomHtmlNode` and `IDomTextNode`, which together define the full HTML tree structure:

![Resolved DOMTree](domtree.jpg)

### Resolution

Resolution is achieved by traversing the output tree returned from `parse` method and manipulating it as per contextual requirements.

To identify each node, you may use helper methods included in the module (`isText`, `isElement`, `isLinkedItem`, `isImage`, `isItemLink`, `isUnpairedElement`) as in the below example, or manually, based on the domNode type and attributes. See example usage below:

#### HTML string (TypeScript)

```ts
const parsedTree = new RichTextBrowserParser().parse(richTextValue);

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

### React with context object containing the rich text objects for resolution

```tsx
// assumes element prop comes from JS SDK

const RichText: React.FC<RichTextProps> = (props) => {
  const [richTextContent, setRichTextContent] = useState<JSX.Element[] | null>(null);
  const context: IResolutionContext = {
    images: Object.fromEntries(props.element.images.map(image => [image.imageId, {
        image_id: image.imageId,
        description: image.description,
        url: image.url,
        width: image.width || null,
        height: image.height || null
    }])),
    links: Object.fromEntries(props.element.links.map(link => [link.linkId, {
        codename: link.codename,
        type: link.type,
        url_slug: link.urlSlug
    }])),
    modularContent: props.element.linkedItemCodenames,
    linkedItems: props.element.linkedItems
  })

  useEffect(() => {
    const parsedTree = new RichTextNodeParser().parse(richTextValue);
    const resolve = (domNode: IDomNode, context: IResolutionContext, index: number): JSX.Element => {
        if (isElement(node)) {
            const childElements = domNode.children.map(node => resolve(node));

            if (isUnpairedElement(node)) {
                const element = React.createElement(domNode.tagName, {...domNode.attributes});
            }

            if (isLinkedItem(node)) {
                const itemCodeName = domNode.attributes['data-codename'];
                const linkedItem = context.linkedItems.find(item => item.system.codename === itemCodeName);

                switch (linkedItem?.system.type) {
                    case 'youtube_video': {
                        return <YoutubeVideo key={index} id={linkedItem.elements.videoId.value} />;
                    }
                    default: {
                        return <div key={index}>Failed resolving item {linkedItem.system.codename}. Resolver for type {linkedItem.system.type} not implemented.</div>;
                    }
                }
            }

            const attributes = { ...domNode.attributes, key: index };
            const element = React.createElement(domNode.tagName, attributes, childElements);

            return element;
        }


        if (isText(node)) {
            return <React.Fragment key={index}>{domNode.content}</React.Fragment>
        }

        throw new Error("Undefined state");
    }

    const result = parsedTree.childNodes.map((node, index) => resolve(node, context, index));
    setRichTextContent(result);
  }, [props.element]);

  return (
    <div className={props.className}>
      {richTextContent}
    </div>
  );
};
```
