"use client";

import { motion } from "framer-motion";

interface DashboardProps {
  className?: string;
  size?: number;
}

export function Dashboard({ className = "", size = 24 }: DashboardProps) {
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
      <motion.rect
        x="3"
        y="3"
        width="7"
        height="7"
        variants={{
          initial: { scale: 1, opacity: 0.8 },
          animate: {
            scale: [1, 1.15, 1],
            opacity: [0.8, 1, 0.8],
            transition: { duration: 0.6, ease: "easeInOut" },
          },
        }}
      />
      <motion.rect
        x="14"
        y="3"
        width="7"
        height="7"
        variants={{
          initial: { scale: 1, opacity: 0.8 },
          animate: {
            scale: [1, 1.15, 1],
            opacity: [0.8, 1, 0.8],
            transition: { duration: 0.6, ease: "easeInOut", delay: 0.1 },
          },
        }}
      />
      <motion.rect
        x="14"
        y="14"
        width="7"
        height="7"
        variants={{
          initial: { scale: 1, opacity: 0.8 },
          animate: {
            scale: [1, 1.15, 1],
            opacity: [0.8, 1, 0.8],
            transition: { duration: 0.6, ease: "easeInOut", delay: 0.2 },
          },
        }}
      />
      <motion.rect
        x="3"
        y="14"
        width="7"
        height="7"
        variants={{
          initial: { scale: 1, opacity: 0.8 },
          animate: {
            scale: [1, 1.15, 1],
            opacity: [0.8, 1, 0.8],
            transition: { duration: 0.6, ease: "easeInOut", delay: 0.3 },
          },
        }}
      />
    </motion.svg>
  );
}
