import { defineField, defineType } from "sanity";
import { HomeIcon } from "@sanity/icons";

export const polytechnic = defineType({
  name: "polytechnic",
  title: "Polytechnic",
  type: "document",
  icon: HomeIcon,
  fields: [
    defineField({
      name: "name",
      title: "Polytechnic Name",
      type: "string",
      validation: (Rule) => Rule.required(),
      description: "E.g., Singapore Polytechnic, Ngee Ann Polytechnic",
    }),
    defineField({
      name: "shortName",
      title: "Short Name",
      type: "string",
      description: "E.g., SP, NP, TP, NYP, RP",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "shortName",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "address",
      title: "Address",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "website",
      title: "Website",
      type: "url",
    }),
    defineField({
      name: "image",
      title: "Polytechnic Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "color",
      title: "Brand Color (hex)",
      type: "string",
      description: "Primary brand color, e.g. #FF6B6B",
      validation: (Rule) => Rule.regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/).warning("Enter a valid hex color, e.g. #FF6B6B"),
    }),
    defineField({
      name: "isActive",
      title: "Active",
      type: "boolean",
      initialValue: true,
      description: "Set to false to hide this polytechnic from the site",
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "shortName",
      media: "logo",
    },
  },
});
