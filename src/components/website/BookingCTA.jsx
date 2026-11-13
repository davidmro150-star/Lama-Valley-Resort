import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function BookingCTA() {
  return (
    <section className="relative overflow-hidden bg-primary-dark py-24">
      {/* Background Decoration */}
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/10" />
      <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full border border-white/10" />

      <div className="container relative z-10 text-center">
        <p className="section-eyebrow !text-accent-light">
          Your Escape Awaits
        </p>

        <h2 className="mx-auto mb-6 max-w-3xl font-display !text-3xl leading-tight text-white sm:text-5xl">
          Ready to Experience the Beauty of Lama?
        </h2>

        <p className="mx-auto mb-10 max-w-2xl text-sm leading-8 text-white/70">
          Plan your next getaway and discover a relaxing
          experience surrounded by the natural beauty of
          Bandarban.
        </p>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/stays"
            className="btn inline-flex bg-accent px-8 text-primary-dark hover:bg-accent-light"
          >
            Book Your Stay
            <ArrowUpRight size={18} />
          </Link>

          <Link
            href="/contact"
            className="btn border border-white/50 bg-transparent px-8 text-white hover:bg-white hover:text-primary-dark"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}