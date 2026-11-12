
import mongoose from "mongoose";

const bookingSettingsSchema = new mongoose.Schema(
  {
    advancePercentage: {
      type: Number,
      enum: [30, 50],
      default: 30,
    },

    paymentMethods: {
      bkash: {
        enabled: { type: Boolean, default: true },
        accountNumber: { type: String, default: "", trim: true },
        accountName: { type: String, default: "", trim: true },
        instructions: { type: String, default: "", trim: true },
      },

      nagad: {
        enabled: { type: Boolean, default: true },
        accountNumber: { type: String, default: "", trim: true },
        accountName: { type: String, default: "", trim: true },
        instructions: { type: String, default: "", trim: true },
      },

      bank: {
        enabled: { type: Boolean, default: true },
        bankName: { type: String, default: "", trim: true },
        accountName: { type: String, default: "", trim: true },
        accountNumber: { type: String, default: "", trim: true },
        branchName: { type: String, default: "", trim: true },
        routingNumber: { type: String, default: "", trim: true },
        instructions: { type: String, default: "", trim: true },
      },
    },

    paymentDeadlineHours: {
      type: Number,
      default: 2,
      min: 1,
      max: 48,
    },

    bookingEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const BookingSettings =
  mongoose.models.BookingSettings ||
  mongoose.model("BookingSettings", bookingSettingsSchema);

export default BookingSettings;
