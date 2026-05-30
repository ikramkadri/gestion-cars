import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

/**
 * تعريف نوع البيانات للسيارات التجريبية لضمان مطابقة الـ Schema
 */
interface DemoCar {
  make: string;
  model: string;
  origin: string;
  year: number;
  description: string;
  purchasePrice: number;
  price: number;
  mileage: number;
  vin: string;
  location: string;
  hasWarranty: boolean;
  cylinders: number;
  fuel: "Gasoline" | "Diesel" | "Electric" | "Hybrid";
  transmission: "Automatic" | "Manual";
  drivetrain: "FWD" | "RWD" | "AWD" | "4WD";
  engineSize: string;
  color: string;
  condition: "New" | "Excellent" | "Good" | "Fair" | "Poor";
  viewCount: number;
  status: "Available" | "Sold" | "Reserved";
  slug: string;
  isArchived: boolean;
}

const DEMO_CARS: DemoCar[] = [
  {
    make: "Lamborghini",
    model: "Urus Performante",
    origin: "Italy",
    year: 2024,
    description: "High-performance Lamborghini SUV with aggressive styling and luxury interior.",
    purchasePrice: 48000000,
    price: 55900000,
    mileage: 900,
    vin: "ZPBUA1ZL9RLA77881",
    location: "Algiers",
    hasWarranty: true,
    cylinders: 8,
    fuel: "Gasoline" as const,
    transmission: "Automatic" as const,
    drivetrain: "AWD" as const,
    engineSize: "4.0L Twin Turbo V8",
    color: "Yellow",
    condition: "New" as const,
    viewCount: 910,
    status: "Available" as const,
    slug: "lamborghini-urus-performante-2024",
    isArchived: false,
  },
  {
    make: "Mercedes",
    model: "G63 AMG",
    origin: "Germany",
    year: 2024,
    description: "Luxury Mercedes G63 AMG with premium interior, twin turbo V8 engine and full option package.",
    purchasePrice: 28500000,
    price: 32900000,
    mileage: 1200,
    vin: "W1NYC7HJ5MX392145",
    location: "Algiers",
    hasWarranty: true,
    cylinders: 8,
    fuel: "Gasoline" as const,
    transmission: "Automatic" as const,
    drivetrain: "AWD" as const,
    engineSize: "4.0L Twin Turbo V8",
    color: "Obsidian Black",
    condition: "New" as const,
    viewCount: 284,
    status: "Available" as const,
    slug: "mercedes-g63-amg-2024",
    isArchived: false,
  },
  {
    make: "BMW",
    model: "X7 M60i",
    origin: "Germany",
    year: 2024,
    description: "BMW X7 luxury SUV with advanced technology and sporty performance.",
    purchasePrice: 21000000,
    price: 24800000,
    mileage: 3500,
    vin: "5UXCX6C03L9B12345",
    location: "Oran",
    hasWarranty: true,
    cylinders: 8,
    fuel: "Gasoline" as const,
    transmission: "Automatic" as const,
    drivetrain: "AWD" as const,
    engineSize: "4.4L V8",
    color: "White",
    condition: "Excellent" as const,
    viewCount: 198,
    status: "Available" as const,
    slug: "bmw-x7-m60i-2024",
    isArchived: false,
  },
  {
    make: "Porsche",
    model: "Cayenne Turbo GT",
    origin: "Germany",
    year: 2024,
    description: "Ultra luxury SUV combining Porsche performance and daily practicality.",
    purchasePrice: 24000000,
    price: 28700000,
    mileage: 2100,
    vin: "WP1ZZZ9YZMDA12345",
    location: "Blida",
    hasWarranty: true,
    cylinders: 8,
    fuel: "Gasoline" as const,
    transmission: "Automatic" as const,
    drivetrain: "AWD" as const,
    engineSize: "4.0L V8",
    color: "Crayon Grey",
    condition: "New" as const,
    viewCount: 400,
    status: "Reserved" as const,
    slug: "porsche-cayenne-turbo-gt-2024",
    isArchived: false,
  },
];

// ──────────────────────────────────────────────────
// Internal mutation: handles DB writes (users, settings, cars)
// ──────────────────────────────────────────────────
export const insertSeedData = internalMutation({
  args: {
    carsData: v.array(
      v.object({
        car: v.object({
          make: v.string(),
          model: v.string(),
          origin: v.string(),
          year: v.number(),
          description: v.string(),
          purchasePrice: v.number(),
          price: v.number(),
          mileage: v.number(),
          vin: v.string(),
          location: v.string(),
          hasWarranty: v.boolean(),
          cylinders: v.number(),
          fuel: v.union(
            v.literal("Gasoline"),
            v.literal("Diesel"),
            v.literal("Electric"),
            v.literal("Hybrid"),
          ),
          transmission: v.union(v.literal("Automatic"), v.literal("Manual")),
          drivetrain: v.union(
            v.literal("FWD"),
            v.literal("RWD"),
            v.literal("AWD"),
            v.literal("4WD"),
          ),
          engineSize: v.string(),
          color: v.string(),
          condition: v.union(
            v.literal("New"),
            v.literal("Excellent"),
            v.literal("Good"),
            v.literal("Fair"),
            v.literal("Poor"),
          ),
          viewCount: v.number(),
          status: v.union(
            v.literal("Available"),
            v.literal("Sold"),
            v.literal("Reserved"),
          ),
          slug: v.string(),
          isArchived: v.boolean(),
        }),
        mainImageId: v.optional(v.id("_storage")),
        imageIds: v.array(v.id("_storage")),
      }),
    ),
  },
  handler: async (ctx, { carsData }) => {
    // Clean existing data
    const existingUsers = await ctx.db.query("users").collect();
    for (const u of existingUsers) await ctx.db.delete(u._id);

    const existingSettings = await ctx.db.query("site_settings").collect();
    for (const s of existingSettings) await ctx.db.delete(s._id);

    const existingCars = await ctx.db.query("cars").collect();
    for (const c of existingCars) await ctx.db.delete(c._id);

    // Create admin
    const adminId = await ctx.db.insert("users", {
      fullName: "Motorix Admin",
      email: "admin@motorix.com",
      password: "123456",
      role: "admin",
      status: "active",
      verified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create site settings
    await ctx.db.insert("site_settings", {
      showroomName: "Motorix Showroom",
      contactPhone: "213550123456",
      contactWhatsApp: "213550123456",
      address: "123 Main St, Algiers, Algeria",
      currency: "DZD",
      updatedAt: Date.now(),
    });

    // Insert cars
    for (const { car, mainImageId, imageIds } of carsData) {
      const allImages = [mainImageId, ...imageIds].filter(
        (id): id is Id<"_storage"> => id !== undefined && id !== null,
      );

      await ctx.db.insert("cars", {
        ...car,
        searchName: `${car.make} ${car.model} ${car.year}`.toLowerCase(),
        sellerId: adminId,
        mainImage: mainImageId ?? undefined,
        images: allImages.length > 0 ? allImages : undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

// ──────────────────────────────────────────────────
// Public action: generates placeholder images, then
// delegates DB writes to the internal mutation above
// ──────────────────────────────────────────────────
export const seedCars = action({
  args: {
    baseUrl: v.optional(v.string()),
  },
  handler: async (ctx, { baseUrl }) => {
    const escapeXml = (s: string) =>
      s.replace(
        /[&<>"']/g,
        (c: string) =>
          ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c] || c,
      );

    // Generate SVG placeholder for a car
    const generatePlaceholder = (
      make: string,
      model: string,
      color: string,
    ): Blob => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e293b"/>
      <stop offset="100%" style="stop-color:#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#bg)"/>
  <g transform="translate(400,240)" fill="none" stroke="#334155" stroke-width="2">
    <rect x="-120" y="-40" rx="40" ry="20" width="240" height="80"/>
    <circle cx="-60" cy="40" r="30" fill="#1e293b" stroke="#475569"/>
    <circle cx="60" cy="40" r="30" fill="#1e293b" stroke="#475569"/>
    <rect x="-60" y="-30" rx="10" width="120" height="30" fill="#1e293b"/>
  </g>
  <text x="400" y="340" text-anchor="middle" fill="#94a3b8" font-size="28" font-family="system-ui,-apple-ui,sans-serif" font-weight="700">${escapeXml(make)}</text>
  <text x="400" y="380" text-anchor="middle" fill="#64748b" font-size="20" font-family="system-ui,-apple-ui,sans-serif">${escapeXml(model)}</text>
  <rect x="350" y="420" rx="20" width="100" height="6" fill="#${escapeXml(color)}" opacity="0.6"/>
</svg>`;
      return new Blob([svg], { type: "image/svg+xml" });
    };

    // Try fetching a real image from baseUrl, fall back to generated placeholder
    const uploadImage = async (
      make: string,
      model: string,
      color: string,
      idx: number,
    ): Promise<Id<"_storage"> | null> => {
      // First try: fetch from baseUrl if provided (frontend serves public/demo-cars/)
      if (baseUrl) {
        try {
          const folder = make.replace(/\s+/g, "-");
          const url = `${baseUrl}/demo-cars/${encodeURIComponent(folder)}/${idx}.jpg`;
          const resp = await fetch(url);
          if (resp.ok) {
            const blob = await resp.blob();
            return await ctx.storage.store(blob);
          }
        } catch {
          // fall through to placeholder
        }
      }

      // Fallback: generate a placeholder SVG (always works in actions via store())
      try {
        const placeholder = generatePlaceholder(make, model, color);
        return await ctx.storage.store(placeholder);
      } catch {
        return null;
      }
    };

    // Upload images for each demo car
    const carsData: {
      car: DemoCar;
      mainImageId?: Id<"_storage">;
      imageIds: Id<"_storage">[];
    }[] = [];

    for (const car of DEMO_CARS) {
      const mainImageId = await uploadImage(car.make, car.model, car.color, 1);
      const extraIds = (
        await Promise.all([
          uploadImage(car.make, car.model, car.color, 2),
          uploadImage(car.make, car.model, car.color, 3),
        ])
      ).filter((id): id is Id<"_storage"> => id !== null);

      carsData.push({
        car,
        mainImageId: mainImageId ?? undefined,
        imageIds: extraIds,
      });
    }

    // Delegate DB writes to the internal mutation
    await ctx.runMutation(internal.seed.insertSeedData, { carsData });

    console.log(
      `✅ Seed completed: ${DEMO_CARS.length} cars created with images`,
    );
  },
});
