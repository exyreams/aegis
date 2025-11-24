"use client";

import { motion } from "framer-motion";

interface UsersProps {
  className?: string;
  size?: number;
}

export function Users({ className = "", size = 24 }: UsersProps) {
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
        cx="12"
        cy="7"
        r="4"
        variants={{
          initial: { scale: 1, y: 0 },
          animate: {
            scale: [1, 1.15, 1],
            y: [0, -1, 0],
            transition: { duration: 0.6, ease: "easeInOut" },
          },
        }}
      />
      <motion.path
        d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"
        variants={{
          initial: { pathLength: 1, y: 0 },
          animate: {
            pathLength: [1, 0.6, 1],
            y: [0, 1, 0],
            transition: { duration: 0.8, ease: "easeInOut", delay: 0.1 },
          },
        }}
      />
      <motion.circle
        cx="19"
        cy="11"
        r="2"
        variants={{
          initial: { scale: 1, opacity: 0.7, x: 0 },
          animate: {
            scale: [1, 1.3, 1],
            opacity: [0.7, 1, 0.7],
            x: [0, 1, 0],
            transition: { duration: 0.5, ease: "easeInOut", delay: 0.2 },
          },
        }}
      />
      <motion.path
        d="M23 21v-2a4 4 0 0 0-3-3.87"
        variants={{
          initial: { pathLength: 1, opacity: 0.7, x: 0 },
          animate: {
            pathLength: [1, 0.4, 1],
            opacity: [0.7, 1, 0.7],
            x: [0, 1, 0],
            transition: { duration: 0.6, ease: "easeInOut", delay: 0.3 },
          },
        }}
      />
      <motion.circle
        cx="5"
        cy="11"
        r="2"
        variants={{
          initial: { scale: 1, opacity: 0.7, x: 0 },
          animate: {
            scale: [1, 1.3, 1],
            opacity: [0.7, 1, 0.7],
            x: [0, -1, 0],
            transition: { duration: 0.5, ease: "easeInOut", delay: 0.4 },
          },
        }}
      />
      <motion.path
        d="M1 21v-2a4 4 0 0 1 3-3.87"
        variants={{
          initial: { pathLength: 1, opacity: 0.7, x: 0 },
          animate: {
            pathLength: [1, 0.4, 1],
            opacity: [0.7, 1, 0.7],
            x: [0, -1, 0],
            transition: { duration: 0.6, ease: "easeInOut", delay: 0.5 },
          },
        }}
      />
    </motion.svg>
  );
}
