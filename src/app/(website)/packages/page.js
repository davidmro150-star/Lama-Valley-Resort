
import Image from "next/image";
import Link from "next/link";

import connectDB from "@/lib/mongodb";
import Package from "@/models/Package";

export const dynamic = "force-dynamic";

const fallbackImage =
  "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8";

const siteUrl = (
  process.env.SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");

export const metadata = {
  title: "Resort Packages in Bandarban | Lama Valley Resort",
  description:
    "Explore resort packages, family getaways and hill retreat experiences at Lama Valley Resort in Lama, Bandarban. Discover our packages and plan your stay.",

  keywords: [
    "Resort packages in Bandarban",
    "Lama Valley Resort packages",
    "Lama resort packages",
    "Family getaway in Bandarban",
    "Hill resort packages in Bangladesh",
    "Resort accommodation in Lama",
  ],

  alternates: {
    canonical: `${siteUrl}/packages`,
  },

  openGraph: {
    title: "Resort Packages | Lama Valley Resort",
    description:
      "Discover relaxing hill retreats, family getaways and memorable resort experiences at Lama Valley Resort, Lama, Bandarban.",
    url: `${siteUrl}/packages`,
    siteName: "Lama Valley Resort & Restaurant",
    type: "website",
    images: [
      {
        url: fallbackImage,
        alt: "Peaceful mountain resort getaway at Lama Valley",
      },
    ],
  },
};

export default async function PackagesPage() {
  let packages = [];

  try {
    await connectDB();

    const packageData = await Package.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    packages = packageData.map((item) => ({
      id: item._id.toString(),
      name: item.name,
      subtitle: item.shortDescription || "",
      description: item.description || "",
      price: Number(item.price || 0).toLocaleString("en-BD"),
      unit: item.priceUnit || "per person",
      image: item.imageUrl || fallbackImage,
      features: item.features || [],
    }));
  } catch (error) {
    console.error("Packages page error:", error);
  }

  return (
    <main className="bg-[#f7f5ef] text-[#173729]">
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden">
        <Image
          src={fallbackImage}
          alt="Peaceful mountain resort getaway"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 py-24 text-center text-white">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.35em] text-[#d8b77e]">
            Discover Your Escape
          </p>

          <h1 className="font-serif text-4xl leading-tight md:text-6xl lg:text-7xl">
            Packages & Experiences
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/85 md:text-lg">
            Discover peaceful hill retreats, memorable family getaways,
            and relaxing experiences at Lama Valley Resort.
          </p>

          <a
            href="#packages"
            className="mt-9 inline-flex rounded-full bg-[#c49a62] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#a9804d]"
          >
            Explore Packages
          </a>
        </div>
      </section>

      <section
        id="packages"
        className="bg-white px-6 py-20 lg:px-10 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[#a9804d]">
              Our Packages
            </p>

            <h2 className="font-serif text-3xl md:text-5xl">
              Choose Your Experience
            </h2>
          </div>

          {packages.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {packages.map((item) => (
                <article
                  key={item.id}
                  className="relative flex flex-col overflow-hidden rounded-2xl border border-[#e7e3d9] bg-[#f7f5ef]"
                >
                  <div className="relative h-[260px]">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col p-7">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a9804d]">
                      Resort Experience
                    </p>

                    <h3 className="mt-3 font-serif text-2xl">
                      {item.name}
                    </h3>

                    {item.subtitle && (
                      <p className="mt-2 text-sm text-[#647067]">
                        {item.subtitle}
                      </p>
                    )}

                    {item.description && (
                      <p className="mt-5 text-sm leading-7 text-[#647067]">
                        {item.description}
                      </p>
                    )}

                    <div className="my-6 border-t border-[#ded9ce]" />

                    {item.features.length > 0 && (
                      <>
                        <h4 className="text-sm font-semibold">
                          Package Includes
                        </h4>

                        <ul className="mt-4 flex-1 space-y-3">
                          {item.features.map((feature, index) => (
                            <li
                              key={`${item.id}-${index}`}
                              className="flex items-start gap-3 text-sm text-[#647067]"
                            >
                              <span className="text-[#a9804d]">✓</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    <div className="mt-8 border-t border-[#ded9ce] pt-6">
                      <p className="text-3xl font-semibold">
                        ৳{item.price}
                      </p>

                      <p className="mt-1 text-xs text-[#647067]">
                        {item.unit}
                      </p>

                      <Link
                        href="/booking"
                        className="mt-6 flex w-full items-center justify-center rounded-full bg-[#234b3b] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#173729]"
                      >
                        Book Your Stay
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#ded9ce] px-6 py-16 text-center">
              <h3 className="font-serif text-2xl">
                Packages Coming Soon
              </h3>

              <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[#647067]">
                We are preparing special experiences for our guests.
                Please contact our team for package information.
              </p>

              <Link
                href="/contact"
                className="mt-7 inline-flex rounded-full bg-[#234b3b] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#173729]"
              >
                Contact Our Team
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="grid gap-10 rounded-2xl bg-[#234b3b] p-8 text-white md:grid-cols-2 md:items-center md:p-14">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[#d8b77e]">
              Something Special
            </p>

            <h2 className="font-serif text-3xl leading-tight md:text-5xl">
              Looking for a Custom Experience?
            </h2>

            <p className="mt-6 leading-8 text-white/75">
              Planning a group visit or a special occasion?
              Contact our team to discuss your requirements.
            </p>

            <Link
              href="/contact"
              className="mt-8 inline-flex rounded-full bg-[#c49a62] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#a9804d]"
            >
              Contact Our Team
            </Link>
          </div>

          <div className="relative min-h-[280px] overflow-hidden rounded-xl md:min-h-[380px]">
            <Image
              src="https://images.unsplash.com/photo-1510798831971-661eb04b3739"
              alt="Peaceful resort accommodation"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
