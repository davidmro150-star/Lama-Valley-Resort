
import { randomBytes } from "crypto";

import connectDB from "../lib/mongodb.js";
import Booking from "../models/booking.js";


function generateBookingReference() {
  const year = new Date().getFullYear();

  const uniqueCode = randomBytes(4)
    .toString("hex")
    .toUpperCase();

  return `LV-${year}-${uniqueCode}`;
}

async function backfillBookingReferences() {
  try {
    await connectDB();

    console.log("Checking existing bookings...");

    const bookings = await Booking.find({
      $or: [
        { bookingReference: { $exists: false } },
        { bookingReference: null },
        { bookingReference: "" },
      ],
    })
      .select("_id")
      .lean();

    console.log(`Found ${bookings.length} bookings without references.`);

    let updatedCount = 0;

    for (const booking of bookings) {
      let saved = false;

      // Retry if a reference collision occurs
      for (let attempt = 0; attempt < 5 && !saved; attempt++) {
        try {
          const result = await Booking.updateOne(
            {
              _id: booking._id,
              $or: [
                { bookingReference: { $exists: false } },
                { bookingReference: null },
                { bookingReference: "" },
              ],
            },
            {
              $set: {
                bookingReference: generateBookingReference(),
              },
            }
          );

          if (result.modifiedCount === 1) {
            updatedCount++;
          }

          saved = true;
        } catch (error) {
          if (error.code !== 11000) {
            throw error;
          }
        }
      }

      if (!saved) {
        throw new Error(
          `Could not generate a unique reference for booking ${booking._id}`
        );
      }
    }

    console.log("Booking reference migration completed.");
    console.log(`Updated bookings: ${updatedCount}`);
  } catch (error) {
    console.error("Booking migration failed:", error);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
}

backfillBookingReferences();
