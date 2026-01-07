import { defineField, defineType } from "sanity";

export const settingsType = defineType({
  name: "settings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "deliveryCharges",
      title: "Delivery Charges",
      type: "object",
      fields: [
        defineField({
          name: "colombo",
          title: "Colombo",
          type: "number",
          initialValue: 150,
        }),
        defineField({
          name: "suburbs",
          title: "Suburbs",
          type: "number",
          initialValue: 200,
        }),
        defineField({
          name: "others",
          title: "Others",
          type: "number",
          initialValue: 300,
        }),
      ],
    }),
  ],
});
