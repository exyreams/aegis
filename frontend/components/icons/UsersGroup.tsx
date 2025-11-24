"use client";

import { motion } from "framer-motion";

interface UsersGroupProps {
  className?: string;
  size?: number;
}

export function UsersGroup({ className = "", size = 24 }: UsersGroupProps) {
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
        cy="7"
        r="4"
        variants={{
          initial: { scale: 1, y: 0 },
          animate: {
            scale: [1, 1.2, 1],
            y: [0, -2, 0],
            transition: { duration: 0.6, ease: "easeInOut" },
          },
        }}
      />
      <motion.path
        d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"
        variants={{
          initial: { pathLength: 1, y: 0 },
          animate: {
            pathLength: [1, 0.5, 1],
            y: [0, 2, 0],
            transition: { duration: 0.8, ease: "easeInOut", delay: 0.1 },
          },
        }}
      />
      <motion.circle
        cx="16"
        cy="11"
        r="3"
        variants={{
          initial: { scale: 1, opacity: 0.8, x: 0, y: 0 },
          animate: {
            scale: [1, 1.3, 1],
            opacity: [0.8, 1, 0.8],
            x: [0, 2, 0],
            y: [0, -1, 0],
            transition: { duration: 0.5, ease: "easeInOut", delay: 0.2 },
          },
        }}
      />
      <motion.path
        d="M22 21v-2a4 4 0 0 0-3-3.87"
        variants={{
          initial: { pathLength: 1, opacity: 0.8, x: 0, y: 0 },
          animate: {
            pathLength: [1, 0.3, 1],
            opacity: [0.8, 1, 0.8],
            x: [0, 2, 0],
            y: [0, 1, 0],
            transition: { duration: 0.6, ease: "easeInOut", delay: 0.3 },
          },
        }}
      />
    </motion.svg>
  );
}
