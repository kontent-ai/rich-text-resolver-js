# JSON Transformer

This module also allows you to manipulate the intermediate JSON structure prior to converting it into Portable text or if you prefer to work with a tree structure, rather than portable text.

## Usage

Output of `nodeParse` and `browserParse` methods is a simple tree structure, defined by the following interface.

```ts
interface ParseResult {
  children: DomNode[];
}
```

`DomNode` is a union of `DomHtmlNode` and `DomTextNode`, which together define the full HTML tree structure:

![Resolved DOMTree](../media/domtree.jpg)

The structure can be modified using `transformToJson` method which accepts `ParseResult` as the first argument and an optional `customResolvers` object, which can contain two methods `resolveDomTextNode` and `resolveDomHtmlNode`. Each method is responsible for manipulating its respective node type, allowing you to transform the output as per your requirements.

Example use of the `transformToJson` method:

```ts
const transformJsonWithCustomResolvers = (result: ParseResult) => transformToJson(result, {
  resolveDomTextNode: customResolveDomTextNode,
  resolveDomHtmlNode: customResolveDomHtmlNode
})


const customResolveDomTextNode: ResolveDomTextNodeType = node => {
  return {
    text: node.content
  };
}

const customResolveDomHtmlNode: ResolveDomHtmlNodeType = (node, traverse) => {
  let result = {
    tag: node.tagName
  };

  switch (node.tagName) {
    case 'figure': {
      const figureObject = {
        'imageId': node.attributes['data-image-id']
      };
      result = { ...result, ...figureObject }
      break;
    }
    case "img": {
      const imgObject = {
        'src': node.attributes['src'],
        'alt': node.attributes['alt']
      }
      result = { ...result, ...imgObject }
      break;      
    }
    case 'ol': {
      const tdObject = {
        'tag': 'ol'
      };
      result = { ...result, ...tdObject }
      break;
    }
    case 'ul': {
      const tdObject = {
        'tag': 'ul'
      };
      result = { ...result, ...tdObject }
      break;
    }
    case 'li': {
      let tdObject = {
        'tag': 'li',
        'text': node.children[0].type === 'text' ? node.children[0].content : ""
      };
      if (node.children.length > 1) {
        tdObject = { ...tdObject, ...{ children: node.children.slice(1).map(node => traverse(node)) } }
      }
      return { ...result, ...tdObject }
    }
    case "object": {
      if (node.attributes['type'] === 'application/kenticocloud') {
        const linkedItemObject = {
          codeName: node.attributes['data-codename']
        };
        result = { ...result, ...linkedItemObject }
      }
      break;
    }
    default: {

    }
  }
  return result;
}

const originalTree = browserParse(richTextValue);
const transformedTree = transformJsonWithCustomResolvers(originalTree);
```

## Resolution
If you prefer working with a tree structure, rather than Portable text, you can implement resolution around the `ParseResult` tree. See examples below.

#### HTML string (TypeScript)

```ts
const parsedTree = browserParse(richTextValue);

const resolve = (domNode: DomNode): string => {
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
const resolveHtmlElement = (node: DomHtmlNode): string => {
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
resolveImage = (node: DomHtmlNode): string => {
  const imageId = node.attributes["data-asset-id"];

  const image = getImage(imageId);
  return `<img src=${image.url}/>`;
};
```

[Link attributes](https://kontent.ai/learn/reference/openapi/delivery-api/#section/Links-in-rich-text) contain just the information parsed from HTML. Link context is being returned as a [part of the Delivery API response](https://kontent.ai/learn/reference/openapi/delivery-api/#section/Rich-text-element) - in the sample below being loaded by `getLink` method.

```ts
const resolveItemLink = (node: DomHtmlNode): string => {
  const linkId = node.attributes["data-item-id"];

  const link = getLink(linkId);

  return `<a href="${resolveLink(link)}">${node.children.map(link).join()}</a>`;
};
```

[Linked item attributes](https://kontent.ai/learn/reference/openapi/delivery-api/#section/Content-items-and-components-in-rich-text) contain just the information parsed from HTML. Linked item context is being returned as a [part of the Delivery API response](https://kontent.ai/learn/reference/openapi/delivery-api/#section/Rich-text-element) - in the sample below being loaded by `getLinkedContentItem` method.

```ts
const resolveLinkedItem = (node: DomHtmlNode): string => {
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
    const resolve = (domNode: DomNode, index: number): JSX.Element => {
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
