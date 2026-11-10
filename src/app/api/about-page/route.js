
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import AboutPage from "@/models/Aboutpage";


export async function GET() {
  try {
    await connectDB();

    let aboutPage = await AboutPage.findOne().lean();

    if (!aboutPage) {
      aboutPage = await AboutPage.create({});
      aboutPage = aboutPage.toObject();
    }

    return NextResponse.json(
      {
        success: true,
        aboutPage,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Public About Page API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load About Page content.",
      },
      { status: 500 }
    );
  }
}
