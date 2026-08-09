import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Marketing Director',
    content:
      "SocialArch has completely transformed how we manage our clients' social media. The analytics and auto-scheduling are game-changers.",
  },
  {
    name: 'Mike Chen',
    role: 'Content Creator',
    content:
      'The automated workflows save me over 15 hours every single week. I can finally focus on creating content instead of manual posting.',
  },
  {
    name: 'Emily Davis',
    role: 'Brand Manager',
    content:
      'Intuitive interface and powerful AI features. Hands down the best social media management platform I&apos;ve used in years.',
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-14 bg-white/50 dark:bg-gray-800/50">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
            Loved by Social Media Managers
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            See how SocialArch is empowering thousands of creators and growth teams.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((testimonial, i) => (
            <Card
              key={i}
              className="border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 rounded-2xl p-1"
            >
              <CardContent className="p-5">
                <Quote className="h-6 w-6 text-cyan-600 dark:text-cyan-400 mb-3 opacity-70" />
                <p className="text-sm font-normal text-gray-700 dark:text-gray-200 mb-5 italic leading-relaxed">
                  &quot;{testimonial.content}&quot;
                </p>
                <div className="flex items-center">
                  <div className="w-9 h-9 bg-linear-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3 shadow-2xs">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                      {testimonial.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

