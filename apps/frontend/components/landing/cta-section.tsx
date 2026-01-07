import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className="py-20 bg-linear-to-r from-cyan-600 to-blue-700">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-2xl mx-auto text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Social Media Strategy?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of creators and businesses already using SocialArch
          </p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary">
              Get Started Today
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
