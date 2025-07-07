import React from 'react';
import { FacebookIcon, GithubIcon, LinkedinIcon } from 'lucide-react';
import { Tooltip } from 'antd';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-gray-700 py-6">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        
        {/* Social + Powered by */}
        <div className="flex flex-col md:flex-row md:items-center md:space-x-6 text-gray-700 dark:text-gray-300 text-sm">
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
          <span className="text-gray-500 dark:text-gray-400 text-xs">
            Powered by <span className="font-semibold">Quorvex Institute</span>
          </span>
        </div>

        {/* Links + Copyright */}
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 text-gray-500 dark:text-gray-400 text-xs">
          <a
            href="/terms"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            Terms of Service
          </a>
          <a
            href="/privacy"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            Privacy Policy
          </a>
          <span className="select-none">
            © {new Date().getFullYear()} <span className="font-semibold">FileBank</span>. All rights reserved.
          </span>
        </div>

      </div>
    </footer>
  );
};

export default Footer;

