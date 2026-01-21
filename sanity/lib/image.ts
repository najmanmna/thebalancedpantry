import createImageUrlBuilder from '@sanity/image-url'
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

import { dataset, projectId } from '../env'

// https://www.sanity.io/docs/image-url
const builder = createImageUrlBuilder({ projectId, dataset })

export const urlFor = (source: SanityImageSource) => {
  // ✅ FIX: Force 'WebP' format and 'Max' fit globally
  // This automatically converts huge PNGs to efficient WebP images
  return builder.image(source).auto('format').fit('max');
}