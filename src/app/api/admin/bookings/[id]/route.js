
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";

import sendBookingConfirmation from "@/lib/sendBookingConfirmation";
import sendBookingCancellation from "@/lib/sendBookingCancellation";
import sendBookingRejection from "@/lib/sendBookingRejection";

import Booking from "@/models/booking";
import Cottage from "@/models/Cottage";
import RestaurantOrder from "@/models/RestaurantOrder";

// Round money to two decimal places.
function money(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

// Allocate booking checkout payments to restaurant orders.
// Booking payments first cover the outstanding cottage balance.
// Any excess is allocated to restaurant orders without duplicating payments.
async function synchronizeRestaurantPayments(
  booking,
  restaurantOrders,
  session
) {
  const verifiedAdvance =
    booking.paymentStatus === "verified"
      ? money(booking.paymentAmount)
      : 0;

  let remainingCottageBalance = Math.max(
    0,
    money(booking.totalPrice) - verifiedAdvance
  );

  const sortedPayments = [...(booking.payments || [])].sort(
    (a, b) =>
      new Date(a.paidAt || 0).getTime() -
      new Date(b.paidAt || 0).getTime()
  );

  const sortedOrders = [...restaurantOrders].sort(
    (a, b) =>
      new Date(a.createdAt || 0).getTime() -
      new Date(b.createdAt || 0).getTime()
  );

  const allocationsByOrder = new Map();

  for (const order of sortedOrders) {
    allocationsByOrder.set(order._id.toString(), []);
  }

  // Process booking payments in chronological order.
  for (const payment of sortedPayments) {
    let availableAmount = money(payment.amount);

    // First, pay the remaining cottage accommodation balance.
    const cottageContribution = Math.min(
      availableAmount,
      remainingCottageBalance
    );

    availableAmount = money(
      availableAmount - cottageContribution
    );

    remainingCottageBalance = money(
      remainingCottageBalance - cottageContribution
    );

    if (availableAmount <= 0) {
      continue;
    }

    // Any excess can cover restaurant orders that existed
    // when the payment was recorded.
    const paymentDate = new Date(
      payment.paidAt || booking.createdAt || Date.now()
    );

    for (const order of sortedOrders) {
      if (availableAmount <= 0) {
        break;
      }

      if (
        order.orderStatus === "cancelled" ||
        new Date(order.createdAt).getTime() > paymentDate.getTime()
      ) {
        continue;
      }

      const directPayments = (order.payments || []).reduce(
        (total, item) => total + money(item.amount),
        0
      );

      const currentAllocations =
        allocationsByOrder.get(order._id.toString()) || [];

      const alreadyAllocated = currentAllocations.reduce(
        (total, item) => total + money(item.amount),
        0
      );

      const orderBalance = Math.max(
        0,
        money(
          money(order.total) -
            directPayments -
            alreadyAllocated
        )
      );

      if (orderBalance <= 0) {
        continue;
      }

      const allocationAmount = Math.min(
        availableAmount,
        orderBalance
      );

      currentAllocations.push({
        bookingPaymentId: payment._id,
        amount: money(allocationAmount),
        allocatedAt: payment.paidAt || new Date(),
      });

      allocationsByOrder.set(
        order._id.toString(),
        currentAllocations
      );

      availableAmount = money(
        availableAmount - allocationAmount
      );
    }
  }

  // Save allocation references and synchronize payment statuses.
  for (const order of restaurantOrders) {
    const allocations =
      allocationsByOrder.get(order._id.toString()) || [];

    order.checkoutPaymentAllocations = allocations;

    const directPayments = (order.payments || []).reduce(
      (total, payment) => total + money(payment.amount),
      0
    );

    const checkoutAllocations = allocations.reduce(
      (total, allocation) =>
        total + money(allocation.amount),
      0
    );

    const orderReceived = money(
      directPayments + checkoutAllocations
    );

    if (orderReceived >= money(order.total)) {
      order.paymentStatus = "paid";
    } else if (orderReceived > 0) {
      order.paymentStatus = "partially_paid";
    } else {
      order.paymentStatus = "unpaid";
    }

    await order.save({ session });
  }
}

export async function PATCH(request, { params }) {
  try {
    // 1. Verify administrator authentication.
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    // 2. Validate booking ID.
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid booking ID." },
        { status: 400 }
      );
    }

    // 3. Validate request body.
    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid request body." },
        { status: 400 }
      );
    }

    await connectDB();

    // 4. Find booking.
    const existingBooking = await Booking.findById(id);

    if (!existingBooking) {
      return NextResponse.json(
        { success: false, message: "Booking not found." },
        { status: 404 }
      );
    }

    // 5. Synchronize existing payments without recording new money.
    if (body?.action === "sync-restaurant-payments") {
      const dbSession = await mongoose.startSession();

      let syncResult = null;

      try {
        await dbSession.withTransaction(async () => {
          const booking = await Booking.findById(id).session(
            dbSession
          );

          if (!booking) {
            syncResult = {
              status: 404,
              data: {
                success: false,
                message: "Booking not found.",
              },
            };

            return;
          }

          // Confirmed front-desk bookings do not need
          // an online advance payment to synchronize payments.
          if (
            booking.status !== "confirmed" ||
            (
              booking.bookingSource !== "front_desk" &&
              booking.paymentStatus !== "verified"
            )
          ) {
            syncResult = {
              status: 409,
              data: {
                success: false,
                message:
                  "Only confirmed front-desk bookings or confirmed bookings with verified online advances can be synchronized.",
              },
            };

            return;
          }

          const restaurantOrders = await RestaurantOrder.find({
            booking: booking._id,
            orderStatus: { $ne: "cancelled" },
          })
            .sort({ createdAt: 1 })
            .session(dbSession);

          await synchronizeRestaurantPayments(
            booking,
            restaurantOrders,
            dbSession
          );

          const allocatedTotal = restaurantOrders.reduce(
            (total, order) =>
              total +
              (order.checkoutPaymentAllocations || []).reduce(
                (sum, allocation) =>
                  sum + money(allocation.amount),
                0
              ),
            0
          );

          const paidOrders = restaurantOrders.filter(
            (order) => order.paymentStatus === "paid"
          ).length;

          syncResult = {
            status: 200,
            data: {
              success: true,
              message:
                "Existing payments synchronized successfully. No new payment was recorded.",
              restaurantOrdersUpdated: restaurantOrders.length,
              paidOrders,
              checkoutAllocations: money(allocatedTotal),
            },
          };
        });
      } finally {
        await dbSession.endSession();
      }

      if (!syncResult) {
        return NextResponse.json(
          {
            success: false,
            message: "Unable to synchronize payments.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json(syncResult.data, {
        status: syncResult.status,
      });
    }

    // 6. Record additional / combined checkout payment.
    if (body?.action === "record-payment") {
      const adminId = session.user.id || session.user._id;

      if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Your administrator account ID is missing or invalid. Please sign in again.",
          },
          { status: 400 }
        );
      }

      const amount = Number(body.amount);

      if (
        !Number.isFinite(amount) ||
        amount <= 0 ||
        Math.round(amount * 100) !== amount * 100
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Enter a valid payment amount with up to 2 decimal places.",
          },
          { status: 400 }
        );
      }

      const allowedMethods = ["cash", "bkash", "nagad", "bank"];

      if (!allowedMethods.includes(body.method)) {
        return NextResponse.json(
          {
            success: false,
            message: "Please select a valid payment method.",
          },
          { status: 400 }
        );
      }

      const reference =
        typeof body.reference === "string"
          ? body.reference.trim()
          : "";

      const note =
        typeof body.note === "string"
          ? body.note.trim()
          : "";

      if (reference.length > 100 || note.length > 500) {
        return NextResponse.json(
          {
            success: false,
            message: "Reference or note is too long.",
          },
          { status: 400 }
        );
      }

      const dbSession = await mongoose.startSession();

      let paymentResult = null;

      try {
        await dbSession.withTransaction(async () => {
          paymentResult = null;

          // Get the latest booking inside the transaction.
          const booking = await Booking.findById(id).session(
            dbSession
          );

          if (!booking) {
            paymentResult = {
              status: 404,
              data: {
                success: false,
                message: "Booking not found.",
              },
            };

            return;
          }

          // Front-desk bookings can receive payments when confirmed.
          // Online bookings still require a verified advance payment.
          if (
            booking.status !== "confirmed" ||
            (
              booking.bookingSource !== "front_desk" &&
              booking.paymentStatus !== "verified"
            )
          ) {
            paymentResult = {
              status: 409,
              data: {
                success: false,
                message:
                  "Additional payments can only be recorded for confirmed front-desk bookings or confirmed bookings with verified online advances.",
              },
            };

            return;
          }

          // Load every non-cancelled restaurant order linked to this booking.
          const restaurantOrders = await RestaurantOrder.find({
            booking: booking._id,
            orderStatus: { $ne: "cancelled" },
          })
            .sort({ createdAt: 1 })
            .session(dbSession);

          // Only count an advance payment after it has been verified.
          const verifiedAdvance =
            booking.paymentStatus === "verified"
              ? money(booking.paymentAmount)
              : 0;

          const bookingAdditionalPayments = (
            booking.payments || []
          ).reduce(
            (total, payment) =>
              total + money(payment.amount),
            0
          );

          const restaurantTotal = restaurantOrders.reduce(
            (total, order) =>
              total + money(order.total),
            0
          );

          const restaurantDirectPayments =
            restaurantOrders.reduce(
              (total, order) => {
                const directPayments = (
                  order.payments || []
                ).reduce(
                  (sum, payment) =>
                    sum + money(payment.amount),
                  0
                );

                return total + directPayments;
              },
              0
            );

          const cottageTotal = money(booking.totalPrice);

          const grandTotal = money(
            cottageTotal + restaurantTotal
          );

          // Checkout allocations are references to booking payments.
          // Do not count them again.
          const totalReceived = money(
            verifiedAdvance +
              bookingAdditionalPayments +
              restaurantDirectPayments
          );

          const outstandingAmount = Math.max(
            0,
            money(grandTotal - totalReceived)
          );

          if (amount > outstandingAmount) {
            paymentResult = {
              status: 400,
              data: {
                success: false,
                message: `The maximum amount you can record is ৳${outstandingAmount.toFixed(2)}.`,
                outstandingAmount,
                grandTotal,
                totalReceived,
              },
            };

            return;
          }

          // Record the payment once in the booking.
          booking.payments.push({
            amount,
            method: body.method,
            reference,
            note,
            paidAt: new Date(),
            recordedBy: new mongoose.Types.ObjectId(adminId),
          });

          await booking.save({ session: dbSession });

          // Allocate the booking payments to restaurant orders.
          await synchronizeRestaurantPayments(
            booking,
            restaurantOrders,
            dbSession
          );

          const updatedBookingPayments = (
            booking.payments || []
          ).reduce(
            (total, payment) =>
              total + money(payment.amount),
            0
          );

          const updatedTotalReceived = money(
            verifiedAdvance +
              updatedBookingPayments +
              restaurantDirectPayments
          );

          const remainingBalance = Math.max(
            0,
            money(grandTotal - updatedTotalReceived)
          );

          const allocatedRestaurantPayments =
            restaurantOrders.reduce(
              (total, order) => {
                const allocated = (
                  order.checkoutPaymentAllocations || []
                ).reduce(
                  (sum, allocation) =>
                    sum + money(allocation.amount),
                  0
                );

                return total + allocated;
              },
              0
            );

          paymentResult = {
            status: 200,
            data: {
              success: true,
              message:
                "Checkout payment recorded and restaurant payment statuses synchronized successfully.",
              booking: {
                id: booking._id.toString(),
                status: booking.status,
                cottageTotal,
                restaurantTotal,
                grandTotal,
                totalReceived: updatedTotalReceived,
                remainingBalance,
                restaurantDirectPayments,
                restaurantCheckoutAllocations:
                  allocatedRestaurantPayments,
              },
            },
          };
        });
      } finally {
        await dbSession.endSession();
      }

      if (!paymentResult) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Unable to calculate the checkout balance. Please try again.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json(paymentResult.data, {
        status: paymentResult.status,
      });
    }

    // 7. Payment verification action.
    if (body?.action === "verify-payment") {
      if (existingBooking.status !== "pending") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Only pending bookings can have their payment verified.",
          },
          { status: 409 }
        );
      }

      if (existingBooking.paymentStatus !== "submitted") {
        return NextResponse.json(
          {
            success: false,
            message:
              "This payment is not awaiting verification.",
          },
          { status: 409 }
        );
      }

      if (
        !existingBooking.transactionId ||
        !existingBooking.paymentProof?.publicId ||
        !existingBooking.paymentAmount ||
        existingBooking.paymentAmount <= 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Payment details or screenshot are incomplete.",
          },
          { status: 400 }
        );
      }

      const adminId = session.user.id || session.user._id;

      const updateFields = {
        paymentStatus: "verified",
        paymentVerifiedAt: new Date(),
      };

      if (
        adminId &&
        mongoose.Types.ObjectId.isValid(adminId)
      ) {
        updateFields.paymentVerifiedBy = adminId;
      }

      const booking = await Booking.findOneAndUpdate(
        {
          _id: id,
          status: "pending",
          paymentStatus: "submitted",
        },
        {
          $set: updateFields,
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!booking) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Payment has already been updated. Please refresh.",
          },
          { status: 409 }
        );
      }

      return NextResponse.json({
        success: true,
        message:
          "Payment verified successfully. You can now confirm this booking.",
        booking: {
          id: booking._id.toString(),
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          paymentAmount: booking.paymentAmount,
        },
      });
    }

    // 8. Validate booking status action.
    const { status } = body || {};

    const allowedStatuses = [
      "confirmed",
      "rejected",
      "cancelled",
    ];

    if (
      typeof status !== "string" ||
      !allowedStatuses.includes(status)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid booking action.",
        },
        { status: 400 }
      );
    }

    // 9. Determine required previous booking status.
    const requiredPreviousStatus =
      status === "cancelled" ? "confirmed" : "pending";

    if (
      status === "confirmed" &&
      existingBooking.paymentStatus !== "verified"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please verify the guest's payment before confirming this booking.",
        },
        { status: 400 }
      );
    }

    // 10. Atomically update booking.
    const updateQuery = {
      _id: id,
      status: requiredPreviousStatus,
    };

    if (status === "confirmed") {
      updateQuery.paymentStatus = "verified";
    }

    const booking = await Booking.findOneAndUpdate(
      updateQuery,
      {
        $set: { status },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This booking has already been updated or its current status does not allow this action.",
        },
        { status: 409 }
      );
    }

    // 11. Send appropriate email.
    let emailSent = false;

    try {
      await booking.populate("cottage", "name");

      let emailResult;

      if (status === "confirmed") {
        emailResult = await sendBookingConfirmation(booking);
      } else if (status === "cancelled") {
        emailResult = await sendBookingCancellation(booking);
      } else if (status === "rejected") {
        emailResult = await sendBookingRejection(booking);
      }

      emailSent = Boolean(emailResult?.messageId);

      if (emailSent) {
        console.log(
          `Booking ${status} email sent: ${booking._id}`
        );
      }
    } catch (emailError) {
      console.error(
        `Booking ${status} email error:`,
        emailError
      );
    }

    // 12. Prepare response message.
    let message;

    if (status === "confirmed") {
      message = emailSent
        ? "Booking confirmed and confirmation email sent successfully."
        : "Booking confirmed, but the confirmation email could not be sent.";
    } else if (status === "cancelled") {
      message = emailSent
        ? "Booking cancelled and cancellation email sent successfully."
        : "Booking cancelled, but the cancellation email could not be sent.";
    } else {
      message = emailSent
        ? "Booking rejected and notification email sent successfully."
        : "Booking rejected, but the notification email could not be sent.";
    }

    return NextResponse.json({
      success: true,
      message,
      emailSent,
      booking: {
        id: booking._id.toString(),
        status: booking.status,
        paymentStatus: booking.paymentStatus,
      },
    });
  } catch (error) {
    console.error("Admin booking update error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update booking. Please try again.",
      },
      { status: 500 }
    );
  }
}
