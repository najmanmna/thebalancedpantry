import { TrolleyIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const productType = defineType({
  name: "product",
  title: "Products",
  type: "document",
  icon: TrolleyIcon,
  // Grouping fields makes the CMS cleaner
  fieldsets: [
    { name: "details", title: "Product Details & Story" },
    { name: "pricing", title: "Pricing & Bundles" },
    { name: "inventory", title: "Inventory Tracking" },
    { name: "nutrition", title: "Nutrition & Ingredients" },
  ],
  fields: [
    // --- 1. CORE IDENTITY ---
    defineField({
      name: "name",
      title: "Product Name",
      type: "string",
      validation: (Rule) => Rule.required(),
      description: "e.g., Freeze Dried Strawberries",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subtitle",
      title: "Hero Subtitle",
      type: "string",
      fieldset: "details",
      description: "The catchy phrase under the title. e.g., 'The Nostalgia of Fresh Fruit, Now Crunchy.'",
    }),
    defineField({
      name: "badge",
      title: "Product Badge",
      type: "string",
      description: "e.g., 'Best Seller', 'New Arrival', 'Low Sugar'",
    }),

    // --- 2. IMAGERY ---
    defineField({
      name: "mainImage",
      title: "Main Product Image",
      type: "image",
      options: { hotspot: true },
      description: "Ideally a transparent PNG of the bowl or pouch for the Hero section.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "gallery",
      title: "Gallery / Lifestyle Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      description: "Additional angles, packaging shots, or lifestyle photos.",
    }),

    // --- 3. PRICING & BUNDLES (Crucial for AOV) ---
    defineField({
      name: "price",
      title: "Base Price (1 Unit)",
      type: "number",
      fieldset: "pricing",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "bundleOptions",
      title: "Bundle Variants",
      fieldset: "pricing",
      description: "Define the 3-pack, 6-pack options here to encourage bulk buying.",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "title", type: "string", title: "Bundle Name (e.g. The Stash)" },
            { name: "count", type: "number", title: "Pack Count (e.g. 3)" },
            { name: "price", type: "number", title: "Bundle Price (LKR)" },
            { name: "savings", type: "string", title: "Savings Label (e.g. Save Rs. 200)" },
            { name: "tag", type: "string", title: "Tag (e.g. Most Popular)" },
          ],
        },
      ],
    }),

    // --- 4. INVENTORY (Your Logic) ---
    defineField({
      name: "sku",
      title: "SKU / Item Code",
      type: "string",
      fieldset: "inventory",
    }),
    defineField({
      name: "openingStock",
      title: "Opening Stock",
      type: "number",
      fieldset: "inventory",
      description: "Total quantity initially added to inventory.",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "stockOut",
      title: "Stock Out / Sold",
      type: "number",
      fieldset: "inventory",
      description: "Quantity sold (automatically updated by orders).",
      initialValue: 0,
      validation: (Rule) => Rule.min(0),
    }),

    // --- 5. NUTRITION & STORY ---
    defineField({
      name: "description",
      title: "Marketing Description",
      type: "text",
      fieldset: "details",
      rows: 4,
      description: "The paragraph explaining why it's good.",
    }),
    defineField({
      name: "benefits",
      title: "Key Benefits (Trust Stamps)",
      type: "array",
      fieldset: "details",
      of: [{ type: "string" }],
      description: "Short phrases like 'Flash Frozen', 'No Preservatives', 'Gluten Free'",
    }),
    defineField({
      name: "nutrition",
      title: "Nutrition Facts",
      type: "object",
      fieldset: "nutrition",
      fields: [
        { name: "servingSize", type: "string", title: "Serving Size" },
        { name: "calories", type: "string", title: "Calories" },
        { name: "sugar", type: "string", title: "Total Sugar" },
        { name: "protein", type: "string", title: "Protein" },
        { name: "fat", type: "string", title: "Total Fat" },
      ],
    }),
    
    // --- 6. CATEGORIZATION ---
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      of: [{ type: "reference", to: { type: "category" } }],
    }),
  ],

  // --- PREVIEW CONFIG ---
  preview: {
    select: {
      title: "name",
      price: "price",
      opening: "openingStock",
      out: "stockOut",
      media: "mainImage",
    },
    prepare({ title, price, opening, out, media }) {
      // Calculate available on the fly for the preview
      const available = (opening || 0) - (out || 0);
      
      return {
        title,
        subtitle: `LKR ${price} | Stock: ${available}`,
        media: media || TrolleyIcon,
      };
    },
  },
});