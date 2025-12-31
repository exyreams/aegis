"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import {
  AlertTriangle,
  CheckCircle,
  Zap,
  FileSearch,
  TrendingUp,
  Shield,
  Clock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface AnalysisResult {
  inconsistencies: Array<{
    type: "financial" | "legal" | "temporal" | "reference";
    severity: "high" | "medium" | "low";
    description: string;
    location: string;
    suggestion: string;
  }>;
  riskFactors: Array<{
    category: "credit" | "legal" | "operational" | "market";
    level: "high" | "medium" | "low";
    description: string;
    mitigation: string;
  }>;
  complianceIssues: Array<{
    regulation: string;
    issue: string;
    recommendation: string;
  }>;
  overallScore: number;
  processingTime: number;
}

interface DocumentAnalyzerProps {
  documentContent: string;
  documentType: string;
  onAnalysisComplete?: (result: AnalysisResult) => void;
}

export function DocumentAnalyzer({
  documentContent,
  documentType,
  onAnalysisComplete,
}: DocumentAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const analyzeDocument = async () => {
    if (!documentContent.trim()) {
      toast.error("No document content to analyze");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      const response = await fetch("/api/analyze-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: documentContent,
          documentType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze document");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      let progress = 0;
      let result: AnalysisResult | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              setAnalysisProgress(100);
              break;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.progress) {
                progress = parsed.progress;
                setAnalysisProgress(progress);
              }
              if (parsed.result) {
                result = parsed.result;
                setAnalysisResult(result);
                if (result) {
                  onAnalysisComplete?.(result);
                }
              }
            } catch {
              // Ignore parsing errors for partial chunks
            }
          }
        }
      }

      toast.success("Document analysis completed!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze document");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Analysis Trigger */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSearch className="h-5 w-5" />
            AI Document Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Analyze your document for inconsistencies, risk factors, and
              compliance issues using advanced AI.
            </p>

            {isAnalyzing && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Analyzing document...</span>
                </div>
                <Progress value={analysisProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {analysisProgress < 30
                    ? "Scanning for inconsistencies..."
                    : analysisProgress < 60
                    ? "Evaluating risk factors..."
                    : analysisProgress < 90
                    ? "Checking compliance..."
                    : "Finalizing analysis..."}
                </p>
              </div>
            )}

            <Button
              onClick={analyzeDocument}
              disabled={isAnalyzing || !documentContent.trim()}
              className="w-full"
            >
              <Zap className="h-4 w-4 mr-2" />
              {isAnalyzing ? "Analyzing..." : "Analyze Document"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Analysis Summary</span>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      analysisResult.overallScore >= 80
                        ? "default"
                        : analysisResult.overallScore >= 60
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    Score: {analysisResult.overallScore}/100
                  </Badge>
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {analysisResult.processingTime}s
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {analysisResult.inconsistencies.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Inconsistencies
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {analysisResult.riskFactors.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Risk Factors
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {analysisResult.complianceIssues.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Compliance Issues
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inconsistencies */}
          {analysisResult.inconsistencies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Inconsistencies Found
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisResult.inconsistencies.map((issue, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${getSeverityColor(
                        issue.severity
                      )}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {issue.type}
                          </Badge>
                          <Badge
                            variant={
                              issue.severity === "high"
                                ? "destructive"
                                : issue.severity === "medium"
                                ? "secondary"
                                : "outline"
                            }
                            className="capitalize"
                          >
                            {issue.severity}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {issue.location}
                        </span>
                      </div>
                      <p className="font-medium mb-2">{issue.description}</p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Suggestion:</strong> {issue.suggestion}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Risk Factors */}
          {analysisResult.riskFactors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-yellow-600" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisResult.riskFactors.map((risk, index) => (
                    <div key={index} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {risk.category}
                          </Badge>
                          <Badge
                            variant={
                              risk.level === "high"
                                ? "destructive"
                                : risk.level === "medium"
                                ? "secondary"
                                : "default"
                            }
                            className="capitalize"
                          >
                            {risk.level} Risk
                          </Badge>
                        </div>
                      </div>
                      <p className="font-medium mb-2">{risk.description}</p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Mitigation:</strong> {risk.mitigation}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Compliance Issues */}
          {analysisResult.complianceIssues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Compliance Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisResult.complianceIssues.map((issue, index) => (
                    <div key={index} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline">{issue.regulation}</Badge>
                      </div>
                      <p className="font-medium mb-2">{issue.issue}</p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Recommendation:</strong> {issue.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Issues Found */}
          {analysisResult.inconsistencies.length === 0 &&
            analysisResult.riskFactors.length === 0 &&
            analysisResult.complianceIssues.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Document Looks Good!
                  </h3>
                  <p className="text-muted-foreground">
                    No significant issues were found in your document.
                  </p>
                </CardContent>
              </Card>
            )}
        </motion.div>
      )}
    </div>
  );
}
