import React from 'react';
import { Button } from 'antd';
import { ArrowLeft, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Lottie from 'lottie-react';
import errorAnimation from '../assets/error.json'; // Adjust the path if needed

export default function NotFoundPage() {
  const location = useLocation(); // Get the current URL path

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-white">
      <div className="text-center max-w-xl bg-white dark:bg-[#2c2c2c] rounded-2xl p-8 shadow-xl">
        {/* Animation */}
        <div className="flex justify-center mb-4">
          <Lottie 
            animationData={errorAnimation}
            loop
            style={{ width: 220, height: 220 }}
          />
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#800000] mb-3">
          Page Not Found
        </h1>

        {/* Explanation */}
        <p className="text-lg text-[#202124] dark:text-gray-300 mb-3">
          Oops! The page you are looking for doesn’t exist or has been moved.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          To clear things up: the URL you tried to access was  
          <span className="ml-1 font-mono text-[#800000] break-all">
            {window.location.origin}{location.pathname}
          </span>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          If you typed it manually, please check the spelling and try again.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button
              type="primary"
              size="large"
              icon={<Home />}
              style={{ 
                backgroundColor: '#800000', 
                borderColor: '#800000',
                fontWeight: '600',
                borderRadius: '9999px'
              }}
            >
              Back to Home
            </Button>
          </Link>
          <Button
            size="large"
            icon={<ArrowLeft />}
            onClick={() => window.history.back()}
            style={{
              backgroundColor: '#202124',
              color: 'white',
              borderRadius: '9999px',
              border: '1px solid #444'
            }}
          >
            Go Back
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-xs text-gray-400">
          Famacloud © {new Date().getFullYear()} | Your files. Your control.
        </div>
      </div>
    </div>
  );
}

