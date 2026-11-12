
import mongoose from "mongoose";
import { randomBytes } from "crypto";

const bookingSchema = new mongoose.Schema(
  {
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

    // Advance payment information
    advancePercentage: {
      type: Number,
      enum: [30, 50],
    },

    paymentAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["bkash", "nagad", "bank"],
    },

    transactionId: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    // Store private Cloudinary asset information, not a public image URL
    paymentProof: {
      publicId: {
        type: String,
        trim: true,
      },
      format: {
        type: String,
        trim: true,
      },
      bytes: {
        type: Number,
        min: 0,
      },
    },

    paymentStatus: {
      type: String,
      enum: [
        "unpaid",
        "submitted",
        "verified",
        "rejected",
        "refunded",
      ],
      default: "unpaid",
    },

    paymentDeadline: {
      type: Date,
    },

    paymentVerifiedAt: {
      type: Date,
    },

    paymentVerifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    paymentRejectionReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
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
  },
  { timestamps: true }
);

bookingSchema.pre("validate", function () {
  if (!this.bookingReference) {
    const year = new Date().getFullYear();
    const uniqueCode = randomBytes(4).toString("hex").toUpperCase();

    this.bookingReference = `LV-${year}-${uniqueCode}`;
  }
});

bookingSchema.index({
  cottage: 1,
  status: 1,
  checkIn: 1,
  checkOut: 1,
});

bookingSchema.index({
  cottage: 1,
  paymentDeadline: 1,
  status: 1,
});

const Booking =
  mongoose.models.Booking &&
  !mongoose.models.Booking.schema.path("paymentStatus").enumValues.includes("submitted")
    ? (mongoose.deleteModel("Booking"), mongoose.model("Booking", bookingSchema))
    : mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

export default Booking;
