export var NodeType;
(function (NodeType) {
    NodeType[NodeType["ELEMENT_NODE"] = 1] = "ELEMENT_NODE";
    NodeType[NodeType["TEXT_NODE"] = 3] = "TEXT_NODE";
    NodeType[NodeType["DOCUMENT_NODE"] = 9] = "DOCUMENT_NODE";
})(NodeType || (NodeType = {}));
export const convertDomNodeAttributes = (domNodeAttributes) => {
    let convertedAttributes = {};
    for (const attr of domNodeAttributes) {
        convertedAttributes[attr.name] = attr.value;
    }
    return convertedAttributes;
};
export const isRootNode = (domNode) => domNode.nodeType === NodeType.DOCUMENT_NODE;
export const isTextNode = (domNode) => domNode.nodeType === NodeType.TEXT_NODE;
export const isElementNode = (domNode) => domNode.nodeType === NodeType.ELEMENT_NODE;
/**
 * Returns `true` for text nodes and type guards the node as `IDomTextNode`.
 */
export const isText = (node) => node.type === 'text';
/**
 * Returns `true` for HTML nodes and type guards the node as `IDomHtmlNode`.
 */
export const isElement = (node) => node.type === 'tag';
/**
 * Returns `true` if the node is a linked item node (`<object></object>`).
 */
export const isLinkedItem = (node) => isElement(node) &&
    node.tagName === 'object' &&
    node.attributes['type'] === 'application/kenticocloud';
/**
 * Returns `true` if the node is a rich text image node (`<figure></figure>`).
 */
export const isImage = (node) => isElement(node) &&
    node.tagName === 'figure' &&
    node.attributes['data-image-id'] ? true : false;
/**
 * Returns `true` if the node is a link to a content item.
 */
export const isItemLink = (node) => isElement(node) &&
    node.tagName === 'a' &&
    node.attributes['data-item-id'] ? true : false;
/**
 * Returns `true` if the node represents an unpaired element (`br, img, hr, meta`)
 */
export const isUnPairedElement = (node) => isElement(node) &&
    ['br', 'img', 'hr', 'meta'].includes(node.tagName);
