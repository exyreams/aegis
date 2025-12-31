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
import { VersionComparison } from "@/components/documents/VersionComparison";
import { ArrowLeft, GitBranch, Clock, User, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

export default function VersionsPage() {
  const router = useRouter();
  const [selectedDocument] = useState("sample-loan-agreement");

  // Mock document data
  const mockDocument = {
    id: "sample-loan-agreement",
    title: "Acme Corp Loan Agreement",
    type: "loan_agreement",
    currentVersion: "2.1",
    totalVersions: 8,
    lastModified: new Date().toISOString(),
    modifiedBy: "Legal Team",
  };

  // Mock version stats
  const versionStats = {
    totalVersions: 8,
    drafts: 3,
    approved: 4,
    archived: 1,
    contributors: 5,
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
                        Version Control
                      </h1>
                      <p className="text-muted-foreground">
                        Track changes and compare document versions with
                        Git-like precision
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
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            {mockDocument.title}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1">
                              <GitBranch className="h-4 w-4" />
                              Version {mockDocument.currentVersion}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Last modified{" "}
                              {new Date(
                                mockDocument.lastModified
                              ).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {mockDocument.modifiedBy}
                            </span>
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {mockDocument.type.replace("_", " ")}
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>
                </div>

                {/* Version Stats */}
                <div className="px-4 lg:px-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <GitBranch className="h-4 w-4 text-blue-600" />
                          <div>
                            <div className="text-2xl font-bold">
                              {versionStats.totalVersions}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Total Versions
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-yellow-600" />
                          <div>
                            <div className="text-2xl font-bold">
                              {versionStats.drafts}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Drafts
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 bg-green-600 rounded-full" />
                          <div>
                            <div className="text-2xl font-bold">
                              {versionStats.approved}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Approved
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 bg-gray-600 rounded-full" />
                          <div>
                            <div className="text-2xl font-bold">
                              {versionStats.archived}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Archived
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-purple-600" />
                          <div>
                            <div className="text-2xl font-bold">
                              {versionStats.contributors}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Contributors
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Version Control Interface */}
                <div className="px-4 lg:px-6">
                  <VersionComparison documentId={selectedDocument} />
                </div>

                {/* Features Info */}
                <div className="px-4 lg:px-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">
                          Version Control Features
                        </h3>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Complete document history</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>Visual diff comparisons</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span>Change attribution</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span>Restore previous versions</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span>Branching and merging</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">
                          Comparison Tools
                        </h3>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Side-by-side document comparison</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>Highlight additions and deletions</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span>Track modifications</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span>Line-by-line analysis</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span>Export comparison reports</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
