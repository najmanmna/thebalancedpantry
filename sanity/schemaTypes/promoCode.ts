// sanity/schemas/promoCode.ts
import { defineField, defineType } from 'sanity'
import { TagIcon } from '@sanity/icons'

export const promoCodeType = defineType({
  name: 'promoCode',
  title: 'Promo Codes',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'A human-readable title (e.g., "15% Off First Order")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'code',
      title: 'Promo Code',
      type: 'string',
      description: 'The code the customer will type (e.g., "ELVYN15")',
      validation: (Rule) =>
        Rule.required().uppercase().error('Code must be uppercase.'),
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      description: 'Turn this on to make the promo code usable.',
      initialValue: true,
    }),

    // 👇 1. NEW FIELD: Free Shipping Toggle
    defineField({
      name: 'isFreeShipping',
      title: 'Free Shipping Code',
      type: 'boolean',
      description: 'If active, this code will remove the Delivery Charge (ignoring the discount %)',
      initialValue: false,
    }),

    // 👇 2. UPDATED FIELD: Discount Percentage
    defineField({
      name: 'discountPercentage',
      title: 'Discount Percentage',
      type: 'number',
      description: 'The percentage to discount (e.g., 15 for 15%)',
      initialValue: 15,
      // HIDE this field if "Free Shipping" is checked
      hidden: ({ document }) => !!document?.isFreeShipping,
      // CUSTOM VALIDATION: Only require this if it's NOT a free shipping code
      validation: (Rule) => Rule.custom((value, context) => {
        const isFreeShip = context.document?.isFreeShipping;
        
        // If it is a free shipping code, this field is optional/irrelevant -> Valid
        if (isFreeShip) return true;

        // Otherwise, standard checks:
        if (typeof value === 'undefined' || value === null) return 'Percentage is required';
        if (value < 1) return 'Must be at least 1%';
        if (value > 100) return 'Cannot be more than 100%';
        
        return true;
      }),
    }),

    defineField({
      name: 'minOrderAmount',
      title: 'Minimum Order Amount',
      type: 'number',
      description: 'The subtotal must be this much or more (e.g., 3000)',
      validation: (Rule) => Rule.required().min(0),
      initialValue: 3000,
    }),
    defineField({
      name: 'firstOrderOnly',
      title: 'First Order Only',
      type: 'boolean',
      description: 'Is this code only for new customers?',
      initialValue: true,
    }),
    defineField({
      name: 'promoImage',
      title: 'Promo Image',
      type: 'image',
      description: 'An image to show in the promo popup.',
      options: {
        hotspot: true, // Good for cropping
      },
    }),
    defineField({
      name: 'isFeatured',
      title: 'Feature on Side Pane',
      type: 'boolean',
      description: 'Show this promo in the floating side pane on all pages? (Max: 1)',
      initialValue: false,
      validation: (Rule) => Rule.custom(async (isFeatured, context) => {
        if (!isFeatured) return true // If this isn't featured, it's valid

        const { getClient } = context;
        const client = getClient({ apiVersion: '2025-01-01' });

        // Get the actual document ID, stripping "drafts." if it exists
        const documentId = context.document?._id.replace('drafts.', '');

        // Check if another *published* promo is already featured
        const otherFeatured = await client.fetch(
          `count(*[
             _type == "promoCode" && 
             isFeatured == true && 
             _id != $draftId && 
             _id != $publishedId && 
             !(_id in path("drafts.**"))
           ])`,
          {
            draftId: `drafts.${documentId}`,
            publishedId: documentId
          }
        );

        if (otherFeatured > 0) {
          return 'Only one promo code can be featured at a time. Please un-feature the other *published* one first.';
        }

        return true;
      })
    }),
  ],
  // 👇 3. UPDATED PREVIEW: Shows "Free Shipping" in the list
  preview: {
    select: {
      title: 'title',
      code: 'code',
      isActive: 'isActive',
      isFreeShipping: 'isFreeShipping',
      discountPercentage: 'discountPercentage',
    },
    prepare({ title, code, isActive, isFreeShipping, discountPercentage }) {
      const typeText = isFreeShipping 
        ? '🚚 Free Shipping' 
        : `🏷️ ${discountPercentage}% Off`;

      return {
        title: title,
        subtitle: `${code} - ${typeText} (${isActive ? 'Active' : 'Inactive'})`,
      }
    },
  },
})