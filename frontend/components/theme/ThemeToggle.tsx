"use client";

import { motion } from "framer-motion";
import React, { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "./Theme";

interface ThemeToggleProps {
  className?: string;
  direction?:
    | "bottom-up"
    | "top-down"
    | "left-right"
    | "right-left"
    | "top-right"
    | "top-left"
    | "bottom-left"
    | "bottom-right";
}

export const ThemeToggle = ({
  className = "",
  direction = "top-right",
}: ThemeToggleProps) => {
  const { isDark, theme, setTheme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  const styleId = "theme-transition-styles";

  const updateStyles = useCallback((css: string) => {
    if (typeof window === "undefined") return;

    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = css;
  }, []);

  const getClipPath = (direction: string) => {
    switch (direction) {
      case "bottom-up":
        return {
          from: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
          to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        };
      case "top-down":
        return {
          from: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
          to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        };
      case "left-right":
        return {
          from: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
          to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        };
      case "right-left":
        return {
          from: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
          to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        };
      case "top-right":
        return {
          from: "polygon(100% 0%, 100% 0%, 100% 0%, 100% 0%)",
          to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        };
      case "top-left":
        return {
          from: "polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)",
          to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        };
      case "bottom-left":
        return {
          from: "polygon(0% 100%, 0% 100%, 0% 100%, 0% 100%)",
          to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        };
      case "bottom-right":
        return {
          from: "polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)",
          to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        };
      default:
        return {
          from: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
          to: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        };
    }
  };

  const createAnimation = useCallback((direction: string) => {
    const clipPath = getClipPath(direction);
    return `
      ::view-transition-group(root) {
        animation-duration: 0.5s;
        animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
        animation-fill-mode: both;
      }
      
      ::view-transition-new(root) {
        animation-name: reveal-light-${direction};
        will-change: clip-path;
        backface-visibility: hidden;
        transform: translateZ(0);
      }
      
      ::view-transition-old(root),
      .dark::view-transition-old(root) {
        animation: none;
        z-index: -1;
        opacity: 1;
      }
      
      .dark::view-transition-new(root) {
        animation-name: reveal-dark-${direction};
        will-change: clip-path;
        backface-visibility: hidden;
        transform: translateZ(0);
      }
      
      @keyframes reveal-dark-${direction} {
        0% {
          clip-path: ${clipPath.from};
          transform: translateZ(0) scale(1.001);
        }
        100% {
          clip-path: ${clipPath.to};
          transform: translateZ(0) scale(1);
        }
      }
      
      @keyframes reveal-light-${direction} {
        0% {
          clip-path: ${clipPath.from};
          transform: translateZ(0) scale(1.001);
        }
        100% {
          clip-path: ${clipPath.to};
          transform: translateZ(0) scale(1);
        }
      }
    `;
  }, []);

  const toggleTheme = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);
    const animation = createAnimation(direction);
    updateStyles(animation);

    if (typeof window === "undefined") return;

    const switchTheme = () => {
      setTheme(theme === "light" ? "dark" : "light");
      setTimeout(() => setIsAnimating(false), 50);
    };

    if (!document.startViewTransition) {
      switchTheme();
      return;
    }

    document.startViewTransition(switchTheme);
  }, [theme, setTheme, direction, updateStyles, createAnimation, isAnimating]);

  return (
    <button
      type="button"
      className={cn(
        "flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 w-7 h-7 will-change-transform cursor-pointer",
        "text-foreground hover:scale-105",
        isAnimating && "pointer-events-none opacity-80",
        className
      )}
      onClick={toggleTheme}
      disabled={isAnimating}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        fill="currentColor"
        strokeLinecap="round"
        viewBox="0 0 32 32"
        className="w-5 h-5"
      >
        <clipPath id="theme-toggle-clip">
          <motion.path
            animate={{ y: isDark ? 10 : 0, x: isDark ? -12 : 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              mass: 0.8,
            }}
            d="M0-5h30a1 1 0 0 0 9 13v24H0Z"
          />
        </clipPath>
        <g clipPath="url(#theme-toggle-clip)">
          <motion.circle
            animate={{ r: isDark ? 10 : 8 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              mass: 0.8,
            }}
            cx="16"
            cy="16"
          />
          <motion.g
            animate={{
              rotate: isDark ? -100 : 0,
              scale: isDark ? 0.5 : 1,
              opacity: isDark ? 0 : 1,
            }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              mass: 0.8,
            }}
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M16 5.5v-4" />
            <path d="M16 30.5v-4" />
            <path d="M1.5 16h4" />
            <path d="M26.5 16h4" />
            <path d="m23.4 8.6 2.8-2.8" />
            <path d="m5.7 26.3 2.9-2.9" />
            <path d="m5.8 5.8 2.8 2.8" />
            <path d="m23.4 23.4 2.9 2.9" />
          </motion.g>
        </g>
      </svg>
    </button>
  );
};
