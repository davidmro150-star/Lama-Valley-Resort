
import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema(
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
    href: {
      type: String,
      default: "",
      trim: true,
    },
    link: {
      type: String,
      default: "",
      trim: true,
    },
    icon: {
      type: String,
      enum: ["bed", "utensils", "mountain"],
      default: "mountain",
    },
  },
  { _id: true }
);

const aboutPageSchema = new mongoose.Schema(
  {
    // Hero Section
    heroEyebrow: {
      type: String,
      default: "Our Story & Our Place",
      trim: true,
    },
    heroTitle: {
      type: String,
      default: "Discover Lama Valley",
      trim: true,
    },
    heroDescription: {
      type: String,
      default:
        "A resort and restaurant destination in Lama, Bandarban, surrounded by the distinctive landscapes of the Chittagong Hill Tracts.",
      trim: true,
    },
    heroLocation: {
      type: String,
      default: "Lama, Bandarban, Bangladesh",
      trim: true,
    },
    heroImage: {
      type: String,
      default: "",
      trim: true,
    },
    heroImageAlt: {
      type: String,
      default: "Mirinja Valley landscape in Lama, Bandarban",
      trim: true,
    },

    // Introduction Section
    introEyebrow: {
      type: String,
      default: "Welcome to Lama Valley",
      trim: true,
    },
    introTitle: {
      type: String,
      default: "A Destination Inspired by the Beauty of the Hills",
      trim: true,
    },
    introImage: {
      type: String,
      default: "",
      trim: true,
    },
    introImageAlt: {
      type: String,
      default: "Lama Valley Resort surrounded by natural scenery",
      trim: true,
    },
    introParagraphs: {
      type: [String],
      default: [
        "Lama Valley Resort & Restaurant is a destination in Lama, Bandarban, created around the idea of enjoying a change of pace in a beautiful hill region of Bangladesh.",
        "The surrounding landscape gives this part of Bandarban its distinctive character. Green hills, changing skies and the natural scenery of the region make Lama an appealing place for visitors looking to explore southeastern Bangladesh.",
        "Through its accommodation and restaurant, Lama Valley brings together two important parts of a getaway: a place to stay and a place to enjoy food during your visit.",
      ],
    },
    highlights: {
      type: [String],
      default: [
        "Located in Lama, Bandarban, Bangladesh",
        "Part of the beautiful Chittagong Hill Tracts region",
        "A destination for accommodation and dining",
      ],
    },

    // Location Section
    locationEyebrow: {
      type: String,
      default: "Our Location",
      trim: true,
    },
    locationTitle: {
      type: String,
      default: "The Natural Beauty of Lama, Bandarban",
      trim: true,
    },
    locationDescription: {
      type: String,
      default:
        "Discover the landscape and character of one of Bangladesh's beautiful hill regions.",
      trim: true,
    },
    locationImage: {
      type: String,
      default: "",
      trim: true,
    },
    locationImageAlt: {
      type: String,
      default: "Misty hills and landscape of Mirinja Valley, Lama",
      trim: true,
    },
    locationHeading: {
      type: String,
      default: "Explore the Charm of the Hill Tracts",
      trim: true,
    },
    locationParagraphs: {
      type: [String],
      default: [
        "Lama is part of Bandarban district in southeastern Bangladesh, a region known for its hills, valleys and distinctive natural landscapes.",
        "One notable destination in the Lama area is Mirinja Tourist Spot, recognised for its elevated viewpoint and surrounding hill scenery. It is part of the wider landscape that makes this region special.",
      ],
    },
    locationButtonText: {
      type: String,
      default: "Find Our Location",
      trim: true,
    },
    locationButtonLink: {
      type: String,
      default: "/contact",
      trim: true,
    },

    // Experiences Section
    experiencesEyebrow: {
      type: String,
      default: "What We Offer",
      trim: true,
    },
    experiencesTitle: {
      type: String,
      default: "Discover the Lama Valley Experience",
      trim: true,
    },
    experiencesDescription: {
      type: String,
      default:
        "Explore the different parts of your visit, from accommodation to dining.",
      trim: true,
    },
    experiences: {
      type: [experienceSchema],
      default: [
        {
          title: "Accommodation",
          description:
            "Explore the accommodation options available at Lama Valley and find a place for your visit.",
          href: "/stays",
          link: "Explore stays",
          icon: "bed",
        },
        {
          title: "Food & Dining",
          description:
            "Discover the restaurant experience and dining options available during your visit.",
          href: "/restaurant",
          link: "Explore dining",
          icon: "utensils",
        },
        {
          title: "Natural Surroundings",
          description:
            "Experience the distinctive hill landscapes and scenic character of the Lama region.",
          href: "/gallery",
          link: "View gallery",
          icon: "mountain",
        },
      ],
    },

    // Closing CTA
    ctaEyebrow: {
      type: String,
      default: "Your Next Getaway",
      trim: true,
    },
    ctaTitle: {
      type: String,
      default: "Experience Lama Valley for Yourself",
      trim: true,
    },
    ctaDescription: {
      type: String,
      default:
        "Explore our accommodation and dining options and get in touch to plan your visit to Lama, Bandarban.",
      trim: true,
    },
    ctaPrimaryText: {
      type: String,
      default: "Book Your Stay",
      trim: true,
    },
    ctaPrimaryLink: {
      type: String,
      default: "/booking",
      trim: true,
    },
    ctaSecondaryText: {
      type: String,
      default: "Contact Us",
      trim: true,
    },
    ctaSecondaryLink: {
      type: String,
      default: "/contact",
      trim: true,
    },
  },
  { timestamps: true }
);

const AboutPage =
  mongoose.models.AboutPage ||
  mongoose.model("AboutPage", aboutPageSchema);

export default AboutPage;
