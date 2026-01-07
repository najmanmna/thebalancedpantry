import { defineType, defineField } from "sanity";

export const orderItemType = defineType({
  name: "orderItem",
  title: "Order Item",
  type: "object",
  fields: [
    defineField({
      name: "product",
      title: "Product",
      type: "reference",
      to: [{ type: "product" }],
    }),
    // ❌ REMOVED: Variant Object (simplified schema doesn't use it)

    defineField({
      name: "quantity",
      title: "Quantity",
      type: "number",
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: "price",
      title: "Unit Price",
      type: "number",
    }),
    
    // --- SNAPSHOT FIELDS (In case product is deleted later) ---
    defineField({
      name: "productName",
      title: "Product Name (snapshot)",
      type: "string",
    }),
    defineField({
      name: "productImage",
      title: "Product Image (snapshot)",
      type: "image",
      options: { hotspot: true },
    }),
  ],

  preview: {
    select: {
      snapName: "productName",
      snapImage: "productImage",
      // Look up live product data if snapshot missing
      refName: "product.name",
      refImages: "product.images", 
      quantity: "quantity",
      price: "price",
    },
    prepare({ snapName, snapImage, refName, refImages, quantity, price }) {
      const name = snapName || refName || "Unknown Product";
      
      // Use snapshot image OR fallback to first image of live product
      const image = snapImage || refImages?.[0];

      const total = (price || 0) * (quantity || 0);

      return {
        title: `${quantity || 0} × ${name}`,
        subtitle: `Rs. ${total}`,
        media: image,
      };
    },
  },
});