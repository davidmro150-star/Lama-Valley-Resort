
import AboutSection from "@/components/website/AboutSection";
import BookingCTA from "@/components/website/BookingCTA";
import GallerySection from "@/components/website/GallerySection";
import HeroSection from "@/components/website/HeroSection";
import RestaurantSection from "@/components/website/RestaurantSection";
import StaysSection from "@/components/website/StaysSection";
import WhyChooseUs from "@/components/website/WhyChooseUs";

export const metadata = {
  title: "Lama Valley Resort & Restaurant in Lama, Bandarban",
  description:
    "Discover Lama Valley Resort & Restaurant in Lama, Bandarban. Explore scenic hill cottages, comfortable accommodation, delicious local food and a peaceful nature getaway.",
  keywords: [
    "Lama Valley Resort",
    "Resort in Lama Bandarban",
    "Cottage in Lama",
    "Bandarban resort",
    "Lama resort and restaurant",
    "Hill resort in Bangladesh",
  ],
  openGraph: {
    title: "Lama Valley Resort & Restaurant | Lama, Bandarban",
    description:
      "Experience peaceful hill accommodation, beautiful surroundings and delicious dining at Lama Valley Resort in Bandarban, Bangladesh.",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <AboutSection />
      <StaysSection />
      <RestaurantSection />
      <WhyChooseUs />
      <GallerySection />
      <BookingCTA />
    </main>
  );
}
