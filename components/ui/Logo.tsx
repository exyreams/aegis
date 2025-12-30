/* eslint-disable @next/next/no-img-element */
"use client";


import { useTheme } from "@/components/theme";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export function Logo({ width = 24, height = 24, className = "" }: LogoProps) {
  const { isDark } = useTheme();

  return (
    <img
      src={isDark ? "/aegis_dark.svg" : "/aegis.svg"}
      alt="Aegis"
      width={width}
      height={height}
      className={`${className} h-auto`}
    />
  );
}
