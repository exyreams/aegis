"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Terminal, Activity, Server, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

// Simulated Trading Platform Activity
const MOCK_TRANSACTIONS = [
  {
    hash: "DD_7f3a2b",
    type: "DD_COMPLETED",
    amount: "Score: 92/100",
    time: "2ms ago",
  },
  {
    hash: "TR_9c8d1e",
    type: "TRADE_EXECUTED",
    amount: "$25M Position",
    time: "45ms ago",
  },
  {
    hash: "CV_1a4f5c",
    type: "COVENANT_ALERT",
    amount: "Warning Issued",
    time: "120ms ago",
  },
  {
    hash: "MP_3d9e2a",
    type: "MARKETPLACE_BID",
    amount: "$50M Listed",
    time: "350ms ago",
  },
  {
    hash: "RS_5b1c8f",
    type: "RISK_SCORED",
    amount: "Auto-Verified",
    time: "800ms ago",
  },
];

export function HeroSection() {
  const { auth } = useAuth();
  const [blockHeight, setBlockHeight] = useState(18492034);
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);

  // Simulate live ledger activity
  useEffect(() => {
    const interval = setInterval(() => {
      setBlockHeight((prev) => prev + 1);
      setTransactions((prev) => {
        const newTx = {
          hash: `0x${Math.random()
            .toString(16)
            .substring(2, 4)}...${Math.random().toString(16).substring(2, 6)}`,
          type: ["DD_SCORED", "TRADE_MATCHED", "RISK_UPDATED", "COMPLIANCE_OK"][
            Math.floor(Math.random() * 4)
          ],
          amount: `$${(Math.random() * 50 + 1).toFixed(1)}M`,
          time: "just now",
        };
        return [newTx, ...prev.slice(0, 4)];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center bg-background text-foreground overflow-hidden pt-20">
      {/* Technical Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: Value Prop */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-xs tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              PROCESSING_STATUS: ACTIVE
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-indigo-500">
                Transparent Loan
              </span>
              <br />
              Trading Platform
            </h1>

            <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
              Transform secondary loan trading with AI-powered due diligence,
              real-time risk scoring, and transparent marketplace. Reduce costs
              by 90% and complete trades in days, not weeks.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {auth.user ? (
                <Link href="/dashboard">
                  <Button className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-none border border-primary/50 font-mono uppercase tracking-wide">
                    <Terminal className="mr-2 h-4 w-4" />
                    Access_Platform
                  </Button>
                </Link>
              ) : (
                <Link href="/auth">
                  <Button className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-none border border-primary/50 font-mono uppercase tracking-wide">
                    <Terminal className="mr-2 h-4 w-4" />
                    Start_Processing
                  </Button>
                </Link>
              )}
              <Button
                variant="outline"
                className="h-12 px-8 border-border text-muted-foreground hover:bg-muted hover:text-foreground rounded-none font-mono uppercase tracking-wide"
              >
                View_Platform_Demo
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border">
              <div>
                <div className="text-muted-foreground text-xs font-mono uppercase mb-1">
                  Secondary_Market
                </div>
                <div className="text-2xl font-mono font-bold text-foreground">
                  $847B
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs font-mono uppercase mb-1">
                  Cost_Reduction
                </div>
                <div className="text-2xl font-mono font-bold text-foreground">
                  90%
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs font-mono uppercase mb-1">
                  DD_Time_Saved
                </div>
                <div className="text-2xl font-mono font-bold text-primary">
                  85%
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Ledger Visualization */}
          <div className="relative">
            {/* Terminal Window */}
            <div className="bg-card border border-border rounded-lg overflow-hidden shadow-2xl shadow-primary/5 font-mono text-sm">
              {/* Terminal Header */}
              <div className="bg-muted/50 px-4 py-2 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive/50 border border-destructive/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50 border border-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50 border border-green-500/50" />
                </div>
                <div className="text-muted-foreground text-xs">
                  aegis-platform-01
                </div>
              </div>

              {/* Terminal Content */}
              <div className="p-6 space-y-6">
                {/* System Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-muted/30 p-3 rounded border border-border">
                    <div className="text-muted-foreground text-xs mb-1 flex items-center gap-2">
                      <Server className="h-3 w-3" /> ACTIVE_LOANS
                    </div>
                    <div className="text-primary font-bold">
                      #{blockHeight.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded border border-border">
                    <div className="text-muted-foreground text-xs mb-1 flex items-center gap-2">
                      <Activity className="h-3 w-3" /> PROCESSING_TIME
                    </div>
                    <div className="text-primary font-bold">1.2s avg</div>
                  </div>
                </div>

                {/* Transaction Feed */}
                <div>
                  <div className="text-muted-foreground text-xs mb-3 flex items-center gap-2">
                    <Shield className="h-3 w-3" /> LIVE_PLATFORM_ACTIVITY
                  </div>
                  <div className="space-y-2">
                    {transactions.map((tx, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs p-2 hover:bg-muted/50 rounded transition-colors border-l-2 border-transparent hover:border-primary"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">
                            {tx.time}
                          </span>
                          <span
                            className={`font-bold ${
                              tx.type === "DOC_GENERATED"
                                ? "text-blue-500"
                                : tx.type === "TRADE_EXECUTED"
                                ? "text-indigo-500"
                                : tx.type === "ESG_REPORTED"
                                ? "text-green-500"
                                : tx.type === "COVENANT_BREACH"
                                ? "text-red-500"
                                : "text-primary"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-muted-foreground font-mono">
                            {tx.hash}
                          </span>
                          <span className="text-foreground w-20 text-right">
                            {tx.amount}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Command Input */}
                <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-muted-foreground">
                  <span className="text-blue-500">➜</span>
                  <span className="text-primary">~</span>
                  <span className="animate-pulse">_</span>
                </div>
              </div>
            </div>

            {/* Decorative Elements behind terminal */}
            <div className="absolute -z-10 top-10 -right-10 w-full h-full bg-primary/5 rounded-lg blur-3xl" />
            <div className="absolute -z-10 -bottom-10 -left-10 w-full h-full bg-blue-500/5 rounded-lg blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
