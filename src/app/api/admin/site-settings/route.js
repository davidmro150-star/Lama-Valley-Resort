
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
      logoUrl,
      logoAlt,
      faviconUrl,
      primaryColor,
      accentColor,
      seo,
    } = body;

    if (
      resortName !== undefined &&
      (typeof resortName !== "string" || !resortName.trim())
    ) {
      return NextResponse.json(
        { success: false, message: "Resort name is required." },
        { status: 400 }
      );
    }

    await connectDB();

    const updateData = {};

    // ========================================
    // GENERAL INFORMATION
    // ========================================

    if (resortName !== undefined) updateData.resortName = resortName;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (address !== undefined) updateData.address = address;
    if (mapLink !== undefined) updateData.mapLink = mapLink;

    if (shortDescription !== undefined) {
      updateData.shortDescription = shortDescription;
    }

    // ========================================
    // SOCIAL MEDIA
    // ========================================

    if (socialMedia !== undefined) {
      updateData.socialMedia = {
        facebook: socialMedia?.facebook || "",
        instagram: socialMedia?.instagram || "",
        youtube: socialMedia?.youtube || "",
        tiktok: socialMedia?.tiktok || "",
        linkedin: socialMedia?.linkedin || "",
      };
    }

    // ========================================
    // BRANDING & APPEARANCE
    // ========================================

    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    if (logoAlt !== undefined) updateData.logoAlt = logoAlt;
    if (faviconUrl !== undefined) updateData.faviconUrl = faviconUrl;

    if (primaryColor !== undefined) {
      updateData.primaryColor = primaryColor;
    }

    if (accentColor !== undefined) {
      updateData.accentColor = accentColor;
    }

    // ========================================
    // SEO SETTINGS
    // ========================================

    if (seo !== undefined) {
      if (
        typeof seo !== "object" ||
        seo === null ||
        Array.isArray(seo)
      ) {
        return NextResponse.json(
          { success: false, message: "Invalid SEO settings." },
          { status: 400 }
        );
      }

      const allowedSeoFields = [
        "metaTitle",
        "metaDescription",
        "keywords",
        "canonicalUrl",
        "robotsIndex",
        "robotsFollow",
        "ogTitle",
        "ogDescription",
        "ogImage",
        "ogType",
        "twitterTitle",
        "twitterDescription",
        "twitterImage",
        "twitterCard",
      ];

      for (const field of allowedSeoFields) {
        if (seo[field] !== undefined) {
          updateData[`seo.${field}`] = seo[field];
        }
      }

      // Validate keyword format
      if (
        seo.keywords !== undefined &&
        (!Array.isArray(seo.keywords) ||
          !seo.keywords.every(
            (keyword) => typeof keyword === "string"
          ))
      ) {
        return NextResponse.json(
          { success: false, message: "SEO keywords must be an array of strings." },
          { status: 400 }
        );
      }

      // Validate boolean fields
      if (
        seo.robotsIndex !== undefined &&
        typeof seo.robotsIndex !== "boolean"
      ) {
        return NextResponse.json(
          { success: false, message: "Invalid SEO indexing setting." },
          { status: 400 }
        );
      }

      if (
        seo.robotsFollow !== undefined &&
        typeof seo.robotsFollow !== "boolean"
      ) {
        return NextResponse.json(
          { success: false, message: "Invalid SEO follow setting." },
          { status: 400 }
        );
      }
    }

    // ========================================
    // SAVE SETTINGS
    // ========================================

    const settings = await SiteSettings.findOneAndUpdate(
      {},
      { $set: updateData },
      {
        returnDocument: "after",
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
      {
        success: false,
        message: "Unable to update site settings.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
