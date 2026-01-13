"use client";

import { useState } from "react";
import {
  Shield,
  Lock,
  Code,
  Network,
  CheckCircle2,
  FileCode,
  Server,
  Database,
  ArrowRight,
  Globe,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const LOAN_DATA_SNIPPET = `{
  "loanId": "TERM_2024_001",
  "borrower": {
    "name": "TechCorp Industries Ltd",
    "jurisdiction": "Delaware",
    "creditRating": "BBB+"
  },
  "facility": {
    "amount": 15000000,
    "currency": "USD",
    "type": "Term Loan",
    "purpose": "Working Capital"
  },
  "terms": {
    "maturityDate": "2027-12-15",
    "interestRate": {
      "type": "floating",
      "benchmark": "SOFR",
      "margin": 2.75,
      "floor": 0.50
    }
  },
  "covenants": {
    "financial": [
      {
        "type": "debt_to_ebitda",
        "threshold": 3.5,
        "testFrequency": "quarterly"
      },
      {
        "type": "minimum_liquidity", 
        "threshold": 5000000,
        "testFrequency": "monthly"
      }
    ],
    "operational": [
      "No material acquisitions > $2M without consent",
      "Maintain primary banking relationship"
    ]
  },
  "security": {
    "type": "first_lien",
    "collateral": ["inventory", "receivables", "equipment"]
  }
}`;

export function FeaturesSection() {
  const [activeTab, setActiveTab] = useState<
    "trading" | "diligence" | "compliance" | "analytics"
  >("trading");

  return (
    <section
      id="features"
      className="py-24 bg-background text-foreground relative overflow-hidden"
    >
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] opacity-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-xs tracking-wider mb-6">
            <Code className="h-3 w-3" />
            SYSTEM_ARCHITECTURE
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-blue-600">
              Transparent Trading
            </span>{" "}
            Platform
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Transform secondary loan trading with AI-powered due diligence,
            real-time compliance monitoring, and transparent risk scoring. Built
            for the modern lending industry.
          </p>
        </div>

        {/* Feature Navigation */}
        <div className="flex flex-wrap gap-4 mb-12 border-b border-border pb-1">
          <button
            onClick={() => setActiveTab("trading")}
            className={`px-6 py-3 text-sm font-mono transition-all border-b-2 ${
              activeTab === "trading"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            01_TRANSPARENT_TRADING
          </button>
          <button
            onClick={() => setActiveTab("diligence")}
            className={`px-6 py-3 text-sm font-mono transition-all border-b-2 ${
              activeTab === "diligence"
                ? "border-blue-500 text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            02_AI_DUE_DILIGENCE
          </button>
          <button
            onClick={() => setActiveTab("compliance")}
            className={`px-6 py-3 text-sm font-mono transition-all border-b-2 ${
              activeTab === "compliance"
                ? "border-indigo-500 text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            03_LIVE_COMPLIANCE
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-6 py-3 text-sm font-mono transition-all border-b-2 ${
              activeTab === "analytics"
                ? "border-green-500 text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            04_RISK_ANALYTICS
          </button>
        </div>

        {/* Feature Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start min-h-[500px]">
          {/* Left: Description */}
          <div className="space-y-8 pt-4">
            {activeTab === "trading" && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <Network className="h-6 w-6 text-primary" />
                  Transparent Marketplace
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Live secondary loan marketplace with real bank counterparties,
                  transparent bid/offer pricing, and standardized risk scores.
                  Trade with confidence using verified compliance data and
                  automated settlement processes.
                </p>
                <ul className="space-y-4 font-mono text-sm text-foreground/80">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Real-time bid/offer pricing</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Standardized risk scoring (0-100)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Automated trade execution</span>
                  </li>
                </ul>
              </div>
            )}

            {activeTab === "diligence" && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <Shield className="h-6 w-6 text-blue-500" />
                  AI-Powered Due Diligence
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Advanced AI models analyze loan documents, extract key terms,
                  and perform comprehensive due diligence checks in 2-3 days
                  instead of weeks. Reduce costs by 90% while maintaining
                  institutional-grade accuracy.
                </p>
                <ul className="space-y-4 font-mono text-sm text-foreground/80">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    <span>Automated document analysis</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    <span>KYC/AML verification</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    <span>Risk scoring algorithms</span>
                  </li>
                </ul>
              </div>
            )}

            {activeTab === "compliance" && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-indigo-500" />
                  Real-time Compliance
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Monitor covenant compliance in real-time with automated alerts
                  and reporting. Track financial ratios, operational
                  requirements, and regulatory obligations across your entire
                  loan portfolio with instant breach detection.
                </p>
                <ul className="space-y-4 font-mono text-sm text-foreground/80">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                    <span>Live covenant monitoring</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                    <span>Automated breach alerts</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                    <span>Regulatory reporting</span>
                  </li>
                </ul>
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <Database className="h-6 w-6 text-green-500" />
                  Risk Analytics
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Advanced analytics correlating yield spreads with compliance
                  scores, providing transparent risk-return insights. Market
                  intelligence feeds and benchmarking data enable informed
                  trading decisions.
                </p>
                <ul className="space-y-4 font-mono text-sm text-foreground/80">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Yield vs risk correlation</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Market benchmarking</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Predictive modeling</span>
                  </li>
                </ul>
              </div>
            )}

            <div className="pt-8">
              <Button
                variant="outline"
                className="border-border text-muted-foreground hover:bg-muted hover:text-foreground font-mono text-xs uppercase tracking-wider"
              >
                Read_Technical_Documentation{" "}
                <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Right: Visualization */}
          <div className="relative bg-card rounded-xl border border-border p-1 shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary via-blue-500 to-indigo-500 rounded-t-xl" />

            {/* Code Window / Diagram Container */}
            <div className="bg-muted/30 rounded-lg overflow-hidden min-h-[400px] flex flex-col">
              {/* Window Controls */}
              <div className="flex items-center px-4 py-3 border-b border-border bg-muted/50">
                <div className="flex gap-2 mr-4">
                  <div className="w-3 h-3 rounded-full bg-destructive/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="text-xs font-mono text-muted-foreground">
                  {activeTab === "digital"
                    ? "loan_structure.json"
                    : activeTab === "creation"
                    ? "extracted_data.json"
                    : activeTab === "trading"
                    ? "api_integration.json"
                    : activeTab === "compliance"
                    ? "compliance_monitor.json"
                    : "esg_metrics.json"}
                </div>
              </div>

              {/* Content Area */}
              <div className="p-6 flex-1 relative">
                {activeTab === "trading" && (
                  <div className="flex flex-col items-center justify-center h-full space-y-6 animate-fade-in">
                    {/* Trading Dashboard Mockup */}
                    <div className="w-full max-w-md space-y-4">
                      <div className="bg-muted/30 p-4 rounded border border-border">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-mono text-muted-foreground">
                            MARKETPLACE
                          </span>
                          <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                            LIVE
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>TechCorp Term Loan</span>
                            <span className="text-green-500">
                              $25M @ 92/100
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Atlas Logistics</span>
                            <span className="text-blue-500">$50M @ 88/100</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Meridian Holdings</span>
                            <span className="text-amber-500">
                              $15M @ 76/100
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-primary/10 p-3 rounded border border-primary/20 text-center">
                        <div className="text-primary font-mono text-lg">
                          $847B
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Secondary Market Volume
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "diligence" && (
                  <div className="flex flex-col items-center justify-center h-full space-y-6 animate-fade-in">
                    {/* DD Process Visualization */}
                    <div className="w-full max-w-md space-y-4">
                      <div className="bg-muted/30 p-4 rounded border border-border">
                        <div className="text-xs font-mono text-muted-foreground mb-3">
                          DUE DILIGENCE PIPELINE
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-sm">Document Analysis</span>
                            <span className="text-xs text-green-500 ml-auto">
                              ✓ Complete
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-sm">KYC/AML Check</span>
                            <span className="text-xs text-green-500 ml-auto">
                              ✓ Verified
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                            <span className="text-sm">Risk Scoring</span>
                            <span className="text-xs text-blue-500 ml-auto">
                              Processing...
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-blue-500/10 p-3 rounded border border-blue-500/20 text-center">
                          <div className="text-blue-500 font-mono text-lg">
                            2.3 days
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Avg DD Time
                          </div>
                        </div>
                        <div className="bg-green-500/10 p-3 rounded border border-green-500/20 text-center">
                          <div className="text-green-500 font-mono text-lg">
                            90%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Cost Savings
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "compliance" && (
                  <div className="flex flex-col items-center justify-center h-full space-y-6 animate-fade-in">
                    {/* Compliance Dashboard */}
                    <div className="w-full max-w-md space-y-4">
                      <div className="bg-muted/30 p-4 rounded border border-border">
                        <div className="text-xs font-mono text-muted-foreground mb-3">
                          COVENANT STATUS
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-green-500/10 border border-green-500/20 rounded p-3 text-center">
                            <div className="text-green-500 font-mono text-sm">
                              PASS
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Debt/EBITDA
                            </div>
                          </div>
                          <div className="bg-green-500/10 border border-green-500/20 rounded p-3 text-center">
                            <div className="text-green-500 font-mono text-sm">
                              PASS
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Min Liquidity
                            </div>
                          </div>
                          <div className="bg-amber-500/10 border border-amber-500/20 rounded p-3 text-center">
                            <div className="text-amber-500 font-mono text-sm">
                              WARN
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Interest Cover
                            </div>
                          </div>
                          <div className="bg-green-500/10 border border-green-500/20 rounded p-3 text-center">
                            <div className="text-green-500 font-mono text-sm">
                              PASS
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Capex Limit
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-indigo-500/10 p-3 rounded border border-indigo-500/20 text-center">
                        <div className="text-indigo-500 font-mono text-lg">
                          90%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Portfolio Compliant
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "analytics" && (
                  <div className="flex flex-col items-center justify-center h-full space-y-6 animate-fade-in">
                    {/* Risk Analytics Chart */}
                    <div className="w-full max-w-md space-y-4">
                      <div className="bg-muted/30 p-4 rounded border border-border">
                        <div className="text-xs font-mono text-muted-foreground mb-3">
                          YIELD vs RISK CORRELATION
                        </div>
                        <div className="relative h-32 bg-muted/20 rounded border border-border p-2">
                          {/* Simple scatter plot visualization */}
                          <div className="absolute bottom-2 left-2 w-2 h-2 bg-green-500 rounded-full"></div>
                          <div className="absolute bottom-4 left-6 w-2 h-2 bg-green-500 rounded-full"></div>
                          <div className="absolute bottom-8 left-12 w-2 h-2 bg-amber-500 rounded-full"></div>
                          <div className="absolute bottom-12 left-20 w-2 h-2 bg-amber-500 rounded-full"></div>
                          <div className="absolute bottom-16 left-28 w-2 h-2 bg-red-500 rounded-full"></div>
                          <div className="absolute bottom-20 left-36 w-2 h-2 bg-red-500 rounded-full"></div>
                          <div className="absolute bottom-1 left-1 text-xs text-muted-foreground">
                            Low Risk
                          </div>
                          <div className="absolute top-1 right-1 text-xs text-muted-foreground">
                            High Yield
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-green-500/10 p-3 rounded border border-green-500/20 text-center">
                          <div className="text-green-500 font-mono text-lg">
                            85%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Prediction Accuracy
                          </div>
                        </div>
                        <div className="bg-primary/10 p-3 rounded border border-primary/20 text-center">
                          <div className="text-primary font-mono text-lg">
                            +15bp
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Risk Premium
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
