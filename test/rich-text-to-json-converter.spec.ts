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
                tagName: "",
                attributes: {},
                textContent: "<p><br></p>",
                children: [
                    {
                        tagName: "p",
                        attributes: {},
                        textContent: "<br>",
                        children: [
                            {
                                tagName: "br",
                                attributes: {},
                                textContent: "",
                                children: []
                            }
                        ]
                    }
                ],
            }
        ]);

    });

    it("nested link is parsed correctly", () => {
        const dummyRichText: Elements.RichTextElement = {
            value: "<p class=\"test\"><a href=\"mailto:email@abc.test\">email</a></p>",
            type: ElementType.RichText,
            images: [],
            linkedItemCodenames: [],
            linkedItems: [],
            links: [],
            name: "dummy"
        }

        const result: any = transformer.transform(dummyRichText);

        expect(result).toEqual<any>([
            {
                tagName: "",
                attributes: {},
                textContent: "<p class=\"test\"><a href=\"mailto:email@abc.test\">email</a></p>",
                children: [{
                    tagName: "p",
                    attributes: {
                        "class": "test"
                    },
                    textContent: '<a href=\"mailto:email@abc.test\">email</a>',
                    children: [{
                        tagName: "a",
                        attributes: {
                            "href": "mailto:email@abc.test"
                        },
                        textContent: 'email',
                        children: [{
                            tagName: "",
                            attributes: {},
                            textContent: "",
                            children: []
                        }]
                    }]
                }]
            }
        ])
    })

    it("multiple child tags are parsed correctly", () => {
        const dummyRichText: Elements.RichTextElement = {
            value: "<p><b>bold text</b><i>italic text</i></p>",
            type: ElementType.RichText,
            images: [],
            linkedItemCodenames: [],
            linkedItems: [],
            links: [],
            name: "dummy"
        }
    
        const result: any = transformer.transform(dummyRichText);
    
        expect(result).toEqual<any>([
            {
                tagName: "",
                attributes: {},
                textContent: "<p><b>bold text</b><i>italic text</i></p>",
                children: [{
                    tagName: "p",
                    attributes: {},
                    textContent: '<b>bold text</b><i>italic text</i>',
                    children: [{
                        tagName: "b",
                        attributes: {},
                        textContent: 'bold text',
                        children: [{
                            tagName: "",
                            attributes: {},
                            textContent: "",
                            children: []
                        }]
                    },{
                        tagName: "i",
                        attributes: {},
                        textContent: 'italic text',
                        children: [{
                            tagName:"",
                            attributes: {},
                            textContent: "",
                            children: []
                        }]
                    }]
                }]
            }
        ])
    })
});