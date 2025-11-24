"use client";

import { motion, Variants, Transition } from "framer-motion";

interface FileDescriptionProps {
  className?: string;
  size?: number;
}

const fileVariants: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.03, 1],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

const lineVariants: Variants = {
  initial: { pathLength: 1 },
  animate: {
    pathLength: [1, 0, 1],
  },
};

const lineTransition: Transition = {
  duration: 2,
  ease: "easeInOut",
  repeat: Infinity,
};

export function FileDescription({
  className = "",
  size = 24,
}: FileDescriptionProps) {
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
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
        variants={fileVariants}
      />
      <motion.polyline points="14,2 14,8 20,8" variants={fileVariants} />

      {/* Top text line */}
      <motion.line
        x1="16"
        y1="13"
        x2="8"
        y2="13"
        variants={lineVariants}
        transition={{
          ...lineTransition,
          delay: 0.1,
        }}
      />
      {/* Bottom text line */}
      <motion.line
        x1="16"
        y1="17"
        x2="8"
        y2="17"
        variants={lineVariants}
        transition={{
          ...lineTransition,
          delay: 0.3,
        }}
      />
    </motion.svg>
  );
}
