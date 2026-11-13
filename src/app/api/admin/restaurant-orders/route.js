
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";

import RestaurantOrder from "@/models/RestaurantOrder";
import MenuItem from "@/models/MenuItem";
import Booking from "@/models/booking";
import Cottage from "@/models/Cottage";

export const dynamic = "force-dynamic";

const roundMoney = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

async function verifyAdmin() {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    return null;
  }

  return session;
}

// Validate a date and get its Bangladesh calendar-day boundaries.
function getDhakaDateRange(dateString) {
  if (
    typeof dateString !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dateString)
  ) {
    return null;
  }

  const [year, month, day] = dateString.split("-").map(Number);
  const checkDate = new Date(Date.UTC(year, month - 1, day));

  if (
    checkDate.getUTCFullYear() !== year ||
    checkDate.getUTCMonth() !== month - 1 ||
    checkDate.getUTCDate() !== day
  ) {
    return null;
  }

  const start = new Date(`${dateString}T00:00:00+06:00`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  return { start, end };
}

// GET: Fetch restaurant orders
export async function GET() {
  try {
    const session = await verifyAdmin();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 403 }
      );
    }

    await connectDB();

    const orders = await RestaurantOrder.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .populate("booking", "bookingReference guestName")
      .populate("cottage", "name")
      .populate("createdBy", "name")
      .lean();

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Restaurant orders GET error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load restaurant orders." },
      { status: 500 }
    );
  }
}

// POST: Create restaurant order
export async function POST(request) {
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

    await connectDB();

    const body = await request.json();

    const {
      orderType,
      bookingId,
      selectedDate,
      items,
      extraCharges = [],
      discount = 0,
      paymentMode,
      guestName = "",
      guestPhone = "",
      note = "",
    } = body;

    // Validate order type
    if (!["walk-in", "cottage"].includes(orderType)) {
      return NextResponse.json(
        { success: false, message: "Invalid order type." },
        { status: 400 }
      );
    }

    // Validate payment mode
    if (!["pay_now", "cottage_bill"].includes(paymentMode)) {
      return NextResponse.json(
        { success: false, message: "Invalid payment mode." },
        { status: 400 }
      );
    }

    if (orderType === "walk-in" && paymentMode !== "pay_now") {
      return NextResponse.json(
        {
          success: false,
          message: "Walk-in orders must use pay now.",
        },
        { status: 400 }
      );
    }

    if (orderType === "walk-in" && !guestName.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer name is required for walk-in orders.",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length < 1 || items.length > 50) {
      return NextResponse.json(
        { success: false, message: "Add between 1 and 50 food items." },
        { status: 400 }
      );
    }

    if (!Array.isArray(extraCharges) || extraCharges.length > 20) {
      return NextResponse.json(
        { success: false, message: "Invalid additional charges." },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(Number(discount)) ||
      Number(discount) < 0 ||
      roundMoney(discount) !== Number(discount)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid discount amount." },
        { status: 400 }
      );
    }

    if (
      typeof guestName !== "string" ||
      guestName.length > 100 ||
      typeof guestPhone !== "string" ||
      guestPhone.length > 30 ||
      typeof note !== "string" ||
      note.length > 500
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid customer or order details." },
        { status: 400 }
      );
    }

    // Separate website menu items and custom items
    const menuQuantities = new Map();
    const customItems = [];

    for (const item of items) {
      const itemType = item.itemType || "menu";
      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 100
      ) {
        return NextResponse.json(
          { success: false, message: "Invalid food quantity." },
          { status: 400 }
        );
      }

      if (itemType === "menu") {
        if (
          !item.menuItemId ||
          !mongoose.Types.ObjectId.isValid(item.menuItemId)
        ) {
          return NextResponse.json(
            { success: false, message: "Invalid menu item." },
            { status: 400 }
          );
        }

        const id = String(item.menuItemId);

        menuQuantities.set(
          id,
          (menuQuantities.get(id) || 0) + quantity
        );
      } else if (itemType === "custom") {
        const name =
          typeof item.name === "string" ? item.name.trim() : "";
        const price = Number(item.price);

        if (
          !name ||
          name.length > 100 ||
          !Number.isFinite(price) ||
          price <= 0 ||
          roundMoney(price) !== price
        ) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid custom food name or price.",
            },
            { status: 400 }
          );
        }

        customItems.push({
          itemType: "custom",
          menuItem: null,
          name,
          price: roundMoney(price),
          quantity,
          lineTotal: roundMoney(price * quantity),
        });
      } else {
        return NextResponse.json(
          { success: false, message: "Invalid food item type." },
          { status: 400 }
        );
      }
    }

    const totalItemCount = menuQuantities.size + customItems.length;

    if (totalItemCount > 50) {
      return NextResponse.json(
        { success: false, message: "Too many food items." },
        { status: 400 }
      );
    }

    // Fetch actual menu prices from database
    const menuIds = [...menuQuantities.keys()];

    const menuDocuments = menuIds.length
      ? await MenuItem.find({
          _id: { $in: menuIds },
          isAvailable: true,
        }).select("name price")
      : [];

    if (menuDocuments.length !== menuIds.length) {
      return NextResponse.json(
        {
          success: false,
          message: "One or more menu items are unavailable.",
        },
        { status: 400 }
      );
    }

    const menuItems = menuDocuments.map((menuItem) => {
      const quantity = menuQuantities.get(String(menuItem._id));
      const price = roundMoney(menuItem.price);

      if (!Number.isFinite(price) || price < 0) {
        throw new Error("Invalid menu price in database.");
      }

      return {
        itemType: "menu",
        menuItem: menuItem._id,
        name: menuItem.name,
        price,
        quantity,
        lineTotal: roundMoney(price * quantity),
      };
    });

    const orderItems = [...menuItems, ...customItems];

    // Calculate food subtotal
    const subtotal = roundMoney(
      orderItems.reduce((sum, item) => sum + item.lineTotal, 0)
    );

    // Validate and calculate additional charges
    const safeExtraCharges = [];

    for (const charge of extraCharges) {
      const name =
        typeof charge.name === "string" ? charge.name.trim() : "";
      const amount = Number(charge.amount);

      if (
        !name ||
        name.length > 100 ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        roundMoney(amount) !== amount
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid additional charge name or amount.",
          },
          { status: 400 }
        );
      }

      safeExtraCharges.push({
        name,
        amount: roundMoney(amount),
      });
    }

    const extraChargesTotal = roundMoney(
      safeExtraCharges.reduce((sum, charge) => sum + charge.amount, 0)
    );

    // Calculate final bill
    const safeDiscount = roundMoney(discount);
    const totalBeforeDiscount = roundMoney(
      subtotal + extraChargesTotal
    );

    if (safeDiscount > totalBeforeDiscount) {
      return NextResponse.json(
        {
          success: false,
          message: "Discount cannot exceed the bill amount.",
        },
        { status: 400 }
      );
    }

    const total = roundMoney(totalBeforeDiscount - safeDiscount);

    if (total <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Order total must be greater than zero.",
        },
        { status: 400 }
      );
    }

    // Validate cottage guest booking against the selected Dhaka date
    let booking = null;
    let cottage = null;
    let finalGuestName = guestName.trim();
    let finalGuestPhone = guestPhone.trim();

    if (orderType === "cottage") {
      if (
        !bookingId ||
        !mongoose.Types.ObjectId.isValid(bookingId)
      ) {
        return NextResponse.json(
          { success: false, message: "Select a valid cottage booking." },
          { status: 400 }
        );
      }

      const dateRange = getDhakaDateRange(selectedDate);

      if (!dateRange) {
        return NextResponse.json(
          {
            success: false,
            message: "Select a valid guest date before creating the order.",
          },
          { status: 400 }
        );
      }

      booking = await Booking.findOne({
        _id: bookingId,
        status: "confirmed",
        checkIn: { $lt: dateRange.end },
        checkOut: { $gte: dateRange.start },
      }).select(
        "bookingReference guestName guestPhone cottage"
      );

      if (!booking) {
        return NextResponse.json(
          {
            success: false,
            message:
              "This guest does not have a confirmed booking for the selected date.",
          },
          { status: 400 }
        );
      }

      cottage = await Cottage.findById(booking.cottage).select("name");

      if (!cottage) {
        return NextResponse.json(
          { success: false, message: "Cottage not found." },
          { status: 404 }
        );
      }

      finalGuestName = booking.guestName || finalGuestName;
      finalGuestPhone = booking.guestPhone || finalGuestPhone;
    }

    // Create order
    const order = await RestaurantOrder.create({
      orderType,
      booking: booking?._id || null,
      cottage: cottage?._id || null,

      guestName: finalGuestName,
      guestPhone: finalGuestPhone,

      items: orderItems,

      subtotal,
      extraCharges: safeExtraCharges,
      extraChargesTotal,

      discount: safeDiscount,
      total,

      paymentMode,
      paymentStatus: "unpaid",
      orderStatus: "open",

      note: note.trim(),
      createdBy: adminId,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Restaurant order created successfully.",
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          subtotal: order.subtotal,
          extraChargesTotal: order.extraChargesTotal,
          discount: order.discount,
          total: order.total,
          paymentMode: order.paymentMode,
          paymentStatus: order.paymentStatus,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Restaurant order POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create restaurant order.",
      },
      { status: 500 }
    );
  }
}
