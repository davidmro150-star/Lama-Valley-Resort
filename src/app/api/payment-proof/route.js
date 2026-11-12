
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function validateImageSignature(buffer, mimeType) {
  if (mimeType === "image/jpeg") {
    return (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );
  }

  if (mimeType === "image/png") {
    return (
      buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
      )
    );
  }

  if (mimeType === "image/webp") {
    return (
      buffer.length >= 12 &&
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP"
    );
  }

  return false;
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json(
        { success: false, message: "Please select a payment screenshot." },
        { status: 400 }
      );
    }

    if (!Object.hasOwn(ALLOWED_TYPES, file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Only JPG, PNG and WebP screenshots are allowed.",
        },
        { status: 400 }
      );
    }

    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "Screenshot must be smaller than 5 MB.",
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (!validateImageSignature(buffer, file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "The uploaded file is not a valid image.",
        },
        { status: 400 }
      );
    }

    const cloudinary = getCloudinary();

    const publicId = `payment-${randomUUID()}`;

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          folder: "lama-valley-resort/payment-proofs",
          resource_type: "image",
          type: "authenticated",
          overwrite: false,
          allowed_formats: ["jpg", "png", "webp"],
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

    return NextResponse.json(
      {
        success: true,
        message: "Payment screenshot uploaded successfully.",
        proof: {
          publicId: uploadResult.public_id,
          format: uploadResult.format,
          bytes: uploadResult.bytes,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Payment proof upload error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to upload payment screenshot. Please try again.",
      },
      { status: 500 }
    );
  }
}
