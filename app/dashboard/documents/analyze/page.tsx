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
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { DocumentAnalyzer } from "@/components/documents/DocumentAnalyzer";
import { ArrowLeft, FileSearch, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AnalyzePage() {
  const router = useRouter();
  const [documentContent, setDocumentContent] = useState("");
  const [documentType, setDocumentType] = useState("");

  const sampleDocument = `# LOAN AGREEMENT

**Principal Amount:** $500,000
**Interest Rate:** 5.25% per annum
**Term:** 60 months
**Borrower:** Acme Corporation
**Lender:** First National Bank

## 1. LOAN TERMS
The Lender agrees to loan the Principal Amount to the Borrower under the following terms:
- Monthly payments of $9,435.85
- First payment due 30 days from signing
- Payments due on the 15th of each month

## 2. INTEREST AND FEES
Interest shall accrue at 5.25% per annum, compounded monthly.

## 3. COLLATERAL
This loan is secured by business equipment valued at $600,000.

## 4. DEFAULT
Events of default include failure to make payments within 10 days of due date.

## 5. GOVERNING LAW
This agreement shall be governed by the laws of Delaware.`;

  const loadSampleDocument = () => {
    setDocumentContent(sampleDocument);
    setDocumentType("loan_agreement");
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
                        AI Document Analysis
                      </h1>
                      <p className="text-muted-foreground">
                        Analyze loan documents for inconsistencies, risks, and
                        compliance issues
                      </p>
                    </div>
                  </div>
                </div>

                {/* Document Input */}
                <div className="px-4 lg:px-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Upload className="h-5 w-5" />
                          Document Input
                        </CardTitle>
                        <CardDescription>
                          Paste your document content or load a sample document
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="documentType">Document Type</Label>
                          <Select
                            value={documentType}
                            onValueChange={setDocumentType}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select document type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="loan_agreement">
                                Loan Agreement
                              </SelectItem>
                              <SelectItem value="term_sheet">
                                Term Sheet
                              </SelectItem>
                              <SelectItem value="credit_agreement">
                                Credit Agreement
                              </SelectItem>
                              <SelectItem value="promissory_note">
                                Promissory Note
                              </SelectItem>
                              <SelectItem value="security_agreement">
                                Security Agreement
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="content">Document Content</Label>
                          <Textarea
                            id="content"
                            placeholder="Paste your document content here..."
                            value={documentContent}
                            onChange={(e) => setDocumentContent(e.target.value)}
                            className="min-h-64 font-mono text-sm"
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={loadSampleDocument}
                            className="flex-1"
                          >
                            Load Sample Document
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setDocumentContent("");
                              setDocumentType("");
                            }}
                          >
                            Clear
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileSearch className="h-5 w-5" />
                          Analysis Features
                        </CardTitle>
                        <CardDescription>
                          What our AI analysis will detect
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm">
                              Inconsistencies
                            </h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• Financial calculation errors</li>
                              <li>• Contradictory terms</li>
                              <li>• Missing required clauses</li>
                              <li>• Conflicting dates and timelines</li>
                            </ul>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-medium text-sm">
                              Risk Factors
                            </h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• Credit risk assessment</li>
                              <li>• Legal enforceability issues</li>
                              <li>• Operational risks</li>
                              <li>• Market condition factors</li>
                            </ul>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-medium text-sm">Compliance</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• TILA disclosure requirements</li>
                              <li>• ECOA compliance notices</li>
                              <li>• State and federal regulations</li>
                              <li>• Industry best practices</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Analysis Results */}
                {documentContent && documentType && (
                  <div className="px-4 lg:px-6">
                    <DocumentAnalyzer
                      documentContent={documentContent}
                      documentType={documentType}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
