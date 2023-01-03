import { Elements } from "@kentico/kontent-delivery";
import { IHtmlNode, IRichTextToJsonTransformer } from "./IRichTextToJsonTransformer";
import { parse, HTMLElement } from 'node-html-parser';

class Transformer implements IRichTextToJsonTransformer {
    transform(dummyRichText: Elements.RichTextElement): IHtmlNode[] {
        const parsedHtml = parse(dummyRichText.value);
        return this.remapNode(parsedHtml);
    }
    remapNode(parsedHtml: HTMLElement): IHtmlNode[] {
        var nodes: IHtmlNode[] = [];
        if(parsedHtml.childNodes.length > 0 || parsedHtml.rawTagName) {            
            nodes.push({
                tagName: parsedHtml.rawTagName ?? "",
                attributes: parsedHtml.attributes ?? {},
                textContent: parsedHtml.innerHTML ?? '',
                children: parsedHtml.childNodes.flatMap((element) => this.remapNode(element as HTMLElement))
            });
        }
        return nodes;
    }

}

export const transformer = new Transformer();