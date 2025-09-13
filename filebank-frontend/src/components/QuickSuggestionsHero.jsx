import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";

// QuickSuggestionsHero.jsx (JSX)
// - client-safe greeting (computed on mount)
// - auto-dismiss with pause-on-hover and optional persistence via localStorage
// - keyboard navigation (Arrow keys, Enter, Escape)
// - memoized rendering for performance
// - Tailwind-friendly utility classes

const DEFAULT_SUGGESTIONS = [
  "Create a simple cover letter",
  "Do I have to trust Filebank with my files?",
  "Share a file with a colleague",
];

const containerVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.995 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, when: "beforeChildren", staggerChildren: 0.06 }
  },
  exit: { opacity: 0, y: 6, transition: { duration: 0.32, ease: "easeInOut" } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 28 } }
};

function getGreetingByHour(hour) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function QuickSuggestionsHero({ sendMessage, suggestions = DEFAULT_SUGGESTIONS, autoDismissMs = 4000, persistKey = "quickSuggestions.dismissed.v1", className = "" }) {
  const [visible, setVisible] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [paused, setPaused] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const rootRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (persistKey) {
      try {
        const dismissed = localStorage.getItem(persistKey);
        if (dismissed === "1") return;
      } catch (e) {
        // ignore localStorage errors
      }
    }
    setVisible(true);
  }, [persistKey]);

  useEffect(() => {
    try {
      const hour = new Date().getHours();
      setGreeting(getGreetingByHour(hour));
    } catch (e) {
      setGreeting("Hello");
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    if (!autoDismissMs) return;
    const start = () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        handleDismiss(true);
      }, autoDismissMs);
    };
    if (!paused) start();
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [visible, paused, autoDismissMs]);

  const handleDismiss = useCallback((persist) => {
    setVisible(false);
    if (persist && persistKey) {
      try {
        localStorage.setItem(persistKey, "1");
      } catch (e) {
        // ignore
      }
    }
  }, [persistKey]);

  const onSuggestionSelect = useCallback((text) => {
    sendMessage(text);
    handleDismiss(true);
  }, [sendMessage, handleDismiss]);

  const onKeyDown = useCallback((e) => {
    if (!visible) return;
    const len = suggestions.length;
    if (e.key === "Escape") {
      e.stopPropagation();
      handleDismiss(true);
      return;
    }
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev === null ? 0 : (prev + 1) % len));
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev === null ? len - 1 : (prev - 1 + len) % len));
    }
    if (e.key === "Enter" && focusedIndex !== null) {
      e.preventDefault();
      onSuggestionSelect(suggestions[focusedIndex]);
    }
  }, [visible, suggestions, focusedIndex, onSuggestionSelect, handleDismiss]);

  const suggestionNodes = useMemo(() => {
    return suggestions.map((text, idx) => (
      <motion.button
        key={text}
        variants={itemVariants}
        onClick={() => onSuggestionSelect(text)}
        onFocus={() => setFocusedIndex(idx)}
        className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm md:text-base font-medium transition transform focus:outline-none focus:ring-2 focus:ring-sky-500/60 active:scale-[0.995] shadow-sm hover:shadow-md`}
        aria-label={`Quick suggestion: ${text}`}
        tabIndex={0}
        type="button"
      >
        <span className="truncate max-w-[18rem]">{text}</span>
      </motion.button>
    ));
  }, [suggestions, onSuggestionSelect]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={rootRef}
          className={`p-5 md:p-7 bg-white/90 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl max-w-3xl ${className}`}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={containerVariants}
          onKeyDown={onKeyDown}
          role="region"
          aria-label="Quick suggestions"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white leading-snug">
                <span className="mr-2" aria-hidden>
                  👋
                </span>
                {greeting}!
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Quick actions to get started</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                aria-label="Dismiss quick suggestions"
                onClick={() => handleDismiss(true)}
                className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500/60"
                title="Dismiss"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          <motion.div className="mt-4 flex flex-wrap gap-3" initial="hidden" animate="visible">
            {suggestionNodes}
          </motion.div>

          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">Tip: press <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border">←</kbd>/<kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border">→</kbd> to navigate, <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border">Enter</kbd> to select</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

QuickSuggestionsHero.propTypes = {
  sendMessage: PropTypes.func.isRequired,
  suggestions: PropTypes.array,
  autoDismissMs: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
  persistKey: PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf([null])]),
  className: PropTypes.string,
};

export default React.memo(QuickSuggestionsHero);

