"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/navigation";
import { SiteHeader } from "@/components/layout";
import { SidebarInset, SidebarProvider } from "@/components/ui/Sidebar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { NegotiationTracker } from "@/components/documents/NegotiationTracker";
import {
  ArrowLeft,
  MessageSquare,
  Users,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function NegotiatePage() {
  const router = useRouter();
  const { auth } = useAuth();
  const [selectedDocument] = useState("sample-loan-agreement");

  // Mock document data
  const mockDocument = {
    id: "sample-loan-agreement",
    title: "Acme Corp Loan Agreement",
    type: "loan_agreement",
    amount: 500000,
    interestRate: 5.25,
    term: 60,
    borrower: "Acme Corporation",
    lender: "First National Bank",
    status: "under_negotiation",
    lastModified: new Date().toISOString(),
  };

  // Mock negotiation stats
  const negotiationStats = {
    totalComments: 12,
    pendingChanges: 3,
    acceptedChanges: 8,
    rejectedChanges: 2,
    participants: 4,
  };

  return (
    <ProtectedRoute>
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
                {/* Header */}
                <div className="px-4 lg:px-6">
                  <div className="flex items-center gap-4 mb-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push("/dashboard/documents")}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Documents
                    </Button>
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold tracking-tight">
                        Document Negotiation
                      </h1>
                      <p className="text-muted-foreground">
                        Collaborate in real-time on loan document terms and
                        conditions
                      </p>
                    </div>
                  </div>
                </div>

                {/* Document Info */}
                <div className="px-4 lg:px-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{mockDocument.title}</CardTitle>
                          <CardDescription>
                            {mockDocument.borrower} ↔ {mockDocument.lender}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="capitalize">
                          {mockDocument.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            ${mockDocument.amount.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Loan Amount
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {mockDocument.interestRate}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Interest Rate
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {mockDocument.term}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Months
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {negotiationStats.participants}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Participants
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Negotiation Stats */}
                <div className="px-4 lg:px-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                          <div>
                            <div className="text-2xl font-bold">
                              {negotiationStats.totalComments}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Comments
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-600" />
                          <div>
                            <div className="text-2xl font-bold">
                              {negotiationStats.pendingChanges}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Pending
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <div>
                            <div className="text-2xl font-bold">
                              {negotiationStats.acceptedChanges}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Accepted
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-purple-600" />
                          <div>
                            <div className="text-2xl font-bold">
                              {negotiationStats.participants}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Participants
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Negotiation Interface */}
                <div className="px-4 lg:px-6">
                  <NegotiationTracker
                    documentId={selectedDocument}
                    currentUser={{
                      name: auth.user?.email || "Current User",
                      role:
                        (auth.user?.role as
                          | "borrower"
                          | "lender"
                          | "advisor") || "borrower",
                    }}
                  />
                </div>

                {/* Features Info */}
                <div className="px-4 lg:px-6">
                  <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4">
                        Negotiation Features
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">
                            Real-time Collaboration
                          </h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Comment on specific document sections</li>
                            <li>• Propose changes with reasoning</li>
                            <li>• Accept or reject modifications</li>
                            <li>• Track all negotiation history</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Smart Workflow</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Role-based permissions</li>
                            <li>• Automated notifications</li>
                            <li>• Status tracking</li>
                            <li>• Audit trail for compliance</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
