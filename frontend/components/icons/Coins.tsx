"use client";

import { motion, Variants } from "framer-motion";

interface CoinsProps {
  className?: string;
  size?: number;
}

const frontCoinVariants: Variants = {
  initial: { y: 0, scaleX: 1 },
  animate: {
    y: [0, -4, 0],
    scaleX: [1, -1, 1],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
      repeatDelay: 0.5,
    },
  },
};

const backCoinVariants: Variants = {
  initial: { y: 0, scaleX: 1, stroke: "currentColor" },
  animate: {
    y: [0, 4, 0],
    scaleX: [1, -1, 1],
    stroke: ["currentColor", "#FBBF24", "currentColor"],
    transition: {
      delay: 0.25,
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
      repeatDelay: 0.5,
    },
  },
};

export function Coins({ className = "", size = 24 }: CoinsProps) {
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
      whileTap={{ scale: 0.9, transition: { duration: 0.1 } }}
      initial="initial"
    >
      {/* Back Coin */}
      <motion.path
        d="M18.09 10.37A6 6 0 1 1 10.34 18"
        variants={backCoinVariants}
      />
      {/* Front Coin */}
      <motion.circle cx="8" cy="8" r="6" variants={frontCoinVariants} />
    </motion.svg>
  );
}
