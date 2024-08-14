export const textStyleElements = ['strong', 'em', 'sub', 'sup', 'code'] as const;
export const blockElements = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;
export const ignoredElements = ['img', 'tbody', 'ol', 'ul'] as const;
export const tableElements = ['table', 'td', 'tr'] as const;
export const lineBreakElement = 'br' as const;
export const anchorElement = 'a' as const;
export const objectElement = 'object' as const;
export const assetElement = 'figure' as const;
export const listItemElement = 'li' as const;
export const markElements = [...textStyleElements, anchorElement] as const;
export const allElements = [
    ...blockElements,
    ...ignoredElements,
    ...markElements,
    ...tableElements,
    assetElement,
    objectElement,
    lineBreakElement,
    listItemElement,
  ] as const;