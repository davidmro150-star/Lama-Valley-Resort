
import mongoose from "mongoose";

// Hero slider images
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

// Why Choose Us feature cards
const featureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    icon: {
      type: String,
      default: "Mountain",
      trim: true,
    },
  },
  { _id: true }
);

// Restaurant promotional cards
const diningCardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    label: {
      type: String,
      default: "",
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

// About section
const aboutSectionSchema = new mongoose.Schema(
  {
    eyebrow: {
      type: String,
      default: "Welcome to Lama Valley",
      trim: true,
    },
    title: {
      type: String,
      default: "Experience the Beauty of the Hills",
      trim: true,
    },
    description: {
      type: String,
      default:
        "Located in Lama, Bandarban, Lama Valley Resort & Restaurant is a destination for visitors looking to enjoy the natural surroundings and peaceful atmosphere of the hills.",
      trim: true,
    },
    description2: {
      type: String,
      default:
        "Whether you are planning a short getaway or a relaxing visit with family and friends, discover the charm of the surrounding landscape.",
      trim: true,
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    imageAlt: {
      type: String,
      default: "Beautiful surroundings of Lama Valley Resort",
      trim: true,
    },
    buttonText: {
      type: String,
      default: "Discover More",
      trim: true,
    },
    buttonLink: {
      type: String,
      default: "/about",
      trim: true,
    },
  },
  { _id: false }
);

// Stays section
const staysSectionSchema = new mongoose.Schema(
  {
    eyebrow: {
      type: String,
      default: "Stay With Us",
      trim: true,
    },
    title: {
      type: String,
      default: "Find Your Perfect Place to Stay",
      trim: true,
    },
    description: {
      type: String,
      default:
        "Discover a comfortable place to unwind and enjoy the natural beauty of Lama, Bandarban.",
      trim: true,
    },
    buttonText: {
      type: String,
      default: "View All Accommodation",
      trim: true,
    },
    buttonLink: {
      type: String,
      default: "/stays",
      trim: true,
    },
  },
  { _id: false }
);

// Restaurant section
const diningSectionSchema = new mongoose.Schema(
  {
    eyebrow: {
      type: String,
      default: "Food & Dining",
      trim: true,
    },
    title: {
      type: String,
      default: "A Delicious Experience in the Hills",
      trim: true,
    },
    description: {
      type: String,
      default:
        "Enjoy a welcoming dining experience and discover delicious flavours during your stay at Lama Valley.",
      trim: true,
    },
    cards: {
      type: [diningCardSchema],
      default: [
        {
          name: "Local Cuisine",
          description:
            "Discover regional flavours and enjoy a memorable dining experience.",
          image:
            "https://images.unsplash.com/photo-1547592180-85f173990554?w=900",
          label: "Regional Flavours",
          alt: "Local cuisine",
        },
        {
          name: "Fresh & Delicious",
          description:
            "Enjoy freshly prepared dishes made with care and quality ingredients.",
          image:
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900",
          label: "Fresh Ingredients",
          alt: "Freshly prepared food",
        },
        {
          name: "Dining Experience",
          description:
            "Relax and enjoy delicious food in a welcoming atmosphere.",
          image:
            "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900",
          label: "A Taste to Remember",
          alt: "Restaurant dining experience",
        },
      ],
    },
    buttonText: {
      type: String,
      default: "Explore Restaurant",
      trim: true,
    },
    buttonLink: {
      type: String,
      default: "/restaurant",
      trim: true,
    },
  },
  { _id: false }
);

// Why Choose Us section
const featuresSectionSchema = new mongoose.Schema(
  {
    eyebrow: {
      type: String,
      default: "The Lama Valley Experience",
      trim: true,
    },
    title: {
      type: String,
      default: "A Place to Relax, Explore & Reconnect",
      trim: true,
    },
    description: {
      type: String,
      default:
        "Discover what makes a visit to Lama Valley a memorable escape in the hills of Bandarban.",
      trim: true,
    },
    features: {
      type: [featureSchema],
      default: [
        {
          title: "Beautiful Nature",
          description:
            "Enjoy the peaceful atmosphere and natural beauty of Bandarban hills.",
          icon: "Mountain",
        },
        {
          title: "Food & Dining",
          description:
            "Enjoy a welcoming dining experience with delicious food.",
          icon: "Coffee",
        },
        {
          title: "Relaxing Escape",
          description:
            "Take a break from your routine and enjoy a peaceful getaway.",
          icon: "Heart",
        },
        {
          title: "Closer to Nature",
          description:
            "Reconnect with nature and enjoy beautiful green landscapes.",
          icon: "Leaf",
        },
      ],
    },
  },
  { _id: false }
);

// Gallery section
const gallerySectionSchema = new mongoose.Schema(
  {
    eyebrow: {
      type: String,
      default: "Our Gallery",
      trim: true,
    },
    title: {
      type: String,
      default: "Moments Worth Remembering",
      trim: true,
    },
    description: {
      type: String,
      default:
        "Explore beautiful landscapes, memorable experiences and special moments at Lama Valley Resort.",
      trim: true,
    },
    buttonText: {
      type: String,
      default: "Explore Full Gallery",
      trim: true,
    },
    buttonLink: {
      type: String,
      default: "/gallery",
      trim: true,
    },
  },
  { _id: false }
);

// Booking CTA section
const bookingCtaSectionSchema = new mongoose.Schema(
  {
    eyebrow: {
      type: String,
      default: "Your Escape Awaits",
      trim: true,
    },
    title: {
      type: String,
      default: "Ready to Experience the Beauty of Lama?",
      trim: true,
    },
    description: {
      type: String,
      default:
        "Plan your next getaway and discover a relaxing experience surrounded by the natural beauty of Bandarban.",
      trim: true,
    },
    buttonText: {
      type: String,
      default: "Book Your Stay",
      trim: true,
    },
    buttonLink: {
      type: String,
      default: "/stays",
      trim: true,
    },
    secondaryButtonText: {
      type: String,
      default: "Contact Us",
      trim: true,
    },
    secondaryButtonLink: {
      type: String,
      default: "/contact",
      trim: true,
    },
  },
  { _id: false }
);

// Main homepage schema
const homePageSchema = new mongoose.Schema(
  {
    // Hero content
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

    // Other homepage sections
    aboutSection: {
      type: aboutSectionSchema,
      default: () => ({}),
    },
    staysSection: {
      type: staysSectionSchema,
      default: () => ({}),
    },
    diningSection: {
      type: diningSectionSchema,
      default: () => ({}),
    },
    featuresSection: {
      type: featuresSectionSchema,
      default: () => ({}),
    },
    gallerySection: {
      type: gallerySectionSchema,
      default: () => ({}),
    },
    bookingCtaSection: {
      type: bookingCtaSectionSchema,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

const HomePage =
  mongoose.models.HomePage ||
  mongoose.model("HomePage", homePageSchema);

export default HomePage;
