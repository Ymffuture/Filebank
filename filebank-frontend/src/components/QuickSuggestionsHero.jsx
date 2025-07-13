import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const suggestions = [
  "Create a simple cover letter",
  "Help me with JavaScript",
  "Create a tamplate CV for Retail ",
  "Best AI prompts",
  "Do I have to trust Filebank with my files? "
];

const containerVariants = {
  hidden: { opacity: 0, height: 0, transition: { duration: 0.4 } },
  visible: {
    opacity: 1,
    height: 'auto',
    transition: { when: "beforeChildren", staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120 } }
};

const QuickSuggestionsHero =({ sendMessage }) => {
  const [visible, setVisible] = useState(true);
  const greeting = useMemo(() => getGreeting(), []);

  if (!visible) return null;

  const handleClick = (text) => {
    sendMessage(text);
    setVisible(false);
  };

  return (
    <motion.div
      className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl mb-6"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={containerVariants}
    >
      <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white mb-2 animate-fade-in-down">
        👋 {greeting}!
      </h2>
      <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-4">
        Quick actions to get started:
      </p>

      <motion.div className="flex flex-wrap gap-3">
        {suggestions.map((text, idx) => (
          <motion.button
            key={idx}
            variants={itemVariants}
            onClick={() => handleClick(text)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {text}
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}

export default QuickSuggestionsHero;
