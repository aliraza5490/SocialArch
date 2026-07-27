import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className="py-12 bg-linear-to-r from-cyan-600 to-blue-700">
      <div className="container max-w-5xl mx-auto px-4 text-center">
        <div className="max-w-xl mx-auto text-white">
          <h2 className="text-2xl font-bold mb-2">
            Ready to Transform Your Social Media Strategy?
          </h2>
          <p className="text-sm mb-6 text-blue-100">
            Join thousands of creators and businesses already using SocialArch
          </p>
          <Link href="/register">
            <Button size="default" variant="secondary" className="px-6 py-2.5 text-sm font-semibold shadow-md">
              Get Started Today
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
