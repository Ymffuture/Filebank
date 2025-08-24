// SlotReel.jsx
import React from "react";
import { motion } from "framer-motion";

export default function SlotReel({ spinning, symbols }) {
  const repeatedSymbols = ["🍒", "🍋", "🍉", "⭐", "🍒", "🍋", "🍉", "⭐"];

  return (
    <div className="w-20 h-34 bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
      <motion.div
        animate={{
          y: spinning ? ["0%", "-100%"] : "0%",
        }}
        transition={{
          duration: 0.5,
          repeat: spinning ? Infinity : 0,
          ease: "linear",
        }}
        className="flex flex-col items-center"
      >
        {(spinning ? repeatedSymbols : symbols).map((s, idx) => (
          <div
            key={idx}
            className="text-3xl h-8 flex items-center justify-center"
          >
            {s}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
