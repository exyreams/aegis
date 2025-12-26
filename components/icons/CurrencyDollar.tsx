"use client";

import { motion } from "framer-motion";

interface CurrencyDollarProps {
  className?: string;
  size?: number;
}

export function CurrencyDollar({
  className = "",
  size = 24,
}: CurrencyDollarProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      whileHover="animate"
      initial="initial"
    >
      <motion.line
        x1="12"
        y1="1"
        x2="12"
        y2="23"
        variants={{
          initial: { pathLength: 1, y: 0 },
          animate: {
            pathLength: [1, 0.7, 1],
            y: [0, -2, 0],
            transition: { duration: 0.8, ease: "easeInOut" },
          },
        }}
      />
      <motion.path
        d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
        variants={{
          initial: { pathLength: 1, stroke: "currentColor" },
          animate: {
            pathLength: [1, 0.5, 1],
            stroke: ["currentColor", "#22c55e", "currentColor"],
            transition: { duration: 1.2, ease: "easeInOut" },
          },
        }}
      />
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        fill="currentColor"
        variants={{
          initial: { scale: 0, opacity: 0 },
          animate: {
            scale: [0, 1.3, 0],
            opacity: [0, 0.3, 0],
            transition: { duration: 0.8, ease: "easeOut", delay: 0.2 },
          },
        }}
      />
    </motion.svg>
  );
}
