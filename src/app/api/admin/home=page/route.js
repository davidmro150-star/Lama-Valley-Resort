
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import HomePage from "@/models/HomePage";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

async function verifyAdmin() {
  const session = await auth();
  return session?.user?.role === "admin";
}

// GET: Load homepage content
export async function GET() {
  try {
    if (!(await verifyAdmin())) {
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
      homePage: homePage.toObject(),
    });
  } catch (error) {
    console.error("Admin homepage GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load homepage content.",
      },
      { status: 500 }
    );
  }
}

// PUT: Update homepage content
export async function PUT(request) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();

    const {
      heroLocation,
      heroTitle,
      heroDescription,
      primaryButtonText,
      primaryButtonLink,
      secondaryButtonText,
      secondaryButtonLink,
      heroSlides,
    } = body;

    if (!Array.isArray(heroSlides)) {
      return NextResponse.json(
        {
          success: false,
          message: "Hero slides must be an array.",
        },
        { status: 400 }
      );
    }

    if (heroSlides.length > 8) {
      return NextResponse.json(
        {
          success: false,
          message: "You can add a maximum of 8 hero images.",
        },
        { status: 400 }
      );
    }

    for (const slide of heroSlides) {
      if (
        !slide ||
        typeof slide.image !== "string" ||
        !slide.image.trim()
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Every hero slide must have an image URL.",
          },
          { status: 400 }
        );
      }

      try {
        const imageUrl = new URL(slide.image);

        if (!["http:", "https:"].includes(imageUrl.protocol)) {
          throw new Error("Invalid image protocol");
        }
      } catch {
        return NextResponse.json(
          {
            success: false,
            message: "Please provide valid image URLs.",
          },
          { status: 400 }
        );
      }
    }

    let homePage = await HomePage.findOne();

    if (!homePage) {
      homePage = new HomePage();
    }

    homePage.heroLocation = heroLocation ?? homePage.heroLocation;
    homePage.heroTitle = heroTitle ?? homePage.heroTitle;
    homePage.heroDescription =
      heroDescription ?? homePage.heroDescription;

    homePage.primaryButtonText =
      primaryButtonText ?? homePage.primaryButtonText;

    homePage.primaryButtonLink =
      primaryButtonLink ?? homePage.primaryButtonLink;

    homePage.secondaryButtonText =
      secondaryButtonText ?? homePage.secondaryButtonText;

    homePage.secondaryButtonLink =
      secondaryButtonLink ?? homePage.secondaryButtonLink;

    homePage.heroSlides = heroSlides.map((slide) => ({
      image: slide.image.trim(),
      alt: typeof slide.alt === "string" ? slide.alt.trim() : "",
    }));

    await homePage.save();

    return NextResponse.json({
      success: true,
      message: "Homepage content updated successfully.",
      homePage: homePage.toObject(),
    });
  } catch (error) {
    console.error("Admin homepage PUT error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update homepage content.",
      },
      { status: 500 }
    );
  }
}
