import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
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
        "expired",
      ],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },

    // Pending booking expiry time
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

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