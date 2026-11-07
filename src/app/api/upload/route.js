
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 25 MB

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

export async function POST(request) {
  try {
    // 1. Verify admin authentication
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized access.",
        },
        { status: 401 }
      );
    }

    // 2. Read uploaded file
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json(
        {
          success: false,
          message: "Please select an image to upload.",
        },
        { status: 400 }
      );
    }

    // 3. Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Only JPG, PNG, WebP and AVIF images are allowed.",
        },
        { status: 400 }
      );
    }

    // 4. Validate file size
    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "Image size must be between 1 byte and 10 MB.",
        },
        { status: 400 }
      );
    }

    // 5. Convert image into a buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // 6. Upload image to Cloudinary
    const cloudinary = getCloudinary();

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "lama-valley-resort",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });

    // 7. Return uploaded image information
    return NextResponse.json(
      {
        success: true,
        message: "Image uploaded successfully.",
        image: {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format,
          bytes: uploadResult.bytes,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Image upload error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to upload image. Please try again.",
      },
      { status: 500 }
    );
  }
}
