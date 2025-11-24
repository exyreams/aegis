"use client";

import { motion } from "framer-motion";

interface TrashProps {
  className?: string;
  size?: number;
}

export function Trash({ className = "", size = 24 }: TrashProps) {
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
      <motion.g
        variants={{
          initial: { y: 0 },
          animate: {
            y: -1,
            transition: { duration: 0.3, ease: "easeInOut" },
          },
        }}
      >
        <motion.path
          d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
          variants={{
            initial: {},
            animate: {},
          }}
        />
        <motion.path
          d="M3 6h18"
          variants={{
            initial: {},
            animate: {},
          }}
        />
      </motion.g>
      <motion.path
        d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"
        variants={{
          initial: {
            y: 0,
            d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",
          },
          animate: {
            y: 1,
            d: "M19 8v12c0 1-1 2-2 2H7c-1 0-2-1-2-2V8",
            transition: { duration: 0.3, ease: "easeInOut" },
          },
        }}
      />
      <motion.line
        x1={10}
        x2={10}
        y1={11}
        y2={17}
        variants={{
          initial: { y: 0 },
          animate: {
            y: 1,
            transition: { duration: 0.3, ease: "easeInOut" },
          },
        }}
      />
      <motion.line
        x1={14}
        x2={14}
        y1={11}
        y2={17}
        variants={{
          initial: { y: 0 },
          animate: {
            y: 1,
            transition: { duration: 0.3, ease: "easeInOut" },
          },
        }}
      />
    </motion.svg>
  );
}
