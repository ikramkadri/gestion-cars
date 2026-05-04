import { Doc, Id } from "../../../../convex/_generated/dataModel";

// Define the base Car document from Convex
export type CarDocument = Doc<"cars">;

// Define the CarType that CarCard expects, including computed properties
export interface CarType extends CarDocument {
  _id: Id<"cars">; // Explicitly add _id
  _creationTime: number; // Explicitly add _creationTime
  mainImageUrl: string | null; // The URL for the main image (as returned by Convex queries)
  imagesUrls: (string | null)[]; // Array of image URLs
  // يمكنك إضافة أي خصائص أخرى يتم حسابها أو استخدامها في الواجهة الأمامية هنا
}