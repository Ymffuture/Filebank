import React from 'react';
import CVHero from '../components/CVHero';
import CVSteps from '../components/CVSteps';
import PricingSlider from '../components/PricingSlider';

const CVTips = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <CVHero />
      <CVSteps />
      <PricingSlider />
    </div>
  );
};

export default CVTips;

