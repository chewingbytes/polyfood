import type { SchemaTypeDefinition } from "sanity";

import { polytechnic } from "./documents/polytechnic";
import { canteen } from "./documents/canteen";
import { store } from "./documents/store";
import { foodProduct } from "./documents/food-product";

// Export an array of all the schema types.
export const schemaTypes: SchemaTypeDefinition[] = [
  polytechnic,
  canteen,
  store,
  foodProduct,
];
