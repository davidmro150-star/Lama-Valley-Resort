
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import ContactPage from "@/models/ContactPage";

const defaultSettings = {
  heroTitle: "Get in Touch",
  heroSubtitle:
    "We would love to hear from you. Contact us and plan your visit to Lama Valley.",
  heroImage: "",
  introTitle: "We Are Here to Help",
  introDescription:
    "Have questions about our cottages, restaurant, packages or reservations? Get in touch with our team.",
  phone: "",
  email: "",
  address: "Lama, Bandarban, Bangladesh",
  openingHours: "",
  mapEmbedUrl: "",
  locationDescription:
    "Visit us in the beautiful hills of Lama, Bandarban.",
};

const allowedFields = Object.keys(defaultSettings);

async function checkAdmin() {
  const session = await auth();

  return session?.user?.role === "admin";
}

// Get Contact Page settings
export async function GET() {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    await connectDB();

    let settings = await ContactPage.findOne().lean();

    if (!settings) {
      settings = await ContactPage.create(defaultSettings);
      settings = settings.toObject();
    }

    return NextResponse.json({
      success: true,
      settings: {
        ...settings,
        _id: settings._id.toString(),
      },
    });
  } catch (error) {
    console.error("Contact Page GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve Contact Page settings",
      },
      { status: 500 }
    );
  }
}

// Update Contact Page settings
export async function PUT(request) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const updateData = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (typeof body[field] !== "string") {
          return NextResponse.json(
            {
              success: false,
              message: `Invalid value for ${field}`,
            },
            { status: 400 }
          );
        }

        updateData[field] = body[field].trim();
      }
    }

    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(updateData.email)) {
        return NextResponse.json(
          { success: false, message: "Please enter a valid email address" },
          { status: 400 }
        );
      }
    }

    await connectDB();

    const settings = await ContactPage.findOneAndUpdate(
      {},
      {
        $set: updateData,
        $setOnInsert: defaultSettings,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    ).lean();

    return NextResponse.json({
      success: true,
      message: "Contact Page settings saved successfully",
      settings: {
        ...settings,
        _id: settings._id.toString(),
      },
    });
  } catch (error) {
    console.error("Contact Page PUT error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save Contact Page settings",
      },
      { status: 500 }
    );
  }
}
