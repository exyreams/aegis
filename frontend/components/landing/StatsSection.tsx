"use client";

import { Activity, Server, Database, Globe } from "lucide-react";

const STATS = [
  { label: "NETWORK_LATENCY", value: "12ms", icon: Activity, status: "bg-emerald-500" },
  { label: "ACTIVE_NODES", value: "142", icon: Server, status: "bg-emerald-500" },
  { label: "TOTAL_VALUE_LOCKED", value: "$2.5B+", icon: Database, status: "bg-emerald-500" },
  { label: "TRANSACTIONS_24H", value: "8.4K", icon: Globe, status: "bg-emerald-500" },
];

export function StatsSection() {
  return (
    <section className="border-y border-border bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
          {STATS.map((stat, index) => (
            <div key={index} className="p-6 sm:p-8 flex flex-col items-center text-center group hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2 mb-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
                <div className={`w-1.5 h-1.5 rounded-full ${stat.status} animate-pulse`} />
                {stat.label}
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-foreground font-mono tracking-tight group-hover:text-primary transition-colors">
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
