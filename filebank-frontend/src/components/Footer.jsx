import React from 'react';
import { FacebookIcon, GithubIcon, LinkedinIcon } from 'lucide-react';
import { Tooltip } from 'antd';

const Footer = () => {
  return (
    <footer className="bg-[#F0F8FF] py-6 mt-10 shadow-inner">
      <div className="flex justify-center gap-6 text-[#1E90FF] text-xl">
        <Tooltip title="Facebook">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#1877F2] transition-colors duration-300"
          >
            <FacebookIcon className="w-6 h-6" />
          </a>
        </Tooltip>

        <Tooltip title="GitHub">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-black transition-colors duration-300"
          >
            <GithubIcon className="w-6 h-6" />
          </a>
        </Tooltip>

        <Tooltip title="LinkedIn">
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#0A66C2] transition-colors duration-300"
          >
            <LinkedinIcon className="w-6 h-6" />
          </a>
        </Tooltip>
      </div>

      <div className="text-xs text-center text-gray-500 mt-4">
        © 2025 <span className="font-semibold">FileBank</span>. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
