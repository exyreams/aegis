"use client";

import { motion } from "framer-motion";

interface ShieldProps {
  className?: string;
  size?: number;
}

export function Shield({ className = "", size = 24 }: ShieldProps) {
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
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        variants={{
          initial: { pathLength: 1, scale: 1 },
          animate: {
            pathLength: [1, 0.7, 1],
            scale: [1, 1.05, 1],
            transition: { duration: 0.8, ease: "easeInOut" },
          },
        }}
      />
      <motion.path
        d="M9 12l2 2 4-4"
        variants={{
          initial: { pathLength: 0, opacity: 0 },
          animate: {
            pathLength: [0, 1],
            opacity: [0, 1],
            stroke: ["currentColor", "#10b981", "currentColor"],
            transition: { duration: 0.6, ease: "easeOut", delay: 0.2 },
          },
        }}
      />
      <motion.g
        variants={{
          initial: { scale: 0, opacity: 0 },
          animate: {
            scale: [0, 1.2, 1],
            opacity: [0, 0.3, 0],
            transition: { duration: 0.6, ease: "easeOut", delay: 0.1 },
          },
        }}
      >
        <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.1" />
      </motion.g>
    </motion.svg>
  );
}
