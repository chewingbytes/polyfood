import { defineField, defineType } from "sanity";
import { TrolleyIcon } from "@sanity/icons";

export const canteen = defineType({
  name: "canteen",
  title: "Canteen",
  type: "document",
  icon: TrolleyIcon,
  fields: [
    defineField({
      name: "name",
      title: "Canteen Name",
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
      name: "polytechnic",
      title: "Polytechnic",
      type: "reference",
      to: [{ type: "polytechnic" }],
      validation: (Rule) => Rule.required(),
      description: "Which polytechnic does this canteen belong to?",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
      description: "Physical location of the canteen (e.g., Building A, Level 1)",
    }),
    defineField({
      name: "openingHours",
      title: "Opening Hours",
      type: "text",
      rows: 2,
      description: "Operating hours (e.g., Mon-Fri: 7am - 7pm)",
    }),
    defineField({
      name: "image",
      title: "Canteen Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "isActive",
      title: "Active",
      type: "boolean",
      initialValue: true,
      description: "Set to false to hide this canteen from the site",
    }),
  ],
  preview: {
    select: {
      title: "name",
      polytechnicName: "polytechnic.shortName",
      location: "location",
      media: "image",
    },
    prepare(selection) {
      const { title, polytechnicName, location } = selection;
      const subtitle = [polytechnicName, location].filter(Boolean).join(" • ");
      return {
        title,
        subtitle,
        media: selection.media,
      };
    },
  },
});
