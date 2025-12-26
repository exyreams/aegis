"use client";

import { motion } from "framer-motion";

interface NuclearProps {
  className?: string;
  size?: number;
}

export function Nuclear({ className = "", size = 24 }: NuclearProps) {
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
      <motion.path
        d="M1,13.55A5.89,5.89,0,1,1,3.16,21.6"
        variants={{
          initial: { pathLength: 1, rotate: 0 },
          animate: {
            pathLength: [1, 0.7, 1],
            rotate: [0, 5, 0],
            transition: { duration: 0.8, ease: "easeInOut" },
          },
        }}
      />
      <motion.path
        d="M20.84,21.6a5.89,5.89,0,1,1,2.16-8"
        variants={{
          initial: { pathLength: 1, rotate: 0 },
          animate: {
            pathLength: [1, 0.7, 1],
            rotate: [0, -5, 0],
            transition: { duration: 0.8, ease: "easeInOut", delay: 0.1 },
          },
        }}
      />
      <motion.path
        d="M16.17,1.61a5.9,5.9,0,1,1-8.34,0"
        variants={{
          initial: { pathLength: 1, rotate: 0 },
          animate: {
            pathLength: [1, 0.7, 1],
            rotate: [0, 3, 0],
            transition: { duration: 0.8, ease: "easeInOut", delay: 0.2 },
          },
        }}
      />
      <motion.circle
        cx="12"
        cy="12.74"
        r="6.43"
        variants={{
          initial: { scale: 1, opacity: 1 },
          animate: {
            scale: [1, 1.1, 1],
            opacity: [1, 0.8, 1],
            transition: { duration: 0.6, ease: "easeInOut", delay: 0.3 },
          },
        }}
      />
    </motion.svg>
  );
}
