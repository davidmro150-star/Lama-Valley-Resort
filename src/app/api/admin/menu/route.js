
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import MenuItem from "@/models/MenuItem";

export async function GET() {
  try {
    const session = await auth();

    if (session?.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    await connectDB();

    const items = await MenuItem.find({})
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      items: items.map((item) => ({
        ...item,
        _id: item._id.toString(),
      })),
    });
  } catch (error) {
    console.error("Get menu items error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch menu items." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();

    if (session?.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();

    const {
      name,
      description,
      category,
      price,
      imageUrl,
      publicId,
      isAvailable,
      isFeatured,
      order,
    } = body;

    if (!name?.trim() || !category?.trim()) {
      return NextResponse.json(
        { success: false, message: "Name and category are required." },
        { status: 400 }
      );
    }

    const parsedPrice = Number(price);

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid price." },
        { status: 400 }
      );
    }

    const item = await MenuItem.create({
      name: name.trim(),
      description: description?.trim() || "",
      category: category.trim(),
      price: parsedPrice,
      imageUrl: imageUrl || "",
      publicId: publicId || "",
      isAvailable: isAvailable ?? true,
      isFeatured: isFeatured ?? false,
      order: Number(order) || 0,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Menu item created successfully.",
        item: {
          ...item.toObject(),
          _id: item._id.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create menu item error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create menu item." },
      { status: 500 }
    );
  }
}
