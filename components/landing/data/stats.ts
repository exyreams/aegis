export interface Stat {
  value: string;
  label: string;
  description?: string;
}

export const PLATFORM_STATS: Stat[] = [
  {
    value: "$2.8B+",
    label: "Total Loan Volume",
    description: "Managed across all platform modules",
  },
  {
    value: "1,247",
    label: "Active Loan Facilities",
    description: "From origination to maturity",
  },
  {
    value: "85%",
    label: "Process Efficiency Gain",
    description: "Compared to traditional methods",
  },
  {
    value: "99.9%",
    label: "Platform Uptime",
    description: "Enterprise-grade reliability",
  },
];
