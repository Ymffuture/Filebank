import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const suggestions = [
  "Create a simple cover letter",
  "Do I have to trust Filebank with my files?"
];

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, when: "beforeChildren", staggerChildren: 0.15 }
  },
  exit: { opacity: 0, y: 10, transition: { duration: 0.4, ease: 'easeInOut' } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } }
};

const QuickSuggestionsHero = ({ sendMessage }) => {
  const [visible, setVisible] = useState(true);
  const greeting = useMemo(() => getGreeting(), []);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3000); // 3s auto dismiss
    return () => clearTimeout(timer);
  }, []);

  const handleClick = (text) => {
    sendMessage(text);
    setVisible(false); // Dismiss on click
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="p-6 md:p-8 bg-white/80 dark:bg-gray-900/70 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-3xl shadow-xl transition-all cursor-pointer"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={containerVariants}
          onClick={() => setVisible(false)} // Optional: click outside suggestions to dismiss
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-3">
            👋 {greeting}!
          </h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-5">
            Quick actions to get started:
          </p>

          <motion.div className="flex flex-wrap gap-3">
            {suggestions.map((text, idx) => (
              <motion.button
                key={idx}
                variants={itemVariants}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent outer onClick
                  handleClick(text);
                }}
                className="px-4 py-2 md:px-6 md:py-3 text-sm md:text-base font-medium rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-800 dark:text-gray-200 shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              >
                {text}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuickSuggestionsHero;

