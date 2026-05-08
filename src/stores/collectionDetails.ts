import { persistentAtom } from "@nanostores/persistent";

export type CollectionTime = "asap" | "30m" | "1h" | "2h";

export interface CollectionDetails {
  studentName: string;
  collectionTime: CollectionTime;
}

const emptyDetails: CollectionDetails = {
  studentName: "",
  collectionTime: "asap",
};

// Persisted across page reloads
export const collectionDetails = persistentAtom<CollectionDetails>(
  "fap-collection",
  emptyDetails,
  { encode: JSON.stringify, decode: JSON.parse }
);

export const collectionTimeLabels: Record<CollectionTime, string> = {
  asap: "As Soon As Possible",
  "30m": "In ~30 Minutes",
  "1h": "In ~1 Hour",
  "2h": "In ~2 Hours",
};

export function saveCollectionDetails(details: CollectionDetails) {
  collectionDetails.set(details);
}
