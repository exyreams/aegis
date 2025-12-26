"use client";

import { createAvatar } from "@dicebear/core";
import { glass } from "@dicebear/collection";
import { useMemo } from "react";
import { toast } from "sonner";

interface GlassAvatarProps {
  seed?: string;
  size?: number;
  className?: string;
}

// Vibrant color palette for glass avatars
const AVATAR_COLORS = [
  // Blues
  "3B82F6",
  "1D4ED8",
  "60A5FA",
  "93C5FD",
  // Purples
  "8B5CF6",
  "7C3AED",
  "A78BFA",
  "C4B5FD",
  // Greens
  "10B981",
  "059669",
  "34D399",
  "6EE7B7",
  // Ambers
  "F59E0B",
  "D97706",
  "FBBF24",
  "FCD34D",
  // Reds
  "EF4444",
  "DC2626",
  "F87171",
  "FCA5A5",
  // Cyans
  "06B6D4",
  "0891B2",
  "22D3EE",
  "67E8F9",
  // Pinks
  "EC4899",
  "DB2777",
  "F472B6",
  "F9A8D4",
  // Limes
  "84CC16",
  "65A30D",
  "A3E635",
  "BEF264",
  // Oranges
  "F97316",
  "EA580C",
  "FB923C",
  "FDBA74",
  // Indigos
  "6366F1",
  "4F46E5",
  "818CF8",
  "A5B4FC",
  // Tropical combinations
  "FF6B6B",
  "4ECDC4",
  "45B7D1",
  "96CEB4",
  "A8E6CF",
  "FFD93D",
  "FF8A80",
  "FFD54F",
  "81C784",
  "64B5F6",
  "CE93D8",
  "F48FB1",
  "80CBC4",
  "A5D6A7",
  "FFB74D",
  "FF8A65",
  "F06292",
  "BA68C8",
  "4FC3F7",
  "29B6F6",
  "26C6DA",
  "26A69A",
  "AED581",
  "9CCC65",
  "7CB342",
  "689F38",
  "FFAB91",
  "FFCC02",
  "FF6F00",
  "FF3D00",
  "B39DDB",
  "9575CD",
  "7E57C2",
  "673AB7",
  "81D4FA",
  "039BE5",
];

const BACKGROUND_TYPES = ["gradientLinear", "solid"];

/**
 * Generate a seeded random number between 0 and 1
 */
function seededRandom(seed: string, index: number = 0): number {
  let hash = 0;
  const str = seed + index.toString();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash) / 2147483647;
}

/**
 * Get a random item from array using seeded random
 */
function getRandomFromArray<T>(array: T[], seed: string, index: number = 0): T {
  const randomIndex = Math.floor(seededRandom(seed, index) * array.length);
  return array[randomIndex];
}

/**
 * Generate multiple colors from the palette for gradient backgrounds
 */
function generateColorPalette(seed: string, count: number = 3): string[] {
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    const color = getRandomFromArray(AVATAR_COLORS, seed, i);
    colors.push(color);
  }
  return colors;
}

/**
 * Create a glass avatar with proper DiceBear configuration
 */
function createGlassAvatar(seed: string, size: number): string {
  // Generate color palette for this seed
  const colorPalette = generateColorPalette(seed, 3);

  // Select background type (prefer gradients for more vibrant look)
  const backgroundType = getRandomFromArray(BACKGROUND_TYPES, seed, 10) as
    | "gradientLinear"
    | "solid";

  // Create avatar using DiceBear Glass collection
  const avatar = createAvatar(glass, {
    seed: seed,
    size: size,
    backgroundColor: colorPalette,
    backgroundType: [backgroundType],
    radius: 0, // Keep square for our rounded container
    scale: 100, // Full scale
    flip: false,
    rotate: 0,
    translateX: 0,
    translateY: 0,
    clip: true,
    randomizeIds: true, // Prevent SVG ID conflicts
  });

  return avatar.toString();
}

/**
 * Generate a random glass avatar SVG string
 */
export function generateRandomAvatar(seed: string, size: number = 40): string {
  return createGlassAvatar(seed, size);
}

/**
 * Main GlassAvatar component
 */
export function GlassAvatar({
  seed = "default",
  size = 40,
  className = "",
}: GlassAvatarProps) {
  const avatarSvg = useMemo(() => {
    // Handle JSON format (from database)
    if (seed.startsWith("{")) {
      try {
        const jsonData = JSON.parse(seed);
        let svgString = jsonData.svg || jsonData;

        // Ensure we have a valid SVG string
        if (
          svgString &&
          typeof svgString === "string" &&
          svgString.includes("<svg")
        ) {
          // Update width and height attributes to match the requested size
          svgString = svgString
            .replace(/width="\d+"/, `width="${size}"`)
            .replace(/height="\d+"/, `height="${size}"`);

          return svgString;
        } else {
          // If no valid SVG found in JSON, regenerate using the original seed
          const originalSeed = jsonData.seed || "fallback";
          return createGlassAvatar(originalSeed, size);
        }
      } catch {
        // Don't show toast for parsing errors, just fallback silently
        return createGlassAvatar("fallback", size);
      }
    }

    // Handle data URL format (legacy)
    if (seed.startsWith("data:image/")) {
      try {
        const base64Data = seed.split(",")[1];
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const decodedSvg = new TextDecoder().decode(bytes);
        return decodedSvg;
      } catch {
        // Don't show toast for parsing errors, just fallback silently
        return createGlassAvatar("fallback", size);
      }
    }

    // Generate new avatar from seed
    return createGlassAvatar(seed, size);
  }, [seed, size]);

  return (
    <div
      className={`inline-block rounded-full overflow-hidden bg-muted ${className}`}
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        dangerouslySetInnerHTML={{
          __html: avatarSvg
            ? avatarSvg.replace(
                /<svg([^>]*)>/,
                `<svg$1 style="width: 100%; height: 100%; display: block;">`
              )
            : avatarSvg,
        }}
      />
    </div>
  );
}

/**
 * Generate glass avatar data for database storage
 */
export function generateGlassAvatarUrl(
  seed: string,
  size: number = 200
): string {
  try {
    // Generate the avatar SVG
    const svgString = createGlassAvatar(seed, size);

    if (!svgString) {
      throw new Error("Failed to generate avatar SVG");
    }

    // Get the color palette used for this avatar
    const colorPalette = generateColorPalette(seed, 3);
    const backgroundType = getRandomFromArray(BACKGROUND_TYPES, seed, 10) as
      | "gradientLinear"
      | "solid";

    // Return comprehensive JSON data for database storage
    return JSON.stringify({
      svg: svgString,
      seed: seed,
      colors: colorPalette,
      backgroundType: backgroundType,
      size: size,
      timestamp: Date.now(),
    });
  } catch {
    toast.error("Avatar generation failed");

    // Create fallback avatar
    const fallbackColor = AVATAR_COLORS[0];
    const fallbackSvg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fallback-${seed}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#${fallbackColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:#${fallbackColor};stop-opacity:0.8" />
        </linearGradient>
      </defs>
      <circle cx="${size / 2}" cy="${size / 2}" r="${
      size / 2
    }" fill="url(#fallback-${seed})"/>
    </svg>`;

    return JSON.stringify({
      svg: fallbackSvg,
      seed: seed,
      colors: [fallbackColor],
      backgroundType: "gradientLinear",
      size: size,
      timestamp: Date.now(),
      fallback: true,
    });
  }
}
