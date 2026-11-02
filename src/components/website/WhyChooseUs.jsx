import {
  Mountain,
  Coffee,
  Heart,
  Leaf,
} from "lucide-react";

const features = [
  {
    id: 1,
    icon: Mountain,
    title: "Beautiful Nature",
    description:
      "Enjoy the peaceful atmosphere and natural beauty of the Bandarban hills.",
  },
  {
    id: 2,
    icon: Coffee,
    title: "Food & Dining",
    description:
      "Make your visit special with a welcoming food and dining experience.",
  },
  {
    id: 3,
    icon: Heart,
    title: "Relaxing Escape",
    description:
      "Take a break from everyday routines and enjoy a change of scenery.",
  },
  {
    id: 4,
    icon: Leaf,
    title: "Closer to Nature",
    description:
      "Experience the charm of green landscapes and the surrounding hills.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="section-padding bg-primary-dark text-white">
      <div className="container">

        {/* Section Heading */}
        <div className="section-heading mb-14">
          <p className="section-eyebrow !text-accent-light">
            The Lama Valley Experience
          </p>

          <h2 className="section-title !text-[35px] !text-white">
            A Place to Relax, Explore & Reconnect
          </h2>

          <p className="text-base leading-8 text-white/70">
            Discover what makes a visit to Lama Valley a
            memorable escape in the hills of Bandarban.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.id}
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