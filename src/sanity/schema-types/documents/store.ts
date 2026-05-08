import { defineField, defineType } from "sanity";
import { HomeIcon } from "@sanity/icons";

export const store = defineType({
  name: "store",
  title: "Store",
  type: "document",
  icon: HomeIcon,
  fields: [
    defineField({
      name: "name",
      title: "Store Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "canteen",
      title: "Canteen",
      type: "reference",
      to: [{ type: "canteen" }],
      validation: (Rule) => Rule.required(),
      description: "Which canteen does this store belong to?",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "cuisine",
      title: "Cuisine Type",
      type: "string",
      description: "E.g., Chinese, Western, Japanese, etc.",
    }),
    defineField({
      name: "stallNumber",
      title: "Stall Number",
      type: "string",
      description: "Physical stall number (e.g., #01-23)",
    }),
    defineField({
      name: "image",
      title: "Store Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "contactNumber",
      title: "Contact Number",
      type: "string",
    }),
    defineField({
      name: "isActive",
      title: "Active",
      type: "boolean",
      initialValue: true,
      description: "Set to false to hide this store from the site",
    }),
    defineField({
      name: "vendorEmail",
      title: "Vendor Email",
      type: "string",
      description:
        "Email address used for vendor dashboard login via email OTP",
    }),
  ],
  preview: {
    select: {
      title: "name",
      canteenName: "canteen.name",
      stallNumber: "stallNumber",
      media: "image",
    },
    prepare(selection) {
      const { title, canteenName, stallNumber } = selection;
      const subtitle = [canteenName, stallNumber].filter(Boolean).join(" • ");
      return {
        title,
        subtitle,
        media: selection.media,
      };
    },
  },
});
