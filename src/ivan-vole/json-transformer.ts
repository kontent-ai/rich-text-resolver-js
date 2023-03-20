import { IDomHtmlNode, IDomNode, IDomTextNode, IOutputResult } from "../parser";
import { isText } from "../utils";

export const transformIOuputToJson = (
    result: IOutputResult,
    resolveIDomTextNode: (node: IDomTextNode) => object,
    resolveIDomHtmlNode: (node: IDomHtmlNode) => object,
) => {
    return result.children.map(node => transformNode(node, resolveIDomTextNode, resolveIDomHtmlNode))
}

const transformNode = (
    node: IDomNode,
    resolveIDomTextNode: (node: IDomTextNode) => object,
    resolveIDomHtmlNode: (node: IDomHtmlNode) => object
) => {
    if (isText(node)){
        return resolveIDomTextNode(node);
    }
    return resolveIDomHtmlNode(node);
}


export const customResolveIDomTextNode = (node: IDomTextNode) =>  {
    return {
        text: node.content
    };
}

export const customResolveIDomHtmlNode = (node: IDomHtmlNode) =>  {
    let result = {
        tag: node.tagName
    };
    
    switch(node.tagName) {
        case 'figure': {
            const figureObject = {
                'imageId': node.attributes['data-image-id']
            };
            result = {...result, ...figureObject}
            break;
        }
        case "img": {
            const imgObject = {
                'src': node.attributes['src'],
                'alt': node.attributes['alt']
            }
            result = {...result, ...imgObject}
            break;
        }
        case "object": {
            if(node.attributes['type'] === 'application/kenticocloud'){
                const linkedItemObject = {
                    codeName: node.attributes['data-codename']
                };
                result = {...result, ...linkedItemObject}
            }
            break;
        }
        default: {

        }
    }

    result = {...result, ...{
        children: node.children.map(node => transformNode(node, customResolveIDomTextNode, customResolveIDomHtmlNode))
    }}

    return result;
}