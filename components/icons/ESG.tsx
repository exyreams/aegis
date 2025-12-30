"use client";

import { motion } from "framer-motion";

interface ESGProps {
  className?: string;
  size?: number;
}

const sproutVariants = {
  visible: {
    scale: 1,
    opacity: 1,
  },
  animate: {
    scale: [0.8, 1.1, 1],
    opacity: [0.7, 1, 1],
    transition: {
      duration: 2,
      ease: [0.42, 0, 0.58, 1] as const,
      times: [0, 0.6, 1],
    },
  },
};

const leafVariants = {
  visible: {
    pathLength: 1,
    opacity: 1,
  },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
      duration: 1.5,
      ease: [0.42, 0, 0.58, 1] as const,
      delay: 0.3,
    },
  },
};

const stemVariants = {
  visible: {
    pathLength: 1,
    opacity: 1,
  },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
      duration: 1,
      ease: [0.42, 0, 0.58, 1] as const,
      delay: 0.1,
    },
  },
};

const groundVariants = {
  visible: {
    scaleX: 1,
    opacity: 1,
  },
  animate: {
    scaleX: [0, 1],
    opacity: [0, 1],
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
      delay: 0.8,
    },
  },
};

export function ESG({ className = "", size = 24 }: ESGProps) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
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
      animate="visible"
      whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
      initial="visible"
      variants={sproutVariants}
    >
      {/* Main stem/branch */}
      <motion.path
        d="M14 9.536V7a4 4 0 0 1 4-4h1.5a.5.5 0 0 1 .5.5V5a4 4 0 0 1-4 4 4 4 0 0 0-4 4c0 2 1 3 1 5a5 5 0 0 1-1 3"
        variants={stemVariants}
      />

      {/* Left leaf */}
      <motion.path
        d="M4 9a5 5 0 0 1 8 4 5 5 0 0 1-8-4"
        variants={leafVariants}
      />

      {/* Ground line */}
      <motion.path
        d="M5 21h14"
        variants={groundVariants}
        style={{ originX: 0.5 }}
      />
    </motion.svg>
  );
}
