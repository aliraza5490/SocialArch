import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Marketing Director',
    content:
      "SocialArch has completely transformed how we manage our clients' social media. The analytics are a game-changer.",
  },
  {
    name: 'Mike Chen',
    role: 'Content Creator',
    content:
      'The automated workflows save me hours every week. I can finally focus on creating content instead of posting.',
  },
  {
    name: 'Emily Davis',
    role: 'Brand Manager',
    content:
      'Intuitive interface and powerful features. The best social media management tool I&apos;ve used in years.',
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 bg-white/50 dark:bg-gray-800/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Loved by Social Media Managers
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            See what our community has to say about SocialArch
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <Card
              key={i}
              className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <CardContent className="pt-6">
                <Quote className="h-8 w-8 text-blue-600 mb-4 opacity-50" />
                <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                  &quot;{testimonial.content}&quot;
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
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
