export interface Stat {
  value: string;
  label: string;
  description?: string;
}

export const PLATFORM_STATS: Stat[] = [
  {
    value: "$2.5B+",
    label: "Total Volume Processed",
    description: "Across all institutional partners",
  },
  {
    value: "150+",
    label: "Institutional Partners",
    description: "Banks, funds, and lending institutions",
  },
  {
    value: "99.9%",
    label: "Platform Uptime",
    description: "Enterprise-grade reliability",
  },
  {
    value: "24/7",
    label: "Global Support",
    description: "Round-the-clock technical assistance",
  },
];
