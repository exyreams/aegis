"use client";

import Link from "next/link";
import { Github, Twitter, Linkedin, Hexagon } from "lucide-react";

const FOOTER_LINKS = {
  Platform: [
    { label: "Smart Covenants", href: "#" },
    { label: "Privacy Architecture", href: "#" },
    { label: "Network Topology", href: "#" },
    { label: "API Documentation", href: "#" },
  ],
  Company: [
    { label: "About Aegis", href: "#" },
    { label: "Security Audit", href: "#" },
    { label: "Compliance", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Legal: [
    { label: "Terms of Service", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "SLA Agreement", href: "#" },
  ],
};

export function LandingFooter() {
  return (
    <footer className="bg-muted/30 border-t border-border text-muted-foreground font-mono text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-foreground mb-4">
              <img
                src="/aegis_dark.svg"
                alt="Aegis Logo"
                className="h-6 w-auto object-contain"
              />
              <span className="font-bold text-lg tracking-tight">Aegis</span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Institutional-grade lending infrastructure powered by Canton
              Network. Engineered for privacy, compliance, and atomic
              settlement.
            </p>
            <div className="flex gap-4 pt-2">
              <Link
                href="#"
                className="hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="hover:text-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="hover:text-foreground transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-bold text-foreground mb-4 uppercase tracking-wider text-xs">
                {category}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="hover:text-primary transition-colors text-xs"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <div>
            &copy; {new Date().getFullYear()} Aegis Financial Technologies. All
            rights reserved.
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span>SYSTEM_STATUS: OPERATIONAL</span>
            </div>
            <span>v2.4.0-stable</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
