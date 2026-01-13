"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Hexagon, Menu, X, Terminal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

const NAV_LINKS = [
  { label: "Trading Platform", href: "#features" },
  { label: "Due Diligence", href: "#security" },
  { label: "Market Data", href: "#stats" },
  { label: "API Docs", href: "#docs" },
];

export function LandingNavigation() {
  const { auth } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-border py-4"
          : "bg-transparent border-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <img
                src="/aegis_dark.svg"
                alt="Aegis Logo"
                className="h-8 w-auto object-contain"
              />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">
              Aegis
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {auth.user ? (
              <Link href="/dashboard">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/50 font-mono text-xs uppercase tracking-wide">
                  <Terminal className="mr-2 h-3 w-3" />
                  Console
                </Button>
              </Link>
            ) : (
              <>
                <Link
                  href="/auth"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
                <Link href="/auth">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/50 font-mono text-xs uppercase tracking-wide">
                    Start_Trading
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border p-4 space-y-4 animate-in slide-in-from-top-5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="block text-sm font-medium text-muted-foreground hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-border flex flex-col gap-3">
            <Link href="/auth">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Start_Trading
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
