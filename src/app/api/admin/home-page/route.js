
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import HomePage from "@/models/HomePage";

export const dynamic = "force-dynamic";

async function checkAdmin() {
  const session = await auth();

  return session?.user?.role === "admin";
}

const allowedFields = [
  "heroLocation",
  "heroTitle",
  "heroDescription",
  "primaryButtonText",
  "primaryButtonLink",
  "secondaryButtonText",
  "secondaryButtonLink",
  "heroSlides",
  "aboutSection",
  "staysSection",
  "diningSection",
  "featuresSection",
  "gallerySection",
  "bookingCtaSection",
];

const sectionFields = {
  aboutSection: [
    "eyebrow",
    "title",
    "description",
    "description2",
    "image",
    "imageAlt",
    "buttonText",
    "buttonLink",
  ],
  staysSection: [
    "eyebrow",
    "title",
    "description",
    "buttonText",
    "buttonLink",
  ],
  diningSection: [
    "eyebrow",
    "title",
    "description",
    "cards",
    "buttonText",
    "buttonLink",
  ],
  featuresSection: [
    "eyebrow",
    "title",
    "description",
    "features",
  ],
  gallerySection: [
    "eyebrow",
    "title",
    "description",
    "buttonText",
    "buttonLink",
  ],
  bookingCtaSection: [
    "eyebrow",
    "title",
    "description",
    "buttonText",
    "buttonLink",
    "secondaryButtonText",
    "secondaryButtonLink",
  ],
};

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function sanitizeSection(sectionName, value) {
  if (!isPlainObject(value)) {
    return null;
  }

  const fields = sectionFields[sectionName];
  const result = {};

  for (const field of fields) {
    if (value[field] !== undefined) {
      result[field] = value[field];
    }
  }

  if (sectionName === "diningSection" && result.cards !== undefined) {
    if (
      !Array.isArray(result.cards) ||
      result.cards.length > 12
    ) {
      return null;
    }

    for (const card of result.cards) {
      if (
        !isPlainObject(card) ||
        typeof card.name !== "string" ||
        typeof card.description !== "string" ||
        typeof card.image !== "string"
      ) {
        return null;
      }
    }
  }

  if (
    sectionName === "featuresSection" &&
    result.features !== undefined
  ) {
    if (
      !Array.isArray(result.features) ||
      result.features.length > 12
    ) {
      return null;
    }

    for (const feature of result.features) {
      if (
        !isPlainObject(feature) ||
        typeof feature.title !== "string" ||
        typeof feature.description !== "string" ||
        typeof feature.icon !== "string"
      ) {
        return null;
      }
    }
  }

  return result;
}

// GET: Load homepage content for admin
export async function GET() {
  try {
    const isAdmin = await checkAdmin();

    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized access.",
        },
        { status: 401 }
      );
    }

    await connectDB();

    let homePage = await HomePage.findOne();

    if (!homePage) {
      homePage = await HomePage.create({});
    }

    return NextResponse.json(
      {
        success: true,
        homePage: homePage.toObject(),
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
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
    const isAdmin = await checkAdmin();

    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized access.",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();

    if (!isPlainObject(body)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request data.",
        },
        { status: 400 }
      );
    }

    const updateData = {};

    for (const field of allowedFields) {
      if (body[field] === undefined) {
        continue;
      }

      if (field === "heroSlides") {
        if (
          !Array.isArray(body.heroSlides) ||
          body.heroSlides.length > 8
        ) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid hero slides. Maximum 8 slides allowed.",
            },
            { status: 400 }
          );
        }

        const invalidSlide = body.heroSlides.some(
          (slide) =>
            !isPlainObject(slide) ||
            typeof slide.image !== "string" ||
            !slide.image.trim()
        );

        if (invalidSlide) {
          return NextResponse.json(
            {
              success: false,
              message: "Every hero slide needs an image.",
            },
            { status: 400 }
          );
        }

        updateData.heroSlides = body.heroSlides;
        continue;
      }

      if (sectionFields[field]) {
        const section = sanitizeSection(field, body[field]);

        if (!section) {
          return NextResponse.json(
            {
              success: false,
              message: `Invalid data for ${field}.`,
            },
            { status: 400 }
          );
        }

        updateData[field] = section;
        continue;
      }

      if (typeof body[field] !== "string") {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid value for ${field}.`,
          },
          { status: 400 }
        );
      }

      updateData[field] = body[field];
    }

    let homePage = await HomePage.findOne();

    if (!homePage) {
      homePage = await HomePage.create({});
    }

   for (const [field, value] of Object.entries(updateData)) {
  if (sectionFields[field]) {
    const currentSection = homePage[field]?.toObject
      ? homePage[field].toObject()
      : homePage[field] || {};

    homePage.set(field, {
      ...currentSection,
      ...value,
    });

    // Explicitly tell Mongoose that this nested section changed.
    homePage.markModified(field);
  } else {
    homePage.set(field, value);
  }
   }

   await homePage.save();

// Return the actual saved document, not the submitted form data.
      const savedHomePage = await HomePage.findById(homePage._id).lean();

   return NextResponse.json({
  success: true,
  message: "Homepage content saved successfully.",
  homePage: savedHomePage,
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
