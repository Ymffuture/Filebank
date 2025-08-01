import React from 'react';
import { FacebookIcon, GithubIcon, LinkedinIcon } from 'lucide-react';
import { Tooltip } from 'antd';
import Particles from './Particles';

const Footer = () => {
  return (
    <footer className="relative bg-white dark:bg-gray-900 dark:border-gray-700 py-6 overflow-hidden">
      {/* Particle Background */}
      <div className="absolute inset-0 -z-10 w-full h-full">
        <Particles
          particleColors={['#000', '#1E90FF', 'perple' ]}
          particleCount={300}
          particleSpread={10}
          speed={0.3}
          particleBaseSize={120}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      {/* Footer Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 flex flex-col items-center space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center">
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
          <span className="text-gray-500 dark:text-gray-400 text-xs text-center md:text-left">
            &copy; {new Date().getFullYear()} Quorvex Institute. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
 
