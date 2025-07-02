import React from 'react';
import { FacebookIcon, GithubIcon, LinkedinIcon } from 'lucide-react';
import { Tooltip } from 'antd';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        {/* Social Icons */}
        <div className="flex space-x-6 mb-4 md:mb-0 text-gray-700 text-xl">
          <Tooltip title="Facebook">
            <a
              href="https://facebook.com/Quorvex Institute"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#1877F2] transition-colors duration-200"
              aria-label="Facebook"
            >
              <FacebookIcon className="w-6 h-6" />
            </a>
          </Tooltip>

          <Tooltip title="GitHub">
            <a
              href="https://github.com/Ymffuture/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black transition-colors duration-200"
              aria-label="GitHub"
            >
              <GithubIcon className="w-6 h-6" />
            </a>
          </Tooltip>

          <Tooltip title="LinkedIn">
            <a
              href="https://linkedin.com/in/kgomotsonkosi-l"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#0A66C2] transition-colors duration-200"
              aria-label="LinkedIn"
            >
              <LinkedinIcon className="w-6 h-6" />
            </a>
          </Tooltip>
        </div>

        {/* Copyright */}
        <p className="text-gray-500 text-sm select-none">
          © 2025 <span className="font-semibold">FileBank</span>. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

