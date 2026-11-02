
import AboutSection from "@/components/website/AboutSection";
import BookingCTA from "@/components/website/BookingCTA";
import GallerySection from "@/components/website/GallerySection";
import HeroSection from "@/components/website/HeroSection";
import RestaurantSection from "@/components/website/RestaurantSection";
import StaysSection from "@/components/website/StaysSection";
import WhyChooseUs from "@/components/website/WhyChooseUs";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <AboutSection />
      <StaysSection />
      <RestaurantSection />
      <WhyChooseUs />
      <GallerySection />
      <BookingCTA/>
    </main>
  );
}
