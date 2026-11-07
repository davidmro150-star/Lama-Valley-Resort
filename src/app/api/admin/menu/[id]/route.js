
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import MenuItem from "@/models/MenuItem";
import { getCloudinary } from "@/lib/cloudinary";

export async function PATCH(request, { params }) {
  try {
    const session = await auth();

    if (session?.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid menu item ID." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const allowedFields = [
      "name",
      "description",
      "category",
      "price",
      "imageUrl",
      "publicId",
      "isAvailable",
      "isFeatured",
      "order",
    ];

    const updateData = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (
      updateData.name !== undefined &&
      !updateData.name.trim()
    ) {
      return NextResponse.json(
        { success: false, message: "Name cannot be empty." },
        { status: 400 }
      );
    }

    if (
      updateData.category !== undefined &&
      !updateData.category.trim()
    ) {
      return NextResponse.json(
        { success: false, message: "Category cannot be empty." },
        { status: 400 }
      );
    }

    if (updateData.price !== undefined) {
      const price = Number(updateData.price);

      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json(
          { success: false, message: "Invalid price." },
          { status: 400 }
        );
      }

      updateData.price = price;
    }

    if (updateData.name !== undefined) {
      updateData.name = updateData.name.trim();
    }

    if (updateData.category !== undefined) {
      updateData.category = updateData.category.trim();
    }

    if (updateData.description !== undefined) {
      updateData.description = updateData.description.trim();
    }

    if (updateData.order !== undefined) {
      const order = Number(updateData.order);

      if (!Number.isFinite(order)) {
        return NextResponse.json(
          { success: false, message: "Invalid display order." },
          { status: 400 }
        );
      }

      updateData.order = order;
    }

    const item = await MenuItem.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!item) {
      return NextResponse.json(
        { success: false, message: "Menu item not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Menu item updated successfully.",
      item: {
        ...item,
        _id: item._id.toString(),
      },
    });
  } catch (error) {
    console.error("Update menu item error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update menu item." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();

    if (session?.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid menu item ID." },
        { status: 400 }
      );
    }

    const item = await MenuItem.findById(id);

    if (!item) {
      return NextResponse.json(
        { success: false, message: "Menu item not found." },
        { status: 404 }
      );
    }

    if (item.publicId) {
      const cloudinary = getCloudinary();

      const result = await cloudinary.uploader.destroy(
        item.publicId,
        { resource_type: "image" }
      );

      if (result.result !== "ok" && result.result !== "not found") {
        return NextResponse.json(
          {
            success: false,
            message: "Could not delete the menu image from Cloudinary.",
          },
          { status: 500 }
        );
      }
    }

    await MenuItem.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Menu item deleted successfully.",
    });
  } catch (error) {
    console.error("Delete menu item error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete menu item." },
      { status: 500 }
    );
  }
}
