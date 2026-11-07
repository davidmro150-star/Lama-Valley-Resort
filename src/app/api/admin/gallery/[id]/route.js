
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import { getCloudinary } from "@/lib/cloudinary";
import Gallery from "@/models/Gallery";

export const runtime = "nodejs";

const ALLOWED_CATEGORIES = [
  "Nature",
  "Cottages",
  "Restaurant",
  "Activities",
  "Views",
];

async function checkAdmin() {
  const session = await auth();
  return session?.user?.role === "admin";
}

// PATCH: Update gallery image information
export async function PATCH(request, { params }) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid image ID." },
        { status: 400 }
      );
    }

    await connectDB();

    const body = await request.json();
    const updates = {};

    if (typeof body.title === "string") {
      updates.title = body.title.trim();
    }

    if (typeof body.description === "string") {
      updates.description = body.description.trim();
    }

    if (body.category !== undefined) {
      if (!ALLOWED_CATEGORIES.includes(body.category)) {
        return NextResponse.json(
          { success: false, message: "Invalid gallery category." },
          { status: 400 }
        );
      }

      updates.category = body.category;
    }

    if (typeof body.isActive === "boolean") {
      updates.isActive = body.isActive;
    }

    if (body.order !== undefined) {
      const order = Number(body.order);

      if (!Number.isFinite(order)) {
        return NextResponse.json(
          { success: false, message: "Invalid display order." },
          { status: 400 }
        );
      }

      updates.order = order;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid updates provided." },
        { status: 400 }
      );
    }

    const image = await Gallery.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!image) {
      return NextResponse.json(
        { success: false, message: "Gallery image not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Gallery image updated successfully.",
      image,
    });
  } catch (error) {
    console.error("Gallery PATCH error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update gallery image." },
      { status: 500 }
    );
  }
}

// DELETE: Remove gallery image from Cloudinary and MongoDB
export async function DELETE(request, { params }) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid image ID." },
        { status: 400 }
      );
    }

    await connectDB();

    const image = await Gallery.findById(id);

    if (!image) {
      return NextResponse.json(
        { success: false, message: "Gallery image not found." },
        { status: 404 }
      );
    }

    // Delete the actual image from Cloudinary first
    const cloudinary = getCloudinary();

    const result = await cloudinary.uploader.destroy(image.publicId, {
      resource_type: "image",
    });

    if (result.result !== "ok" && result.result !== "not found") {
      throw new Error("Cloudinary image deletion failed.");
    }

    // Delete the MongoDB record
    await Gallery.deleteOne({ _id: id });

    return NextResponse.json({
      success: true,
      message: "Gallery image deleted successfully.",
    });
  } catch (error) {
    console.error("Gallery DELETE error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete gallery image." },
      { status: 500 }
    );
  }
}
