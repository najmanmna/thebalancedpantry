import { BasketIcon } from "@sanity/icons";
import { defineType, defineField } from "sanity";

export const orderType = defineType({
  name: "order",
  title: "Orders",
  type: "document",
  icon: BasketIcon,
  groups: [
    { name: "details", title: "Order Details" },
    { name: "customer", title: "Customer Info" },
    { name: "admin", title: "Admin & Status" },
  ],
  fields: [
    // 🔹 1. Order Basics
    defineField({
      name: "orderNumber",
      title: "Order Number",
      type: "string",
      group: "details",
      validation: (Rule) => Rule.required(),
      readOnly: true,
    }),
    defineField({
      name: "orderDate",
      title: "Order Date",
      type: "datetime",
      group: "details",
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
      readOnly: true,
    }),

    // 🔹 2. Status Management
    defineField({
      name: "status",
      title: "Order Status (Fulfillment)",
      type: "string",
      group: "admin",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Processing", value: "processing" },
          { title: "Shipped", value: "shipped" },
          { title: "Delivered", value: "delivered" },
          { title: "Cancelled", value: "cancelled" },
        ],
        layout: "radio",
      },
      initialValue: "pending",
    }),
    
    // 🆕 Payment Status
    defineField({
      name: "paymentStatus",
      title: "Payment Status",
      type: "string",
      group: "admin",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Paid", value: "paid" },
          { title: "Failed", value: "failed" },
          { title: "Refunded", value: "refunded" },
        ],
        layout: "radio",
      },
      initialValue: "pending",
    }),

    // Internal note for your team (not seen by customer)
    defineField({
      name: "internalNote",
      title: "Internal Notes",
      type: "text",
      group: "admin",
      rows: 3,
      description: "Notes for the packing team (e.g. 'Pack with extra care').",
    }),

    // 🔹 3. Customer Details
    defineField({
      name: "customerName",
      title: "Customer Name",
      type: "string",
      group: "customer",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "phone",
      title: "Phone Number",
      type: "string",
      group: "customer",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "alternativePhone",
      title: "Alternative Phone",
      type: "string",
      group: "customer",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      group: "customer",
    }),
    defineField({
      name: "address",
      title: "Shipping Address",
      type: "object",
      group: "customer",
      fields: [
        { name: "line1", title: "Address Line", type: "string" },
        { name: "city", title: "City", type: "string" },
        { name: "district", title: "District", type: "string" },
        { name: "notes", title: "Delivery Instructions", type: "text" },
      ],
    }),

    // 🔹 4. Cart & Payment
    defineField({
      name: "items",
      title: "Cart Items",
      type: "array",
      group: "details",
      of: [{ type: "orderItem" }], 
    }),
    defineField({
      name: "paymentMethod",
      title: "Payment Method",
      type: "string",
      group: "details",
      options: {
        list: [
          { title: "Cash on Delivery", value: "COD" },
          { title: "Bank Transfer", value: "BANK" },
          { title: "Card Payment (Payable)", value: "CARD" }, // Added Card
        ],
      },
    }),

    // 🔹 5. Financials
    defineField({
      name: "subtotal",
      title: "Subtotal",
      type: "number",
      group: "details",
      readOnly: true,
    }),
    defineField({
      name: "discountAmount",
      title: "Discount Applied",
      type: "number",
      group: "details",
      readOnly: true,
    }),
    defineField({
      name: "discountLabel",
      title: "Discount Code/Reason",
      type: "string",
      group: "details",
      readOnly: true,
    }),
    defineField({
      name: "shippingCost",
      title: "Shipping Fee",
      type: "number",
      group: "details",
      readOnly: true,
    }),
    defineField({
      name: "total",
      title: "Grand Total",
      type: "number",
      group: "details",
      validation: (Rule) => Rule.required(),
      readOnly: true,
    }),
    
    // System Fields
    defineField({
      name: "emailSent",
      title: "Success Email Sent",
      type: "boolean",
      group: "admin",
      hidden: true,
      initialValue: false,
    }),
  ],

  preview: {
    select: {
      name: "customerName",
      total: "total",
      orderId: "orderNumber",
      status: "status",
      paymentStatus: "paymentStatus",
      paymentMethod: "paymentMethod",
      date: "orderDate",
    },
    prepare({ name, total, orderId, status, paymentStatus, paymentMethod, date }) {
      const d = new Date(date).toLocaleDateString();
      
      const statusEmojis: Record<string, string> = {
        pending: "🟡",
        processing: "⚙️",
        shipped: "🚚",
        delivered: "✅",
        cancelled: "❌",
      };
      
      const payEmojis: Record<string, string> = {
        paid: "💳",
        pending: "⏳",
        failed: "🚫",
        refunded: "↩️",
      };

      const sEmoji = statusEmojis[status] || "⚪️";
      const pEmoji = payEmojis[paymentStatus] || "❓";

      return {
        title: `${sEmoji} ${name} (Rs. ${total})`,
        subtitle: `${pEmoji} ${paymentStatus?.toUpperCase()} | ${paymentMethod} | #${orderId}`,
      };
    },
  },
});