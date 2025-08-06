import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FacebookIcon, GithubIcon, LinkedinIcon } from 'lucide-react';
import { Tooltip } from 'antd';
import Particles from './Particles'; 

const Footer = () => {
  
const location = useLocation();
const isHome = location.pathname === '/';

  return (
    <footer className={`relative py-6 overflow-hidden transition-colors duration-300 ${
        isHome
          ? 'bg-black text-white'
          : 'bg-white dark:bg-gray-900 dark:border-gray-700 text-gray-600 dark:text-gray-300'
      }`}>
<div style={{ width: '100%', height: '100px', position: 'absolute', zIndex: 0, pointerEvents: 'none' }}>

  <Particles
    particleColors={!isHome? ['#000', 'red']:['#fff', '#fff'] }
    particleCount={50}
    particleSpread={10}
    speed={0.3}
    particleBaseSize={60}
    moveParticlesOnHover={true}
    alphaParticles={false}
    disableRotation={false}
  />
</div>
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center">
        
        {/* Social + Powered by */}
        <div className="flex flex-col items-center md:flex-row md:items-center md:space-x-4">
          <div className="flex space-x-4 mb-2 md:mb-0">
            <Tooltip title="Facebook">
              <a
                href="https://facebook.com/Quorvex Institute"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#1877F2] focus:outline-none focus:ring-2 focus:ring-[#1877F2] rounded-full p-1 transition"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-5 h-5 md:w-6 md:h-6" />
              </a>
            </Tooltip>
            <Tooltip title="GitHub">
              <a
                href="https://github.com/Ymffuture/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-black focus:outline-none focus:ring-2 focus:ring-black rounded-full p-1 transition"
                aria-label="GitHub"
              >
                <GithubIcon className="w-5 h-5 md:w-6 md:h-6" />
              </a>
            </Tooltip>
            <Tooltip title="LinkedIn">
              <a
                href="https://linkedin.com/in/kgomotsonkosi-l"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#0A66C2] focus:outline-none focus:ring-2 focus:ring-[#0A66C2] rounded-full p-1 transition"
                aria-label="LinkedIn"
              >
                <LinkedinIcon className="w-5 h-5 md:w-6 md:h-6" />
              </a>
            </Tooltip>
          </div>
          <span className="dark:text-gray-400 text-xs text-center md:text-left">
            Powered by <span className="font-semibold">Quorvex Institute</span>
          </span>
        </div>

        {/* Links + Copyright */}
        <div className="flex flex-row items-center md:flex-row md:space-x-4 dark:text-gray-400 text-xs gap-4">
          <Link
            to="/terms"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            Terms
          </Link>

      |
          <Link
            to="/privacy"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            Privacy
          </Link>
   

        </div>
          <span className="select-none text-center md:text-left items-center md:flex-row md:space-x-4 dark:text-white text-xs">
            © {new Date().getFullYear()} <span className="font-semibold text-fuchsia-600">Famacloud</span>. All rights reserved.
          </span>
      </div>
      
      <div class="flex justify-center mt-8">
  <a
    href="https://buymeacoffee.com/Ymffuture"
    target="_blank"
    rel="noopener noreferrer"
    class="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300"
  >
    <!-- Coffee Icon (Lucide) -->
    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path d="M17 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
      <line x1="6" x2="6" y1="2" y2="4" />
      <line x1="10" x2="10" y1="2" y2="4" />
      <line x1="14" x2="14" y1="2" y2="4" />
    </svg>
    <span>Buy me a coffee</span>
  </a>
</div>

    </footer>
  );
};

export default Footer;
