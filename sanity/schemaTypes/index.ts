import { type SchemaTypeDefinition } from "sanity";

import { blockContentType } from "./blockContentType";
import { categoryType } from "./categoryType";
import { productType } from "./productType";
import { orderType } from "./orderType";
import { orderItemType } from "./orderItem";
// import { bannerType } from "./bannerType";
// import subscribersType from "./subscribersType";


// import { pageType } from "./page";

import { settingsType } from "./settings";
import { homepageType } from "./homepage";
// import { promoCodeType } from "./promoCode";

// import { marketingPopupType } from "./marketingPopup";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
      settingsType,
    blockContentType,
    categoryType,
    productType,
    orderType,
orderItemType,
    // bannerType,
    homepageType
    // subscribersType,
    // pageType,

    // promoCodeType,

    // marketingPopupType

  ],
};
