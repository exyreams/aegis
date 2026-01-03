"use client";

import { AppSidebar } from "@/components/navigation";
import { SiteHeader } from "@/components/layout";
import { SidebarInset, SidebarProvider } from "@/components/ui/Sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { MarketAnalytics } from "@/components/secondary-market/MarketAnalytics";
import { PieChart } from "lucide-react";

interface MarketStats {
  totalVolume: number;
  activeListings: number;
  avgDueDiligenceTime: number;
  avgTransactionCost: number;
  completedTrades: number;
  avgYield: number;
}

export default function AnalyticsPage() {
  // Mock market statistics
  const marketStats: MarketStats = {
    totalVolume: 1847000000000,
    activeListings: 234,
    avgDueDiligenceTime: 2.3,
    avgTransactionCost: 12500,
    completedTrades: 156,
    avgYield: 9.45,
  };

  // Mock trends data for analytics
  const mockTrends = [
    { month: "Jan", volume: 145, avgYield: 8.2 },
    { month: "Feb", volume: 167, avgYield: 8.4 },
    { month: "Mar", volume: 189, avgYield: 8.1 },
    { month: "Apr", volume: 203, avgYield: 8.6 },
    { month: "May", volume: 178, avgYield: 8.9 },
    { month: "Jun", volume: 234, avgYield: 8.7 },
    { month: "Jul", volume: 256, avgYield: 8.5 },
    { month: "Aug", volume: 289, avgYield: 8.8 },
    { month: "Sep", volume: 267, avgYield: 9.1 },
    { month: "Oct", volume: 298, avgYield: 8.9 },
    { month: "Nov", volume: 312, avgYield: 8.6 },
    { month: "Dec", volume: 334, avgYield: 8.7 },
  ];

  // Mock industry data for analytics
  const mockIndustryData = [
    { name: "Healthcare", value: 28, color: "var(--chart-1)" },
    { name: "Technology", value: 22, color: "var(--chart-2)" },
    { name: "Manufacturing", value: 18, color: "var(--chart-3)" },
    { name: "Energy", value: 15, color: "var(--chart-4)" },
    { name: "Real Estate", value: 12, color: "var(--chart-5)" },
    { name: "Other", value: 5, color: "#94a3b8" },
  ];

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-8 py-6 md:gap-10 md:py-8">
              <div className="px-4 md:px-8">
                <Card className="overflow-hidden">
                  <CardHeader className="bg-muted/50 border-b pb-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                          <PieChart className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <CardTitle className="text-xl">
                          Market Analytics
                        </CardTitle>
                      </div>
                      <CardDescription>
                        Comprehensive market insights, trends, and performance
                        analytics.
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0 bg-muted/30">
                    <MarketAnalytics
                      trends={mockTrends}
                      industryData={mockIndustryData}
                      stats={marketStats}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
