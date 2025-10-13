import type { PortableTextImage } from "@kontent-ai/rich-text-resolver";
// biome-ignore lint/style/useImportType: React is needed for JSX transform
import React from "react";

export const ImageComponent: React.FC<PortableTextImage> = (image) => (
  <img src={image.asset.url} alt={image.asset.alt ?? ""} />
);
