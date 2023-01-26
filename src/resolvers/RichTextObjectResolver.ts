import { Elements } from "@kontent-ai/delivery-sdk";
import { IResolverInput } from "../models/resolver-models";
import { RichTextBaseResolver } from "./RichTextBaseResolver";

export class RichTextObjectResolver extends RichTextBaseResolver<any> {
    resolve(input: Elements.RichTextElement) {
        throw new Error("Method not implemented.");
    }

    //TODO
    
    constructor(input: IResolverInput<any>) {
        super(input);
    }

}