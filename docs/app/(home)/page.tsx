import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Zap,
  Lock,
  Code2,
  Database,
  Network,
  Github,
  Search,
  BookOpen,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div className="w-full text-center py-24 md:py-32 bg-grid-zinc-200/[0.2] dark:bg-grid-zinc-800/[0.2] relative border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">
            Aegis RFQ Documentation
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            Your guide to building secure, enterprise-grade lending workflows
            with DAML smart contracts on the Canton Network.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-10">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search documentation... (e.g., 'Create RFQ')"
                className="w-full pl-12 h-14 text-lg rounded-full"
              />
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="text-base px-8 py-6 rounded-full group"
            >
              <Link href="/docs/getting-started">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-base px-8 py-6 rounded-full"
            >
              <Link
                href="https://github.com/exyreams/aegis"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="mr-2 w-5 h-5" />
                View on GitHub
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* "Get Started" Section */}
      <div className="w-full px-4 py-24 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {/* Step 1: Concepts */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Core Concepts</h3>
              <p className="text-muted-foreground mb-4">
                Understand the fundamentals of Aegis RFQ, DAML, and our
                privacy-first architecture.
              </p>
              <Button asChild variant="link" className="text-lg text-primary">
                <Link href="/docs/concepts">
                  Learn the Basics
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>

            {/* Step 2: Quickstart */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                <Rocket className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Quickstart Guide</h3>
              <p className="text-muted-foreground mb-4">
                Follow our step-by-step guide to set up your environment and
                initiate your first RFQ.
              </p>
              <Button asChild variant="link" className="text-lg text-primary">
                <Link href="/docs/quickstart">
                  Start Building
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>

            {/* Step 3: API Reference */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                <Code2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">API Reference</h3>
              <p className="text-muted-foreground mb-4">
                Dive deep into our API modules and endpoints with detailed
                examples.
              </p>
              <Button asChild variant="link" className="text-lg text-primary">
                <Link href="/docs/api">
                  Explore the API
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full px-4 py-24 bg-muted/40 border-t border-border/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
              Why Aegis RFQ?
            </h2>
            <p className="text-lg text-muted-foreground mb-16">
              Built for institutional lending with privacy, security, and
              performance at its core.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Lock className="w-6 h-6 text-primary" />}
              title="Privacy-First Architecture"
              description="Confidential bidding with DAML observer patterns. Competing lenders never see each other's offers."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6 text-primary" />}
              title="Institutional Grade"
              description="Multi-party workflows, credit scoring, collateral management, and syndicated lending."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-primary" />}
              title="High Performance"
              description="Built with Next.js 15, React 19, Hono.js, and Bun for maximum speed and efficiency."
            />
            <FeatureCard
              icon={<Code2 className="w-6 h-6 text-primary" />}
              title="Developer Friendly"
              description="Comprehensive API docs with examples in TypeScript, Python, and cURL."
            />
            <FeatureCard
              icon={<Database className="w-6 h-6 text-primary" />}
              title="Complete Audit Trails"
              description="Built-in compliance tracking and immutable audit logs for regulatory requirements."
            />
            <FeatureCard
              icon={<Network className="w-6 h-6 text-primary" />}
              title="Canton Network"
              description="Powered by DAML on Canton Network for interoperable, privacy-preserving workflows."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for Feature Cards to keep the main component clean
const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <div className="p-6 bg-card border border-border/50 rounded-xl transition-all hover:border-primary/50 hover:shadow-md">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <p className="text-muted-foreground mt-4">{description}</p>
    </div>
  );
};
