import { mutation } from "./_generated/server";
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

export const seedCars = mutation({
  args: {},
  handler: async (ctx) => {
    // =========================================
    // 🗑️ تنظيف البيانات القديمة قبل البدء
    // =========================================
    const existingUsers = await ctx.db.query("users").collect();
    for (const u of existingUsers) await ctx.db.delete(u._id);

    const existingSettings = await ctx.db.query("site_settings").collect();
    for (const s of existingSettings) await ctx.db.delete(s._id);

    const existingCars = await ctx.db.query("cars").collect();
    for (const c of existingCars) await ctx.db.delete(c._id);

    // دالة مساعدة لرفع صورة إلى Convex Storage
    const uploadImage = async (url: string) => {
      // تعريف النوع يدوياً لتجنب any وإرضاء الـ Linter
      const storage = ctx.storage as unknown as { 
        store: (blob: Blob) => Promise<Id<"_storage">> 
      };
      return await storage.store(new Blob([await (await fetch(url)).arrayBuffer()], { type: "image/jpeg" }));
    };

    // إنشاء أدمن
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

    // =========================
    // CREATE SITE SETTINGS
    // =========================
    await ctx.db.insert("site_settings", {
      showroomName: "Motorix Showroom",
      contactPhone: "213550123456", // رقم هاتف افتراضي
      contactWhatsApp: "213550123456",
      contactEmail: "contact@motorix.com",
      address: "123 Main St, Algiers, Algeria",
      currency: "DZD",
      updatedAt: Date.now(),
    });

    // =========================================
    // 🚗 MOTORIX DEMO CARS DATA
    // =========================================
    const demoCars: DemoCar[] = [
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

    for (const car of demoCars) {
      // رفع الصور الافتراضية إلى Convex Storage
      const mainImageId = await uploadImage(`/demo-cars/${car.make}/1.jpg`);
      const imageIds = await Promise.all([
        uploadImage(`/demo-cars/${car.make}/1.jpg`),
        uploadImage(`/demo-cars/${car.make}/2.jpg`),
        uploadImage(`/demo-cars/${car.make}/3.jpg`),
      ]);
      await ctx.db.insert("cars", {
        ...car,
        searchName: `${car.make} ${car.model} ${car.year}`.toLowerCase(),
        sellerId: adminId,
        mainImage: mainImageId,
        images: imageIds, // التأكد من أن images ليست undefined
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    console.log("✅ Seeding completed successfully!");
  },
});