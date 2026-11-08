
import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      maxlength: 150,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
      maxlength: 30,
    },

    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: 150,
    },

    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: 3000,
    },

    status: {
      type: String,
      enum: ["New", "Read", "Replied", "Archived"],
      default: "New",
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const ContactMessage =
  mongoose.models.ContactMessage ||
  mongoose.model("ContactMessage", contactMessageSchema);

export default ContactMessage;
