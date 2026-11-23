import {
  Mountain,
  Coffee,
  Heart,
  Leaf,
  Utensils,
  Trees,
  Waves,
  Camera,
  BedDouble,
  Sparkles,
  MapPin,
  Star,
  Sun,
  Flower2,
} from "lucide-react";

import connectDB from "@/lib/mongodb";
import HomePage from "@/models/HomePage";

const iconMap = {
  Mountain,
  Coffee,
  Heart,
  Leaf,
  Utensils,
  Trees,
  Waves,
  Camera,
  BedDouble,
  Sparkles,
  MapPin,
  Star,
  Sun,
  Flower2,
};

const defaultFeatures = [
  {
    id: 1,
    icon: "Mountain",
    title: "Beautiful Nature",
    description:
      "Enjoy the peaceful atmosphere and natural beauty of the Bandarban hills.",
  },
  {
    id: 2,
    icon: "Coffee",
    title: "Food & Dining",
    description:
      "Make your visit special with a welcoming food and dining experience.",
  },
  {
    id: 3,
    icon: "Heart",
    title: "Relaxing Escape",
    description:
      "Take a break from everyday routines and enjoy a change of scenery.",
  },
  {
    id: 4,
    icon: "Leaf",
    title: "Closer to Nature",
    description:
      "Experience the charm of green landscapes and the surrounding hills.",
  },
];

export const dynamic = "force-dynamic";

export default async function WhyChooseUs() {
  let content = {};

  try {
    await connectDB();

    const homePage = await HomePage.findOne()
      .select("featuresSection")
      .lean();

    content = homePage?.featuresSection || {};
  } catch (error) {
    console.error("Homepage Features section error:", error);
  }

  const savedFeatures = Array.isArray(content.features)
    ? content.features
    : [];

  // Display only feature cards with all required fields.
  const completeFeatures = savedFeatures.filter(
    (feature) =>
      feature.title?.trim() &&
      feature.description?.trim() &&
      feature.icon?.trim()
  );

  // Use default features if no complete saved features exist.
  const features =
    completeFeatures.length > 0
      ? completeFeatures
      : defaultFeatures;

  return (
    <section className="section-padding bg-primary-dark text-white">
      <div className="container min-w-0">
        {/* Section Heading */}
        <div className="section-heading mb-10 sm:mb-14">
          <p className="section-eyebrow !text-accent-light !text-[10px]">
            {content.eyebrow || "The Lama Valley Experience"}
          </p>

          <h2 className="section-title !text-[18px] sm:!text-[35px] !text-white">
            {content.title || "A Place to Relax, Explore & Reconnect"}
          </h2>

          <p className="text-[14px] leading-8 text-white/70">
            {content.description ||
              "Discover what makes a visit to Lama Valley a memorable escape in the hills of Bandarban."}
          </p>
        </div>

        {/* Automatic Slider: Mobile and Tablet */}
        <div className="feature-slider lg:hidden">
          <div className="feature-slider-track">
            {[...features, ...features].map((feature, index) => {
              const Icon = iconMap[feature.icon] || Mountain;
              const isDuplicate = index >= features.length;

              return (
                <div
                  key={`${feature._id || feature.id || index}-${index}`}
                  aria-hidden={isDuplicate ? "true" : undefined}
                  className="feature-slide"
                >
                  <div className="h-full rounded-xl border border-white/15 bg-white/5 p-5 sm:p-7">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent-light sm:h-14 sm:w-14">
                      <Icon size={25} strokeWidth={1.6} />
                    </div>

                    <h3 className="mb-3 text-xl text-white">
                      {feature.title}
                    </h3>

                    <p className="text-base leading-7 text-white/65">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop Grid: 4 Cards */}
        <div className="hidden gap-6 lg:grid lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon] || Mountain;

            return (
              <div
                key={feature._id || feature.id || index}
                className="rounded-xl border border-white/15 bg-white/5 p-7 transition-colors duration-300 hover:bg-white/10"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent-light">
                  <Icon size={27} strokeWidth={1.6} />
                </div>

                <h3 className="mb-3 text-xl text-white">
                  {feature.title}
                </h3>

                <p className="text-sm leading-7 text-white/65">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}