"use client";

import Image from "next/image";
import { useTheme } from "@/components/theme";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export function Logo({ width = 24, height = 24, className = "" }: LogoProps) {
  const { isDark } = useTheme();

  return (
    <Image
      src={isDark ? "/aegis_dark.svg" : "/aegis.svg"}
      alt="Aegis"
      width={width}
      height={height}
      className={className}
    />
  );
}
