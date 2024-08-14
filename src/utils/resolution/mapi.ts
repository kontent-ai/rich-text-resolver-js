import {
  PortableTextMarkComponentOptions,
  PortableTextOptions,
  PortableTextTypeComponentOptions,
  toHTML,
} from "@portabletext/to-html";
import {
  PortableTextImage,
  PortableTextInternalLink,
  PortableTextExternalLink,
  PortableTextComponent,
  PortableTextTable,
  PortableTextObject,
  PortableTextMark,
} from "../../index.js";
import { resolveTable } from "./html.js";


const toManagementApiRichTextItem = (richTextItem: PortableTextComponent) => `<object type=\"application/kenticocloud\" data-type=\"${richTextItem.dataType}\" data-id=\"${richTextItem.component._ref}\"></object>`;
const toManagementApiTable = (table: PortableTextTable) => resolveTable(table, (blocks) => toHTML(blocks, portableTextComponents));
const toManagementApiImage = (image: PortableTextImage) => createFigureTag(image.asset._ref);
const toManagementApiExternalLink = (children: string, link?: PortableTextExternalLink) => link ? `<a ${createExternalLinkAttributes(link)}>${children}</a>` : (() => { throw new Error('Mark definition for external link not found.'); })();
const toManagementApiInternalLink = (children: string, link?: PortableTextInternalLink) => link ? `<a data-item-id=\"${link.reference._ref}\">${children}</a>` : (() => { throw new Error('Mark definition for item link not found.'); })();

const createImgTag = (assetId: string) => `<img src=\"#\" data-asset-id=\"${assetId}\">`;
const createFigureTag = (assetId: string) => `<figure data-asset-id=\"${assetId}\">${createImgTag(assetId)}</figure>`;
const createExternalLinkAttributes = (link: PortableTextExternalLink) => Object.entries(link).filter(([k,]) => k !== "_type" && k !== "_key").map(([k, v]) => `${k}=\"${v}\"`).join(" ");

const portableTextComponents: PortableTextOptions = {
    components: {
      types: {
        image: ({ value }: PortableTextTypeComponentOptions<PortableTextImage>) => toManagementApiImage(value),
        component: ({ value }: PortableTextTypeComponentOptions<PortableTextComponent>) => toManagementApiRichTextItem(value),
        table: ({ value }: PortableTextTypeComponentOptions<PortableTextTable>) => toManagementApiTable(value),
      },
      marks: {
        internalLink: ({ children, value }: PortableTextMarkComponentOptions<PortableTextInternalLink>) => toManagementApiInternalLink(children, value),
        link: ({ children, value }: PortableTextMarkComponentOptions<PortableTextExternalLink>) => toManagementApiExternalLink(children, value),
        sub: ({children}: PortableTextMarkComponentOptions<PortableTextMark>) => `<sub>${children}</sub>`,
        strong: ({children}: PortableTextMarkComponentOptions<PortableTextMark>) => `<strong>${children}</strong>`,
        sup: ({children}: PortableTextMarkComponentOptions<PortableTextMark>) => `<sup>${children}</sup>`,
        em: ({children}: PortableTextMarkComponentOptions<PortableTextMark>) => `<em>${children}</em>`,
      },
    },
  };

export const toManagementApiFormat = (blocks: PortableTextObject[]) => toHTML(blocks, portableTextComponents);
