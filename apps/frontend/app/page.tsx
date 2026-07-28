import type { Metadata } from 'next';
import { Navbar } from './components/landing/navbar';
import { HeroSection } from './components/landing/hero-section';
import { FeaturesSection } from './components/landing/features-section';
import { AboutSection } from './components/landing/about-section';
import { TestimonialsSection } from './components/landing/testimonials-section';
import { PricingSection } from './components/landing/pricing-section';
import { CTASection } from './components/landing/cta-section';
import { Footer } from './components/landing/footer';

export const metadata: Metadata = {
  title: 'SocialArch - AI-Powered Social Media Management & Studio',
  description: 'SocialArch is an all-in-one AI platform to streamline social media management, content creation, and analytics.',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 overflow-hidden relative">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <AboutSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
}
