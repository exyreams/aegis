"use client";

import { motion } from "framer-motion";

interface SidebarExpandProps {
  className?: string;
  size?: number;
}

export function SidebarExpand({
  className = "",
  size = 24,
}: SidebarExpandProps) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      whileHover="animate"
      initial="initial"
    >
      <motion.rect
        width="18"
        height="18"
        x="3"
        y="3"
        rx="2"
        ry="2"
        variants={{
          initial: {},
          animate: {},
        }}
      />
      <motion.line
        variants={{
          initial: { x1: 15, y1: 3, x2: 15, y2: 21 },
          animate: {
            x1: 9,
            y1: 3,
            x2: 9,
            y2: 21,
            transition: { type: "spring", damping: 20, stiffness: 200 },
          },
        }}
        x1="15"
        y1="3"
        x2="15"
        y2="21"
      />
    </motion.svg>
  );
}
