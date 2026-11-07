
import { NextResponse } from "next/server";

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

export async function POST(request) {
  try {
    // 1. Verify administrator authentication
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    // 2. Read request body
    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid request body." },
        { status: 400 }
      );
    }

    const {
      name,
      slug,
      price,
      capacity,
      description = "",
      images = [],
    } = body || {};

    // 3. Validate cottage name
    if (
      typeof name !== "string" ||
      name.trim().length < 2 ||
      name.trim().length > 100
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Cottage name must be between 2 and 100 characters.",
        },
        { status: 400 }
      );
    }

    // 4. Generate and validate slug
    const cottageSlug = createSlug(
      typeof slug === "string" && slug.trim()
        ? slug
        : name
    );

    if (!cottageSlug || cottageSlug.length > 120) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid cottage slug." },
        { status: 400 }
      );
    }

    // 5. Validate price
    const cottagePrice = Number(price);

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

    // 6. Validate guest capacity
    const cottageCapacity = Number(capacity);

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

    // 7. Validate description
    if (
      typeof description !== "string" ||
      description.length > 3000
    ) {
      return NextResponse.json(
        { success: false, message: "Description cannot exceed 3000 characters." },
        { status: 400 }
      );
    }

    // 8. Validate uploaded image URLs
    if (!Array.isArray(images) || images.length > 20) {
      return NextResponse.json(
        { success: false, message: "You can add a maximum of 20 images." },
        { status: 400 }
      );
    }

    const validImages = images.every((image) => {
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
    });

    if (!validImages) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide valid Cloudinary image URLs.",
        },
        { status: 400 }
      );
    }

    // 9. Connect to MongoDB
    await connectDB();

    // 10. Check duplicate slug
    const existingCottage = await Cottage.findOne({
      slug: cottageSlug,
    });

    if (existingCottage) {
      return NextResponse.json(
        {
          success: false,
          message: "A cottage with this name or slug already exists.",
        },
        { status: 409 }
      );
    }

    // 11. Create cottage
    const cottage = await Cottage.create({
      name: name.trim(),
      slug: cottageSlug,
      price: cottagePrice,
      capacity: cottageCapacity,
      description: description.trim(),
      images,
      isActive: true,
    });

    // 12. Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Cottage created successfully.",
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
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create cottage error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "A cottage with this slug already exists.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create cottage. Please try again.",
      },
      { status: 500 }
    );
  }
}
