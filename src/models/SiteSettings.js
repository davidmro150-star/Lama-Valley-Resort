
import mongoose from "mongoose";

const siteSettingsSchema = new mongoose.Schema(
  {
    // ========================================
    // GENERAL INFORMATION
    // ========================================
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

    // ========================================
    // SOCIAL MEDIA
    // ========================================
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

    // ========================================
    // BRANDING & APPEARANCE
    // ========================================
    logoUrl: {
      type: String,
      default: "",
      trim: true,
    },
    logoAlt: {
      type: String,
      default: "Lama Valley Resort & Restaurant",
      trim: true,
    },
    faviconUrl: {
      type: String,
      default: "",
      trim: true,
    },
    primaryColor: {
      type: String,
      default: "#234b3b",
      trim: true,
    },
    accentColor: {
      type: String,
      default: "#c49a62",
      trim: true,
    },

    // ========================================
    // SEO SETTINGS
    // ========================================
    seo: {
      metaTitle: {
        type: String,
        default: "Lama Valley Resort & Restaurant | Lama, Bandarban",
        trim: true,
        maxlength: 70,
      },
      metaDescription: {
        type: String,
        default:
          "Discover Lama Valley Resort & Restaurant in Lama, Bandarban. Enjoy comfortable accommodation, delicious dining, and beautiful hill scenery.",
        trim: true,
        maxlength: 320,
      },
      keywords: {
        type: [String],
        default: [
          "Lama Valley Resort",
          "Resort in Lama",
          "Bandarban Resort",
          "Lama Bandarban",
        ],
      },
      canonicalUrl: {
        type: String,
        default: "",
        trim: true,
      },
      robotsIndex: {
        type: Boolean,
        default: true,
      },
      robotsFollow: {
        type: Boolean,
        default: true,
      },

      // Open Graph / Social Sharing
      ogTitle: {
        type: String,
        default: "",
        trim: true,
        maxlength: 70,
      },
      ogDescription: {
        type: String,
        default: "",
        trim: true,
        maxlength: 320,
      },
      ogImage: {
        type: String,
        default: "",
        trim: true,
      },
      ogType: {
        type: String,
        default: "website",
        enum: ["website", "article"],
      },

      // Twitter / X Sharing
      twitterTitle: {
        type: String,
        default: "",
        trim: true,
      },
      twitterDescription: {
        type: String,
        default: "",
        trim: true,
      },
      twitterImage: {
        type: String,
        default: "",
        trim: true,
      },
      twitterCard: {
        type: String,
        default: "summary_large_image",
        enum: ["summary", "summary_large_image"],
      },
    },
  },
  {
    timestamps: true,
  }
);

// ========================================
// MODEL CACHE HANDLING
// ========================================

const modelName = "SiteSettings";

if (
  mongoose.models[modelName] &&
  !mongoose.models[modelName].schema.path("seo")
) {
  mongoose.deleteModel(modelName);
}

const SiteSettings =
  mongoose.models[modelName] ||
  mongoose.model(modelName, siteSettingsSchema);

export default SiteSettings;
