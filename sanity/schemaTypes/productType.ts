import { TrolleyIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const productType = defineType({
  name: "product",
  title: "Products",
  type: "document",
  icon: TrolleyIcon,
  fields: [
    defineField({
      name: "name",
      title: "Product Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "sku",
      title: "SKU / Item Code",
      type: "string",
    }),
    defineField({
      name: "price",
      title: "Price",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "images",
      title: "Product Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      validation: (Rule) => Rule.min(1),
    }),

    // --- 🔹 INVENTORY TRACKING (Top Level) ---
    defineField({
      name: "openingStock",
      title: "Opening Stock",
      type: "number",
      description: "Total quantity initially added to inventory.",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "stockOut",
      title: "Stock Out / Sold",
      type: "number",
      description: "Quantity sold (automatically updated by orders).",
      initialValue: 0,
      validation: (Rule) => Rule.min(0),
    }),
    // ------------------------------------------

    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      of: [{ type: "reference", to: { type: "category" } }],
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),
  ],

  preview: {
    select: {
      title: "name",
      price: "price",
      opening: "openingStock",
      out: "stockOut",
      media: "images.0.asset",
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