
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Package from "@/models/Package";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    await connectDB();

    const packages = await Package.find({})
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      packages: packages.map((item) => ({
        ...item,
        _id: item._id.toString(),
      })),
    });
  } catch (error) {
    console.error("Admin packages GET error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch packages." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();

    const {
      name,
      slug,
      shortDescription,
      description,
      price,
      priceUnit,
      imageUrl,
      publicId,
      features,
      isActive,
      order,
    } = body;

    if (
      !name?.trim() ||
      !slug?.trim() ||
      price === undefined ||
      price === null ||
      price === "" ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, slug and a valid price are required.",
        },
        { status: 400 }
      );
    }

    const normalizedSlug = slug
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

    const existingPackage = await Package.findOne({
      slug: normalizedSlug,
    });

    if (existingPackage) {
      return NextResponse.json(
        {
          success: false,
          message: "A package with this slug already exists.",
        },
        { status: 409 }
      );
    }

    const newPackage = await Package.create({
      name: name.trim(),
      slug: normalizedSlug,
      shortDescription: shortDescription || "",
      description: description || "",
      price: Number(price),
      priceUnit: priceUnit || "per person",
      imageUrl: imageUrl || "",
      publicId: publicId || "",
      features: Array.isArray(features) ? features : [],
      isActive: isActive ?? true,
      order: Number(order) || 0,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Package created successfully.",
        package: {
          ...newPackage.toObject(),
          _id: newPackage._id.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin packages POST error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "This package slug already exists.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to create package." },
      { status: 500 }
    );
  }
}
