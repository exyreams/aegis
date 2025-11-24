import {
  Coins,
  CreditCard,
  Shield,
  FileDescription,
  Loan,
  Users,
} from "@/components/icons";

export interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  benefits: string[];
  route: string;
}

export const PLATFORM_FEATURES: Feature[] = [
  {
    icon: FileDescription,
    title: "RFQ Management",
    description:
      "Create and manage Request for Quote workflows with privacy-preserving bidding",
    benefits: [
      "Confidential bid submission",
      "Anonymous lender profiles",
      "Automated matching",
    ],
    route: "/dashboard/rfqs",
  },
  {
    icon: Users,
    title: "User Management",
    description:
      "Comprehensive user and role management for institutional participants",
    benefits: [
      "Role-based access control",
      "DAML party integration",
      "Audit trails",
    ],
    route: "/dashboard/users",
  },
  {
    icon: Loan,
    title: "Active Loans",
    description:
      "Monitor and manage active loan portfolios with real-time updates",
    benefits: [
      "Real-time loan tracking",
      "Payment processing",
      "Performance analytics",
    ],
    route: "/dashboard/loans",
  },
  {
    icon: CreditCard,
    title: "Credit Management",
    description:
      "Advanced credit scoring and risk assessment with DAML integration",
    benefits: [
      "Automated credit scoring",
      "Risk assessment tools",
      "Credit history tracking",
    ],
    route: "/dashboard/credit",
  },
  {
    icon: Shield,
    title: "Collateral Pools",
    description:
      "Multi-asset collateral management with dynamic valuation and liquidation",
    benefits: [
      "Multi-asset support",
      "Automated margin calls",
      "Liquidation workflows",
    ],
    route: "/dashboard/collateral",
  },
  {
    icon: Coins,
    title: "Yield Generation",
    description:
      "Liquidity pools and automated market making for optimized returns",
    benefits: [
      "LP token rewards",
      "Automated rebalancing",
      "Dynamic fee structures",
    ],
    route: "/dashboard/yield",
  },
];
