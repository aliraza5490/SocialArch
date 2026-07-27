import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-6 h-6 relative flex items-center justify-center">
              <Image 
                src="/logo.png" 
                alt="SocialArch Logo" 
                fill
                className="object-contain"
              />
            </div>
            <span className="text-lg font-bold">SocialArch</span>
          </div>
          <div className="flex space-x-5 text-xs font-medium">
            <Link
              href="/login"
              className="hover:text-blue-400 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="hover:text-blue-400 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-800 text-center text-xs text-gray-400">
          <p>&copy; 2024 SocialArch. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
