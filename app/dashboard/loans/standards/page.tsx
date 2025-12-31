"use client";

import { useState } from "react";
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
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  ArrowLeft,
  Database,
  Download,
  CheckCircle2,
  Code,
  FileText,
  Settings,
  Zap,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { generateMockLoanData, LoanDataStandardizer } from "@/lib/loanData";

export default function DataStandardsPage() {
  const [selectedStandard, setSelectedStandard] = useState("lma-edge");

  const standards = {
    "lma-edge": {
      name: "LMA-EDGE-2024",
      description:
        "Loan Market Association Enhanced Data & Global Exchange Standard",
      version: "2024.1",
      status: "Active",
      coverage: "Europe, Middle East, Africa",
      adoptionRate: 78,
    },
    lsta: {
      name: "LSTA-2024",
      description: "Loan Syndications and Trading Association Standard",
      version: "2024.2",
      status: "Active",
      coverage: "North America",
      adoptionRate: 85,
    },
    aplma: {
      name: "APLMA-2024",
      description: "Asia Pacific Loan Market Association Standard",
      version: "2024.1",
      status: "Active",
      coverage: "Asia Pacific",
      adoptionRate: 62,
    },
  };

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
              {/* Header */}
              <div className="flex items-center justify-between px-4 lg:px-6">
                <div className="flex items-center gap-4">
                  <Link href="/dashboard/loans">
                    <Button variant="ghost" size="sm">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Loans
                    </Button>
                  </Link>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                      Data Standards & Interoperability
                    </h1>
                    <p className="text-muted-foreground">
                      Industry-standard data formats for loan system integration
                    </p>
                  </div>
                </div>
              </div>

              {/* Standards Overview */}
              <div className="px-4 lg:px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(standards).map(([key, standard]) => (
                    <Card
                      key={key}
                      className={`cursor-pointer transition-all ${
                        selectedStandard === key
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedStandard(key)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <Badge className="bg-green-500 text-white">
                            {standard.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            v{standard.version}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg mb-2">
                          {standard.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {standard.description}
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Coverage:</span>
                            <span className="font-medium">
                              {standard.coverage}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Adoption:</span>
                            <span className="font-medium">
                              {standard.adoptionRate}%
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Detailed Standard Information */}
              <div className="px-4 lg:px-6">
                <Tabs defaultValue="overview">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="schema">Data Schema</TabsTrigger>
                    <TabsTrigger value="integration">Integration</TabsTrigger>
                    <TabsTrigger value="validation">Validation</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Standardization Benefits</CardTitle>
                        <CardDescription>
                          How standardized data formats transform loan
                          operations
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                              <span className="font-medium">
                                Cross-System Interoperability
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground ml-8">
                              Seamless data exchange between different loan
                              management systems
                            </p>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                              <span className="font-medium">
                                Automated Reporting
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground ml-8">
                              Generate regulatory and management reports
                              automatically
                            </p>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                              <span className="font-medium">
                                Loan Comparison
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground ml-8">
                              Compare terms and conditions across different
                              facilities
                            </p>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                              <span className="font-medium">
                                Risk Analytics
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground ml-8">
                              Perform portfolio-wide risk analysis and stress
                              testing
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Real-World Impact */}
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          Commercial Impact & Value Proposition
                        </CardTitle>
                        <CardDescription>
                          Quantified benefits of loan data standardization
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600 mb-1">
                              75%
                            </div>
                            <div className="text-sm text-blue-700">
                              Faster Document Processing
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              AI extraction vs manual
                            </div>
                          </div>
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600 mb-1">
                              $2.3M
                            </div>
                            <div className="text-sm text-green-700">
                              Annual Cost Savings
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Per $1B loan portfolio
                            </div>
                          </div>
                          <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600 mb-1">
                              90%
                            </div>
                            <div className="text-sm text-purple-700">
                              Error Reduction
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              In data entry & reporting
                            </div>
                          </div>
                          <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600 mb-1">
                              48hrs
                            </div>
                            <div className="text-sm text-orange-700">
                              Faster Loan Comparison
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Standardized vs manual
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="schema" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Core Data Schema</CardTitle>
                        <CardDescription>
                          Standardized data structure for loan information
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <pre className="text-sm overflow-x-auto">
                            {`{
  "loanId": "string",
  "version": "string", 
  "dataStandard": "LMA-EDGE-2024",
  "parties": {
    "borrower": {
      "name": "string",
      "entityId": "string (LEI)",
      "jurisdiction": "string"
    },
    "lender": {
      "name": "string", 
      "entityId": "string (LEI)",
      "type": "bank|institutional|alternative"
    }
  },
  "financialTerms": {
    "amount": {
      "value": "number",
      "currency": "string (ISO 4217)"
    },
    "pricing": {
      "baseRate": "SOFR|LIBOR|EURIBOR",
      "margin": "number (basis points)"
    }
  }
}`}
                          </pre>
                        </div>
                        <div className="mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const mockData = generateMockLoanData();
                              const jsonData = JSON.stringify(
                                mockData,
                                null,
                                2
                              );
                              navigator.clipboard.writeText(jsonData);
                              toast.success(
                                "Sample standardized loan data copied to clipboard!"
                              );
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Copy Sample Data
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Data Mapping */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Legacy System Mapping</CardTitle>
                        <CardDescription>
                          How existing loan data maps to standardized format
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <h4 className="font-medium mb-2">Legacy Field</h4>
                              <div className="space-y-1 text-muted-foreground">
                                <div>borrower_name</div>
                                <div>loan_amt</div>
                                <div>int_rate</div>
                                <div>mat_date</div>
                              </div>
                            </div>
                            <div className="flex items-center justify-center">
                              <ArrowUpRight className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">
                                Standardized Field
                              </h4>
                              <div className="space-y-1 text-muted-foreground">
                                <div>parties.borrower.name</div>
                                <div>financialTerms.amount.value</div>
                                <div>financialTerms.pricing.allInRate</div>
                                <div>financialTerms.term.maturityDate</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="integration" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Supported Systems</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <span className="font-medium">
                              Bloomberg Terminal
                            </span>
                            <Badge className="bg-green-500 text-white">
                              Integrated
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <span className="font-medium">Refinitiv Eikon</span>
                            <Badge className="bg-green-500 text-white">
                              Integrated
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <span className="font-medium">S&P Capital IQ</span>
                            <Badge className="bg-green-500 text-white">
                              Integrated
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <span className="font-medium">
                              Moody&apos;s Analytics
                            </span>
                            <Badge className="bg-yellow-500 text-white">
                              In Progress
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Export Formats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <Code className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">JSON</span>
                            <Badge variant="outline">REST API</Badge>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <FileText className="h-4 w-4 text-green-600" />
                            <span className="font-medium">XML</span>
                            <Badge variant="outline">SOAP/XML</Badge>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <Database className="h-4 w-4 text-purple-600" />
                            <span className="font-medium">CSV</span>
                            <Badge variant="outline">Bulk Export</Badge>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <Zap className="h-4 w-4 text-orange-600" />
                            <span className="font-medium">FpML</span>
                            <Badge variant="outline">Financial</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* API Integration */}
                    <Card>
                      <CardHeader>
                        <CardTitle>API Integration Guide</CardTitle>
                        <CardDescription>
                          RESTful APIs for seamless system integration
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">
                              Loan Data Retrieval
                            </h4>
                            <code className="text-sm">
                              GET /api/v1/loans/{`{loanId}`}
                              ?format=lma-edge-2024
                            </code>
                          </div>
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">
                              Bulk Data Export
                            </h4>
                            <code className="text-sm">
                              POST /api/v1/loans/export
                            </code>
                          </div>
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">
                              Data Validation
                            </h4>
                            <code className="text-sm">
                              POST /api/v1/loans/validate
                            </code>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="validation" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Data Validation Rules</CardTitle>
                        <CardDescription>
                          Ensure data quality and compliance
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 border rounded-lg">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <div>
                              <p className="font-medium">
                                Required Fields Validation
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Ensures all mandatory fields are present and
                                properly formatted
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 border rounded-lg">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <div>
                              <p className="font-medium">
                                Business Logic Validation
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Validates business rules like positive amounts,
                                valid dates
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 border rounded-lg">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <div>
                              <p className="font-medium">
                                Cross-Reference Validation
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Validates entity IDs against LEI database,
                                currency codes
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Live Validation Demo */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Live Validation Demo</CardTitle>
                        <CardDescription>
                          Test data validation with sample loan data
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <Button
                            onClick={() => {
                              const mockData = generateMockLoanData();
                              const validation =
                                LoanDataStandardizer.validateLoanData(mockData);
                              if (validation.isValid) {
                                toast.success(
                                  `Validation passed! ${validation.warnings.length} warnings found.`
                                );
                              } else {
                                toast.error(
                                  `Validation failed! ${validation.errors.length} errors found.`
                                );
                              }
                            }}
                            className="w-full"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Validate Sample Loan Data
                          </Button>
                          <div className="text-sm text-muted-foreground">
                            Click to validate a sample standardized loan record
                            against LMA-EDGE-2024 schema
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Implementation Guide */}
              <div className="px-4 lg:px-6">
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Settings className="h-6 w-6 text-blue-600 mt-1" />
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-2">
                          Implementation Support
                        </h4>
                        <p className="text-sm text-blue-700 mb-3">
                          Our platform provides comprehensive tools and
                          documentation to help you implement standardized loan
                          data formats in your organization.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              toast.info("Documentation download starting...")
                            }
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Spec
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              toast.info("API documentation coming soon")
                            }
                          >
                            <Code className="h-4 w-4 mr-2" />
                            API Docs
                          </Button>
                        </div>
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
  );
}
