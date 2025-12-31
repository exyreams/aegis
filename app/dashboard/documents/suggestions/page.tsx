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
import { SmartClauseSuggestions } from "@/components/documents/SmartClauseSuggestions";
import { ArrowLeft, Lightbulb, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SuggestionsPage() {
  const router = useRouter();
  const [documentContent, setDocumentContent] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [loanAmount, setLoanAmount] = useState<number>(500000);
  const [interestRate, setInterestRate] = useState<number>(5.25);

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

## 2. INTEREST AND FEES
Interest shall accrue at 5.25% per annum, compounded monthly.

## 3. COLLATERAL
This loan is secured by business equipment valued at $600,000.

## 4. DEFAULT
Events of default include failure to make payments within 10 days of due date.`;

  const loadSampleDocument = () => {
    setDocumentContent(sampleDocument);
    setDocumentType("loan_agreement");
  };

  const handleClauseAccepted = (clause: any) => {
    const updatedContent = `${documentContent}\n\n## ${clause.title}\n\n${clause.clauseText}`;
    setDocumentContent(updatedContent);
    toast.success(`"${clause.title}" clause added to document`);
  };

  const handleClauseRejected = (clause: any) => {
    toast.success(`"${clause.title}" clause rejected`);
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
                        Smart Clause Suggestions
                      </h1>
                      <p className="text-muted-foreground">
                        AI-powered recommendations to improve your loan
                        documents
                      </p>
                    </div>
                  </div>
                </div>

                {/* Document Setup */}
                <div className="px-4 lg:px-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Document Content
                        </CardTitle>
                        <CardDescription>
                          Your current document content (suggestions will be
                          based on this)
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
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

                        <Button
                          variant="outline"
                          onClick={loadSampleDocument}
                          className="w-full"
                        >
                          Load Sample Document
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="h-5 w-5" />
                          Document Parameters
                        </CardTitle>
                        <CardDescription>
                          Configure document details for better suggestions
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
                              <SelectValue placeholder="Select type" />
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
                          <Label htmlFor="loanAmount">Loan Amount ($)</Label>
                          <input
                            id="loanAmount"
                            type="number"
                            value={loanAmount}
                            onChange={(e) =>
                              setLoanAmount(Number(e.target.value))
                            }
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="interestRate">
                            Interest Rate (%)
                          </Label>
                          <input
                            id="interestRate"
                            type="number"
                            step="0.01"
                            value={interestRate}
                            onChange={(e) =>
                              setInterestRate(Number(e.target.value))
                            }
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>

                        <div className="pt-4 border-t">
                          <h4 className="font-medium text-sm mb-2">
                            Suggestion Categories
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span>Protection clauses</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>Flexibility terms</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span>Compliance requirements</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span>Risk mitigation</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Smart Suggestions */}
                {documentContent && documentType && (
                  <div className="px-4 lg:px-6">
                    <SmartClauseSuggestions
                      documentType={documentType}
                      documentContent={documentContent}
                      loanAmount={loanAmount}
                      interestRate={interestRate}
                      onClauseAccepted={handleClauseAccepted}
                      onClauseRejected={handleClauseRejected}
                    />
                  </div>
                )}

                {/* Info Card */}
                <div className="px-4 lg:px-6">
                  <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4">
                        How Smart Suggestions Work
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">AI Analysis</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Analyzes your document content</li>
                            <li>• Considers loan parameters</li>
                            <li>• Reviews industry best practices</li>
                            <li>• Identifies missing protections</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">
                            Smart Recommendations
                          </h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Context-aware clause suggestions</li>
                            <li>• Risk assessment and mitigation</li>
                            <li>• Compliance requirement checks</li>
                            <li>• One-click clause insertion</li>
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
