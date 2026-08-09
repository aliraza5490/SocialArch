import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className="py-16 bg-linear-to-r from-cyan-600 to-blue-700">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
            Ready to Transform Your Social Media Strategy?
          </h2>
          <p className="text-base md:text-lg mb-8 text-blue-100 leading-relaxed">
            Join thousands of creators and businesses already using SocialArch
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="px-8 py-3 h-11 text-sm font-bold shadow-lg rounded-xl">
              Get Started Today
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
