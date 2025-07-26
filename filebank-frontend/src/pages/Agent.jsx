import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Wallet, Rocket, Smile, ThumbsUp } from 'lucide-react';
import { Button } from 'antd';

const agentBenefits = [
  {
    icon: <UserPlus className="text-blue-500 w-6 h-6" />,
    title: 'Get New Clients',
    desc: 'We connect you to people looking for your skills in your area.',
  },
  {
    icon: <Wallet className="text-green-500 w-6 h-6" />,
    title: 'Earn Commission',
    desc: 'Earn money for each client or file you help with.',
  },
  {
    icon: <Rocket className="text-purple-500 w-6 h-6" />,
    title: 'Grow Fast',
    desc: 'Start small and grow your reach across the country.',
  },
  {
    icon: <Smile className="text-yellow-500 w-6 h-6" />,
    title: 'Flexible Work',
    desc: 'Work when you want, from anywhere — you’re in control.',
  },
];

const Agent = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Hero */}
      <section className="py-20 bg-gradient-to-r from-blue-100 to-purple-200 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto px-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Become an Agent</h1>
          <p className="text-lg text-gray-700 mb-6">Join our team and help others while making income.</p>
          <a
            href="https://wa.me/27634414863?text=Hi%2C%20I'm%20interested%20in%20becoming%20an%20agent"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button type="primary" size="large" className="rounded-full px-8">
              Join Now on WhatsApp
            </Button>
          </a>
        </motion.div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-10">Why Join As Agent?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {agentBenefits.map((benefit, i) => (
              <motion.div
                key={i}
                className="p-6 rounded-xl shadow-md bg-gray-50 flex gap-4"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring' }}
              >
                <div>{benefit.icon}</div>
                <div>
                  <h4 className="text-lg font-bold">{benefit.title}</h4>
                  <p className="text-gray-600">{benefit.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-50 text-center">
        <h3 className="text-2xl md:text-3xl font-semibold mb-4">Ready to Earn and Make a Difference?</h3>
        <p className="text-gray-600 mb-6">We support you with training, tools and leads.</p>
        <a
          href="https://wa.me/27634414863?text=Hi%2C%20I%20want%20to%20start%20as%20an%20agent"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button type="primary" size="large" className="rounded-full px-8">
            Start on WhatsApp
          </Button>
        </a>
      </section>
    </div>
  );
};

export default Agent;

