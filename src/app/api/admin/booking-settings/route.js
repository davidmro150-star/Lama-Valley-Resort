
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import BookingSettings from "@/models/BookingSettings";

async function verifyAdmin() {
  const session = await auth();
  return session?.user?.role === "admin";
}

const defaultSettings = {
  advancePercentage: 30,
  paymentMethods: {
    bkash: {
      enabled: true,
      accountNumber: "",
      accountName: "",
      instructions: "",
    },
    nagad: {
      enabled: true,
      accountNumber: "",
      accountName: "",
      instructions: "",
    },
    bank: {
      enabled: true,
      bankName: "",
      accountName: "",
      accountNumber: "",
      branchName: "",
      routingNumber: "",
      instructions: "",
    },
  },
  paymentDeadlineHours: 2,
  bookingEnabled: true,
};

export async function GET() {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    await connectDB();

    let settings = await BookingSettings.findOne();

    if (!settings) {
      settings = await BookingSettings.create(defaultSettings);
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Booking settings GET error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load booking settings." },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();

    const {
      advancePercentage,
      paymentMethods,
      paymentDeadlineHours,
      bookingEnabled,
    } = body;

    if (![30, 50].includes(advancePercentage)) {
      return NextResponse.json(
        { success: false, message: "Advance payment must be 30% or 50%." },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(paymentDeadlineHours) ||
      paymentDeadlineHours < 1 ||
      paymentDeadlineHours > 48
    ) {
      return NextResponse.json(
        { success: false, message: "Payment deadline must be between 1 and 48 hours." },
        { status: 400 }
      );
    }

    if (typeof bookingEnabled !== "boolean") {
      return NextResponse.json(
        { success: false, message: "Invalid booking status." },
        { status: 400 }
      );
    }

    if (!paymentMethods || typeof paymentMethods !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid payment methods." },
        { status: 400 }
      );
    }

    const methodNames = ["bkash", "nagad", "bank"];

    for (const method of methodNames) {
      if (
        !paymentMethods[method] ||
        typeof paymentMethods[method].enabled !== "boolean"
      ) {
        return NextResponse.json(
          { success: false, message: `Invalid ${method} configuration.` },
          { status: 400 }
        );
      }
    }

    const enabledMethods = methodNames.filter(
      (method) => paymentMethods[method].enabled
    );

    if (bookingEnabled && enabledMethods.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Enable at least one payment method before accepting bookings.",
        },
        { status: 400 }
      );
    }

    const cleanText = (value, maxLength = 300) => {
      if (typeof value !== "string") return "";
      return value.trim().slice(0, maxLength);
    };

    const cleanMethod = (method, fields) => {
      const result = {
        enabled: paymentMethods[method].enabled,
      };

      for (const field of fields) {
        result[field] = cleanText(paymentMethods[method][field]);
      }

      return result;
    };

    const updatedSettings = {
      advancePercentage,
      paymentDeadlineHours,
      bookingEnabled,

      paymentMethods: {
        bkash: cleanMethod("bkash", [
          "accountNumber",
          "accountName",
          "instructions",
        ]),

        nagad: cleanMethod("nagad", [
          "accountNumber",
          "accountName",
          "instructions",
        ]),

        bank: cleanMethod("bank", [
          "bankName",
          "accountName",
          "accountNumber",
          "branchName",
          "routingNumber",
          "instructions",
        ]),
      },
    };

    if (bookingEnabled) {
      for (const method of enabledMethods) {
        const details = paymentMethods[method];

        const requiredFields =
          method === "bank"
            ? ["bankName", "accountName", "accountNumber"]
            : ["accountNumber", "accountName"];

        const missingDetails = requiredFields.some(
          (field) => !cleanText(details[field])
        );

        if (missingDetails) {
          return NextResponse.json(
            {
              success: false,
              message: `Please complete the required ${method} account details.`,
            },
            { status: 400 }
          );
        }
      }
    }

    const settings = await BookingSettings.findOneAndUpdate(
      {},
      { $set: updatedSettings },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Booking settings updated successfully.",
      settings,
    });
  } catch (error) {
    console.error("Booking settings PUT error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update booking settings." },
      { status: 500 }
    );
  }
}
