import { HeroSlider } from "@/components/site/home/hero-slider";
import {
  AboutSection,
  BestSellers,
  CategoryShowcase,
  FeaturedPizzas,
  FinalCta,
  HowItWorks,
  PromoBanners,
  Testimonials,
  TrustStrip,
  VisitSection,
} from "@/components/site/home/sections";

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <TrustStrip />
      <CategoryShowcase />
      <FeaturedPizzas />
      <PromoBanners />
      <BestSellers />
      <AboutSection />
      <HowItWorks />
      <Testimonials />
      <VisitSection />
      <FinalCta />
    </>
  );
}
