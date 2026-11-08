
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import HomePage from "@/models/HomePage";

async function checkAdmin() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return false;
  }

  return true;
}

// GET: Load homepage content
export async function GET() {
  try {
    const isAdmin = await checkAdmin();

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    await connectDB();

    let homePage = await HomePage.findOne();

    if (!homePage) {
      homePage = await HomePage.create({});
    }

    return NextResponse.json({
      success: true,
      homePage,
    });
  } catch (error) {
    console.error("Home page GET error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load homepage content." },
      { status: 500 }
    );
  }
}

// PUT: Update homepage content
export async function PUT(request) {
  try {
    const isAdmin = await checkAdmin();

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();

    const allowedFields = [
      "heroLocation",
      "heroTitle",
      "heroDescription",
      "primaryButtonText",
      "primaryButtonLink",
      "secondaryButtonText",
      "secondaryButtonLink",
      "heroSlides",
    ];

    const updateData = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (updateData.heroSlides) {
      if (!Array.isArray(updateData.heroSlides)) {
        return NextResponse.json(
          { success: false, message: "Invalid hero slides." },
          { status: 400 }
        );
      }

      for (const slide of updateData.heroSlides) {
        if (
          typeof slide.image !== "string" ||
          !slide.image.trim()
        ) {
          return NextResponse.json(
            { success: false, message: "Every slide needs an image." },
            { status: 400 }
          );
        }
      }
    }

    let homePage = await HomePage.findOne();

    if (homePage) {
      Object.assign(homePage, updateData);
      await homePage.save();
    } else {
      homePage = await HomePage.create(updateData);
    }

    return NextResponse.json({
      success: true,
      message: "Homepage content updated successfully.",
      homePage,
    });
  } catch (error) {
    console.error("Home page PUT error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update homepage content." },
      { status: 500 }
    );
  }
}
