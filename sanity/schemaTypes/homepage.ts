import { defineField, defineType } from "sanity";
import { Home } from "lucide-react"; // Or any icon

export const homepageType = defineType({
  name: "homepage",
  title: "Homepage Settings",
  type: "document",
  icon: Home, // You might need to import a standard Sanity icon if lucide fails here
  fields: [
    defineField({
      name: "heroProduct",
      title: "Hero Spotlight Product",
      description: "Select the product to feature in the main hero section.",
      type: "reference",
      to: [{ type: "product" }], // Only allow selecting products
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Homepage Configuration",
      };
    },
  },
});