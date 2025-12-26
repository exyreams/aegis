"use client";

import { motion } from "framer-motion";

interface ShoppingCartProps {
  className?: string;
  size?: number;
}

export function ShoppingCart({ className = "", size = 24 }: ShoppingCartProps) {
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
      <motion.circle
        cx="9"
        cy="21"
        r="1"
        variants={{
          initial: { scale: 1 },
          animate: {
            scale: [1, 1.4, 1],
            transition: { duration: 0.4, ease: "easeInOut" },
          },
        }}
      />
      <motion.circle
        cx="20"
        cy="21"
        r="1"
        variants={{
          initial: { scale: 1 },
          animate: {
            scale: [1, 1.4, 1],
            transition: { duration: 0.4, ease: "easeInOut", delay: 0.1 },
          },
        }}
      />
      <motion.path
        d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
        variants={{
          initial: { pathLength: 1, x: 0 },
          animate: {
            pathLength: [1, 0.8, 1],
            x: [0, -3, 3, 0],
            transition: { duration: 0.8, ease: "easeInOut" },
          },
        }}
      />
    </motion.svg>
  );
}
