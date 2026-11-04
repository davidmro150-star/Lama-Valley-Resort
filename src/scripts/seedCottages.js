
import connectDB from "../lib/mongodb.js";
import Cottage from "../models/Cottage.js";
import { cottages } from "../data/cottages.js";

async function seedCottages() {
  try {
    await connectDB();

    console.log("Starting cottage seeding...");

    let inserted = 0;
    let alreadyExists = 0;

    for (const cottage of cottages) {
      const result = await Cottage.updateOne(
        { slug: cottage.slug },
        {
          $setOnInsert: {
            name: cottage.name,
            slug: cottage.slug,
            price: cottage.price,
            capacity: cottage.capacity,
            description: cottage.description || "",
            images: cottage.images || [],
            isActive: true,
          },
        },
        { upsert: true }
      );

      if (result.upsertedCount > 0) {
        inserted++;
      } else {
        alreadyExists++;
      }
    }

    console.log("Cottage seeding completed!");
    console.log("New cottages added:", inserted);
    console.log("Already existing:", alreadyExists);
  } catch (error) {
    console.error("Cottage seeding failed:", error);
    process.exitCode = 1;
  } finally {
    const mongoose = await import("mongoose");
    await mongoose.default.disconnect();
  }
}

seedCottages();
