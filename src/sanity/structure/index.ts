import { TrolleyIcon, HomeIcon, LemonIcon } from "@sanity/icons";
import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Food at Poly")
    .items([
      S.documentTypeListItem("polytechnic").title("Polytechnics").icon(HomeIcon),
      S.documentTypeListItem("canteen").title("Canteens").icon(TrolleyIcon),
      S.documentTypeListItem("store").title("Stores").icon(HomeIcon),
      S.documentTypeListItem("foodProduct").title("Food Products").icon(LemonIcon),
    ]);
