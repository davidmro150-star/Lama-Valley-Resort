
import Image from "next/image";
import connectDB from "@/lib/mongodb";
import Gallery from "@/models/Gallery";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gallery | Lama Valley Resort",
  description:
    "Explore the beautiful surroundings, cottages, dining and experiences at Lama Valley Resort.",
};

const categories = [
  "All",
  "Nature",
  "Cottages",
  "Restaurant",
  "Activities",
  "Views",
];

export default async function GalleryPage() {
  let images = [];
  let databaseError = false;

  try {
    await connectDB();

    const galleryImages = await Gallery.find({
      isActive: true,
    })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    images = galleryImages.map((image) => ({
      id: image._id.toString(),
      title: image.title || "Lama Valley Resort",
      description: image.description || "",
      imageUrl: image.imageUrl,
      category: image.category || "Nature",
    }));
  } catch (error) {
    console.error("Public gallery error:", error);
    databaseError = true;
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#173729]">
      {/* Hero */}
      <section className="relative flex min-h-[55vh] items-center justify-center bg-[#173729] px-6 py-24 text-center text-white">
        <div className="relative z-10 max-w-3xl">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.35em] text-[#d8b77e]">
            Moments at Lama Valley
          </p>

          <h1 className="font-serif text-4xl leading-tight md:text-6xl lg:text-7xl">
            Explore Our Gallery
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/75 md:text-lg">
            Discover the natural beauty, peaceful accommodation
            and memorable experiences of Lama Valley Resort.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 h-1 w-full bg-[#c49a62]" />
      </section>

      {/* Gallery Introduction */}
      <section className="mx-auto max-w-3xl px-6 py-16 text-center md:py-20">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[#a9804d]">
          A Visual Journey
        </p>

        <h2 className="font-serif text-3xl md:text-5xl">
          Discover Lama Valley
        </h2>

        <p className="mt-6 leading-8 text-[#647067]">
          Every corner has a story. Explore our collection of
          photographs and discover what makes a visit to Lama
          Valley special.
        </p>
      </section>

      {/* Category Navigation */}
      <section className="mx-auto max-w-7xl px-6 pb-10 lg:px-10">
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <a
              key={category}
              href={
                category === "All"
                  ? "#gallery"
                  : `#${category.toLowerCase()}`
              }
              className="rounded-full border border-[#d9d5ca] px-5 py-3 text-sm font-medium transition hover:border-[#234b3b] hover:bg-[#234b3b] hover:text-white"
            >
              {category}
            </a>
          ))}
        </div>
      </section>

      {/* Gallery Images */}
      <section
        id="gallery"
        className="mx-auto max-w-7xl px-6 pb-24 lg:px-10"
      >
        {databaseError ? (
          <div className="rounded-2xl bg-white px-6 py-20 text-center">
            <h2 className="font-serif text-2xl">
              Gallery temporarily unavailable
            </h2>

            <p className="mt-4 text-sm text-[#647067]">
              Please try again later.
            </p>
          </div>
        ) : images.length === 0 ? (
          <div className="rounded-2xl bg-white px-6 py-20 text-center">
            <h2 className="font-serif text-2xl md:text-3xl">
              Our Gallery Is Growing
            </h2>

            <p className="mx-auto mt-5 max-w-lg leading-8 text-[#647067]">
              We are preparing photographs of our cottages,
              restaurant and beautiful natural surroundings.
              Please visit again soon.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image) => (
              <article
                key={image.id}
                id={image.category.toLowerCase()}
                className="group overflow-hidden rounded-2xl bg-white shadow-sm"
              >
                <div className="relative h-[280px] overflow-hidden">
                  <Image
                    src={image.imageUrl}
                    alt={image.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a9804d]">
                    {image.category}
                  </p>

                  <h3 className="mt-2 font-serif text-xl">
                    {image.title}
                  </h3>

                  {image.description && (
                    <p className="mt-3 text-sm leading-7 text-[#647067]">
                      {image.description}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Closing Section */}
      <section className="bg-[#173729] px-6 py-20 text-center text-white">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[#d8b77e]">
          Your Next Experience
        </p>

        <h2 className="mx-auto max-w-2xl font-serif text-3xl md:text-5xl">
          Come Create Your Own Memories
        </h2>

        <p className="mx-auto mt-5 max-w-xl leading-8 text-white/75">
          Experience the beauty of Lama Valley in person.
          We look forward to welcoming you.
        </p>

        <a
          href="/booking"
          className="mt-8 inline-flex rounded-full bg-[#c49a62] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#a9804d]"
        >
          Book Your Stay
        </a>
      </section>
    </main>
  );
}
