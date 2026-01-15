import { defineQuery } from "next-sanity";

// 🔹 Banner
const BANNER_QUERY = defineQuery(`*[_type == "banner"]{
  showOn,
  desktop { image { asset }, buttonTheme },
  mobile { image { asset }, buttonTheme }
}`);

// 🔹 Page
const PAGE_QUERY = defineQuery(`*[_type == "page" && slug.current == $slug][0]{
  title,
  content
}`);

// 🔹 Settings (Shipping)
const SHIPPING_QUERY = defineQuery(`*[_type == "settings"][0]{
  deliveryCharges {
    colombo,
    suburbs,
    others
  }
}`);

// 🔹 Featured categories
const FEATURED_CATEGORY_QUERY = defineQuery(
  `*[_type == 'category' && featured == true] | order(name desc) {
    _id,
    name,
    slug,
    image { asset }
  }`
);

// 🔹 All products (with variants)
const ALL_PRODUCTS_QUERY = defineQuery(`
  *[_type=="product"] | order(name asc){
    _id,
    name,
    slug,
    price,
    discount,
    isFlashSale,
    status,
    isPreOrder,
    isFeatured,
    materials[]->{ _id, name, slug },
    categories[]->{
      title
    },
    variants[]{
      _key,
      colorName,
      openingStock,
      stockOut,
      "availableStock": openingStock - coalesce(stockOut, 0),
      images[] { _key, asset }
    }
  }
`);

// 🔹 Hot Selling Products
const HOT_PRODUCTS_QUERY = defineQuery(`
  *[_type == 'product' && status == 'hot'] | order(name asc){
    _id,
    name,
    slug,
    price,
    discount,
    isPreOrder,
    materials[]->{ _id, name, slug },
    categories[]->{
      title
    },
    variants[]{
      _key,
      colorName,
      openingStock,
      stockOut,
      "availableStock": openingStock - coalesce(stockOut, 0),
      images[] { _key, asset }
    }
  }
`);

// 🔹 Best Deals Products
const DEAL_PRODUCTS_QUERY = defineQuery(`
  *[_type == 'product' && status == 'sale'] | order(name asc){
    _id,
    name,
    slug,
    price,
    discount,
    isPreOrder,
    materials[]->{ _id, name, slug },
    categories[]->{
      title
    },
    variants[]{
      _key,
      colorName,
      openingStock,
      stockOut,
      "availableStock": openingStock - coalesce(stockOut, 0),
      images[] { _key, asset }
    }
  }
`);

// 🔹 New Arrivals
const NEW_PRODUCTS_QUERY = defineQuery(`
  *[_type == 'product' && status == 'new'] | order(name asc){
    _id,
    name,
    slug,
    price,
    discount,
    isPreOrder,
    materials[]->{ _id, name, slug },
    categories[]->{
      title
    },
    variants[]{
      _key,
      colorName,
      openingStock,
      stockOut,
      "availableStock": openingStock - coalesce(stockOut, 0),
      images[] { _key, asset }
    }
  }
`);

// 🔹 Featured Products
const FEATURE_PRODUCTS = defineQuery(`
  *[_type == 'product' && isFeatured == true] | order(name asc){
    _id,
    name,
    slug,
    price,
    discount,
    status,
    isPreOrder,
    materials[]->{ _id, name, slug },
    categories[]->{
      title
    },
    variants[]{
      _key,
      colorName,
      openingStock,
      stockOut,
      "availableStock": openingStock - coalesce(stockOut, 0),
      images[] { _key, asset }
    }
  }
`);

// 🔹 Address
const ADDRESS_QUERY = defineQuery(
  `*[_type=="address"] | order(publishedAt desc) {
    _id,
    location,
    address,
    phone,
    email
  }`
);
const ALL_MATERIALS_QUERY = defineQuery(
  `*[_type == "material"] | order(name asc) {
    _id,
    name,
    "slug": slug.current
  }`
);
// 🔹 All Categories
const ALLCATEGORIES_QUERY = defineQuery(
  `*[_type == 'category'] | order(name asc)[0...$quantity] {
    _id,
    name,
    slug,
    image { asset }
  }`
);

// 🔹 Subscribers
const SUBSCRIBERS_QUERY = defineQuery(`*[_type == "subscribers"]{
  _id,
  email,
  createdAt
} | order(createdAt desc)`);

// 🔹 Single Product By Slug (with variants)
const PRODUCT_BY_SLUG_QUERY = defineQuery(`
  *[_type == "product" && slug.current == $slug][0]{
    _id,
    name,
    slug,
    sku,
    subtitle,  // 🔹 New: For the hero text
    badge,     // 🔹 New: For "Best Seller" tags
    description,
    price,
    
    // 🔹 Inventory Logic
    openingStock,
    stockOut,
    "availableStock": coalesce(openingStock, 0) - coalesce(stockOut, 0),
    
    // 🔹 Imagery (Updated structure)
    mainImage {
      asset
    },
    gallery[] {
      _key,
      asset
    },

    // 🔹 Business Logic (Bundles)
    bundleOptions[] {
      title,
      count,
      price,
      savings,
      tag
    },

    // 🔹 Storytelling & Trust
    benefits, // The "Trust Stamps" array

    // 🔹 Health Data
    nutrition {
      servingSize,
      calories,
      sugar,
      protein,
      fat
    },

    categories[]->{
      _id,
      title,
      slug
    }
  }
`);

export {
  BANNER_QUERY,
  FEATURED_CATEGORY_QUERY,
  ALL_PRODUCTS_QUERY,
  HOT_PRODUCTS_QUERY,
  DEAL_PRODUCTS_QUERY,
  NEW_PRODUCTS_QUERY,
  FEATURE_PRODUCTS,
  ADDRESS_QUERY,
  ALLCATEGORIES_QUERY,
  PRODUCT_BY_SLUG_QUERY,
  SHIPPING_QUERY,
  PAGE_QUERY,
  SUBSCRIBERS_QUERY,
  ALL_MATERIALS_QUERY
};