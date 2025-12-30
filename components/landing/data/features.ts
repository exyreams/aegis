import {
  Documents,
  DigitalLoans,
  Users,
} from "@/components/icons";
import { Coins, CreditCard, ShieldCheck } from "lucide-react";

export interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  benefits: string[];
  route: string;
}

export const PLATFORM_FEATURES: Feature[] = [
  {
    icon: Documents,
    title: "Digital Loan Documents",
    description:
      "AI-powered extraction and standardization of loan terms from complex legal documents",
    benefits: [
      "99.7% extraction accuracy",
      "LMA standard compliance",
      "Cross-system data portability",
    ],
    route: "/dashboard/documents",
  },
  {
    icon: ShieldCheck,
    title: "Document Creation & Negotiation",
    description:
      "Accelerate loan document creation with intelligent templates and real-time collaboration",
    benefits: [
      "Smart document templates",
      "Real-time collaboration",
      "Automated consistency checks",
    ],
    route: "/dashboard/creation",
  },
  {
    icon: DigitalLoans,
    title: "Transparent Loan Trading",
    description:
      "Automate secondary market due diligence with smart contracts and real-time verification",
    benefits: [
      "Automated due diligence",
      "Smart contract settlement",
      "Real-time price discovery",
    ],
    route: "/dashboard/trading",
  },
  {
    icon: CreditCard,
    title: "Keeping Loans on Track",
    description:
      "Continuous monitoring of loan covenants and borrower obligations with automated alerts",
    benefits: [
      "Real-time covenant monitoring",
      "Automated breach detection",
      "Standardized reporting",
    ],
    route: "/dashboard/compliance",
  },
  {
    icon: Users,
    title: "Greener Lending & ESG",
    description:
      "Comprehensive ESG data capture, verification, and reporting for sustainable lending",
    benefits: [
      "ESG data standardization",
      "Third-party verification",
      "Impact measurement & reporting",
    ],
    route: "/dashboard/esg",
  },
  {
    icon: Coins,
    title: "Platform Integration",
    description:
      "RESTful APIs and connectors for seamless integration with existing loan management systems",
    benefits: [
      "Real-time data streaming",
      "Legacy system connectors",
      "Webhook notifications",
    ],
    route: "/dashboard/api",
  },
];
