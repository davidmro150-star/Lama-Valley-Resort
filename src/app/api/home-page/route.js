
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import HomePage from "@/models/HomePage";

export async function GET() {
  try {
    await connectDB();

    let homePage = await HomePage.findOne().lean();

    if (!homePage) {
      homePage = await HomePage.create({});
      homePage = homePage.toObject();
    }

    return NextResponse.json(
      {
        success: true,
        homePage: {
          heroLocation: homePage.heroLocation,
          heroTitle: homePage.heroTitle,
          heroDescription: homePage.heroDescription,
          primaryButtonText: homePage.primaryButtonText,
          primaryButtonLink: homePage.primaryButtonLink,
          secondaryButtonText: homePage.secondaryButtonText,
          secondaryButtonLink: homePage.secondaryButtonLink,
          heroSlides: homePage.heroSlides,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Public homepage API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load homepage content.",
      },
      { status: 500 }
    );
  }
}
