
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Package from "@/models/Package";
import { getCloudinary } from "@/lib/cloudinary";

export async function PATCH(request, { params }) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid package ID." },
        { status: 400 }
      );
    }

    await connectDB();

    const body = await request.json();

    const allowedFields = [
      "name",
      "slug",
      "shortDescription",
      "description",
      "price",
      "priceUnit",
      "imageUrl",
      "publicId",
      "features",
      "isActive",
      "order",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        updates[field] = body[field];
      }
    }

    if (updates.name !== undefined) {
      if (typeof updates.name !== "string" || !updates.name.trim()) {
        return NextResponse.json(
          { success: false, message: "Package name is required." },
          { status: 400 }
        );
      }

      updates.name = updates.name.trim();
    }

    if (updates.slug !== undefined) {
      if (typeof updates.slug !== "string" || !updates.slug.trim()) {
        return NextResponse.json(
          { success: false, message: "Package slug is required." },
          { status: 400 }
        );
      }

      updates.slug = updates.slug
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");

      const duplicate = await Package.findOne({
        slug: updates.slug,
        _id: { $ne: id },
      });

      if (duplicate) {
        return NextResponse.json(
          { success: false, message: "This package slug already exists." },
          { status: 409 }
        );
      }
    }

    if (updates.price !== undefined) {
      const price = Number(updates.price);

      if (
        updates.price === "" ||
        !Number.isFinite(price) ||
        price < 0
      ) {
        return NextResponse.json(
          { success: false, message: "Enter a valid package price." },
          { status: 400 }
        );
      }

      updates.price = price;
    }

    if (updates.features !== undefined && !Array.isArray(updates.features)) {
      return NextResponse.json(
        { success: false, message: "Features must be an array." },
        { status: 400 }
      );
    }

    if (updates.order !== undefined) {
      const order = Number(updates.order);

      if (!Number.isFinite(order) || order < 0) {
        return NextResponse.json(
          { success: false, message: "Enter a valid display order." },
          { status: 400 }
        );
      }

      updates.order = order;
    }

    await connectDB();

    const updatedPackage = await Package.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedPackage) {
      return NextResponse.json(
        { success: false, message: "Package not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Package updated successfully.",
      package: {
        ...updatedPackage.toObject(),
        _id: updatedPackage._id.toString(),
      },
    });
  } catch (error) {
    console.error("Admin package PATCH error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "This package slug already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to update package." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid package ID." },
        { status: 400 }
      );
    }

    await connectDB();

    const packageItem = await Package.findById(id);

    if (!packageItem) {
      return NextResponse.json(
        { success: false, message: "Package not found." },
        { status: 404 }
      );
    }

    if (packageItem.publicId) {
      const cloudinary = getCloudinary();

      const result = await cloudinary.uploader.destroy(
        packageItem.publicId,
        { resource_type: "image" }
      );

      if (!["ok", "not found"].includes(result.result)) {
        return NextResponse.json(
          {
            success: false,
            message: "Could not remove the package image from Cloudinary.",
          },
          { status: 500 }
        );
      }
    }

    await Package.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Package deleted successfully.",
    });
  } catch (error) {
    console.error("Admin package DELETE error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete package." },
      { status: 500 }
    );
  }
}
