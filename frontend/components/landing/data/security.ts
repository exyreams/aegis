import { Shield, Lock, Eye, FileCheck, Globe, Zap } from "lucide-react";

export interface SecurityFeature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

export const SECURITY_FEATURES: SecurityFeature[] = [
  {
    icon: Shield,
    title: "SOC 2 Type II Compliant",
    description:
      "Comprehensive security controls and regular third-party audits for institutional trust",
  },
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description:
      "All data encrypted in transit and at rest using enterprise-grade cryptography",
  },
  {
    icon: Eye,
    title: "Role-Based Access Control",
    description:
      "Granular permissions and multi-factor authentication for secure access management",
  },
  {
    icon: FileCheck,
    title: "Regulatory Reporting",
    description:
      "Automated compliance reporting for Basel III, CCAR, and other regulatory frameworks",
  },
  {
    icon: Zap,
    title: "Real-Time Monitoring",
    description:
      "24/7 security monitoring with automated threat detection and incident response",
  },
  {
    icon: Globe,
    title: "Global Infrastructure",
    description:
      "Multi-region deployment with 99.9% uptime SLA and disaster recovery capabilities",
  },
];
