import { defineField, defineType } from "sanity";
import { LemonIcon } from "@sanity/icons";

export const foodProduct = defineType({
  name: "foodProduct",
  title: "Food Product",
  type: "document",
  icon: LemonIcon,
  fields: [
    defineField({
      name: "name",
      title: "Product Name",
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
      name: "store",
      title: "Store",
      type: "reference",
      to: [{ type: "store" }],
      validation: (Rule) => Rule.required(),
      description: "Which store sells this product?",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "price",
      title: "Price",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
      description: "Price in SGD",
    }),
    defineField({
      name: "image",
      title: "Product Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Main Course", value: "main" },
          { title: "Side Dish", value: "side" },
          { title: "Beverage", value: "beverage" },
          { title: "Dessert", value: "dessert" },
          { title: "Snack", value: "snack" },
        ],
      },
    }),
    defineField({
      name: "isVegetarian",
      title: "Vegetarian",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "isHalal",
      title: "Halal",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "spicyLevel",
      title: "Spicy Level",
      type: "number",
      options: {
        list: [
          { title: "Not Spicy", value: 0 },
          { title: "Mild", value: 1 },
          { title: "Medium", value: 2 },
          { title: "Hot", value: 3 },
          { title: "Extra Hot", value: 4 },
        ],
      },
      initialValue: 0,
    }),
    defineField({
      name: "isAvailable",
      title: "Available",
      type: "boolean",
      initialValue: true,
      description: "Set to false if out of stock or temporarily unavailable",
    }),
    defineField({
      name: "preparationTime",
      title: "Preparation Time (minutes)",
      type: "number",
      description: "Estimated time to prepare this item",
    }),
    defineField({
      name: "shopifyVariantId",
      title: "Shopify Variant ID",
      type: "string",
      description: "Maps this product to a specific Shopify product variant (e.g. gid://shopify/ProductVariant/12345)",
    }),
    defineField({
      name: "addOnOptions",
      title: "Add-on Options",
      type: "array",
      of: [{ type: "string" }],
      description: "Customer customisation options, e.g. 'No Chili', 'Extra Rice', 'Less Sugar'",
      options: {
        layout: "tags",
      },
    }),
  ],
  preview: {
    select: {
      title: "name",
      storeName: "store.name",
      price: "price",
      media: "image",
      isAvailable: "isAvailable",
    },
    prepare(selection) {
      const { title, storeName, price, isAvailable } = selection;
      const priceStr = price ? `$${price.toFixed(2)}` : "";
      const availabilityStr = isAvailable === false ? " (Unavailable)" : "";
      const subtitle = [storeName, priceStr].filter(Boolean).join(" • ") + availabilityStr;
      return {
        title,
        subtitle,
        media: selection.media,
      };
    },
  },
});
