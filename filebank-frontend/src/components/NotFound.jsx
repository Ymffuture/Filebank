import React from 'react';
import { Button } from 'antd';
import { ArrowLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';

export default function NotFoundPage() {
  const animationUrl = 'https://lottie.host/1f020d2e-0d25-45f8-9295-2c2b2b27843e/404-animation.json';

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-tr from-blue-50 via-green-50 to-blue-100 p-6">
      <div className="text-center max-w-xl bg-white shadow-2xl rounded-2xl p-8">
        <div className="flex justify-center mb-4">
          <Lottie 
            animationData={require('../assets/error.json')} // If you download the file
            // Or use online link like below if preferred
            // <Lottie animationData={null} path={animationUrl} loop autoplay />
            path={animationUrl}
            loop
            style={{ width: 200, height: 200 }}
          />
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1E90FF] mb-2">404</h1>
        <p className="text-lg text-gray-700 mb-4">
          Oops! The page you are looking for doesn’t exist or has been moved.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          If you typed the URL manually, check the spelling and try again.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button
              type="primary"
              size="large"
              icon={<Home />}
              style={{ backgroundColor: '#1E90FF', borderColor: '#1E90FF' }}
            >
              Back to Home
            </Button>
          </Link>
          <Button
            size="large"
            icon={<ArrowLeft />}
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>

        <div className="mt-8 text-xs text-gray-400">
          FileBank © {new Date().getFullYear()} | Your files. Your control.
        </div>
      </div>
    </div>
  );
}

