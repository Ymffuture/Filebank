import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck } from 'lucide-react';
import { Tooltip } from 'antd';

const levels = [
  {
    title: 'Level 1: Basic CV',
    price: 'R150',
    features: ['Simple layout', 'Basic formatting', 'No custom design'],
  },
  {
    title: 'Level 2: Standard CV',
    price: 'R300',
    features: ['Modern layout', '1-on-1 support', 'Editable format'],
  },
  {
    title: 'Level 3: Expert CV',
    price: 'R600',
    features: ['ATS optimized', 'Fully designed', 'Custom branding'],
  },
];

const scrollInterval = 4000; // 4 seconds

const PricingSlider = () => {
  const containerRef = useRef(null);
  const cardRef = useRef(null);

  // Auto-scroll horizontally with snap
  useEffect(() => {
    const container = containerRef.current;
    const cardWidth = cardRef.current?.offsetWidth || 300;
    let scrollIndex = 0;

    const scroll = () => {
      if (!container) return;
      scrollIndex = (scrollIndex + 1) % levels.length;
      container.scrollTo({
        left: cardWidth * scrollIndex,
        behavior: 'smooth',
      });
    };

    const intervalId = setInterval(scroll, scrollInterval);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      
      <section className="bg-gradient-to-br from-gray-50 to-gray-200 py-20 px-4">
        <motion.h3
          className="text-4xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          CV Pricing Packages
        </motion.h3>

        <div
          ref={containerRef}
          className="flex gap-6 justify-start overflow-x-auto snap-x snap-mandatory px-4 scrollbar-hide"
        >
          {levels.map((pkg, i) => (
            <motion.div
              key={i}
              ref={i === 0 ? cardRef : null}
              className="min-w-[300px] max-w-[320px] snap-center bg-white p-6 rounded-2xl shadow-xl flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <h4 className="text-xl font-bold mb-2 text-gray-800">{pkg.title}</h4>
              <p className="text-2xl text-blue-600 font-semibold mb-4">{pkg.price}</p>
              <ul className="space-y-2">
                {pkg.features.map((feat, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-700">
                    <Tooltip title={feat}>
                      <BadgeCheck className="text-green-500 w-5 h-5" />
                    </Tooltip>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
};

export default PricingSlider;
