
import mongoose from "mongoose";

const heroSlideSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
      trim: true,
    },
    alt: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: true }
);

const homePageSchema = new mongoose.Schema(
  {
    heroLocation: {
      type: String,
      default: "Lama, Bandarban, Bangladesh",
      trim: true,
    },
    heroTitle: {
      type: String,
      default: "Find Your Peace Among the Hills.",
      trim: true,
    },
    heroDescription: {
      type: String,
      default:
        "Step away from the everyday and discover the natural beauty of Lama, Bandarban. A place to slow down, reconnect and experience the hills.",
      trim: true,
    },
    primaryButtonText: {
      type: String,
      default: "Book Your Stay",
      trim: true,
    },
    primaryButtonLink: {
      type: String,
      default: "/booking",
      trim: true,
    },
    secondaryButtonText: {
      type: String,
      default: "Explore the Resort",
      trim: true,
    },
    secondaryButtonLink: {
      type: String,
      default: "/about",
      trim: true,
    },
    heroSlides: {
      type: [heroSlideSchema],
      default: [
        {
          image:
            "https://res.cloudinary.com/oncwdbly/image/upload/v1793992861/lama-valley-resort/n1efwjumbtuusthx5mh2.avif",
          alt: "Beautiful hill scenery at Lama Valley Resort",
        },
        {
          image:
            "https://res.cloudinary.com/oncwdbly/image/upload/v1793992862/lama-valley-resort/gyfmrzx3ukmjobvltoik.jpg",
          alt: "Resort accommodation and natural surroundings",
        },
      ],
    },
  },
  { timestamps: true }
);

const HomePage =
  mongoose.models.HomePage ||
  mongoose.model("HomePage", homePageSchema);

export default HomePage;
