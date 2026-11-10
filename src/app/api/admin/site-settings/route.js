
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import SiteSettings from "@/models/SiteSettings";

async function verifyAdmin() {
  const session = await auth();
  return session?.user?.role === "admin";
}

export async function GET() {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    await connectDB();

    let settings = await SiteSettings.findOne();

    if (!settings) {
      settings = await SiteSettings.create({});
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Get site settings error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load site settings." },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      resortName,
      phone,
      email,
      address,
      mapLink,
      shortDescription,
      socialMedia,
    } = body;

    if (!resortName?.trim()) {
      return NextResponse.json(
        { success: false, message: "Resort name is required." },
        { status: 400 }
      );
    }

    await connectDB();

    const settings = await SiteSettings.findOneAndUpdate(
      {},
      {
        $set: {
          resortName,
          phone,
          email,
          address,
          mapLink,
          shortDescription,
          socialMedia: {
            facebook: socialMedia?.facebook || "",
            instagram: socialMedia?.instagram || "",
            youtube: socialMedia?.youtube || "",
            tiktok: socialMedia?.tiktok || "",
            linkedin: socialMedia?.linkedin || "",
          },
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Site settings updated successfully.",
      settings,
    });
  } catch (error) {
    console.error("Update site settings error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update site settings." },
      { status: 500 }
    );
  }
}
