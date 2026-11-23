
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import HomePage from "@/models/HomePage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    let homePage = await HomePage.findOne().lean();

    if (!homePage) {
      const created = await HomePage.create({});
      homePage = created.toObject();
    }

    return NextResponse.json(
      {
        success: true,
        homePage: {
          // Hero section
          heroLocation: homePage.heroLocation,
          heroTitle: homePage.heroTitle,
          heroDescription: homePage.heroDescription,
          primaryButtonText: homePage.primaryButtonText,
          primaryButtonLink: homePage.primaryButtonLink,
          secondaryButtonText: homePage.secondaryButtonText,
          secondaryButtonLink: homePage.secondaryButtonLink,
          heroSlides: homePage.heroSlides,

          // About section
          aboutSection: homePage.aboutSection,

          // Stays section
          staysSection: homePage.staysSection,

          // Restaurant section
          diningSection: homePage.diningSection,

          // Why Choose Us section
          featuresSection: homePage.featuresSection,

          // Gallery section
          gallerySection: homePage.gallerySection,

          // Booking CTA section
          bookingCtaSection: homePage.bookingCtaSection,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
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
