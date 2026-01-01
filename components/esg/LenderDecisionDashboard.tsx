"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Target,
  Shield,
  Zap,
  Building,
  Users,
  Leaf,
} from "lucide-react";

interface BorrowerProfile {
  id: string;
  name: string;
  industry: string;
  loanAmount: number;
  esgScore: number;
  riskRating: "low" | "medium" | "high" | "critical";
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  trend: "improving" | "stable" | "declining";
  lastAssessment: string;
}

interface ESGRiskFactor {
  category: string;
  risk: string;
  impact: "low" | "medium" | "high";
  likelihood: "low" | "medium" | "high";
  mitigation: string;
}

interface LendingRecommendation {
  borrowerId: string;
  recommendation: "approve" | "conditional" | "reject";
  confidence: number;
  suggestedRate: number;
  marketRate: number;
  esgPremium: number;
  conditions?: string[];
  reasoning: string;
}

export function LenderDecisionDashboard() {
  const [selectedBorrower, setSelectedBorrower] = useState<string>("1");
  const [viewMode, setViewMode] = useState<"overview" | "risk" | "comparison">(
    "overview"
  );

  // Mock borrower profiles
  const borrowers: BorrowerProfile[] = [
    {
      id: "1",
      name: "GreenTech Industries",
      industry: "Technology",
      loanAmount: 50000000,
      esgScore: 78,
      riskRating: "low",
      environmentalScore: 85,
      socialScore: 72,
      governanceScore: 77,
      trend: "improving",
      lastAssessment: "2024-12-15",
    },
    {
      id: "2",
      name: "Traditional Manufacturing Co",
      industry: "Manufacturing",
      loanAmount: 25000000,
      esgScore: 45,
      riskRating: "high",
      environmentalScore: 35,
      socialScore: 48,
      governanceScore: 52,
      trend: "stable",
      lastAssessment: "2024-12-10",
    },
    {
      id: "3",
      name: "Sustainable Energy Corp",
      industry: "Energy",
      loanAmount: 75000000,
      esgScore: 92,
      riskRating: "low",
      environmentalScore: 95,
      socialScore: 88,
      governanceScore: 93,
      trend: "improving",
      lastAssessment: "2024-12-20",
    },
  ];

  const currentBorrower =
    borrowers.find((b) => b.id === selectedBorrower) || borrowers[0];

  // Mock ESG risk factors
  const riskFactors: ESGRiskFactor[] = [
    {
      category: "Environmental",
      risk: "Carbon emission targets not met",
      impact: "medium",
      likelihood: "low",
      mitigation: "Quarterly monitoring and reporting required",
    },
    {
      category: "Social",
      risk: "Workforce diversity below industry average",
      impact: "low",
      likelihood: "medium",
      mitigation: "Diversity improvement plan as loan condition",
    },
    {
      category: "Governance",
      risk: "Board independence concerns",
      impact: "high",
      likelihood: "low",
      mitigation: "Board restructuring within 12 months",
    },
  ];

  // Mock lending recommendation
  const recommendation: LendingRecommendation = {
    borrowerId: selectedBorrower,
    recommendation:
      currentBorrower.esgScore > 70
        ? "approve"
        : currentBorrower.esgScore > 50
        ? "conditional"
        : "reject",
    confidence: 87,
    suggestedRate:
      currentBorrower.esgScore > 70
        ? 4.2
        : currentBorrower.esgScore > 50
        ? 5.1
        : 6.8,
    marketRate: 5.0,
    esgPremium:
      currentBorrower.esgScore > 70
        ? -0.8
        : currentBorrower.esgScore > 50
        ? 0.1
        : 1.8,
    conditions:
      currentBorrower.esgScore <= 70
        ? [
            "Quarterly ESG reporting required",
            "Annual third-party ESG audit",
            "ESG improvement targets with penalties",
          ]
        : undefined,
    reasoning:
      currentBorrower.esgScore > 70
        ? "Strong ESG performance indicates lower long-term risk and regulatory compliance"
        : currentBorrower.esgScore > 50
        ? "Moderate ESG performance requires additional monitoring and conditions"
        : "Poor ESG performance presents significant regulatory and reputational risks",
  };

  // Mock industry comparison data
  const industryComparison = [
    {
      industry: "Technology",
      avgScore: 72,
      borrowerScore:
        currentBorrower.industry === "Technology"
          ? currentBorrower.esgScore
          : 0,
    },
    {
      industry: "Manufacturing",
      avgScore: 58,
      borrowerScore:
        currentBorrower.industry === "Manufacturing"
          ? currentBorrower.esgScore
          : 0,
    },
    {
      industry: "Energy",
      avgScore: 65,
      borrowerScore:
        currentBorrower.industry === "Energy" ? currentBorrower.esgScore : 0,
    },
    { industry: "Finance", avgScore: 78, borrowerScore: 0 },
    { industry: "Healthcare", avgScore: 69, borrowerScore: 0 },
  ];

  // Mock ESG trend data
  const trendData = [
    { month: "Jul", score: currentBorrower.esgScore - 15 },
    { month: "Aug", score: currentBorrower.esgScore - 12 },
    { month: "Sep", score: currentBorrower.esgScore - 8 },
    { month: "Oct", score: currentBorrower.esgScore - 5 },
    { month: "Nov", score: currentBorrower.esgScore - 2 },
    { month: "Dec", score: currentBorrower.esgScore },
  ];

  const radarData = [
    {
      subject: "Environmental",
      score: currentBorrower.environmentalScore,
      fullMark: 100,
    },
    { subject: "Social", score: currentBorrower.socialScore, fullMark: 100 },
    {
      subject: "Governance",
      score: currentBorrower.governanceScore,
      fullMark: 100,
    },
  ];

  const getRiskColor = (rating: string) => {
    switch (rating) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
      case "critical":
        return "bg-red-200 text-red-900";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case "approve":
        return "bg-green-100 text-green-800";
      case "conditional":
        return "bg-yellow-100 text-yellow-800";
      case "reject":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">ESG Lending Decision Support</h3>
        <div className="flex space-x-2">
          <Select value={selectedBorrower} onValueChange={setSelectedBorrower}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {borrowers.map((borrower) => (
                <SelectItem key={borrower.id} value={borrower.id}>
                  {borrower.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={viewMode}
            onValueChange={(value: "overview" | "risk" | "comparison") =>
              setViewMode(value)
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="risk">Risk Analysis</SelectItem>
              <SelectItem value="comparison">Comparison</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Borrower Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{currentBorrower.name}</CardTitle>
              <p className="text-gray-600">
                {currentBorrower.industry} • $
                {(currentBorrower.loanAmount / 1000000).toFixed(0)}M Loan
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {currentBorrower.esgScore}
              </div>
              <div className="text-sm text-gray-600">ESG Score</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-green-600">
                {currentBorrower.environmentalScore}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center">
                <Leaf className="h-4 w-4 mr-1" />
                Environmental
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-blue-600">
                {currentBorrower.socialScore}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center">
                <Users className="h-4 w-4 mr-1" />
                Social
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-purple-600">
                {currentBorrower.governanceScore}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center">
                <Shield className="h-4 w-4 mr-1" />
                Governance
              </div>
            </div>
            <div className="text-center">
              <Badge className={getRiskColor(currentBorrower.riskRating)}>
                {currentBorrower.riskRating.toUpperCase()} RISK
              </Badge>
              <div className="text-sm text-gray-600 mt-1">
                {currentBorrower.trend === "improving" && (
                  <TrendingUp className="h-4 w-4 text-green-500 mx-auto" />
                )}
                {currentBorrower.trend === "declining" && (
                  <TrendingDown className="h-4 w-4 text-red-500 mx-auto" />
                )}
                {currentBorrower.trend === "stable" && (
                  <div className="h-4 w-4 mx-auto" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lending Recommendation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lending Recommendation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <Badge
                  className={getRecommendationColor(
                    recommendation.recommendation
                  )}
                  variant="secondary"
                >
                  {recommendation.recommendation.toUpperCase()}
                </Badge>
                <div className="text-sm text-gray-600">
                  Confidence: {recommendation.confidence}%
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Suggested Rate:</span>
                  <span className="font-semibold">
                    {recommendation.suggestedRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Market Rate:</span>
                  <span>{recommendation.marketRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ESG Premium/Discount:</span>
                  <span
                    className={
                      recommendation.esgPremium < 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {recommendation.esgPremium > 0 ? "+" : ""}
                    {recommendation.esgPremium}%
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Reasoning</h4>
              <p className="text-sm text-gray-700 mb-3">
                {recommendation.reasoning}
              </p>

              {recommendation.conditions && (
                <div>
                  <h4 className="font-medium mb-2">Conditions</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {recommendation.conditions.map((condition, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-yellow-500 mr-2">•</span>
                        {condition}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {viewMode === "overview" && (
        <div className="grid grid-cols-2 gap-6">
          {/* ESG Score Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ESG Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* ESG Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ESG Score Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {viewMode === "risk" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">ESG Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskFactors.map((factor, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{factor.category}</h4>
                    <div className="flex space-x-2">
                      <Badge
                        variant="outline"
                        className={getImpactColor(factor.impact)}
                      >
                        {factor.impact} impact
                      </Badge>
                      <Badge
                        variant="outline"
                        className={getImpactColor(factor.likelihood)}
                      >
                        {factor.likelihood} likelihood
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{factor.risk}</p>
                  <div className="text-sm">
                    <span className="text-gray-600">Mitigation:</span>
                    <span className="ml-1">{factor.mitigation}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === "comparison" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Industry Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={industryComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="industry" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar
                  dataKey="avgScore"
                  fill="#e5e7eb"
                  name="Industry Average"
                />
                <Bar
                  dataKey="borrowerScore"
                  fill="#3b82f6"
                  name="Borrower Score"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
