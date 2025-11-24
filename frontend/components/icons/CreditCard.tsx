"use client";

import { motion } from "framer-motion";

interface CreditCardProps {
  className?: string;
  size?: number;
}

export function CreditCard({ className = "", size = 24 }: CreditCardProps) {
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
        x="1"
        y="4"
        width="22"
        height="16"
        rx="2"
        ry="2"
        variants={{
          initial: { pathLength: 1, rotateY: 0 },
          animate: {
            pathLength: [1, 0.8, 1],
            rotateY: [0, 15, 0],
            transition: { duration: 0.8, ease: "easeInOut" },
          },
        }}
      />
      <motion.line
        x1="1"
        y1="10"
        x2="23"
        y2="10"
        variants={{
          initial: { pathLength: 1 },
          animate: {
            pathLength: [1, 0, 1],
            transition: { duration: 0.6, ease: "easeInOut", delay: 0.2 },
          },
        }}
      />
      <motion.circle
        cx="18"
        cy="15"
        r="1"
        variants={{
          initial: { scale: 1 },
          animate: {
            scale: [1, 1.8, 1],
            fill: ["transparent", "currentColor", "transparent"],
            transition: { duration: 0.5, ease: "easeInOut", delay: 0.4 },
          },
        }}
      />
      <motion.circle
        cx="15"
        cy="15"
        r="1"
        variants={{
          initial: { scale: 1 },
          animate: {
            scale: [1, 1.8, 1],
            fill: ["transparent", "currentColor", "transparent"],
            transition: { duration: 0.5, ease: "easeInOut", delay: 0.6 },
          },
        }}
      />
    </motion.svg>
  );
}
