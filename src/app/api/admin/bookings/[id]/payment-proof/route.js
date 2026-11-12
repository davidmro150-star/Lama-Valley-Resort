
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking";
import { getCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  try {
    // Only admins can access payment screenshots.
    const session = await auth();

    if (session?.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 403 }
      );
    }

    const { id } = await params;

    await connectDB();

    const booking = await Booking.findById(id).select("paymentProof");

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found." },
        { status: 404 }
      );
    }

    const proof = booking.paymentProof;

    if (
      !proof?.publicId ||
      !proof?.format ||
      !proof.publicId.startsWith(
        "lama-valley-resort/payment-proofs/payment-"
      )
    ) {
      return NextResponse.json(
        { success: false, message: "Payment screenshot not found." },
        { status: 404 }
      );
    }

    const cloudinary = getCloudinary();

    // Generate a temporary signed URL (5-minute validity).
    const expiresAt = Math.floor(Date.now() / 1000) + 300;

    const imageUrl = cloudinary.utils.private_download_url(
      proof.publicId,
      proof.format,
      {
        resource_type: "image",
        type: "authenticated",
        expires_at: expiresAt,
        attachment: false,
      }
    );

    return NextResponse.json({
      success: true,
      imageUrl,
      expiresAt,
    });
  } catch (error) {
    console.error("Payment proof access error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load payment screenshot." },
      { status: 500 }
    );
  }
}
