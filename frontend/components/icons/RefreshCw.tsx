"use client";

import { motion } from "framer-motion";

interface RefreshCwProps {
  className?: string;
  size?: number;
  isSpinning?: boolean;
  forceHover?: boolean;
}

export function RefreshCw({
  className = "",
  size = 24,
  isSpinning = false,
  forceHover = false,
}: RefreshCwProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      initial="initial"
      animate={isSpinning ? "spinning" : forceHover ? "hover" : "idle"}
      whileHover={!isSpinning && !forceHover ? "hover" : undefined}
    >
      <motion.g
        variants={{
          initial: { rotate: 0 },
          idle: { rotate: 0 },
          hover: {
            rotate: -45,
            transition: { type: "spring", stiffness: 150, damping: 25 },
          },
          spinning: {
            rotate: 360,
            transition: {
              duration: 1,
              ease: "linear",
              repeat: Infinity,
            },
          },
        }}
        style={{ originX: "50%", originY: "50%" }}
      >
        <motion.path
          d="M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.61061 20 7.46589 18.9525 6 17.2916M9 17H6V17.2916M18.2002 4V6.94416M18.2002 6.94416V6.99993L15.2002 7M6 20V17.2916"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={{
            initial: { pathLength: 1, opacity: 0.8 },
            idle: { pathLength: 1, opacity: 0.8 },
            hover: {
              pathLength: [1, 0.8, 1],
              opacity: [0.8, 1, 0.8],
              transition: { duration: 0.6, ease: "easeInOut" },
            },
            spinning: {
              pathLength: [0.8, 1, 0.8],
              opacity: [0.8, 1, 0.8],
              transition: {
                duration: 1,
                ease: "easeInOut",
                repeat: Infinity,
              },
            },
          }}
        />
      </motion.g>
    </motion.svg>
  );
}
