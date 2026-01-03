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
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Plus,
} from "lucide-react";

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
          <div className="@container/main flex flex-1 flex-col gap-6 py-6 md:py-8">
            {/* Header */}
            <div className="px-4 md:px-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Portfolio
                  </h1>
                  <p className="text-muted-foreground">
                    Track your loan investments and performance
                  </p>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Investment
                </Button>
              </div>
            </div>

            {/* Portfolio Overview */}
            <div className="px-4 md:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Value
                        </p>
                        <p className="text-2xl font-bold">$2.4M</p>
                        <div className="flex items-center gap-1 text-xs text-emerald-600">
                          <TrendingUp className="h-3 w-3" />
                          +12.5%
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                        <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Active Positions
                        </p>
                        <p className="text-2xl font-bold">8</p>
                        <p className="text-xs text-muted-foreground">
                          Across 5 sectors
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                        <PieChart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Avg. Yield
                        </p>
                        <p className="text-2xl font-bold">9.2%</p>
                        <div className="flex items-center gap-1 text-xs text-emerald-600">
                          <TrendingUp className="h-3 w-3" />
                          vs 7.5% market
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                        <BarChart3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Monthly Income
                        </p>
                        <p className="text-2xl font-bold">$18.4K</p>
                        <p className="text-xs text-muted-foreground">
                          Next payment in 5 days
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                        <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Portfolio Content */}
            <div className="px-4 md:px-8">
              <Card>
                <CardHeader>
                  <CardTitle>Your Investments</CardTitle>
                  <CardDescription>
                    Manage and track your loan portfolio performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <PieChart className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      Portfolio Coming Soon
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Portfolio management features are currently in
                      development.
                    </p>
                    <Button variant="outline">Browse Secondary Market</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
