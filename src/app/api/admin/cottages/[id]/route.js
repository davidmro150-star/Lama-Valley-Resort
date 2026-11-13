
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Cottage from "@/models/Cottage";

export const dynamic = "force-dynamic";

function createSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function validImages(images) {
  return (
    Array.isArray(images) &&
    images.length <= 20 &&
    images.every((image) => {
      if (typeof image !== "string") return false;

      try {
        const url = new URL(image);
        return (
          url.protocol === "https:" &&
          url.hostname === "res.cloudinary.com"
        );
      } catch {
        return false;
      }
    })
  );
}

export async function PUT(request, { params }) {
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
        { success: false, message: "Invalid cottage ID." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      name,
      slug,
      price,
      capacity,
      description = "",
      images = [],
      isActive = true,
    } = body || {};

    if (
      typeof name !== "string" ||
      name.trim().length < 2 ||
      name.trim().length > 100
    ) {
      return NextResponse.json(
        { success: false, message: "Cottage name must be between 2 and 100 characters." },
        { status: 400 }
      );
    }

    const cottageSlug = createSlug(
      typeof slug === "string" && slug.trim() ? slug : name
    );

    if (!cottageSlug || cottageSlug.length > 120) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid cottage slug." },
        { status: 400 }
      );
    }

    const cottagePrice = Number(price);
    const cottageCapacity = Number(capacity);

    if (
      price === "" ||
      price === null ||
      price === undefined ||
      !Number.isFinite(cottagePrice) ||
      cottagePrice < 0
    ) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid cottage price." },
        { status: 400 }
      );
    }

    if (
      capacity === "" ||
      capacity === null ||
      capacity === undefined ||
      !Number.isInteger(cottageCapacity) ||
      cottageCapacity < 1 ||
      cottageCapacity > 100
    ) {
      return NextResponse.json(
        { success: false, message: "Guest capacity must be between 1 and 100." },
        { status: 400 }
      );
    }

    if (
      typeof description !== "string" ||
      description.length > 3000
    ) {
      return NextResponse.json(
        { success: false, message: "Description cannot exceed 3000 characters." },
        { status: 400 }
      );
    }

    if (!validImages(images)) {
      return NextResponse.json(
        { success: false, message: "Please provide up to 20 valid Cloudinary image URLs." },
        { status: 400 }
      );
    }

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { success: false, message: "Invalid cottage status." },
        { status: 400 }
      );
    }

    await connectDB();

    const cottage = await Cottage.findById(id);

    if (!cottage) {
      return NextResponse.json(
        { success: false, message: "Cottage not found." },
        { status: 404 }
      );
    }

    const duplicateSlug = await Cottage.findOne({
      _id: { $ne: id },
      slug: cottageSlug,
    });

    if (duplicateSlug) {
      return NextResponse.json(
        { success: false, message: "Another cottage already uses this slug." },
        { status: 409 }
      );
    }

    cottage.name = name.trim();
    cottage.slug = cottageSlug;
    cottage.price = cottagePrice;
    cottage.capacity = cottageCapacity;
    cottage.description = description.trim();
    cottage.images = images;
    cottage.isActive = isActive;

    await cottage.save();

    return NextResponse.json({
      success: true,
      message: "Cottage updated successfully.",
      cottage: {
        id: cottage._id.toString(),
        name: cottage.name,
        slug: cottage.slug,
        price: cottage.price,
        capacity: cottage.capacity,
        description: cottage.description,
        images: cottage.images,
        isActive: cottage.isActive,
      },
    });
  } catch (error) {
    console.error("Update cottage error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "A cottage with this slug already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Unable to update cottage. Please try again." },
      { status: 500 }
    );
  }
}
