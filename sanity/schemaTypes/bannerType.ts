import { TagIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const bannerType = defineType({
  name: "banner",
  title: "Banner",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
  name: "showOn",
  title: "Show On",
  type: "string",
  options: {
    list: [
      { title: "Desktop", value: "desktop" },
      { title: "Mobile", value: "mobile" },
      { title: "Both", value: "both" },
    ],
    layout: "radio",
  },
  initialValue: "both",
}),
    defineField({
  name: "desktop",
  title: "Desktop",
  type: "object",
  fields: [
    { name: "image", title: "Image", type: "image", options: { hotspot: true } },
    {
      name: "buttonTheme",
      title: "Button Theme",
      type: "string",
      options: {
        list: [
          { title: "Light", value: "light" },
          { title: "Dark", value: "dark" },
        ],
        layout: "radio",
      },
      initialValue: "dark",
    },
  ],
}),


defineField({
  name: "mobile",
  title: "Mobile",
  type: "object",
  fields: [
    { name: "image", title: "Image", type: "image", options: { hotspot: true } },
    {
      name: "buttonTheme",
      title: "Button Theme",
      type: "string",
      options: {
        list: [
          { title: "Light", value: "light" },
          { title: "Dark", value: "dark" },
        ],
        layout: "radio",
      },
      initialValue: "dark",
    },
  ],
  
}),

  ],
   preview: {
    select: {
      showOn: "showOn",
      desktopImage: "desktop.image",
      mobileImage: "mobile.image",
    },
    prepare({ showOn, desktopImage, mobileImage }) {
      return {
        title: `Banner (${showOn})`,
        media: desktopImage || mobileImage,
      };
    },
  },
});
