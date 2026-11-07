
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Gallery from "@/models/Gallery";

export const runtime = "nodejs";

// Check admin access
async function checkAdmin() {
  const session = await auth();

  return session?.user?.role === "admin";
}

// GET: Retrieve all gallery images
export async function GET() {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    await connectDB();

    const images = await Gallery.find()
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      images,
    });
  } catch (error) {
    console.error("Gallery GET error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to retrieve gallery images." },
      { status: 500 }
    );
  }
}

// POST: Save uploaded image information
export async function POST(request) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();

    const {
      title,
      description,
      imageUrl,
      publicId,
      category,
      order,
      isActive,
    } = body;

    if (!imageUrl || !publicId) {
      return NextResponse.json(
        {
          success: false,
          message: "Image URL and Cloudinary public ID are required.",
        },
        { status: 400 }
      );
    }

    const image = await Gallery.create({
      title: title || "",
      description: description || "",
      imageUrl,
      publicId,
      category: category || "Nature",
      order: Number.isFinite(Number(order)) ? Number(order) : 0,
      isActive: typeof isActive === "boolean" ? isActive : true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Gallery image saved successfully.",
        image,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Gallery POST error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to save gallery image." },
      { status: 500 }
    );
  }
}
