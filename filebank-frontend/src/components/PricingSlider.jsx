import React from 'react' 
import { motion } from 'framer-motion';
import { BadgeCheck } from 'lucide-react';

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

const PricingSlider = () => {
  return (
    <section className="bg-gray-100 py-20 px-4">
      <h3 className="text-3xl font-semibold text-center mb-10">CV Pricing Packages</h3>
      <div className="flex gap-6 justify-center overflow-x-auto snap-x px-4">
        {levels.map((pkg, i) => (
          <motion.div
            key={i}
            className="min-w-[300px] max-w-[320px] snap-center bg-white p-6 rounded-2xl shadow-xl"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <h4 className="text-xl font-bold mb-2">{pkg.title}</h4>
            <p className="text-2xl text-blue-600 font-semibold mb-4">{pkg.price}</p>
            <ul className="space-y-2">
              {pkg.features.map((feat, index) => (
                <li key={index} className="flex items-center gap-2 text-gray-700">
                  <BadgeCheck className="text-green-500 w-5 h-5" />
                  {feat}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default PricingSlider;
