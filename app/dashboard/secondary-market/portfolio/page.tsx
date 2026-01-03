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
import { TradingDashboard } from "@/components/secondary-market/TradingDashboard";
import { Briefcase } from "lucide-react";

export default function PortfolioPage() {
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
                          <Briefcase className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <CardTitle className="text-xl">
                          Portfolio Management
                        </CardTitle>
                      </div>
                      <CardDescription>
                        Manage your loan positions, track performance, and
                        execute trades.
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0 bg-muted/30">
                    <TradingDashboard />
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
