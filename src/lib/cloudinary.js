
import { v2 as cloudinary } from "cloudinary";

const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

export function getCloudinary() {
  const missingVariables = Object.entries(cloudinaryConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing Cloudinary configuration: ${missingVariables.join(", ")}`
    );
  }

  cloudinary.config(cloudinaryConfig);

  return cloudinary;
}

export default cloudinary;
