
// components/layout/Footer.tsx
import React from 'react';
import Link from 'next/link';
import { Mail, MapPin, Linkedin, Instagram } from 'lucide-react'; // Assuming Lucide-react for icons

const Footer = () => {
  return (
    // Updated background to theme's primary dark mode background
    <footer className="bg-gray-900 text-gray-300 py-8 sm:py-10 md:py-12 px-4 sm:px-6 md:px-8 border-t border-gray-700 w-full overflow-x-hidden max-w-full">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10 lg:gap-12 w-full">
        {/* Column 1: Optimus Brand Info */}
        <div className="space-y-3 sm:space-y-4">
          <Link href="/" className="flex items-center space-x-2 text-white text-xl sm:text-2xl font-bold">
            {/* Logo: Changed accent color from blue to the primary theme cyan (bg-cyan-600) */}
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-base sm:text-lg font-bold">O</span>
            </div>
            <span>Optimus</span>
          </Link>
          <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
            Empowering the next generation of tech innovators through cutting-edge events,
            workshops, and collaborative learning experiences.
          </p>
          <div className="flex space-x-4 mt-4">
            <a 
              href="https://linkedin.com/company/optimus-student-organisation" 
              target="_blank" 
              rel="noopener noreferrer" 
              // Updated hover to theme's cyan accent color (text-cyan-500)
              className="text-gray-400 hover:text-cyan-500 transition duration-200"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-6 h-6" />
            </a>
            <a 
              href="https://instagram.com/optimus.orgz" 
              target="_blank" 
              rel="noopener noreferrer" 
              // Updated hover to theme's cyan accent color (text-cyan-500)
              className="text-gray-400 hover:text-cyan-500 transition duration-200"
              aria-label="Instagram"
            >
              <Instagram className="w-6 h-6" />
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Quick Links</h3>
          <ul className="space-y-2">
            {/* Updated link hover to theme's cyan accent color */}
            <li><Link href="/" className="text-gray-400 hover:text-cyan-500 transition duration-200 text-sm sm:text-base">Home</Link></li>
            <li><Link href="/event-page" className="text-gray-400 hover:text-cyan-500 transition duration-200 text-sm sm:text-base">Events</Link></li>
            <li><Link href="/post" className="text-gray-400 hover:text-cyan-500 transition duration-200 text-sm sm:text-base">Post</Link></li>
          </ul>
        </div>

        {/* Column 3: Community */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Community</h3>
          <ul className="space-y-2">
            {/* Updated link hover to theme's cyan accent color */}
            <li><Link href="/form/joinus" className="text-gray-400 hover:text-cyan-500 transition duration-200 text-sm sm:text-base">Join Us</Link></li>
          </ul>
        </div>

        {/* Column 4: Contact Us */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Contact Us</h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0 mt-0.5 sm:mt-1" />
              <p className="text-gray-400 text-xs sm:text-sm">Block - 13, LPU Campus, Punjab, India</p>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
              <a 
                href="mailto:optimus.orgz@gmail.com" 
                // Updated link hover to theme's cyan accent color
                className="text-gray-400 hover:text-cyan-500 transition duration-200 text-xs sm:text-sm break-all"
              >
                optimus.orgz@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom: Copyright & Legal Links */}
      {/* Note: border-gray-800 is a perfect fit for a divider on bg-gray-900 */}
     

      <div className="border-t border-gray-800 pt-6 sm:pt-8 text-center md:flex md:justify-between md:items-center text-xs sm:text-sm text-gray-500">
        <p className="mb-4 md:mb-0">&copy; 2025 Optimus Student Organisation. All rights reserved.</p>
        <div className="flex flex-wrap justify-center md:justify-end gap-2 sm:gap-4">
          {/* Updated link hover to theme's primary text color for this section (text-white) */}
          <Link href="/privacy-policy" className="hover:text-white transition duration-200">Privacy Policy</Link>
          <Link href="/terms-of-service" className="hover:text-white transition duration-200">Terms of Service</Link>
          <Link href="/code-of-conduct" className="hover:text-white transition duration-200">Code of Conduct</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
