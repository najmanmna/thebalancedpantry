// sanity/schemas/marketingPopup.ts
import { defineField, defineType } from 'sanity'
import { RocketIcon } from '@sanity/icons'

export const marketingPopupType = defineType({
  name: 'marketingPopup',
  title: 'Marketing Popups',
  type: 'document',
  icon: RocketIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Campaign Title',
      type: 'string',
      description: 'Internal reference name (e.g. "Summer Sale Banner")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      description: 'Turn this on to show the popup on the website.',
    }),
    defineField({
      name: 'image',
      title: 'Banner Image',
      type: 'image',
      description: 'The main visual for the popup. Vertical or Square works best.',
      validation: (Rule) => Rule.required(),
      options: { hotspot: true },
    }),
    defineField({
      name: 'link',
      title: 'Link URL',
      type: 'string',
      description: 'Where should the user go when clicking the image? (e.g. /products/summer-shirt)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'displayDelay',
      title: 'Display Delay (Seconds)',
      type: 'number',
      description: 'How long to wait after page load before showing? (Prevents clashing with Promo modal)',
      initialValue: 2,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      isActive: 'isActive',
      media: 'image',
    },
    prepare({ title, isActive, media }) {
      return {
        title: title,
        subtitle: isActive ? 'Active' : 'Inactive',
        media: media,
      }
    },
  },
})