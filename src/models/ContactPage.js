
import mongoose from "mongoose";

const contactPageSchema = new mongoose.Schema(
  {
    heroTitle: {
      type: String,
      default: "Get in Touch",
      trim: true,
    },
    heroSubtitle: {
      type: String,
      default: "We would love to hear from you. Contact us and plan your visit to Lama Valley.",
      trim: true,
    },
    heroImage: {
      type: String,
      default: "",
      trim: true,
    },
    introTitle: {
      type: String,
      default: "We Are Here to Help",
      trim: true,
    },
    introDescription: {
      type: String,
      default: "Have questions about our cottages, restaurant, packages or reservations? Get in touch with our team.",
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
    openingHours: {
      type: String,
      default: "",
      trim: true,
    },
    mapEmbedUrl: {
      type: String,
      default: "",
      trim: true,
    },
    locationDescription: {
      type: String,
      default: "Visit us in the beautiful hills of Lama, Bandarban.",
      trim: true,
    },
  },
  { timestamps: true }
);

const ContactPage =
  mongoose.models.ContactPage ||
  mongoose.model("ContactPage", contactPageSchema);

export default ContactPage;
