
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

    // Booking source: online customer or resort front desk
    bookingSource: {
      type: String,
      enum: ["online", "front_desk"],
      default: "online",
      required: true,
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

    // Optional for front desk bookings
    guestEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
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

    // Required for online booking; not required for front desk booking
    advancePercentage: {
      type: Number,
      enum: [30, 50],
    },

    paymentAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    // Original online advance payment method
    paymentMethod: {
      type: String,
      enum: ["bkash", "nagad", "bank"],
    },

    transactionId: {
      type: String,
      trim: true,
      maxlength: 100,
    },

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

    // All additional payments actually received by the resort admin
    payments: [
      {
        amount: {
          type: Number,
          required: true,
          min: 1,
        },

        method: {
          type: String,
          enum: ["cash", "bkash", "nagad", "bank"],
          required: true,
        },

        reference: {
          type: String,
          trim: true,
          maxlength: 100,
          default: "",
        },

        note: {
          type: String,
          trim: true,
          maxlength: 500,
          default: "",
        },

        paidAt: {
          type: Date,
          default: Date.now,
        },

        recordedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

// Generate a unique booking reference
bookingSchema.pre("validate", function () {
  if (!this.bookingReference) {
    const year = new Date().getFullYear();
    const uniqueCode = randomBytes(4).toString("hex").toUpperCase();

    this.bookingReference = `LV-${year}-${uniqueCode}`;
  }
});

// Booking indexes
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

bookingSchema.index({
  bookingSource: 1,
  createdAt: -1,
});

// Check whether an already compiled model has the latest schema
const existingBookingModel = mongoose.models.Booking;

const existingPaymentStatus = existingBookingModel?.schema
  .path("paymentStatus")
  ?.enumValues;

const existingPaymentsSchema = existingBookingModel?.schema
  .path("payments")
  ?.schema;

const hasSubmittedPaymentStatus =
  existingPaymentStatus?.includes("submitted");

const hasRecordedByField =
  existingPaymentsSchema?.path("recordedBy") !== undefined;

const hasPaymentAmountField =
  existingPaymentsSchema?.path("amount") !== undefined;

const hasBookingSourceField =
  existingBookingModel?.schema.path("bookingSource") !== undefined;

const guestEmailIsOptional =
  existingBookingModel?.schema.path("guestEmail")?.isRequired === false;

// Recompile the model if its cached schema is outdated
if (
  existingBookingModel &&
  (!hasSubmittedPaymentStatus ||
    !hasRecordedByField ||
    !hasPaymentAmountField ||
    !hasBookingSourceField ||
    !guestEmailIsOptional)
) {
  mongoose.deleteModel("Booking");
}

const Booking =
  mongoose.models.Booking ||
  mongoose.model("Booking", bookingSchema);

export default Booking;
