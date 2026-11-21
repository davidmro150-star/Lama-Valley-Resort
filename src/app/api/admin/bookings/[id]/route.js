
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import { authorizeApiRequest } from "@/lib/authorize";
import { PERMISSIONS } from "@/lib/permissions";

import sendBookingConfirmation from "@/lib/sendBookingConfirmation";
import sendBookingCancellation from "@/lib/sendBookingCancellation";
import sendBookingRejection from "@/lib/sendBookingRejection";

import { getCloudinary } from "@/lib/cloudinary";

import Booking from "@/models/booking";
import Cottage from "@/models/Cottage";
import RestaurantOrder from "@/models/RestaurantOrder";

// Round money to two decimal places.
function money(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

// Get the authenticated Admin or Manager ID.
function validStaffId(session) {
  const staffId = session?.user?.id || session?.user?._id;

  return staffId && mongoose.Types.ObjectId.isValid(staffId)
    ? staffId
    : null;
}

// Calculate payments made directly against restaurant orders.
function getDirectRestaurantPayments(restaurantOrders) {
  return money(
    restaurantOrders.reduce((total, order) => {
      const directPayments = (order.payments || []).reduce(
        (sum, payment) => sum + money(payment.amount),
        0
      );

      return total + directPayments;
    }, 0)
  );
}

// Only cottage_bill restaurant orders belong to the accommodation account.
async function synchronizeRestaurantPayments(
  booking,
  restaurantOrders,
  session
) {
  const billableOrders = restaurantOrders.filter(
    (order) => order.paymentMode === "cottage_bill"
  );

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

  const sortedOrders = [...billableOrders].sort(
    (a, b) =>
      new Date(a.createdAt || 0).getTime() -
      new Date(b.createdAt || 0).getTime()
  );

  const allocationsByOrder = new Map();

  for (const order of sortedOrders) {
    allocationsByOrder.set(order._id.toString(), []);
  }

  // Allocate booking payments chronologically.
  for (const payment of sortedPayments) {
    let availableAmount = money(payment.amount);

    // Accommodation is paid first.
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

    if (availableAmount <= 0) continue;

    const paymentDate = new Date(
      payment.paidAt || booking.createdAt || Date.now()
    );

    // Any excess can cover cottage-bill orders that already existed.
    for (const order of sortedOrders) {
      if (availableAmount <= 0) break;

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

      const allocations =
        allocationsByOrder.get(order._id.toString()) || [];

      const alreadyAllocated = allocations.reduce(
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

      if (orderBalance <= 0) continue;

      const allocationAmount = Math.min(
        availableAmount,
        orderBalance
      );

      allocations.push({
        bookingPaymentId: payment._id,
        amount: money(allocationAmount),
        allocatedAt: payment.paidAt || new Date(),
      });

      allocationsByOrder.set(
        order._id.toString(),
        allocations
      );

      availableAmount = money(
        availableAmount - allocationAmount
      );
    }
  }

  // Update only cottage-bill orders.
  for (const order of billableOrders) {
    const allocations =
      allocationsByOrder.get(order._id.toString()) || [];

    order.checkoutPaymentAllocations = allocations;

    const directPayments = (order.payments || []).reduce(
      (total, payment) => total + money(payment.amount),
      0
    );

    const allocatedTotal = allocations.reduce(
      (total, allocation) =>
        total + money(allocation.amount),
      0
    );

    const received = money(directPayments + allocatedTotal);

    order.paymentStatus =
      received >= money(order.total) ? "paid" : "unpaid";

    await order.save({ session });
  }

  return billableOrders;
}

export async function PATCH(request, { params }) {
  try {
    // 1. Validate request body.
    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    // 2. Determine the required permission for this action.
    let requiredPermission;

    if (body.action === "sync-restaurant-payments") {
      requiredPermission = PERMISSIONS.RESTAURANT_PAYMENTS_SYNC;
    } else if (body.action === "record-payment") {
      requiredPermission = PERMISSIONS.PAYMENTS_RECORD;
    } else if (body.action === "verify-payment") {
      requiredPermission = PERMISSIONS.PAYMENTS_VERIFY;
    } else if (
      body.action === undefined ||
      body.action === null
    ) {
      if (body.status === "cancelled") {
        requiredPermission = PERMISSIONS.BOOKINGS_CANCEL;
      } else if (
        body.status === "confirmed" ||
        body.status === "rejected"
      ) {
        requiredPermission = PERMISSIONS.BOOKINGS_UPDATE;
      }
    }

    if (!requiredPermission) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid booking action.",
        },
        { status: 400 }
      );
    }

    // 3. Authorize the authenticated staff member.
    const { user, response } = await authorizeApiRequest(
      requiredPermission
    );

    if (response) {
      return response;
    }

    const session = { user };

    // 4. Validate booking ID.
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid booking ID.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const existingBooking = await Booking.findById(id);

    if (!existingBooking) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking not found.",
        },
        { status: 404 }
      );
    }

    // 5. Synchronize existing booking payments with cottage-bill orders.
    if (body.action === "sync-restaurant-payments") {
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

          // Both Admin and Manager can synchronize any confirmed booking.
          if (booking.status !== "confirmed") {
            syncResult = {
              status: 409,
              data: {
                success: false,
                message:
                  "Only confirmed bookings can have their restaurant payments synchronized.",
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

          const billableOrders =
            await synchronizeRestaurantPayments(
              booking,
              restaurantOrders,
              dbSession
            );

          const allocatedTotal = billableOrders.reduce(
            (total, order) =>
              total +
              (order.checkoutPaymentAllocations || []).reduce(
                (sum, allocation) =>
                  sum + money(allocation.amount),
                0
              ),
            0
          );

          const paidOrders = billableOrders.filter(
            (order) => order.paymentStatus === "paid"
          ).length;

          syncResult = {
            status: 200,
            data: {
              success: true,
              message:
                "Existing booking payments synchronized successfully. No new payment was recorded.",
              restaurantOrdersUpdated: billableOrders.length,
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

    // 6. Record additional accommodation / checkout payment.
    if (body.action === "record-payment") {
      const staffId = validStaffId(session);

      if (!staffId) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Your staff account ID is missing or invalid. Please sign in again.",
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

          // Additional payments are allowed for every confirmed booking.
          if (booking.status !== "confirmed") {
            paymentResult = {
              status: 409,
              data: {
                success: false,
                message:
                  "Additional payments can only be recorded for confirmed bookings.",
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

          const billableOrders = restaurantOrders.filter(
            (order) => order.paymentMode === "cottage_bill"
          );

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

          // Include direct payments already received by the restaurant.
          const directRestaurantPayments =
            getDirectRestaurantPayments(billableOrders);

          const cottageTotal = money(booking.totalPrice);

          const restaurantTotal = billableOrders.reduce(
            (total, order) => total + money(order.total),
            0
          );

          const grandTotal = money(
            cottageTotal + restaurantTotal
          );

          const totalReceived = money(
            verifiedAdvance +
              bookingAdditionalPayments +
              directRestaurantPayments
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

          booking.payments.push({
            amount,
            method: body.method,
            reference,
            note,
            paidAt: new Date(),
            recordedBy: new mongoose.Types.ObjectId(staffId),
          });

          await booking.save({ session: dbSession });

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
              directRestaurantPayments
          );

          const remainingBalance = Math.max(
            0,
            money(grandTotal - updatedTotalReceived)
          );

          const allocatedRestaurantPayments =
            billableOrders.reduce(
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
                "Payment recorded and cottage-bill restaurant payment statuses synchronized successfully.",
              booking: {
                id: booking._id.toString(),
                status: booking.status,
                cottageTotal,
                restaurantTotal,
                grandTotal,
                totalReceived: updatedTotalReceived,
                directRestaurantPayments,
                remainingBalance,
                restaurantCheckoutAllocations:
                  money(allocatedRestaurantPayments),
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

    // 7. Verify submitted online advance payment.
    if (body.action === "verify-payment") {
      // Payment can be verified before or after booking confirmation.
      if (
        !["pending", "confirmed"].includes(existingBooking.status)
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Payment can only be verified for pending or confirmed bookings.",
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

      const staffId = validStaffId(session);

      if (!staffId) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Your staff account ID is missing or invalid. Please sign in again.",
          },
          { status: 400 }
        );
      }

      const booking = await Booking.findOneAndUpdate(
        {
          _id: id,
          status: { $in: ["pending", "confirmed"] },
          paymentStatus: "submitted",
        },
        {
          $set: {
            paymentStatus: "verified",
            paymentVerifiedAt: new Date(),
            paymentVerifiedBy: staffId,
          },
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
              "Payment or booking status has already changed. Please refresh.",
          },
          { status: 409 }
        );
      }

      return NextResponse.json({
        success: true,
        message:
          "Payment verified successfully. The booking status has not been changed.",
        booking: {
          id: booking._id.toString(),
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          paymentAmount: booking.paymentAmount,
        },
      });
    }

    // 8. Validate booking status action.
    const { status } = body;

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

    let booking;

    // 9. Confirm booking with cottage-level concurrency protection.
    if (status === "confirmed") {
      const dbSession = await mongoose.startSession();

      let confirmationResult = null;

      try {
        await dbSession.withTransaction(async () => {
          booking = null;
          confirmationResult = null;

          // Payment verification is NOT required for confirmation.
          const currentBooking = await Booking.findOne({
            _id: id,
            status: "pending",
          }).session(dbSession);

          if (!currentBooking) {
            confirmationResult = {
              status: 409,
              data: {
                success: false,
                message:
                  "This booking is no longer pending. Please refresh and review its current status.",
              },
            };
            return;
          }

          const now = new Date();

          // Do not confirm an expired pending reservation.
          if (
            currentBooking.paymentDeadline &&
            currentBooking.paymentDeadline <= now
          ) {
            confirmationResult = {
              status: 409,
              data: {
                success: false,
                message:
                  "This booking's payment deadline has expired. Please review it before confirming.",
              },
            };
            return;
          }

          // Lock the cottage. Concurrent booking operations
          // for this cottage must serialize through this write.
          const lockedCottage = await Cottage.findOneAndUpdate(
            {
              _id: currentBooking.cottage,
              isActive: true,
            },
            {
              $inc: { __v: 1 },
            },
            {
              new: true,
              session: dbSession,
            }
          );

          if (!lockedCottage) {
            confirmationResult = {
              status: 409,
              data: {
                success: false,
                message:
                  "The cottage could not be found or is no longer active.",
              },
            };
            return;
          }

          // Check all other active reservations for overlapping dates.
          const overlappingBooking = await Booking.findOne({
            _id: { $ne: currentBooking._id },
            cottage: currentBooking.cottage,
            checkIn: { $lt: currentBooking.checkOut },
            checkOut: { $gt: currentBooking.checkIn },
            $or: [
              { status: "confirmed" },
              {
                status: "pending",
                $or: [
                  { paymentDeadline: { $gt: now } },
                  { paymentDeadline: { $exists: false } },
                ],
              },
            ],
          })
            .select("_id")
            .session(dbSession);

          if (overlappingBooking) {
            confirmationResult = {
              status: 409,
              data: {
                success: false,
                message:
                  "These dates overlap another active booking. Please review the reservations before confirming.",
              },
            };
            return;
          }

          // Confirm without changing paymentStatus.
          booking = await Booking.findOneAndUpdate(
            {
              _id: id,
              status: "pending",
            },
            {
              $set: { status: "confirmed" },
            },
            {
              new: true,
              runValidators: true,
              session: dbSession,
            }
          );

          if (!booking) {
            confirmationResult = {
              status: 409,
              data: {
                success: false,
                message:
                  "This booking has already been updated. Please refresh.",
              },
            };
            return;
          }

          confirmationResult = {
            status: 200,
            data: { success: true },
          };
        });
      } finally {
        await dbSession.endSession();
      }

      if (
        !confirmationResult ||
        confirmationResult.status !== 200
      ) {
        return NextResponse.json(
          confirmationResult?.data || {
            success: false,
            message: "Unable to confirm booking.",
          },
          {
            status: confirmationResult?.status || 500,
          }
        );
      }
    } else {
      // Rejection and cancellation retain their existing behavior.
      const requiredPreviousStatus =
        status === "cancelled" ? "confirmed" : "pending";

      booking = await Booking.findOneAndUpdate(
        {
          _id: id,
          status: requiredPreviousStatus,
        },
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
    }

    // 10. Send appropriate booking email.
    let emailSent = false;

    try {
      await booking.populate("cottage", "name");

      let emailResult;

      if (status === "confirmed") {
        emailResult = await sendBookingConfirmation(booking);
      } else if (status === "cancelled") {
        emailResult = await sendBookingCancellation(booking);
      } else {
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

    // 11. Prepare response.
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



export async function DELETE(request, { params }) {
  try {
    // Only Admin can permanently delete bookings.
    const { response } = await authorizeApiRequest(
      PERMISSIONS.BOOKINGS_DELETE
    );

    if (response) {
      return response;
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid booking ID.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking not found.",
        },
        { status: 404 }
      );
    }

    // Protect separate restaurant order and sales records.
    const linkedRestaurantOrder = await RestaurantOrder.findOne({
      booking: booking._id,
    })
      .select("_id")
      .lean();

    if (linkedRestaurantOrder) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This booking has linked restaurant orders. Remove or resolve those records first.",
        },
        { status: 409 }
      );
    }

    // Save payment screenshot information before deleting.
    const paymentProofPublicId =
      booking.paymentProof?.publicId || null;

    // Admin can delete bookings regardless of status or payment history.
    const deletedBooking = await Booking.findByIdAndDelete(id);

    if (!deletedBooking) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking could not be deleted. Please try again.",
        },
        { status: 409 }
      );
    }

    // Delete the associated Cloudinary payment screenshot.
    let imageCleanupWarning = false;

    if (paymentProofPublicId) {
      try {
        const cloudinary = getCloudinary();

        const result = await cloudinary.uploader.destroy(
          paymentProofPublicId,
          { resource_type: "image" }
        );

        if (!["ok", "not found"].includes(result.result)) {
          imageCleanupWarning = true;
          console.error(
            "Cloudinary cleanup result:",
            result.result
          );
        }
      } catch (error) {
        imageCleanupWarning = true;
        console.error("Cloudinary cleanup error:", error);
      }
    }

    return NextResponse.json({
      success: true,
      message: imageCleanupWarning
        ? "Booking deleted, but its payment screenshot could not be removed."
        : "Booking deleted successfully.",
      deletedBookingId: deletedBooking._id.toString(),
      imageCleanupWarning,
    });
  } catch (error) {
    console.error("Booking deletion error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete booking. Please try again.",
      },
      { status: 500 }
    );
  }
}


