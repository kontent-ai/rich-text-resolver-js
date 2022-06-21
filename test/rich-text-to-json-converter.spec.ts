import { Elements, ElementType } from "@kentico/kontent-delivery";
import { transformer } from "../src/RichTextToJsonTransformer";

describe("rich-text-to-json-converter", () => {

    it("empty rich text converts properly", () => {
        const dummyRichText: Elements.RichTextElement = {
            value: "<p><br></p>",
            type: ElementType.RichText,
            images: [],
            linkedItemCodenames: [],
            linkedItems: [],
            links: [],
            name: "dummy"
        };

        const result: any = transformer.transform(dummyRichText);

        expect(result).toEqual<any>([
            {
                tagName: "p",
                attributes: [],
                textContent: "",
                children: [
                    {
                        tagName: "br",
                        attributes: [],
                        children: []
                    }
                ],
            }
        ]);

    });
});
