
import mongoose from "mongoose";
import { randomBytes } from "crypto";

const restaurantOrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },

    orderType: {
      type: String,
      enum: ["walk-in", "cottage"],
      required: true,
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },

    cottage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cottage",
      default: null,
    },

    guestName: {
      type: String,
      trim: true,
      default: "",
    },

    guestPhone: {
      type: String,
      trim: true,
      default: "",
    },

    items: [
      {
        itemType: {
          type: String,
          enum: ["menu", "custom"],
          default: "menu",
        },

        menuItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem",
          default: null,
        },

        name: {
          type: String,
          required: true,
          trim: true,
        },

        price: {
          type: Number,
          required: true,
          min: 0,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },

        lineTotal: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    extraCharges: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
          maxlength: 100,
        },

        amount: {
          type: Number,
          required: true,
          min: 0.01,
        },
      },
    ],

    extraChargesTotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMode: {
      type: String,
      enum: ["pay_now", "cottage_bill"],
      required: true,
    },

    // New orders use only unpaid or paid.
    // Historical partially_paid records are preserved in the database.
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partially_paid", "paid"],
      default: "unpaid",
    },

    // Keep payment records for financial history and auditing.
    // New pay_now orders receive one full payment record.
    payments: [
      {
        amount: {
          type: Number,
          required: true,
          min: 0.01,
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

    // References to existing booking payments.
    // These are not new payments.
    checkoutPaymentAllocations: [
      {
        bookingPaymentId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },

        amount: {
          type: Number,
          required: true,
          min: 0.01,
        },

        allocatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    orderStatus: {
      type: String,
      enum: ["open", "completed", "cancelled"],
      default: "open",
    },

    note: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

restaurantOrderSchema.pre("validate", function () {
  if (!this.orderNumber) {
    const year = new Date().getFullYear();
    const code = randomBytes(4).toString("hex").toUpperCase();

    this.orderNumber = `LV-FOOD-${year}-${code}`;
  }
});

restaurantOrderSchema.index({ createdAt: -1 });
restaurantOrderSchema.index({ orderStatus: 1, createdAt: -1 });
restaurantOrderSchema.index({ booking: 1, createdAt: -1 });
restaurantOrderSchema.index({ paymentStatus: 1, createdAt: -1 });

if (
  mongoose.models.RestaurantOrder &&
  !mongoose.models.RestaurantOrder.schema.path(
    "checkoutPaymentAllocations"
  )
) {
  delete mongoose.models.RestaurantOrder;
}

const RestaurantOrder =
  mongoose.models.RestaurantOrder ||
  mongoose.model("RestaurantOrder", restaurantOrderSchema);

export default RestaurantOrder;
