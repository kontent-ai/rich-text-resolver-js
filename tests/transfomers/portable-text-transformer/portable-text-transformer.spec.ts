import {
  browserParse,
  nodeParse,
  PortableTextItem,
  PortableTextObject,
  transformToPortableText,
  traversePortableText
} from "../../../src"

jest.mock('short-unique-id', () => {
  return {
    default: jest.fn().mockImplementation(() => {
      return () => 'guid';
    })
  }
});

describe("portable text transformer", () => {

  const transformInput = (input: string): { nodeResult: PortableTextObject[], browserResult: PortableTextObject[] } => {
    const browserTree = browserParse(input);
    const nodeTree = nodeParse(input);
    return {
      nodeResult: transformToPortableText(nodeTree),
      browserResult: transformToPortableText(browserTree)
    };
  }

  it("transforms empty rich text", () => {
    const input = "<p><br></p>";
    const { nodeResult, browserResult } = transformInput(input);

    expect(nodeResult).toMatchSnapshot();
    expect(nodeResult).toMatchObject(browserResult);
  })

  it.each([
    `<table><tbody><tr><td>cell content1</td><td>cell 2</td></tr></tbody></table>`,
    `<table>
    <tbody>
       <tr>
          <td><br></td>
          <td>
             <p><a data-item-id="e2d97322-470a-42e7-a31e-40be26c2ef24" href=""><strong>NanoBlade X</strong></a></p>
             <figure data-asset-id="bb79f32d-4fed-4d46-bec3-71b1c285ca30" data-image-id="bb79f32d-4fed-4d46-bec3-71b1c285ca30"><img src="https://qa-preview-assets-eu-01.devkontentmasters.com:443/0a12060e-20af-0124-a95d-871d26379561/2af0a87f-d750-4f6c-b6ff-8f895fa7d235/scalpel_blade_12.jpg" data-asset-id="bb79f32d-4fed-4d46-bec3-71b1c285ca30" data-image-id="bb79f32d-4fed-4d46-bec3-71b1c285ca30" alt=""></figure>
          </td>
          <td>
             <p><a data-item-id="abaf708d-5d91-4b50-9905-30f1d0f482f9" href=""><strong>NanoBlade V</strong></a></p>
             <figure data-asset-id="f6827ddf-7b07-49c3-819d-5270f1ac0164" data-image-id="f6827ddf-7b07-49c3-819d-5270f1ac0164"><img src="https://qa-preview-assets-eu-01.devkontentmasters.com:443/0a12060e-20af-0124-a95d-871d26379561/653b1fc7-466a-4d91-945a-964ae4f9570a/scalpel_blade_11.jpg" data-asset-id="f6827ddf-7b07-49c3-819d-5270f1ac0164" data-image-id="f6827ddf-7b07-49c3-819d-5270f1ac0164" alt=""></figure>
          </td>
       </tr>
       <tr>
          <td>Nano-scale Cutting</td>
          <td>Offers ultra-fine incisions with precision</td>
          <td>Provides precise incisions</td>
       </tr>
       <tr>
          <td>Blade Material</td>
          <td><a data-asset-id="d27a4f12-c51c-4d64-bb8f-6dcd008abb96" href="https://qa-preview-assets-eu-01.devkontentmasters.com:443/0a12060e-20af-0124-a95d-871d26379561/090af31a-6188-4c37-9623-1422fa966d3d/DALL%C2%B7E%202023-06-21%2008.57.55%20-%20GFenerate%20a%20scientific%20showcase%20of%20the%20the%20molecule%20similar%20to%20corabon%20.png">Advanced material</a> for durability</td>
          <td>High-quality material</td>
       </tr>
       <tr>
          <td>Imaging Compatibility</td>
          <td><strong>Seamless integration</strong> with imaging tech</td>
          <td>Limited integration</td>
       </tr>
       <tr>
          <td><a href="https://www.nbstsa.org/cst-certification" title="CST certification">Regulatory Compliance</a></td>
          <td>
             <p>Exceeds regulatory standards</p>
             <ul>
                <li>Basic</li>
                <li>Advanced</li>
                <ul>
                   <li><strong>Advaced II</strong></li>
                </ul>
             </ul>
          </td>
          <td>Meets regulatory standards</td>
       </tr>
    </tbody>
 </table>`,
    `<p>Text</p>
 <p><strong>Bold text</strong></p>
 <p><strong>Bold text </strong><em><strong>with itallic</strong></em><strong> in it</strong></p>
 <p><strong>Overlapping bold </strong><em><strong>over</strong></em><em> itallic text</em></p>
 <ol>
   <li>Odered list</li>
   <li>Ord<strong>ered </strong><strong><sub>li</sub></strong><a href="http://www.example.com"><em><strong><sub>s</sub></strong></em><em>t with s</em>tyles and li</a>nk
     <ol>
       <li>Nested ordered list</li>
       <li>Nested ordered list
         <ol>
           <li>More nested ordered list</li>
           <li><br></li>
         </ol>
       </li>
     </ol>
   </li>
 </ol>
 <h1><br></h1>
 <figure data-asset-id="8c35b61a-8fcb-4089-a576-5a5e7a158bf2" data-image-id="8c35b61a-8fcb-4089-a576-5a5e7a158bf2"><img src="https://example.com/image.png" data-asset-id="8c35b61a-8fcb-4089-a576-5a5e7a158bf2" data-image-id="8c35b61a-8fcb-4089-a576-5a5e7a158bf2" alt=""></figure>
 <h1>Heading</h1>
 <h4>Heading little</h4>
 <table><tbody>
   <tr><td>1</td><td>2 - w<strong>ith bold te</strong>xt</td><td>3 - w<a href="http://www.example.com">ith link ins</a>ide</td></tr>
   <tr><td>4 <em>- w</em><a data-item-id="6538fde0-e6e5-425c-8642-278e637b2dc1" href=""><em>ith lin</em>k to cont</a>ent</td><td><p>5 - with image in <em>table</em></p>
 <figure data-asset-id="8c35b61a-8fcb-4089-a576-5a5e7a158bf2" data-image-id="8c35b61a-8fcb-4089-a576-5a5e7a158bf2"><img src="https://example.com/image.png" data-asset-id="8c35b61a-8fcb-4089-a576-5a5e7a158bf2" data-image-id="8c35b61a-8fcb-4089-a576-5a5e7a158bf2" alt=""></figure>
 <p><em>and style over the i</em>mage</p>
 </td><td><p>6 - with list&nbsp;</p>
 <ul>
   <li>List in table</li>
   <li>Another list item in table
     <ul>
       <li>Nested in table
         <ul>
           <li>More nested in table&nbsp;
             <ol>
               <li>Ordered inside unorederd</li>
               <li>More unordered</li>
             </ol>
           </li>
         </ul>
       </li>
     </ul>
     <ol>
       <li>Returning byck</li>
     </ol>
   </li>
 </ul>
 <ol>
   <li><br></li>
 </ol>
 </td></tr>
   <tr><td>7</td><td>8</td><td>9</td></tr>
 </tbody>
 </table>`,
    `<table><tbody>
 <tr><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td></tr>
 <tr><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td></tr>
 <tr><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td></tr>
 <tr><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td></tr>
 <tr><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td></tr>
 <tr><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td></tr>
 <tr><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td></tr>
 <tr><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td></tr>
 <tr><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td></tr>
 <tr><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td></tr>
 <tr><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td></tr>
 <tr><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td></tr>
 <tr><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td></tr>
 <tr><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td></tr>
 <tr><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td></tr>
 <tr><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td></tr>
 <tr><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td></tr>
 <tr><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td></tr>
 <tr><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td></tr>
 <tr><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td><td><br></td></tr>
</tbody></table>`,
    `<table>
      <tbody>
        <tr>
          <td>column</td>
          <td>column</td>
          <td>column</td>
          <td>column</td>
          <td>column</td>
          <td>column</td>
        </tr>
        <tr>
          <td>column</td>
          <td>column</td>
          <td>column</td>
          <td>column</td>
          <td>column</td>
          <td>column</td>
        </tr>
        <tr>
          <td>column</td>
          <td>column</td>
          <td>column</td>
          <td>column</td>
          <td>column</td>
          <td>column</td>
        </tr>
        <tr>
          <td>column</td>
          <td>column</td>
          <td>column</td>
          <td>column</td>
          <td>column</td>
          <td>column</td>
        </tr>
        <tr>
          <td>column</td>
          <td>column</td>
          <td>column</td>
          <td>column</td>
          <td>column</td>
          <td>column</td>
        </tr>
      </tbody>
    </table>`
  ])("transforms table with input %s", (input) => {
    const { nodeResult, browserResult } = transformInput(input);

    expect(nodeResult).toMatchSnapshot();
    expect(nodeResult).toMatchObject(browserResult);
  })

  it("transforms item links", () => {
    const input = `<p><a data-item-id="23f71096-fa89-4f59-a3f9-970e970944ec" href="">text<strong>link to an item</strong></a></p>`;

    const { nodeResult, browserResult } = transformInput(input);

    expect(nodeResult).toMatchSnapshot();
    expect(nodeResult).toMatchObject(browserResult);

  })

  it("transforms external links", () => {
    const input = `<h2><strong>Kontent supports portable text!</strong></h2>\n<p>For more information, check out the related <a href="https://github.com/portabletext/portabletext" data-new-window="true" title="Portable text repo" target="_blank" rel="noopener noreferrer"><strong>GitHub repository.</strong></a></p>`
    const { nodeResult, browserResult } = transformInput(input);

    expect(nodeResult).toMatchSnapshot();
    expect(nodeResult).toMatchObject(browserResult);
  })

  it("transforms nested styles", () => {
    const input = `<p><strong>all text is bold and last part is </strong><em><strong>also italic and this is also </strong></em><em><strong><sup>superscript</sup></strong></em></p>`
    const { nodeResult, browserResult } = transformInput(input);

    expect(nodeResult).toMatchSnapshot();
    expect(nodeResult).toMatchObject(browserResult);
  })

  it("transforms lists", () => {
    const input = `<ul><li>first level bullet</li><li>first level bullet</li><ol><li>nested number in bullet list</li></ol></ul><ol><li>first level item</li><li>first level item</li><ol><li>second level item</li><li><strong>second level item </strong></li></ol>`;
    const { nodeResult, browserResult } = transformInput(input);

    expect(nodeResult).toMatchSnapshot();
    expect(nodeResult).toMatchObject(browserResult);
  })

  it("transforms images", () => {
    const input = `<figure data-asset-id="7d866175-d3db-4a02-b0eb-891fb06b6ab0" data-image-id="7d866175-d3db-4a02-b0eb-891fb06b6ab0"><img src="https://assets-eu-01.kc-usercontent.com:443/6d864951-9d19-0138-e14d-98ba886a4410/236ecb7f-41e3-40c7-b0db-ea9c2c44003b/sharad-bhat-62p19OGT2qg-unsplash.jpg" data-asset-id="7d866175-d3db-4a02-b0eb-891fb06b6ab0" data-image-id="7d866175-d3db-4a02-b0eb-891fb06b6ab0" alt=""></figure><p><em>text in a paragraph</em></p>`;
    const { nodeResult, browserResult } = transformInput(input);

    expect(nodeResult).toMatchSnapshot();
    expect(nodeResult).toMatchObject(browserResult);
  })

  it("transforms complex rich text into portable text", () => {
    const input = `<table><tbody><tr><td><ul><li>list item</li><ol><li>nested list item</li></ol></ul></td></tr></tbody></table><table><tbody>\n  <tr><td><p>paragraph 1</p><p>paragraph 2</p></td><td><ul>\n  <li>list item\n     </li>\n</ul>\n</td><td><a href="http://google.com" data-new-window="true" title="linktitle" target="_blank" rel="noopener noreferrer">this is a<strong>strong</strong>link</a></td></tr>\n<tr><td><h1><strong>nadpis</strong></h1></td><td><p>text</p></td><td><p>text</p></td></tr>\n<tr><td><em>italic text</em></td><td><p>text</p></td><td><p>text</p></td></tr>\n</tbody></table><p>text<a href="http://google.com" data-new-window="true" title="linktitle" target="_blank" rel="noopener noreferrer">normal and<strong>bold</strong>link</a></p><h1>heading</h1><object type="application/kenticocloud" data-type="item" data-rel="link" data-codename="test_item"></object>`;
    const { nodeResult, browserResult } = transformInput(input);

    expect(nodeResult).toMatchSnapshot();
    expect(nodeResult).toMatchObject(browserResult);
  })

  it("doesn't create duplicates for nested spans", () => {
    const input = `<p>text<strong>bold</strong></p>`;
    const { nodeResult, browserResult } = transformInput(input);

    expect(nodeResult).toMatchSnapshot();
    expect(nodeResult).toMatchObject(browserResult);
  })

  it.each([nodeParse, browserParse])("throws error for non-supported tags for %s", (parse) => {
    const input = "<p>text in a paragraph</p><div>text in a div, which doesnt exist in kontent RTE</div>"
    const tree = parse(input);

    expect(() => {
      transformToPortableText(tree);
    }).toThrow();
  })

  it("doesn't extend link mark to adjacent spans", () => {
    const input = `<p>The coffee drinking culture has been evolving for hundreds and thousands of years. It has never been <a data-item-id="3120ec15-a4a2-47ec-8ccd-c85ac8ac5ba5" href="">so rich as <strong>today</strong></a>. How do you make sense of different types of coffee, what do the particular names in beverage menus mean and what beverage to choose for which occasion in your favorite café?</p>`
    const { nodeResult, browserResult } = transformInput(input);

    expect(nodeResult).toMatchSnapshot();
    expect(nodeResult).toMatchObject(browserResult);
  })

  it("resolves lists", () => {
    const input =
      `<ul>
<li>
   first    
   <ul>
      <li>second</li>
   </ul>
   <ol>
      <li>second</li>
   </ol>
   <ul>
      <li>
         second        
         <ol>
            <li>third</li>
         </ol>
      </li>
   </ul>
</li>
</ul>`
    const { nodeResult, browserResult } = transformInput(input);

    expect(nodeResult).toMatchSnapshot();
    expect(nodeResult).toMatchObject(browserResult);
  })

  it("resolves adjacent styled fonts in table cell", () => {
    const input =
      `<table>
      <tbody>
        <tr>
          <td><strong>bold</strong><em>italic</em></td>
        </tr>
      </tbody>
    </table>`;
    const { nodeResult, browserResult } = transformInput(input);

    expect(nodeResult).toMatchSnapshot();
    expect(nodeResult).toMatchObject(browserResult);
  })

  it("extends component block with additional data", () => {
    const input = `<object type="application/kenticocloud" data-type="item" data-rel="link" data-codename="test_item"></object>`;

    const processBlock = (block: PortableTextObject) => {
      if (block._type === "component") {
        return {
          ...block,
          additionalData: "data"
        }
      }
    }

    const { nodeResult, browserResult } = transformInput(input);

    const modifiedResult = nodeResult.map(block => traversePortableText(block, processBlock));
    expect(modifiedResult).toMatchSnapshot();
    expect(nodeResult).toMatchObject(browserResult);
  })

  it("extends link nested in a table with additional data", () => {
    const input = `<table><tbody><tr><td><a href="http://google.com">tablelink</a></td></tr></tbody></table>`;
    const processBlock = (block: PortableTextItem) => {
      if (block._type === "link") {
        return {
          ...block,
          additionalData: "data"
        }
      }
    }

    const { nodeResult, browserResult } = transformInput(input);

    const transformedResult = nodeResult.map(block => traversePortableText(block, processBlock))
    expect(transformedResult).toMatchSnapshot();
    expect(nodeResult).toMatchObject(browserResult);
  })

  it("transforms a linked item and a component from MAPI with corresponding dataType", () => {
    const input = `<p>Some text at the first level, followed by a component.&nbsp;</p>\n<object type="application/kenticocloud" data-type="component" data-id="d6a10cb4-3639-429f-b6b0-b7fea6dec252"></object>\n<p>and a linked item</p>\n<object type="application/kenticocloud" data-type="item" data-id="99e17fe7-a215-400d-813a-dc3608ee0294"></object>`;
    const { nodeResult, browserResult } = transformInput(input);

    expect(nodeResult).toMatchSnapshot();
    expect(nodeResult).toMatchObject(browserResult);
  })

  it("transforms asset from MAPI", () => {
    const input = `<figure data-asset-id="62ba1f17-13e9-43c0-9530-6b44e38097fc"><img src="#" data-asset-id="62ba1f17-13e9-43c0-9530-6b44e38097fc"></figure>`;
    const { nodeResult, browserResult } = transformInput(input);

    expect(nodeResult).toMatchSnapshot();
    expect(nodeResult).toMatchObject(browserResult);
  })

  it("transforms a linked item and a component from DAPI with corresponding dataType", () => {
    const input = `<p>Some text at the first level, followed by a component.&nbsp;</p>\n<object type="application/kenticocloud" data-type="item" data-rel="component" data-codename="n27ec1626_93ac_0129_64e5_1beeda45416c"></object>\n<p>and a linked item</p>\n<object type="application/kenticocloud" data-type="item" data-rel="link" data-codename="commercet"></object>`;
    const { nodeResult, browserResult } = transformInput(input);

    expect(nodeResult).toMatchSnapshot();
    expect(nodeResult).toMatchObject(browserResult);
  })

  it("transforms a link to an asset in DAPI", () => {
    const input = `<p>Link to an <a data-asset-id="bc6f3ce5-935d-4446-82d4-ce77436dd412" href="https://assets-us-01.kc-usercontent.com:443/cec32064-07dd-00ff-2101-5bde13c9e30c/7d534724-edb8-4a6d-92f6-feb52be61d37/image1_w_metadata.jpg">asset</a></p>`;
    const { nodeResult, browserResult } = transformInput(input);

    expect(nodeResult).toMatchSnapshot();
    expect(nodeResult).toMatchObject(browserResult);
  })

  it("transforms a link to an asset in MAPI", () => {
    const input = `<p>Link to an <a data-asset-id="bc6f3ce5-935d-4446-82d4-ce77436dd412">asset</a></p>`;
    const { nodeResult, browserResult } = transformInput(input);

    expect(nodeResult).toMatchSnapshot();
    expect(nodeResult).toMatchObject(browserResult);
  })
})
