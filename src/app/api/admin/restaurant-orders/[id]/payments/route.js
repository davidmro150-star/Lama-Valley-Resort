
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import RestaurantOrder from "@/models/RestaurantOrder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function verifyAdmin() {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    return null;
  }

  return session;
}

export async function POST(request, { params }) {
  try {
    const session = await verifyAdmin();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 403 }
      );
    }

    const adminId = session.user.id || session.user._id;

    if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
      return NextResponse.json(
        { success: false, message: "Invalid admin account." },
        { status: 400 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid restaurant order ID." },
        { status: 400 }
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid request data." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid request data." },
        { status: 400 }
      );
    }

    const method = body.method;

    const reference =
      typeof body.reference === "string"
        ? body.reference.trim()
        : "";

    const note =
      typeof body.note === "string"
        ? body.note.trim()
        : "";

    const allowedMethods = ["cash", "bkash", "nagad", "bank"];

    if (!allowedMethods.includes(method)) {
      return NextResponse.json(
        { success: false, message: "Invalid payment method." },
        { status: 400 }
      );
    }

    if (reference.length > 100 || note.length > 500) {
      return NextResponse.json(
        { success: false, message: "Reference or note is too long." },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await RestaurantOrder.findById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Restaurant order not found." },
        { status: 404 }
      );
    }

    if (order.orderStatus === "cancelled") {
      return NextResponse.json(
        {
          success: false,
          message: "Payments cannot be added to a cancelled order.",
        },
        { status: 400 }
      );
    }

    if (order.paymentMode === "cottage_bill") {
      return NextResponse.json(
        {
          success: false,
          message:
            "This order belongs to the cottage bill. Record payment through the booking checkout instead.",
        },
        { status: 400 }
      );
    }

    if (order.paymentMode !== "pay_now") {
      return NextResponse.json(
        { success: false, message: "Invalid restaurant payment mode." },
        { status: 400 }
      );
    }

    // A restaurant order must be paid in one full transaction.
    if (order.paymentStatus === "paid" || order.payments?.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "A payment has already been recorded for this order.",
        },
        { status: 400 }
      );
    }

    const amount = Number(order.total);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid restaurant order total." },
        { status: 400 }
      );
    }

    order.payments = [
      {
        amount,
        method,
        reference,
        note,
        paidAt: new Date(),
        recordedBy: adminId,
      },
    ];

    order.paymentStatus = "paid";

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Full restaurant payment recorded successfully.",
      paymentSummary: {
        orderTotal: amount,
        totalPaid: amount,
        outstanding: 0,
        paymentStatus: "paid",
      },
    });
  } catch (error) {
    console.error("Restaurant payment POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to record restaurant payment.",
      },
      { status: 500 }
    );
  }
}
