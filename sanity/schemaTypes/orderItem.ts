import { defineType, defineField } from "sanity";

export const orderItemType = defineType({
  name: "orderItem",
  title: "Order Item",
  type: "object",
  fields: [
    // 🔹 Reference to live product (for inventory scripts)
    defineField({
      name: "product",
      title: "Product",
      type: "reference",
      to: [{ type: "product" }],
    }),

    // 🔹 Bundle Details (CRITICAL for Warehouse & History)
    // We snapshot these so if you change product bundles later, old orders remain accurate.
    defineField({
      name: "bundleTitle",
      title: "Bundle Name",
      type: "string",
      description: "e.g., 'The Stash' or 'Family Pack'",
    }),
    defineField({
      name: "bundleCount",
      title: "Packs per Bundle",
      type: "number",
      description: "How many base units are in this bundle? (e.g., 3, 6)",
      initialValue: 1,
    }),
    // 👇 NEW: Missing field to track "Savings" shown at checkout
    defineField({
      name: "bundleSavings",
      title: "Bundle Savings Label",
      type: "string",
      description: "Snapshot of the savings (e.g., 'Save Rs. 400')",
    }),

    // 🔹 Order Quantity
    defineField({
      name: "quantity",
      title: "Quantity (Bundles)",
      type: "number",
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: "price",
      title: "Price per Bundle",
      type: "number",
      description: "The price paid for this specific bundle configuration at checkout."
    }),
    
    // --- SNAPSHOT FIELDS (History) ---
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
      bundle: "bundleTitle",
      count: "bundleCount",
      quantity: "quantity",
      price: "price",
    },
    prepare({ snapName, snapImage, bundle, count, quantity, price }) {
      const name = snapName || "Unknown Product";
      // Show explicit bundle details in the preview
      const bundleInfo = bundle ? `(${bundle} - ${count} packs)` : "(Single)";
      const total = (price || 0) * (quantity || 0);

      return {
        title: `${quantity} x ${name} ${bundleInfo}`,
        subtitle: `Total: Rs. ${total} (@ ${price}/ea)`,
        media: snapImage,
      };
    },
  },
});