"use client";

import {
  Shield,
  Lock,
  Server,
  CheckCircle2,
  FileCheck,
  Globe,
} from "lucide-react";

const SECURITY_LAYERS = [
  {
    title: "Document Processing",
    icon: Shield,
    features: [
      "End-to-end encryption",
      "Secure document upload",
      "PII redaction & masking",
    ],
    status: "SECURE",
    color: "text-primary",
  },
  {
    title: "Data Protection",
    icon: FileCheck,
    features: [
      "GDPR compliance",
      "Data residency controls",
      "Automated retention policies",
    ],
    status: "COMPLIANT",
    color: "text-blue-500",
  },
  {
    title: "Infrastructure",
    icon: Server,
    features: [
      "SOC 2 Type II certified",
      "Multi-region backup",
      "24/7 monitoring",
    ],
    status: "HARDENED",
    color: "text-indigo-500",
  },
];

const COMPLIANCE_BADGES = [
  { label: "SOC 2 Type II", sub: "Certified", icon: CheckCircle2 },
  { label: "FIPS 140-2", sub: "Level 3", icon: Lock },
  { label: "GDPR / CCPA", sub: "Compliant", icon: Globe },
  { label: "ISO 27001", sub: "Certified", icon: Shield },
];

export function SecuritySection() {
  return (
    <section
      id="security"
      className="py-24 bg-background relative overflow-hidden border-t border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-xs tracking-wider mb-6">
            <Lock className="h-3 w-3" />
            COMPLIANCE_ARCHITECTURE
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-foreground">
            Enterprise-Grade{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
              Document Security
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Bank-level security for sensitive loan documents. Full audit trails,
            encryption, and compliance with financial industry standards.
          </p>
        </div>

        {/* Security Layers Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">
          {SECURITY_LAYERS.map((layer, index) => (
            <div key={index} className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-b from-border to-transparent rounded-xl opacity-50 group-hover:opacity-100 transition duration-500" />
              <div className="relative bg-card h-full p-8 rounded-xl border border-border hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between mb-6">
                  <div className={`p-3 rounded-lg bg-muted/50 ${layer.color}`}>
                    <layer.icon className="h-6 w-6" />
                  </div>
                  <div
                    className={`text-xs font-mono px-2 py-1 rounded bg-muted text-foreground border border-border`}
                  >
                    {layer.status}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-4">
                  {layer.title}
                </h3>

                <ul className="space-y-3">
                  {layer.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-sm text-muted-foreground"
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${layer.color.replace(
                          "text-",
                          "bg-"
                        )}`}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Connecting Line (Desktop) */}
                {index < SECURITY_LAYERS.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-px bg-border z-10" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Compliance Badges */}
        <div className="bg-muted/30 rounded-2xl border border-border p-8 sm:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {COMPLIANCE_BADGES.map((badge, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center space-y-3"
              >
                <div className="p-4 rounded-full bg-background border border-border text-primary">
                  <badge.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-bold text-foreground">{badge.label}</div>
                  <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mt-1">
                    {badge.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
