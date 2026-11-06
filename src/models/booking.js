
import mongoose from "mongoose";
import { randomBytes } from "crypto";

const bookingSchema = new mongoose.Schema(
  {
    // Unique reference guests can use to check their bookings
    bookingReference: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },

    cottage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cottage",
      required: true,
    },

    guestName: {
      type: String,
      required: true,
      trim: true,
    },

    guestEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    guestPhone: {
      type: String,
      required: true,
      trim: true,
    },

    checkIn: {
      type: Date,
      required: true,
    },

    checkOut: {
      type: Date,
      required: true,
    },

    guests: {
      type: Number,
      required: true,
      min: 1,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "cancelled",
        "rejected",
      ],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
  },
  { timestamps: true }
);

// Generate a booking reference automatically
bookingSchema.pre("validate", function () {
  if (!this.bookingReference) {
    const year = new Date().getFullYear();

    const uniqueCode = randomBytes(4)
      .toString("hex")
      .toUpperCase();

    this.bookingReference = `LV-${year}-${uniqueCode}`;
  }
});

// Improve booking availability queries
bookingSchema.index({
  cottage: 1,
  status: 1,
  checkIn: 1,
  checkOut: 1,
});

const Booking =
  mongoose.models.Booking ||
  mongoose.model("Booking", bookingSchema);

export default Booking;
