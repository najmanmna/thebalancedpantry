import { BasketIcon } from "@sanity/icons";
import { defineType, defineField } from "sanity";

export const orderType = defineType({
  name: "order",
  title: "Orders",
  type: "document",
  icon: BasketIcon,
  fields: [
    // 🔹 Order basics
    defineField({
      name: "orderNumber",
      title: "Order Number",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "status",
      title: "Order Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Processing", value: "processing" },
          { title: "Shipped", value: "shipped" },
          { title: "Delivered", value: "delivered" },
          { title: "Cancelled", value: "cancelled" },
        ],
      },
      initialValue: "pending",
      readOnly: ({ parent }) => parent?.status === "cancelled",
    }),
    defineField({
      name: "orderDate",
      title: "Order Date",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),

    // 🔹 Customer details
    defineField({
      name: "customerName",
      title: "Customer Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "phone",
      title: "Phone Number",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "alternativePhone",
      title: "Alternative Phone Number",
      type: "string",
      description: "A second number to contact if the main one is unreachable.",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
    }),

    // 🔹 Address
    defineField({
      name: "address",
      title: "Shipping Address",
      type: "object",
      fields: [
        defineField({ name: "district", title: "District", type: "string" }),
        defineField({ name: "city", title: "City", type: "string" }),
        defineField({ name: "line1", title: "Address Line", type: "string" }),
        defineField({ name: "notes", title: "Notes", type: "text" }),
      ],
    }),

    // 🔹 Payment
    defineField({
      name: "paymentMethod",
      title: "Payment Method",
      type: "string",
      options: {
        list: [
          { title: "Cash on Delivery", value: "COD" },
          { title: "Bank Transfer", value: "BANK" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    // 🔹 Products
    defineField({
      name: "items",
      title: "Ordered Items",
      type: "array",
      of: [{ type: "orderItem" }], // Referenced the updated orderItem schema
    }),

    // 🔹 Totals
    defineField({
      name: "subtotal",
      title: "Subtotal",
      type: "number",
    }),
    defineField({
      name: "shippingCost",
      title: "Shipping Cost",
      type: "number",
    }),
    defineField({
      name: "discountAmount",
      title: "Discount Amount",
      type: "number",
      description: "The amount discounted (if any)",
      initialValue: 0,
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "discountLabel",
      title: "Discount Label",
      type: "string",
      description: "The label for the applied discount",
      readOnly: true,
    }),
    defineField({
      name: "total",
      title: "Total",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
  ],

  preview: {
    select: {
      name: "customerName",
      total: "total",
      orderId: "orderNumber",
      status: "status",
      // Snapshots from the first item in the array
      productName: "items.0.productName",
      productImage: "items.0.productImage",
    },
    prepare({ name, total, orderId, status, productImage }) {
      return {
        title: `${name} (${orderId || "No ID"})`,
        subtitle: `Total: Rs. ${total} — ${status}`,
        media: productImage,
      };
    },
  },
});