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
        case "table": {
            const tableObject = {
                'tag': 'tableName'
            }
            result = {...result, ...tableObject}
            break;
        }
        case 'tbody': {
            const tbodyObject = {
                'tag': 'tbody'
            }
            result = {...result, ...tbodyObject}
            break;
        }
        case 'tr': {
            const trObject = {
                'tag': 'tr'
            }
            result = {...result, ...trObject};
            break;
        }
        case 'td': {
            const tdObject = {
                'tag': 'td',
                'content': node.children.map(node => transformNode(node, customResolveIDomTextNode, customResolveIDomHtmlNode))
            };
            result = {...result, ...tdObject}
            break;
        }
        case 'ol': {
            const tdObject = {
                'tag': 'ol'
            };
            result = {...result, ...tdObject}
            break;
        }
        case 'ul': {
            const tdObject = {
                'tag': 'ul'
            };
            result = {...result, ...tdObject}
            break;
        }
        case 'li': {
            let tdObject = {
                'tag': 'li',
                'text': node.children[0].type === 'text' ? node.children[0].content : ""
            };
            if (node.children.length > 1){
                tdObject = {...tdObject, ...{children: node.children.slice(1).map(node => transformNode(node, customResolveIDomTextNode, customResolveIDomHtmlNode))}}
            }
            return {...result, ...tdObject}
        }
        case 'td': {
            const tdObject = {
                'tag': 'td',
                'content': node.children.map(node => transformNode(node, customResolveIDomTextNode, customResolveIDomHtmlNode))
            };
            result = {...result, ...tdObject}
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
    if(node.tagName != 'td'){
        result = {...result, ...{
            children: node.children.map(node => transformNode(node, customResolveIDomTextNode, customResolveIDomHtmlNode))
        }}
    }

    return result;
}