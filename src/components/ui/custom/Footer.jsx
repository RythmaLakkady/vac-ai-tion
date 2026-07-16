import React from 'react';
import { Mail, Heart } from 'lucide-react';

function Footer() {
  return (
    <footer className="w-full py-8 mt-20 border-t border-holiday-teal/20 bg-white/50 backdrop-blur-md">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-holiday-dark font-sans">
          <span className="font-semibold">WanderGen</span>
          <span className="text-gray-400">|</span>
          <span>Built with</span>
          <Heart className="w-4 h-4 text-holiday-coral fill-current animate-pulse" />
          <span>by Rythma</span>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <span className="text-sm text-gray-500 font-sans">Facing an issue or have feedback?</span>
          <a 
            href="mailto:lakkadyrythma@gmail.com?subject=WanderGen Feedback / Issue Report" 
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-holiday-teal to-holiday-coral text-white rounded-full transition-all duration-300 hover:shadow-lg hover:scale-105 font-semibold font-sans text-sm shadow-md"
          >
            <Mail className="w-4 h-4" />
            Write to me
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
