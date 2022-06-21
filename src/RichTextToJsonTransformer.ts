import { Elements } from "@kentico/kontent-delivery";
import { IRichTextToJsonTransformer } from "./IRichTextToJsonTransformer";


export const transformer : IRichTextToJsonTransformer = {
    transform: function (dummyRichText: Elements.RichTextElement) {
        return [
            {
                tagName: "p",
                attributes: {},
                textContent: "",
                children: [
                    {
                        tagName: "br",
                        attributes: {},
                        textContent: "",
                        children: []
                    }
                ],
            }
        ]
    }
}