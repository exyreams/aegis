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
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import {
  FileText,
  FileSearch,
  ArrowLeftRight,
  ClipboardCheck,
  Leaf,
  Plus,
  ArrowRight,
  TrendingUp,
  Building2,
  Wallet,
} from "lucide-react";

export default function DashboardPage() {
  const { auth } = useAuth();
  const user = auth.user;

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
          <div className="flex flex-col gap-6 p-4 md:p-6">
            {/* Welcome Section */}
            <div>
              <h1 className="text-2xl font-bold">
                Welcome back, {user?.name || "User"}
              </h1>
              <p className="text-muted-foreground">
                {user?.role === "admin" && "Platform Administrator Dashboard"}
                {user?.role === "lender" &&
                  "Manage your lending portfolio and discover opportunities"}
                {user?.role === "borrower" && "Manage your loans and documents"}
              </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Active Loans</CardDescription>
                  <CardTitle className="text-3xl">0</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                    Start by creating a loan request
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Documents</CardDescription>
                  <CardTitle className="text-3xl">0</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    <FileText className="inline h-3 w-3 mr-1" />
                    Upload loan documents to get started
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Compliance Score</CardDescription>
                  <CardTitle className="text-3xl">--</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    <ClipboardCheck className="inline h-3 w-3 mr-1" />
                    Complete your profile to calculate
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Platform Features - 5 Hackathon Categories */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Platform Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Digital Loans */}
                <Card className="hover:border-primary transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <FileSearch className="h-5 w-5 text-blue-500" />
                      Digital Loans
                    </CardTitle>
                    <CardDescription>
                      Extract and digitize loan agreement data using AI
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/dashboard/loans">
                      <Button variant="outline" size="sm" className="w-full">
                        Manage Loans <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Loan Documents */}
                <Card className="hover:border-primary transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <FileText className="h-5 w-5 text-purple-500" />
                      Loan Documents
                    </CardTitle>
                    <CardDescription>
                      Create and negotiate loan agreements faster
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/dashboard/loans">
                      <Button variant="outline" size="sm" className="w-full">
                        View Documents <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Loan Trading */}
                <Card className="hover:border-primary transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <ArrowLeftRight className="h-5 w-5 text-green-500" />
                      Loan Trading
                    </CardTitle>
                    <CardDescription>
                      Secondary market with automated due diligence
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/dashboard/secondary-market">
                      <Button variant="outline" size="sm" className="w-full">
                        Trade Loans <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Compliance Tracking */}
                <Card className="hover:border-primary transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <ClipboardCheck className="h-5 w-5 text-orange-500" />
                      Compliance
                    </CardTitle>
                    <CardDescription>
                      Track covenants and obligations automatically
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/dashboard/loans">
                      <Button variant="outline" size="sm" className="w-full">
                        View Compliance <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* ESG Reporting */}
                <Card className="hover:border-primary transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Leaf className="h-5 w-5 text-emerald-500" />
                      ESG Reporting
                    </CardTitle>
                    <CardDescription>
                      Capture and verify sustainability metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/dashboard/loans">
                      <Button variant="outline" size="sm" className="w-full">
                        ESG Dashboard <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Quick Action based on role */}
                {user?.role === "borrower" && (
                  <Card className="border-primary bg-primary/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Plus className="h-5 w-5" />
                        New Loan Request
                      </CardTitle>
                      <CardDescription>
                        Create a new loan request to find lenders
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href="/dashboard/loans">
                        <Button size="sm" className="w-full">
                          Create Request <Plus className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}

                {user?.role === "lender" && (
                  <Card className="border-primary bg-primary/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Building2 className="h-5 w-5" />
                        Browse Opportunities
                      </CardTitle>
                      <CardDescription>
                        Find loan requests matching your criteria
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href="/dashboard/loans">
                        <Button size="sm" className="w-full">
                          View Requests <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}

                {user?.role === "admin" && (
                  <Card className="border-primary bg-primary/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Wallet className="h-5 w-5" />
                        Platform Overview
                      </CardTitle>
                      <CardDescription>
                        Monitor platform activity and users
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href="/dashboard/settings">
                        <Button size="sm" className="w-full">
                          Settings <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Recent Activity Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest actions and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No recent activity yet</p>
                  <p className="text-sm">
                    Start by exploring the platform features above
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
