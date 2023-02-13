# TypeScript rich text parser for Kontent.ai

This tool provides an alternative to rich text parsing and resolution built into the JS SDK, allowing more control over the resolution process, such as specifying the output type and structure.

## Installation

Install the package via npm

```npm i @pokornyd/kontent-ai-rich-text-parser```

***

## Usage

Module provides two classes to parse rich text HTML into a simplified JSON tree: ```RichTextBrowserParser``` for client-side resolution and ```RichTextNodeParser``` for server-side use with Node.js.

Both classes are initialized with empty constructor and their use is identical, only difference is the underlying parsing logic.

```ts
import { RichTextBrowserParser, RichTextNodeParser } from '@pokornyd/kontent-ai-rich-text-parser';

const parser = new RichTextBrowserParser(); // RichTextNodeParser();
```

### Parsing

Both classes exposes a single `parse` method which accepts a structured `RichTextInput` object.

Structure of the rich text input mirrors the rich text element response from delivery API:

```ts
export type RichTextInput = {
    value: string,
    images?: {
        [key: string]: {
            image_id?: string,
            description?: string | null,
            url: string,
            width?: number | undefined,
            height?: number | undefined
        }
    },
    links?: {
        [key: string]: {
            codename: string,
            type?: string,
            url_slug?: string
        }
    },
    modular_content?: string[]
}
```

The module provides a helper method to map SDK response to a correct input:

```ts
import { RichTextParser, getElementInputFromSdk } from '@pokornyd/kontent-ai-rich-text-parser';
import { type IContentItem, type Elements, createDeliveryClient } from '@kontent-ai/delivery-sdk';
.
.
.
const article = (await client.item<Article>('article_codename').toPromise()).data;

const parseResult = parser.parse(getElementInputFromSdk(article.item.elements.richTextElementCodename));

```

Alternatively, you can map the input yourself, as in the following React example:

```ts
const parseResult = parser.parse({
    value: props.element.value,
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
    modular_content: props.element.linkedItemCodenames,
    linked_items: props.element.linkedItems
})
```

The output is a tree, represented by a simple interface

```ts
export interface IOutputResult {
    childNodes: IDomNode[]
}
```

where ```IDomNode``` represents either a ```IDomHtmlNode``` (tag) or ```IDomTextNode``` (text):

```ts
export interface IDomTextNode {
    type: 'text'
    content: string
}

export interface IDomHtmlNode {
    type: 'tag',
    tagName: string,
    attributes: Record<string, string>,
    children: IDomNode[]
}
```

### Resolution

Resolution is achieved by traversing the output tree returned from ```parse``` method and manipulating it as per contextual requirements. 

To identify each node, you may use helper methods included in the module (``isText``, ``isElement``, ``isLinkedItem``, ``isImage``, ``isItemLink``, ``isUnpairedElement``) as in the below example, or manually, based on the domNode type and attributes. See example usage below:

**HTML string (TypeScript)**
```typescript
const input: RichTextInput = getInput(); // from SDK or otherwise
const parser = new RichTextNodeParser();
const resolve = (domNode: IDomNode) => {
    let result = '';
    if (isText(domNode))
        result += domNode.content;
    
    else if(isLinkedItem(domNode)) {
            const linkedItem = linkedItems.find(item => item.system.codename === domNode.attributes['data-codename']);

            if(linkedItem.system.type === 'youtube_video') {
                result += `
                    <iframe
                        className="hosted-video__wrapper"
                        width="560"
                        height="315"
                        src="https://www.youtube.com/embed/${linkedItem.elements.videoId.value}"}
                        frameBorder="0"
                        allowFullScreen
                        title={Youtube video ${linkedItem.elements.videoId.value}}
                    ></iframe>
                `
            }

            else result += `<div>Resolver for type ${linkedItem.system.type} not implemented.</div>`
        }

        else if (isItemLink(domNode)) {
            const link = input.links.find(link => link[domNode.attributes['data-item-id']]);

            result += `<a href="https://website.com/article/${link.url_slug}">`;
            
            if (domNode.children.length > 0) {
                domNode.children.forEach((node) => (result += resolve(node))) //resolve nested tags recursively
            }

            result += `</a>`;
        }

        else {
            result += `<${domNode.tagName}>`;

            if (domNode.children.length > 0) {
                domNode.children.forEach(childNode => result += resolve(childNode)); // resolve tags recursively
            }   
            
            result += `</${domNode.tagName}>`;
        }
        
        return result;
    }

const parsedRichText = parser.parse(richTextInput); // see example input above
const resolvedHtml = parsedRichText.childNodes.map(node => return resolve(node)).toString();


```

**React**

```ts
const RichText: React.FC<RichTextProps> = (props) => {

  const [richTextContent, setRichTextContent] = useState<JSX.Element[] | null>(null);

  useEffect(() => {
    const parser = new RichTextBrowserParser();
    parser.parse(richTextInput) // see example input above
      .then((value) => {
        const resolve = (domNode: IDomNode, index: number): JSX.Element => {
            if (domNode.type === 'tag') {
                const childElements = domNode.children.map(node => resolve(node));

                if (domNode.tagName === 'object' && domNode.attributes['type'] === 'application/kenticocloud') {
                    const itemCodeName = domNode.attributes['data-codename'];
                    const linkedItem = props.element.linkedItems.find(item => item.system.codename === itemCode);

                    switch (linkedItem?.system.type) {
                        case 'youtube_video': {
                            return <YoutubeVideo key={index} id={linkedItem.elements.videoId.value} />
                        }
                        default: {
                            return <div key={index}>Resolver for item of type {linkedItem.system.type} not implemented.</div>;
                        }
                    }
                }
                
                const children = childElements.length === 0 ? undefined : childElements;
                const attributes = { ...domNode.attributes, key: index };
                const element = React.createElement(domNode.tagName, attributes, children);

                return element;
            }


            if (domNode.type === 'text') {
                return <React.Fragment key={index}>{domNode.content}</React.Fragment>
            }

          throw new Error("Undefined state");
        }

        const result = value.childNodes.map((node, index) => resolve(node, index));
        setRichTextContent(result);
      });
  }, [props.element]);

  return (
    <div className={props.className}>
      {richTextContent}
    </div>
  );
};
```



