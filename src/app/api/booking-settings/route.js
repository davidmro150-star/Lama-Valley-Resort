
import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import BookingSettings from "@/models/BookingSettings";

export const dynamic = "force-dynamic";

const defaultSettings = {
  advancePercentage: 30,
  paymentMethods: {
    bkash: {
      enabled: false,
      accountNumber: "",
      accountName: "",
      instructions: "",
    },
    nagad: {
      enabled: false,
      accountNumber: "",
      accountName: "",
      instructions: "",
    },
    bank: {
      enabled: false,
      bankName: "",
      accountName: "",
      accountNumber: "",
      branchName: "",
      routingNumber: "",
      instructions: "",
    },
  },
  paymentDeadlineHours: 2,
  bookingEnabled: false,
};

export async function GET() {
  try {
    await connectDB();

    const settings = await BookingSettings.findOne()
      .select(
        "advancePercentage paymentMethods paymentDeadlineHours bookingEnabled"
      )
      .lean();

    const currentSettings = settings || defaultSettings;

    return NextResponse.json(
      {
        success: true,
        settings: {
          advancePercentage: currentSettings.advancePercentage,
          paymentMethods: currentSettings.paymentMethods,
          paymentDeadlineHours: currentSettings.paymentDeadlineHours,
          bookingEnabled: currentSettings.bookingEnabled,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Public booking settings error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load booking settings.",
      },
      { status: 500 }
    );
  }
}
