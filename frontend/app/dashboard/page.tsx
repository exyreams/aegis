"use client";

import { AppSidebar } from "@/components/navigation";
import { ChartAreaInteractive } from "@/components/charts";
import { SectionCards } from "@/components/dashboard";
import { SiteHeader } from "@/components/layout";
import { SidebarInset, SidebarProvider } from "@/components/ui/Sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RFQList } from "@/components/rfq/RFQList";
import { CreateRFQModal } from "@/components/rfq/CreateRFQModal";
import { useState } from "react";
import {
  Plus,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  ArrowRight,
  FileText,
  Settings,
  Coins,
  Wallet,
  Droplets,
  ShieldAlert,
} from "lucide-react";
import { useRFQs } from "@/hooks/useRFQ";
import { useAuth } from "@/hooks/useAuth";
import type { UserData } from "@/types/api";
import Link from "next/link";

// Recent RFQs Section Component
function RecentRFQsSection({
  auth,
}: {
  auth: {
    user: UserData | null;
  };
}) {
  const { data: rfqs, loading, error } = useRFQs();

  const recentRFQs = rfqs?.slice(0, 5) || [];
  const activeCount =
    rfqs?.filter((rfq) => rfq.status === "active").length || 0;

  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent RFQs</CardTitle>
            <CardDescription>
              Your latest Request for Quote submissions
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{activeCount} Active</Badge>
            <Link href="/dashboard/rfqs">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              Loading recent RFQs...
            </div>
          ) : error ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              Unable to load RFQs
            </div>
          ) : recentRFQs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No RFQs found. Create your first RFQ to get started.
            </div>
          ) : (
            <RFQList
              rfqs={recentRFQs}
              currentUser={auth.user}
              showActions={false}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page() {
  const [showCreateRFQ, setShowCreateRFQ] = useState(false);
  const { auth } = useAuth();

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
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Key Metrics */}
              <SectionCards />

              {/* Quick Actions - Dynamic based on role */}
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription>
                      {auth.user?.role === "admin"
                        ? "Platform administration and management"
                        : "Manage your lending activities and RFQ requests"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {auth.user?.role === "admin" ? (
                      // Admin Quick Actions
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Link href="/dashboard/admin/platform">
                          <Card className="cursor-pointer hover:border-primary transition-colors h-full">
                            <CardHeader className="pb-3">
                              <CardTitle className="flex items-center gap-2 text-base">
                                <Settings className="h-5 w-5" />
                                Platform
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground mb-3">
                                Platform configuration and status management
                              </p>
                              <div className="flex items-center text-sm text-primary">
                                Manage <ArrowRight className="h-4 w-4 ml-1" />
                              </div>
                            </CardContent>
                          </Card>
                        </Link>

                        <Link href="/dashboard/admin/treasury">
                          <Card className="cursor-pointer hover:border-primary transition-colors h-full">
                            <CardHeader className="pb-3">
                              <CardTitle className="flex items-center gap-2 text-base">
                                <Coins className="h-5 w-5" />
                                Treasury
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground mb-3">
                                Treasury operations and minting controls
                              </p>
                              <div className="flex items-center text-sm text-primary">
                                Manage <ArrowRight className="h-4 w-4 ml-1" />
                              </div>
                            </CardContent>
                          </Card>
                        </Link>

                        <Link href="/dashboard/admin/assets">
                          <Card className="cursor-pointer hover:border-primary transition-colors h-full">
                            <CardHeader className="pb-3">
                              <CardTitle className="flex items-center gap-2 text-base">
                                <FileText className="h-5 w-5" />
                                Assets
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground mb-3">
                                Asset authorization and balance tracking
                              </p>
                              <div className="flex items-center text-sm text-primary">
                                Manage <ArrowRight className="h-4 w-4 ml-1" />
                              </div>
                            </CardContent>
                          </Card>
                        </Link>

                        <Link href="/dashboard/admin/lenders">
                          <Card className="cursor-pointer hover:border-primary transition-colors h-full">
                            <CardHeader className="pb-3">
                              <CardTitle className="flex items-center gap-2 text-base">
                                <Wallet className="h-5 w-5" />
                                Lenders
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground mb-3">
                                Lender registration and funding operations
                              </p>
                              <div className="flex items-center text-sm text-primary">
                                Manage <ArrowRight className="h-4 w-4 ml-1" />
                              </div>
                            </CardContent>
                          </Card>
                        </Link>

                        <Link href="/dashboard/admin/fees">
                          <Card className="cursor-pointer hover:border-primary transition-colors h-full">
                            <CardHeader className="pb-3">
                              <CardTitle className="flex items-center gap-2 text-base">
                                <DollarSign className="h-5 w-5" />
                                Fees
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground mb-3">
                                Fee collection and monitoring dashboard
                              </p>
                              <div className="flex items-center text-sm text-primary">
                                Manage <ArrowRight className="h-4 w-4 ml-1" />
                              </div>
                            </CardContent>
                          </Card>
                        </Link>

                        <Link href="/dashboard/admin/liquidity">
                          <Card className="cursor-pointer hover:border-primary transition-colors h-full">
                            <CardHeader className="pb-3">
                              <CardTitle className="flex items-center gap-2 text-base">
                                <Droplets className="h-5 w-5" />
                                Liquidity
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground mb-3">
                                Liquidity support and pool management
                              </p>
                              <div className="flex items-center text-sm text-primary">
                                Manage <ArrowRight className="h-4 w-4 ml-1" />
                              </div>
                            </CardContent>
                          </Card>
                        </Link>

                        <Link href="/dashboard/admin/emergency">
                          <Card className="cursor-pointer hover:border-red-500 transition-colors h-full">
                            <CardHeader className="pb-3">
                              <CardTitle className="flex items-center gap-2 text-base text-red-600">
                                <ShieldAlert className="h-5 w-5" />
                                Emergency
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground mb-3">
                                Critical emergency operations and controls
                              </p>
                              <div className="flex items-center text-sm text-red-600">
                                Access <ArrowRight className="h-4 w-4 ml-1" />
                              </div>
                            </CardContent>
                          </Card>
                        </Link>

                        <Link href="/dashboard/users">
                          <Card className="cursor-pointer hover:border-primary transition-colors h-full">
                            <CardHeader className="pb-3">
                              <CardTitle className="flex items-center gap-2 text-base">
                                <Users className="h-5 w-5" />
                                Users
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground mb-3">
                                User management and party administration
                              </p>
                              <div className="flex items-center text-sm text-primary">
                                Manage <ArrowRight className="h-4 w-4 ml-1" />
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </div>
                    ) : (
                      // Regular User Quick Actions
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Button
                          onClick={() => setShowCreateRFQ(true)}
                          className="h-20 flex flex-col gap-2"
                        >
                          <Plus className="h-6 w-6" />
                          <span>Create RFQ</span>
                        </Button>

                        <Button
                          variant="outline"
                          className="h-20 flex flex-col gap-2"
                        >
                          <Users className="h-6 w-6" />
                          <span>Browse Lenders</span>
                        </Button>

                        <Button
                          variant="outline"
                          className="h-20 flex flex-col gap-2"
                        >
                          <DollarSign className="h-6 w-6" />
                          <span>View Loans</span>
                        </Button>

                        <Button
                          variant="outline"
                          className="h-20 flex flex-col gap-2"
                        >
                          <Clock className="h-6 w-6" />
                          <span>Pending Bids</span>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Market Overview Chart */}
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Market Overview</CardTitle>
                    <CardDescription>
                      Interest rates and lending volume trends
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartAreaInteractive />
                  </CardContent>
                </Card>
              </div>

              {/* Recent RFQs */}
              <RecentRFQsSection auth={auth} />
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Create RFQ Modal */}
      <CreateRFQModal
        open={showCreateRFQ}
        onOpenChange={setShowCreateRFQ}
        onSuccess={() => {
          // Refresh RFQ list or show success message
          console.log("RFQ created successfully");
        }}
      />
    </SidebarProvider>
  );
}
