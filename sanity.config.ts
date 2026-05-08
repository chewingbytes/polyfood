import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./src/sanity/schema-types";
import { structure } from "./src/sanity/structure";
import { TrolleyIcon } from "@sanity/icons";

export default defineConfig({
  name: "food-at-poly",
  title: "Food at Poly",
  icon: TrolleyIcon,
  projectId:
    typeof process !== "undefined" && process?.env
      ? process.env.PUBLIC_SANITY_STUDIO_PROJECT_ID ||
        import.meta.env.PUBLIC_SANITY_STUDIO_PROJECT_ID
      : import.meta.env.PUBLIC_SANITY_STUDIO_PROJECT_ID,
  dataset:
    typeof process !== "undefined" && process?.env
      ? process.env.PUBLIC_SANITY_STUDIO_DATASET || "production"
      : "production",
  plugins: [
    structureTool({ structure }),
  ],
  schema: {
    types: schemaTypes,
  },
});
