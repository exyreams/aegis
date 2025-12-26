"use client";

import { motion } from "framer-motion";

interface BiddingProps {
  className?: string;
  size?: number;
  isAnimating?: boolean;
  forceHover?: boolean;
}

export function Bidding({
  className = "",
  size = 24,
  isAnimating = false,
  forceHover = false,
}: BiddingProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 -8 72 72"
      fill="currentColor"
      className={className}
      initial="initial"
      animate={isAnimating ? "animating" : forceHover ? "hover" : "idle"}
      whileHover={!isAnimating && !forceHover ? "hover" : undefined}
    >
      <motion.g
        variants={{
          initial: { rotate: 0 },
          idle: { rotate: 0 },
          hover: {
            rotate: [0, -10, 10, 0],
            transition: {
              duration: 0.6,
              ease: "easeInOut",
            },
          },
          animating: {
            rotate: [0, -20, 0],
            transition: {
              duration: 0.8,
              ease: "easeOut",
              repeat: Infinity,
              repeatDelay: 0.5,
            },
          },
        }}
        style={{ originX: "50%", originY: "70%" }}
      >
        <motion.path
          d="M59,27.27l-10,10a3.66,3.66,0,0,1-5.18-.07,3.7,3.7,0,0,1-.56-4.56l-4.4-4.4-3.57,3.58A3.84,3.84,0,0,1,34.17,35L18.61,50.54a3.87,3.87,0,0,1-5.48-5.48L28.68,29.52a3.91,3.91,0,0,1,4.23-.85l3.18-3.18-4.4-4.4a3.72,3.72,0,0,1-4.63-5.74l10-10A3.72,3.72,0,0,1,42.79,10L54.33,21.54A3.72,3.72,0,0,1,59,27.27Z"
          variants={{
            initial: { opacity: 1 },
            idle: { opacity: 1 },
            hover: { opacity: 1 },
            animating: {
              opacity: [1, 0.8, 1],
              transition: {
                duration: 0.8,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 0.5,
              },
            },
          }}
        />
      </motion.g>
    </motion.svg>
  );
}
