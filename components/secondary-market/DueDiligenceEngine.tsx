"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  FileSearch,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Download,
  Eye,
  Zap,
  Shield,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

interface DueDiligenceCheck {
  id: string;
  category: string;
  check: string;
  status: "passed" | "warning" | "failed" | "pending";
  score: number;
  details: string;
  automated: boolean;
  lastUpdated: string;
}

interface DueDiligenceReport {
  loanId: string;
  borrower: string;
  overallScore: number;
  riskLevel: "low" | "medium" | "high";
  status: "complete" | "in_progress" | "pending";
  generatedAt: string;
  checks: DueDiligenceCheck[];
  recommendations: string[];
  estimatedValue: number;
  confidenceLevel: number;
}

export function DueDiligenceEngine() {
  const [selectedLoanId, setSelectedLoanId] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeReport, setActiveReport] = useState<DueDiligenceReport | null>(
    null
  );

  // Mock due diligence reports
  const mockReports: DueDiligenceReport[] = [
    {
      loanId: "1",
      borrower: "TechCorp Industries",
      overallScore: 92,
      riskLevel: "low",
      status: "complete",
      generatedAt: "2025-01-01T10:30:00Z",
      estimatedValue: 41800000,
      confidenceLevel: 95,
      checks: [
        {
          id: "1",
          category: "Financial Health",
          check: "Debt-to-Equity Ratio",
          status: "passed",
          score: 95,
          details:
            "D/E ratio of 0.45 is well within acceptable range for tech sector",
          automated: true,
          lastUpdated: "2025-01-01T10:25:00Z",
        },
        {
          id: "2",
          category: "Financial Health",
          check: "Cash Flow Analysis",
          status: "passed",
          score: 88,
          details: "Strong positive cash flow with 15% YoY growth",
          automated: true,
          lastUpdated: "2025-01-01T10:25:00Z",
        },
        {
          id: "3",
          category: "Legal Compliance",
          check: "Covenant Compliance",
          status: "passed",
          score: 100,
          details: "All financial covenants met with comfortable margins",
          automated: true,
          lastUpdated: "2025-01-01T10:26:00Z",
        },
        {
          id: "4",
          category: "Legal Compliance",
          check: "Documentation Review",
          status: "warning",
          score: 85,
          details:
            "Minor discrepancies in subsidiary guarantees - requires review",
          automated: false,
          lastUpdated: "2025-01-01T10:28:00Z",
        },
        {
          id: "5",
          category: "Market Risk",
          check: "Industry Analysis",
          status: "passed",
          score: 90,
          details: "Technology sector showing strong fundamentals",
          automated: true,
          lastUpdated: "2025-01-01T10:27:00Z",
        },
        {
          id: "6",
          category: "Market Risk",
          check: "Competitive Position",
          status: "passed",
          score: 92,
          details: "Market leader with strong competitive moat",
          automated: true,
          lastUpdated: "2025-01-01T10:27:00Z",
        },
      ],
      recommendations: [
        "Proceed with acquisition - low risk profile with strong fundamentals",
        "Review subsidiary guarantee documentation before closing",
        "Consider negotiating slight discount based on documentation issues",
      ],
    },
  ];

  const generateDueDiligenceReport = async () => {
    if (!selectedLoanId) {
      toast.error("Please select a loan to analyze");
      return;
    }

    setIsGenerating(true);

    // Simulate AI-powered due diligence generation
    setTimeout(() => {
      const report = mockReports.find((r) => r.loanId === selectedLoanId);
      if (report) {
        setActiveReport(report);
        toast.success("Due diligence report generated successfully!");
      }
      setIsGenerating(false);
    }, 3000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "passed":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "high":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            AI-Powered Due Diligence Engine
          </h3>
          <p className="text-sm text-gray-600">
            Automated analysis reduces due diligence time from weeks to minutes
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Zap className="h-3 w-3 mr-1" />
            85% Faster
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Shield className="h-3 w-3 mr-1" />
            95% Accuracy
          </Badge>
        </div>
      </div>

      {/* Generate Report Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileSearch className="h-5 w-5 mr-2" />
            Generate Due Diligence Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="loan-select">Select Loan for Analysis</Label>
              <Select value={selectedLoanId} onValueChange={setSelectedLoanId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a loan..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">TechCorp Industries - $42M</SelectItem>
                  <SelectItem value="2">
                    Green Energy Solutions - $23.5M
                  </SelectItem>
                  <SelectItem value="3">Manufacturing Corp - $12.8M</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={generateDueDiligenceReport}
                disabled={isGenerating || !selectedLoanId}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </div>

          {isGenerating && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Analyzing loan documentation...</span>
                <span>33%</span>
              </div>
              <Progress value={33} className="h-2" />
              <div className="text-xs text-gray-600">
                AI is reviewing financial statements, legal documents, and
                market data
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Due Diligence Report */}
      {activeReport && (
        <div className="space-y-6">
          {/* Report Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Due Diligence Report - {activeReport.borrower}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export PDF
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Share Report
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {activeReport.overallScore}
                  </div>
                  <div className="text-sm text-gray-600">Overall Score</div>
                  <Progress
                    value={activeReport.overallScore}
                    className="mt-2"
                  />
                </div>
                <div className="text-center">
                  <div
                    className={`text-3xl font-bold ${getRiskColor(
                      activeReport.riskLevel
                    )}`}
                  >
                    {activeReport.riskLevel.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-600">Risk Level</div>
                  <Badge
                    className={`mt-2 ${
                      activeReport.riskLevel === "low"
                        ? "bg-green-100 text-green-800"
                        : activeReport.riskLevel === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {activeReport.riskLevel} risk
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {formatCurrency(activeReport.estimatedValue)}
                  </div>
                  <div className="text-sm text-gray-600">Estimated Value</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {activeReport.confidenceLevel}% confidence
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {new Date(activeReport.generatedAt).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-600">Generated</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(activeReport.generatedAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Checks */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["Financial Health", "Legal Compliance", "Market Risk"].map(
                  (category) => {
                    const categoryChecks = activeReport.checks.filter(
                      (check) => check.category === category
                    );
                    const avgScore = Math.round(
                      categoryChecks.reduce(
                        (sum, check) => sum + check.score,
                        0
                      ) / categoryChecks.length
                    );

                    return (
                      <div key={category} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{category}</h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">
                              {avgScore}/100
                            </span>
                            <Progress value={avgScore} className="w-20" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          {categoryChecks.map((check) => (
                            <div
                              key={check.id}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded"
                            >
                              <div className="flex items-center space-x-3">
                                {getStatusIcon(check.status)}
                                <div>
                                  <div className="font-medium text-sm">
                                    {check.check}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {check.details}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {check.automated && (
                                  <Badge variant="outline" className="text-xs">
                                    <Zap className="h-3 w-3 mr-1" />
                                    Auto
                                  </Badge>
                                )}
                                <Badge className={getStatusColor(check.status)}>
                                  {check.status}
                                </Badge>
                                <span className="text-sm font-medium">
                                  {check.score}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeReport.recommendations.map((recommendation, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg"
                  >
                    <div className="shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
                      {index + 1}
                    </div>
                    <p className="text-sm text-blue-800">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Benefits Section */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium mb-2">85% Time Reduction</h4>
              <p className="text-sm text-gray-600">
                From weeks to minutes with AI-powered analysis
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-medium mb-2">90% Cost Reduction</h4>
              <p className="text-sm text-gray-600">
                Automated checks reduce manual review costs
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-medium mb-2">95% Accuracy</h4>
              <p className="text-sm text-gray-600">
                AI-powered analysis with human oversight
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
