
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import AboutPage from "@/models/Aboutpage";


const allowedFields = [
  "heroEyebrow",
  "heroTitle",
  "heroDescription",
  "heroLocation",
  "heroImage",
  "heroImageAlt",

  "introEyebrow",
  "introTitle",
  "introImage",
  "introImageAlt",
  "introParagraphs",
  "highlights",

  "locationEyebrow",
  "locationTitle",
  "locationDescription",
  "locationImage",
  "locationImageAlt",
  "locationHeading",
  "locationParagraphs",
  "locationButtonText",
  "locationButtonLink",

  "experiencesEyebrow",
  "experiencesTitle",
  "experiencesDescription",
  "experiences",

  "ctaEyebrow",
  "ctaTitle",
  "ctaDescription",
  "ctaPrimaryText",
  "ctaPrimaryLink",
  "ctaSecondaryText",
  "ctaSecondaryLink",
];

async function isAdmin() {
  const session = await auth();
  return session?.user?.role === "admin";
}

// GET: Load About Page content
export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    await connectDB();

    let aboutPage = await AboutPage.findOne();

    if (!aboutPage) {
      aboutPage = await AboutPage.create({});
    }

    return NextResponse.json({
      success: true,
      aboutPage,
    });
  } catch (error) {
    console.error("Admin About Page GET error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load About Page content." },
      { status: 500 }
    );
  }
}

// PUT: Update About Page content
export async function PUT(request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    const body = await request.json();

    await connectDB();

    const updateData = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields provided." },
        { status: 400 }
      );
    }

    const aboutPage = await AboutPage.findOneAndUpdate(
      {},
      { $set: updateData },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return NextResponse.json({
      success: true,
      message: "About Page updated successfully.",
      aboutPage,
    });
  } catch (error) {
    console.error("Admin About Page PUT error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update About Page content." },
      { status: 500 }
    );
  }
}
