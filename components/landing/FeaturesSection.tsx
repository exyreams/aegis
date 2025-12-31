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
    "digital" | "creation" | "trading" | "compliance" | "esg"
  >("digital");

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
            Complete{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-blue-600">
              Loan Ecosystem
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl">
            From document creation to ESG reporting - every aspect of the loan
            lifecycle in one integrated platform. Built for the complexity of
            modern lending.
          </p>
        </div>

        {/* Feature Navigation */}
        <div className="flex flex-wrap gap-4 mb-12 border-b border-border pb-1">
          <button
            onClick={() => setActiveTab("digital")}
            className={`px-6 py-3 text-sm font-mono transition-all border-b-2 ${
              activeTab === "digital"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            01_DIGITAL_LOANS
          </button>
          <button
            onClick={() => setActiveTab("creation")}
            className={`px-6 py-3 text-sm font-mono transition-all border-b-2 ${
              activeTab === "creation"
                ? "border-blue-500 text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            02_DOC_CREATION
          </button>
          <button
            onClick={() => setActiveTab("trading")}
            className={`px-6 py-3 text-sm font-mono transition-all border-b-2 ${
              activeTab === "trading"
                ? "border-indigo-500 text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            03_LOAN_TRADING
          </button>
          <button
            onClick={() => setActiveTab("compliance")}
            className={`px-6 py-3 text-sm font-mono transition-all border-b-2 ${
              activeTab === "compliance"
                ? "border-green-500 text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            04_COMPLIANCE
          </button>
          <button
            onClick={() => setActiveTab("esg")}
            className={`px-6 py-3 text-sm font-mono transition-all border-b-2 ${
              activeTab === "esg"
                ? "border-emerald-500 text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            05_ESG_REPORTING
          </button>
        </div>

        {/* Feature Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start min-h-[500px]">
          {/* Left: Description */}
          <div className="space-y-8 pt-4">
            {activeTab === "digital" && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <Shield className="h-6 w-6 text-primary" />
                  AI-Powered Extraction
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Advanced NLP models trained specifically on loan documentation
                  extract key terms, covenants, and financial data with 99.7%
                  accuracy. Handle complex legal language, cross-references, and
                  nested conditions that traditional OCR systems miss.
                </p>
                <ul className="space-y-4 font-mono text-sm text-foreground/80">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Multi-format document ingestion</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Contextual term recognition</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Cross-reference resolution</span>
                  </li>
                </ul>
              </div>
            )}

            {activeTab === "creation" && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <FileCode className="h-6 w-6 text-blue-500" />
                  LMA Standard Compliance
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Automatically map extracted data to Loan Market Association
                  (LMA) standard formats and schemas. Ensure consistency across
                  different lenders, jurisdictions, and document types while
                  maintaining full audit trails of all transformations.
                </p>
                <ul className="space-y-4 font-mono text-sm text-foreground/80">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    <span>LMA template mapping</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    <span>Multi-jurisdiction support</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    <span>Automated validation rules</span>
                  </li>
                </ul>
              </div>
            )}

            {activeTab === "trading" && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <Network className="h-6 w-6 text-indigo-500" />
                  System Integration
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Seamlessly integrate with existing loan management systems,
                  risk platforms, and regulatory reporting tools. RESTful APIs
                  and standardized data formats enable rapid deployment across
                  your technology stack.
                </p>
                <ul className="space-y-4 font-mono text-sm text-foreground/80">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                    <span>RESTful API endpoints</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                    <span>Real-time data streaming</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                    <span>Legacy system connectors</span>
                  </li>
                </ul>
              </div>
            )}

            {activeTab === "compliance" && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                  Automated Compliance
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Monitor covenant compliance in real-time with automated alerts
                  and reporting. Track financial ratios, operational
                  requirements, and regulatory obligations across your entire
                  loan portfolio.
                </p>
                <ul className="space-y-4 font-mono text-sm text-foreground/80">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Real-time covenant monitoring</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Automated breach detection</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Regulatory reporting</span>
                  </li>
                </ul>
              </div>
            )}

            {activeTab === "esg" && (
              <div className="animate-fade-in">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <Globe className="h-6 w-6 text-emerald-500" />
                  ESG Integration
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Track environmental, social, and governance metrics across
                  your loan portfolio. Automated ESG scoring, sustainability
                  reporting, and impact measurement for responsible lending.
                </p>
                <ul className="space-y-4 font-mono text-sm text-foreground/80">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>ESG data collection</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Sustainability scoring</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Impact reporting</span>
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
                {activeTab === "digital" && (
                  <div className="flex flex-col items-center justify-center h-full space-y-8 animate-fade-in">
                    {/* Diagram */}
                    <div className="relative w-full max-w-md">
                      <div className="flex justify-between items-center mb-12">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary flex items-center justify-center">
                            <Server className="h-6 w-6 text-primary" />
                          </div>
                          <span className="text-xs font-mono text-muted-foreground">
                            Borrower_Node
                          </span>
                        </div>
                        <div className="h-px flex-1 bg-linear-to-r from-primary/50 to-blue-500/50 mx-4 relative">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500 flex items-center justify-center">
                            <Database className="h-6 w-6 text-blue-500" />
                          </div>
                          <span className="text-xs font-mono text-muted-foreground">
                            Lender_Node
                          </span>
                        </div>
                      </div>

                      {/* Obfuscation Layer */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-24 bg-muted/50 border border-border rounded-lg backdrop-blur-sm flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-xs font-mono text-muted-foreground mb-1">
                            DIGITAL_LOAN_LAYER
                          </div>
                          <div className="flex items-center gap-2 text-xs text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">
                            <CheckCircle2 className="h-3 w-3" /> DATA_EXTRACTED
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "creation" && (
                  <div className="font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto animate-fade-in">
                    <pre>
                      <code className="language-json">
                        {LOAN_DATA_SNIPPET.split("\n").map((line, i) => (
                          <div key={i} className="flex">
                            <span className="text-muted-foreground/50 mr-4 select-none w-6 text-right">
                              {i + 1}
                            </span>
                            <span
                              className={
                                line.includes('"loanId"') ||
                                line.includes('"borrower"') ||
                                line.includes('"facility"') ||
                                line.includes('"terms"') ||
                                line.includes('"covenants"')
                                  ? "text-primary"
                                  : line.includes('"amount"') ||
                                    line.includes('"threshold"') ||
                                    line.includes('"margin"')
                                  ? "text-blue-500"
                                  : line.includes("//")
                                  ? "text-muted-foreground italic"
                                  : "text-foreground"
                              }
                            >
                              {line}
                            </span>
                          </div>
                        ))}
                      </code>
                    </pre>
                  </div>
                )}

                {activeTab === "trading" && (
                  <div className="flex items-center justify-center h-full animate-fade-in">
                    <div className="relative w-64 h-64">
                      {/* Central Node */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-indigo-500/20 border border-indigo-500 rounded-full flex items-center justify-center z-10">
                        <Database className="h-6 w-6 text-indigo-500" />
                      </div>

                      {/* Satellite Nodes */}
                      {[0, 72, 144, 216, 288].map((deg, i) => (
                        <div
                          key={i}
                          className="absolute top-1/2 left-1/2 w-8 h-8 bg-blue-500/20 border border-blue-500 rounded-full flex items-center justify-center"
                          style={{
                            transform: `translate(-50%, -50%) rotate(${deg}deg) translate(100px) rotate(-${deg}deg)`,
                          }}
                        >
                          <Server className="h-4 w-4 text-blue-500" />
                          {/* Connection Line */}
                          <div
                            className="absolute top-1/2 left-1/2 w-[100px] h-px bg-border -z-10 origin-left"
                            style={{
                              transform: `rotate(${deg + 180}deg)`,
                            }}
                          />
                        </div>
                      ))}

                      {/* Pulse Effect */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border border-indigo-500/20 rounded-full animate-ping opacity-20" />
                    </div>
                  </div>
                )}

                {activeTab === "compliance" && (
                  <div className="flex items-center justify-center h-full animate-fade-in">
                    <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                      <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 text-center">
                        <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <div className="text-xs font-mono text-green-500">
                          COMPLIANT
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Debt/EBITDA
                        </div>
                      </div>
                      <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 text-center">
                        <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <div className="text-xs font-mono text-green-500">
                          COMPLIANT
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Min Liquidity
                        </div>
                      </div>
                      <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4 text-center">
                        <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                        <div className="text-xs font-mono text-yellow-500">
                          WARNING
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Interest Cover
                        </div>
                      </div>
                      <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 text-center">
                        <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <div className="text-xs font-mono text-green-500">
                          COMPLIANT
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Capex Limit
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "esg" && (
                  <div className="flex items-center justify-center h-full animate-fade-in">
                    <div className="space-y-4 w-full max-w-sm">
                      <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500 rounded-lg">
                        <div>
                          <div className="text-sm font-mono text-emerald-500">
                            Carbon Footprint
                          </div>
                          <div className="text-xs text-muted-foreground">
                            -15% YoY
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-emerald-500">
                          A+
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500 rounded-lg">
                        <div>
                          <div className="text-sm font-mono text-blue-500">
                            Social Impact
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Community Score
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-blue-500">
                          B+
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500 rounded-lg">
                        <div>
                          <div className="text-sm font-mono text-purple-500">
                            Governance
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Board Diversity
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-purple-500">
                          A
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
