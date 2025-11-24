"use client";

import { motion } from "framer-motion";

interface LoanProps {
  className?: string;
  size?: number;
}

export function Loan({ className = "", size = 24 }: LoanProps) {
  return (
    <motion.svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      enableBackground="new 0 0 100 100"
      xmlSpace="preserve"
      className={className}
      whileHover="animate"
      initial="initial"
    >
      <motion.g fill="currentColor">
        {/* Hand holding money */}
        <motion.path
          d="M97.3,58.4c-0.4-1.4-1.4-2.5-2.8-3.1c-1.3-0.6-2.9-0.5-4.2,0.1L71,65.1c0.2,1.1,0.1,2.2-0.2,3.3c-1,4.2-5,6.9-9.2,6.4     l-17-2.2c-1.4-0.2-2.4-1.4-2.2-2.8c0.2-1.4,1.4-2.4,2.8-2.2l17,2.2c1.7,0.2,3.2-0.9,3.7-2.5c0.4-1.6-0.4-3.2-1.9-3.8l-17.6-7.4     c-3.4-1.5-7.3-1.5-10.8,0l-11.1,4.7v27.6l27.4,4.3c5.6,0.9,11.3-0.7,15.6-4.5l28.3-24.4C97.3,62.3,97.8,60.3,97.3,58.4z"
          variants={{
            initial: { scale: 1, opacity: 0.8 },
            animate: {
              scale: [1, 1.05, 1],
              opacity: [0.8, 1, 0.8],
              transition: { duration: 0.8, ease: "easeInOut" },
            },
          }}
        />

        {/* Money stack */}
        <motion.path
          d="M16.4,56.5h-11c-1.6,0-2.9,1.3-2.9,2.9V90c0,1.6,1.3,2.9,2.9,2.9h11c1.6,0,2.9-1.3,2.9-2.9V59.4     C19.4,57.8,18,56.5,16.4,56.5z"
          variants={{
            initial: { y: 0, opacity: 0.8 },
            animate: {
              y: [0, -2, 0],
              opacity: [0.8, 1, 0.8],
              transition: { duration: 1, ease: "easeInOut", delay: 0.1 },
            },
          }}
        />

        {/* Dollar coin */}
        <motion.path
          d="M64,41.1c7.1,0,12.9-5.8,12.9-12.9S71.1,15.2,64,15.2c-7.1,0-12.9,5.8-12.9,12.9S56.8,41.1,64,41.1z M60.5,23     c0.6-0.6,1.5-1,2.4-1v-1.4c0-0.6,0.5-1.1,1.1-1.1c0.6,0,1.1,0.5,1.1,1.1V22c1.4,0.1,2.7,1,3.2,2.3c0.2,0.6-0.1,1.2-0.7,1.4     c-0.6,0.2-1.2-0.1-1.4-0.7c-0.2-0.6-0.7-0.9-1.3-0.9h-1.8c-0.4,0-0.7,0.1-1,0.4c-0.3,0.3-0.4,0.6-0.4,1c0,0.8,0.6,1.4,1.4,1.4     h1.8c1,0,1.9,0.4,2.6,1.1c0.7,0.7,1.1,1.6,1.1,2.6c0,1.9-1.5,3.5-3.4,3.6v1.4c0,0.6-0.5,1.1-1.1,1.1c-0.6,0-1.1-0.5-1.1-1.1v-1.4     c-1.4-0.1-2.7-1-3.2-2.3c-0.2-0.6,0.1-1.2,0.6-1.4c0.6-0.2,1.2,0.1,1.4,0.6c0.2,0.6,0.7,0.9,1.4,0.9h1.8c0.8,0,1.4-0.6,1.4-1.4     c0-0.4-0.1-0.7-0.4-1c-0.3-0.3-0.6-0.4-1-0.4h-1.8c-2,0-3.6-1.6-3.6-3.6C59.4,24.6,59.8,23.7,60.5,23z"
          variants={{
            initial: { scale: 1, rotate: 0 },
            animate: {
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0],
              transition: { duration: 1.2, ease: "easeInOut", delay: 0.2 },
            },
          }}
        />

        {/* Money bill */}
        <motion.path
          d="M35,49.2h57.8c1.4,0,2.6-1.2,2.6-2.6v-37c0-1.4-1.2-2.6-2.6-2.6H35c-1.4,0-2.6,1.2-2.6,2.6v37     C32.5,48.1,33.6,49.2,35,49.2z M37.6,19.8c3.7-0.9,6.6-3.8,7.6-7.6h37.6c0.9,3.7,3.8,6.6,7.6,7.6v16.8c-3.7,0.9-6.6,3.8-7.6,7.6     H45.2c-0.9-3.7-3.8-6.6-7.6-7.6V19.8z"
          variants={{
            initial: { pathLength: 1, opacity: 0.8 },
            animate: {
              pathLength: [1, 0.95, 1],
              opacity: [0.8, 1, 0.8],
              transition: { duration: 0.9, ease: "easeInOut", delay: 0.3 },
            },
          }}
        />

        {/* Bill corner decorations */}
        <motion.circle
          cx="44.3"
          cy="28.2"
          r="3.1"
          variants={{
            initial: { scale: 1, opacity: 0.7 },
            animate: {
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
              transition: { duration: 0.6, ease: "easeInOut", delay: 0.4 },
            },
          }}
        />
        <motion.circle
          cx="83.6"
          cy="28.2"
          r="3.1"
          variants={{
            initial: { scale: 1, opacity: 0.7 },
            animate: {
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
              transition: { duration: 0.6, ease: "easeInOut", delay: 0.5 },
            },
          }}
        />

        {/* Floating money coming from top */}
        <motion.circle
          cx="25"
          cy="10"
          r="2"
          variants={{
            initial: { y: -20, opacity: 0, scale: 0.5 },
            animate: {
              y: [0, 15, 30],
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.8],
              transition: { duration: 2, ease: "easeOut", delay: 0.6 },
            },
          }}
        />
        <motion.circle
          cx="40"
          cy="5"
          r="1.5"
          variants={{
            initial: { y: -25, opacity: 0, scale: 0.3 },
            animate: {
              y: [0, 20, 40],
              opacity: [0, 1, 0],
              scale: [0.3, 1, 0.6],
              transition: { duration: 2.2, ease: "easeOut", delay: 0.8 },
            },
          }}
        />
        <motion.circle
          cx="55"
          cy="8"
          r="1.8"
          variants={{
            initial: { y: -22, opacity: 0, scale: 0.4 },
            animate: {
              y: [0, 18, 35],
              opacity: [0, 1, 0],
              scale: [0.4, 1, 0.7],
              transition: { duration: 2.1, ease: "easeOut", delay: 1.0 },
            },
          }}
        />
        <motion.circle
          cx="75"
          cy="6"
          r="1.6"
          variants={{
            initial: { y: -18, opacity: 0, scale: 0.4 },
            animate: {
              y: [0, 12, 25],
              opacity: [0, 1, 0],
              scale: [0.4, 1, 0.8],
              transition: { duration: 1.8, ease: "easeOut", delay: 1.2 },
            },
          }}
        />

        {/* Small dollar signs floating down */}
        <motion.text
          x="30"
          y="12"
          fontSize="4"
          textAnchor="middle"
          variants={{
            initial: { y: -15, opacity: 0, scale: 0.3 },
            animate: {
              y: [0, 20, 35],
              opacity: [0, 0.8, 0],
              scale: [0.3, 1, 0.5],
              transition: { duration: 2.5, ease: "easeOut", delay: 0.7 },
            },
          }}
        >
          $
        </motion.text>
        <motion.text
          x="70"
          y="8"
          fontSize="3.5"
          textAnchor="middle"
          variants={{
            initial: { y: -12, opacity: 0, scale: 0.2 },
            animate: {
              y: [0, 15, 28],
              opacity: [0, 0.8, 0],
              scale: [0.2, 1, 0.4],
              transition: { duration: 2.3, ease: "easeOut", delay: 1.1 },
            },
          }}
        >
          $
        </motion.text>
      </motion.g>
    </motion.svg>
  );
}
