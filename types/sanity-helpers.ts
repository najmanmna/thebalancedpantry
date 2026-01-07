import type { SanityImageCrop, SanityImageHotspot } from "@/sanity.types";

export type SanityImage = {
  _type: "image";
  _key?: string;
  asset?: {
    _ref: string;
    _type: "reference";
    _weak?: boolean;
  };
  hotspot?: SanityImageHotspot;
  crop?: SanityImageCrop;
};
