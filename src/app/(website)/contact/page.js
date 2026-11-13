
import Image from "next/image";
import Link from "next/link";
import ContactForm from "@/components/website/ContactForm";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  ArrowRight,
} from "lucide-react";

const siteUrl = (
  process.env.SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");

export const metadata = {
  title: "Contact Lama Valley Resort | Lama, Bandarban",
  description:
    "Contact Lama Valley Resort & Restaurant in Lama, Bandarban for cottage reservations, restaurant enquiries, resort packages and travel information.",

  keywords: [
    "Contact Lama Valley Resort",
    "Lama resort contact",
    "Resort in Lama Bandarban",
    "Lama Bandarban resort address",
    "Bandarban cottage reservation",
    "Lama Valley Resort location",
  ],

  alternates: {
    canonical: `${siteUrl}/contact`,
  },

  openGraph: {
    title: "Contact Us | Lama Valley Resort",
    description:
      "Get in touch with Lama Valley Resort in Lama, Bandarban. Contact our team for reservations, dining and enquiries.",
    url: `${siteUrl}/contact`,
    siteName: "Lama Valley Resort & Restaurant",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e",
        alt: "Beautiful mountain landscape near Lama Valley Resort",
      },
    ],
  },
};

const contactDetails = [
  {
    icon: MapPin,
    title: "Our Location",
    value: "Lama, Bandarban, Bangladesh",
    description: "Visit us and experience the beauty of the hills.",
  },
  {
    icon: Phone,
    title: "Phone Number",
    value: "Contact number coming soon",
    description: "Call us for reservations and enquiries.",
  },
  {
    icon: Mail,
    title: "Email Address",
    value: "Email address coming soon",
    description: "Send us your questions and booking enquiries.",
  },
  {
    icon: Clock,
    title: "Opening Hours",
    value: "Please contact us",
    description: "Contact our team for current availability.",
  },
];

export default function ContactPage() {
  return (
    <main className="bg-[#f7f5ef] text-[#173729]">
      {/* Hero */}
      <section className="relative flex min-h-[400px] items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e"
          alt="Beautiful natural mountain landscape"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 mx-auto max-w-4xl px-5 py-24 text-center text-white">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-[#e5c18e]">
            Lama Valley Resort
          </p>

          <h1 className="font-serif text-4xl font-bold sm:text-5xl md:text-6xl">
            Get in Touch
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/90 sm:text-lg">
            We would love to hear from you. Contact our team for
            reservations, dining information and any questions about your stay.
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#a9804d]">
            We're Here to Help
          </p>

          <h2 className="font-serif text-3xl font-bold sm:text-4xl">
            Let's Plan Your Visit
          </h2>

          <p className="mt-6 leading-8 text-gray-600">
            Whether you are planning a relaxing holiday, arranging a family
            visit or simply looking for more information, our team will be
            happy to assist you.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="px-5 pb-16 sm:pb-20">
        <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {contactDetails.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-[#e9e3d8] bg-white p-7 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#edf2ed] text-[#234b3b]">
                  <Icon size={25} strokeWidth={1.7} />
                </div>

                <h3 className="text-lg font-semibold">{item.title}</h3>

                <p className="mt-3 font-medium text-[#a9804d]">
                  {item.value}
                </p>

                <p className="mt-3 text-sm leading-7 text-gray-500">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Location and Map */}
      <section className="bg-white px-5 py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#a9804d]">
              Find Us
            </p>

            <h2 className="font-serif text-3xl font-bold sm:text-4xl">
              Discover Lama Valley
            </h2>

            <p className="mt-6 leading-8 text-gray-600">
              Located in the beautiful hills of Lama, Bandarban, Lama Valley
              Resort offers a peaceful destination surrounded by natural
              beauty.
            </p>

            <div className="mt-7 flex items-start gap-4">
              <MapPin className="mt-1 shrink-0 text-[#a9804d]" size={23} />

              <div>
                <h3 className="font-semibold">Resort Address</h3>
                <p className="mt-2 leading-7 text-gray-600">
                  Lama, Bandarban, Bangladesh
                </p>
              </div>
            </div>

            <a
              href="https://www.google.com/maps/search/?api=1&query=Lama+Bandarban+Bangladesh"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#234b3b] px-7 py-4 font-semibold text-white transition hover:bg-[#173729]"
            >
              Get Directions
              <ArrowRight size={18} />
            </a>
          </div>

          <div className="relative h-[350px] overflow-hidden rounded-2xl border border-[#e9e3d8] bg-[#eee9df] shadow-lg sm:h-[420px]">
            <iframe
              title="Lama Bandarban location map"
              src="https://www.google.com/maps?q=Lama%2C%20Bandarban%2C%20Bangladesh&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      
      {/* Contact Enquiry Form */}
      <section className="bg-[#f7f5ef] px-5 py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl items-start gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div className="pt-4">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#a9804d]">
              Contact Our Team
            </p>

            <h2 className="font-serif text-3xl font-bold sm:text-4xl">
              Have a Question?
            </h2>

            <p className="mt-6 leading-8 text-gray-600">
              Whether you need information about our cottages, restaurant,
              packages or reservations, send us a message. Our team will be
              happy to assist you.
            </p>

            <div className="mt-8 space-y-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#a9804d]">
                  <Phone size={21} />
                </div>
                <div>
                  <p className="font-semibold">Call Us</p>
                  <p className="text-sm text-gray-500">
                    Contact number coming soon
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#a9804d]">
                  <Mail size={21} />
                </div>
                <div>
                  <p className="font-semibold">Email Us</p>
                  <p className="text-sm text-gray-500">
                    Email address coming soon
                  </p>
                </div>
              </div>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>


      {/* Contact CTA */}
      <section className="bg-[#173729] px-5 py-16 text-center text-white sm:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-[#e5c18e]">
            <MessageCircle size={30} />
          </div>

          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#e5c18e]">
            Your Journey Begins Here
          </p>

          <h2 className="font-serif text-3xl font-bold sm:text-4xl">
            We Look Forward to Welcoming You
          </h2>

          <p className="mx-auto mt-5 max-w-xl leading-7 text-white/80">
            Have questions about accommodation, dining or your visit?
            Get in touch with our team.
          </p>

          <Link
            href="/stays"
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#c49a62] px-8 py-4 font-semibold text-white transition hover:bg-[#a9804d]"
          >
            Book Your Stay
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
