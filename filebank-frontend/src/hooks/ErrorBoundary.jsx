import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // Optionally send error to monitoring service
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <motion.div
          className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 via-green-50 to-white dark:from-gray-900 dark:to-black p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
            <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {this.state.error?.message || 'An unexpected error has occurred.'}
            </p>
            <button
              onClick={this.handleReload}
              className="bg-gradient-to-r from-[#FF5722] to-[#FF7043] text-white px-6 py-3 rounded-full shadow-lg hover:scale-105 transition-all"
            >
              Reload Page
            </button>
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

