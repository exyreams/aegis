"use client";

import { AppSidebar } from "@/components/navigation";
import { SiteHeader } from "@/components/layout";
import { SidebarInset, SidebarProvider } from "@/components/ui/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  FileSearch,
  Zap,
  Shield,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Clock,
  DollarSign,
  Target,
  Sparkles,
} from "lucide-react";

export default function AboutPage() {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="bg-zinc-50/50 dark:bg-zinc-950/50">
        <SiteHeader />
        <div className="flex flex-1 flex-col max-w-[1400px] mx-auto w-full p-6 md:p-8 space-y-12">
          
          {/* Hero Section */}
          <div className="text-center space-y-4 py-8">
            <Badge className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-50">
              LMA EDGE Hackathon 2026 • Transparent Loan Trading
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Automated Due Diligence for <br />
              <span className="text-primary">Secondary Loan Markets</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Reducing deal analysis from days to minutes with AI-powered document intelligence
            </p>
          </div>

          {/* Problem Statement */}
          <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-amber-600" />
                The Problem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/80 leading-relaxed">
                Secondary loan trading is a <strong>$1.4 trillion global market</strong>, but every transaction requires extensive due diligence:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3 p-3 bg-background rounded-lg border">
                  <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-sm">3-5 Days</div>
                    <div className="text-xs text-muted-foreground">Average analysis time</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-background rounded-lg border">
                  <DollarSign className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-sm">$15K - $50K</div>
                    <div className="text-xs text-muted-foreground">Cost per transaction</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-background rounded-lg border">
                  <FileSearch className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-sm">100+ Pages</div>
                    <div className="text-xs text-muted-foreground">Manual document review</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Solution Overview */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">How Aegis Works</h2>
              <p className="text-muted-foreground">AI-powered automation in 4 simple steps</p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {[
                {
                  step: "1",
                  title: "Upload Documents",
                  desc: "Drag and drop loan agreements, compliance certs, and financial statements into our Virtual Data Room",
                  icon: FileSearch,
                  color: "blue"
                },
                {
                  step: "2",
                  title: "AI Analysis",
                  desc: "Our NLP engine extracts covenants, transfer clauses, and risk factors with 99.8% accuracy",
                  icon: Sparkles,
                  color: "purple"
                },
                {
                  step: "3",
                  title: "Risk Scoring",
                  desc: "Automated scoring across Financial, Legal, Market, and ESG dimensions with source citations",
                  icon: Shield,
                  color: "emerald"
                },
                {
                  step: "4",
                  title: "Trade Execution",
                  desc: "Export audit reports and proceed directly to trade with pre-validated documentation",
                  icon: Zap,
                  color: "amber"
                }
              ].map((item, i) => (
                <Card key={i} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-${item.color}-500`} />
                  <CardContent className="pt-8 pb-6 px-6">
                    <div className={`h-12 w-12 rounded-full bg-${item.color}-100 dark:bg-${item.color}-950 flex items-center justify-center mb-4`}>
                      <item.icon className={`h-6 w-6 text-${item.color}-600`} />
                    </div>
                    <div className="mb-3">
                      <Badge variant="outline" className="mb-2 text-xs">Step {item.step}</Badge>
                      <h3 className="font-bold text-lg">{item.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </CardContent>
                  {i < 3 && (
                    <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                      <ArrowRight className="h-6 w-6 text-primary" />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* Key Benefits */}
          <Card className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                Business Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: "96% Time Reduction",
                    desc: "From 3-5 days to 90 minutes average",
                    metric: "⏱️"
                  },
                  {
                    title: "97% Cost Savings",
                    desc: "Reduce transaction costs from $15K-50K to ~$500",
                    metric: "💰"
                  },
                  {
                    title: "10x Deal Velocity",
                    desc: "Analyze 10x more opportunities with the same team",
                    metric: "🚀"
                  },
                  {
                    title: "99.8% Accuracy",
                    desc: "AI extraction with human-in-the-loop validation",
                    metric: "🎯"
                  }
                ].map((benefit, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-background rounded-lg border">
                    <div className="text-3xl">{benefit.metric}</div>
                    <div>
                      <div className="font-bold text-lg text-emerald-700 dark:text-emerald-400">{benefit.title}</div>
                      <div className="text-sm text-muted-foreground">{benefit.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Technical Highlights */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-center">Technical Highlights</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "LMA Native",
                  desc: "Built specifically for LMA documentation standards and frameworks",
                  icon: Shield
                },
                {
                  title: "Explainable AI",
                  desc: "Every finding includes source document citations with page numbers",
                  icon: FileSearch
                },
                {
                  title: "Real-time Updates",
                  desc: "Risk scores update instantly as new documents are added to VDR",
                  icon: Zap
                }
              ].map((item, i) => (
                <Card key={i}>
                  <CardContent className="pt-6 pb-6 px-6 space-y-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-bold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Built for LMA EDGE */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8 text-center space-y-4">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-2">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Built for LMA EDGE Hackathon 2026</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                This platform addresses the "Transparent Loan Trading" challenge: automating due diligence checks 
                to reduce costs, increase transparency, and improve liquidity in secondary loan markets.
              </p>
              <div className="flex flex-wrap gap-2 justify-center pt-4">
                {["LMA Compliant", "AI-Powered", "Scalable", "Regulatory Ready"].map((tag) => (
                  <Badge key={tag} variant="outline" className="bg-background">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
