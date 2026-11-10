
import mongoose from "mongoose";

const siteSettingsSchema = new mongoose.Schema(
  {
    resortName: {
      type: String,
      default: "Lama Valley Resort & Restaurant",
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      default: "Lama, Bandarban, Bangladesh",
      trim: true,
    },
    mapLink: {
      type: String,
      default: "",
      trim: true,
    },
    shortDescription: {
      type: String,
      default: "",
      trim: true,
    },

    // Social Media
    socialMedia: {
      facebook: {
        type: String,
        default: "",
        trim: true,
      },
      instagram: {
        type: String,
        default: "",
        trim: true,
      },
      youtube: {
        type: String,
        default: "",
        trim: true,
      },
      tiktok: {
        type: String,
        default: "",
        trim: true,
      },
      linkedin: {
        type: String,
        default: "",
        trim: true,
      },
    },
  },
  { timestamps: true }
);

const SiteSettings =
  mongoose.models.SiteSettings ||
  mongoose.model("SiteSettings", siteSettingsSchema);

export default SiteSettings;
