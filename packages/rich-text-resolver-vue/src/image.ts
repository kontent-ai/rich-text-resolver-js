import type { PortableTextImage } from "@kontent-ai/rich-text-resolver";
import type { h } from "vue";

/**
 * Resolves an image object to a Vue virtual DOM node using a provided Vue render function.
 *
 * @param {PortableTextImage} image - The portable text image object to be rendered.
 * @param {typeof h} vueRenderFunction - A Vue render function, typically the `h` function from Vue.
 * @param {(image: PortableTextImage) => VueImage} resolver - A function that takes an image object
 *        and returns an object with `src` and `alt` properties, and possibly other HTML attributes.
 *        Default implementation provided if not specified.
 * @returns {VueNode} The resolved image as a Vue virtual DOM node.
 */
export const resolveImage = (
  image: PortableTextImage,
  vueRenderFunction: typeof h,
  resolver: (image: PortableTextImage) => VueImage = toVueImageDefault,
) => vueRenderFunction("img", resolver(image));

/**
 * Provides a default resolver function for an image object to Vue. Default fallback for `resolver`
 * argument of `resolveImage` function.
 *
 * @param {PortableTextImage} image - The portable text image object to be rendered.
 * @returns {VueImage} An object representing the image, containing `src` and `alt` properties,
 *          and potentially other HTML attributes.
 */
export const toVueImageDefault = (image: PortableTextImage): VueImage => ({
  src: image.asset.url,
  alt: image.asset.alt || "",
});

// biome-ignore lint/suspicious/noExplicitAny: Dynamic HTML attributes passed to Vue's h() function require any type due to TypeScript's index signature constraints
export type VueImage = { src: string; alt: string; [key: string]: any };
