// "use client";

// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
// import { Button } from "@/components/ui/Button";
// import { Badge } from "@/components/ui/Badge";
// import { Progress } from "@/components/ui/Progress";
// import { Label } from "@/components/ui/Label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/Select";
// import {
//   FileSearch,
//   CheckCircle,
//   AlertTriangle,
//   XCircle,
//   Clock,
//   Download,
//   Eye,
//   Zap,
//   Shield,
//   TrendingUp,
//   DollarSign,
// } from "lucide-react";
// import { toast } from "sonner";

// interface DueDiligenceCheck {
//   id: string;
//   category: string;
//   check: string;
//   status: "passed" | "warning" | "failed" | "pending";
//   score: number;
//   details: string;
//   automated: boolean;
//   lastUpdated: string;
// }

// interface DueDiligenceReport {
//   loanId: string;
//   borrower: string;
//   overallScore: number;
//   riskLevel: "low" | "medium" | "high";
//   status: "complete" | "in_progress" | "pending";
//   generatedAt: string;
//   checks: DueDiligenceCheck[];
//   recommendations: string[];
//   estimatedValue: number;
//   confidenceLevel: number;
// }

// export function DueDiligenceEngine() {
//   const [selectedLoanId, setSelectedLoanId] = useState<string>("");
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [activeReport, setActiveReport] = useState<DueDiligenceReport | null>(
//     null
//   );

//   // Mock due diligence reports - realistic LMA secondary market DD
//   const mockReports: DueDiligenceReport[] = [
//     {
//       loanId: "1",
//       borrower: "Meridian Holdings PLC",
//       overallScore: 94,
//       riskLevel: "low",
//       status: "complete",
//       generatedAt: "2025-01-02T14:30:00Z",
//       estimatedValue: 67825000,
//       confidenceLevel: 96,
//       checks: [
//         {
//           id: "1",
//           category: "Financial Health",
//           check: "Net Leverage Ratio Analysis",
//           status: "passed",
//           score: 95,
//           details:
//             "Current Net Leverage of 3.2x vs covenant of 3.5x provides 0.3x headroom. Trending positively over last 3 quarters.",
//           automated: true,
//           lastUpdated: "2025-01-02T14:25:00Z",
//         },
//         {
//           id: "2",
//           category: "Financial Health",
//           check: "Interest Cover Assessment",
//           status: "warning",
//           score: 78,
//           details:
//             "Interest Cover at 3.6x approaching 4.0x threshold. EBITDA growth needed to maintain compliance buffer.",
//           automated: true,
//           lastUpdated: "2025-01-02T14:25:00Z",
//         },
//         {
//           id: "3",
//           category: "Financial Health",
//           check: "Cash Flow & Liquidity",
//           status: "passed",
//           score: 92,
//           details:
//             "Strong operating cash flow of £18.5M LTM. Adequate liquidity with £12M undrawn RCF availability.",
//           automated: true,
//           lastUpdated: "2025-01-02T14:26:00Z",
//         },
//         {
//           id: "4",
//           category: "Legal Compliance",
//           check: "Facility Agreement Review",
//           status: "passed",
//           score: 98,
//           details:
//             "LMA-standard documentation. Clean transfer provisions under Clause 24. No consent requirements for par trades.",
//           automated: false,
//           lastUpdated: "2025-01-02T14:28:00Z",
//         },
//         {
//           id: "5",
//           category: "Legal Compliance",
//           check: "Security Package Verification",
//           status: "passed",
//           score: 95,
//           details:
//             "First-ranking security over all material assets. Guarantees from all material subsidiaries (>5% of group EBITDA).",
//           automated: false,
//           lastUpdated: "2025-01-02T14:29:00Z",
//         },
//         {
//           id: "6",
//           category: "Legal Compliance",
//           check: "KYC/AML Compliance",
//           status: "passed",
//           score: 100,
//           details:
//             "Borrower KYC documentation current. No adverse findings in sanctions screening or PEP checks.",
//           automated: true,
//           lastUpdated: "2025-01-02T14:26:00Z",
//         },
//         {
//           id: "7",
//           category: "Market Risk",
//           check: "Industry & Sector Analysis",
//           status: "passed",
//           score: 88,
//           details:
//             "Industrial services sector stable. Borrower has diversified customer base across UK and Europe.",
//           automated: true,
//           lastUpdated: "2025-01-02T14:27:00Z",
//         },
//         {
//           id: "8",
//           category: "Market Risk",
//           check: "Comparable Transaction Analysis",
//           status: "passed",
//           score: 91,
//           details:
//             "Pricing at 99.0 cents consistent with BB+ credits in current market. Recent comps: 98.5-99.5 range.",
//           automated: true,
//           lastUpdated: "2025-01-02T14:27:00Z",
//         },
//         {
//           id: "9",
//           category: "Market Risk",
//           check: "Credit Rating Trajectory",
//           status: "passed",
//           score: 90,
//           details:
//             "Moody's B1 (stable), S&P BB+ (stable). No negative watch or outlook changes in past 12 months.",
//           automated: true,
//           lastUpdated: "2025-01-02T14:28:00Z",
//         },
//       ],
//       recommendations: [
//         "PROCEED WITH ACQUISITION - Strong credit profile with manageable covenant headroom",
//         "Monitor Interest Cover ratio closely - recommend quarterly updates from Agent",
//         "Pricing at 99.0 cents represents fair value for BB+ credit in current market",
//         "Settlement via standard LMA trade confirmation - T+10 settlement recommended",
//         "Consider requesting updated management accounts before settlement date",
//       ],
//     },
//   ];

//   const generateDueDiligenceReport = async () => {
//     if (!selectedLoanId) {
//       toast.error("Please select a loan to analyze");
//       return;
//     }

//     setIsGenerating(true);

//     // Simulate AI-powered due diligence generation
//     setTimeout(() => {
//       const report = mockReports.find((r) => r.loanId === selectedLoanId);
//       if (report) {
//         setActiveReport(report);
//         toast.success("Due diligence report generated successfully!");
//       }
//       setIsGenerating(false);
//     }, 3000);
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case "passed":
//         return <CheckCircle className="h-4 w-4 text-green-500" />;
//       case "warning":
//         return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
//       case "failed":
//         return <XCircle className="h-4 w-4 text-red-500" />;
//       case "pending":
//         return <Clock className="h-4 w-4 text-gray-500" />;
//       default:
//         return <Clock className="h-4 w-4 text-gray-500" />;
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "passed":
//         return "bg-green-100 text-green-800";
//       case "warning":
//         return "bg-yellow-100 text-yellow-800";
//       case "failed":
//         return "bg-red-100 text-red-800";
//       case "pending":
//         return "bg-gray-100 text-gray-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   const getRiskColor = (risk: string) => {
//     switch (risk) {
//       case "low":
//         return "text-green-600";
//       case "medium":
//         return "text-yellow-600";
//       case "high":
//         return "text-red-600";
//       default:
//         return "text-gray-600";
//     }
//   };

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat("en-US", {
//       style: "currency",
//       currency: "USD",
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0,
//     }).format(amount);
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h3 className="text-lg font-semibold">
//             AI-Powered Due Diligence Engine
//           </h3>
//           <p className="text-sm text-gray-600">
//             Automated analysis reduces due diligence time from weeks to minutes
//           </p>
//         </div>
//         <div className="flex items-center space-x-2">
//           <Badge variant="outline" className="bg-blue-50 text-blue-700">
//             <Zap className="h-3 w-3 mr-1" />
//             85% Faster
//           </Badge>
//           <Badge variant="outline" className="bg-green-50 text-green-700">
//             <Shield className="h-3 w-3 mr-1" />
//             95% Accuracy
//           </Badge>
//         </div>
//       </div>

//       {/* Generate Report Section */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center">
//             <FileSearch className="h-5 w-5 mr-2" />
//             Generate Due Diligence Report
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <Label htmlFor="loan-select">Select Loan for Analysis</Label>
//               <Select value={selectedLoanId} onValueChange={setSelectedLoanId}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Choose a loan..." />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="1">
//                     Meridian Holdings PLC - £68.5M Outstanding
//                   </SelectItem>
//                   <SelectItem value="2">
//                     Nordic Energy AS - €115M Outstanding
//                   </SelectItem>
//                   <SelectItem value="3">
//                     Atlas Logistics Inc - $185M Outstanding
//                   </SelectItem>
//                   <SelectItem value="4">
//                     Pinnacle Healthcare Group - $142.5M Outstanding
//                   </SelectItem>
//                   <SelectItem value="5">
//                     Continental Manufacturing GmbH - €78.2M Outstanding
//                   </SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="flex items-end">
//               <Button
//                 onClick={generateDueDiligenceReport}
//                 disabled={isGenerating || !selectedLoanId}
//                 className="w-full"
//               >
//                 {isGenerating ? (
//                   <>
//                     <Clock className="h-4 w-4 mr-2 animate-spin" />
//                     Analyzing...
//                   </>
//                 ) : (
//                   <>
//                     <Zap className="h-4 w-4 mr-2" />
//                     Generate Report
//                   </>
//                 )}
//               </Button>
//             </div>
//           </div>

//           {isGenerating && (
//             <div className="space-y-3">
//               <div className="flex items-center justify-between text-sm">
//                 <span>Analyzing loan documentation...</span>
//                 <span>33%</span>
//               </div>
//               <Progress value={33} className="h-2" />
//               <div className="text-xs text-gray-600">
//                 AI is reviewing financial statements, legal documents, and
//                 market data
//               </div>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Due Diligence Report */}
//       {activeReport && (
//         <div className="space-y-6">
//           {/* Report Summary */}
//           <Card>
//             <CardHeader>
//               <div className="flex items-center justify-between">
//                 <CardTitle>
//                   Due Diligence Report - {activeReport.borrower}
//                 </CardTitle>
//                 <div className="flex items-center space-x-2">
//                   <Button variant="outline" size="sm">
//                     <Download className="h-4 w-4 mr-1" />
//                     Export PDF
//                   </Button>
//                   <Button variant="outline" size="sm">
//                     <Eye className="h-4 w-4 mr-1" />
//                     Share Report
//                   </Button>
//                 </div>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//                 <div className="text-center">
//                   <div className="text-3xl font-bold text-blue-600">
//                     {activeReport.overallScore}
//                   </div>
//                   <div className="text-sm text-gray-600">Overall Score</div>
//                   <Progress
//                     value={activeReport.overallScore}
//                     className="mt-2"
//                   />
//                 </div>
//                 <div className="text-center">
//                   <div
//                     className={`text-3xl font-bold ${getRiskColor(
//                       activeReport.riskLevel
//                     )}`}
//                   >
//                     {activeReport.riskLevel.toUpperCase()}
//                   </div>
//                   <div className="text-sm text-gray-600">Risk Level</div>
//                   <Badge
//                     className={`mt-2 ${
//                       activeReport.riskLevel === "low"
//                         ? "bg-green-100 text-green-800"
//                         : activeReport.riskLevel === "medium"
//                         ? "bg-yellow-100 text-yellow-800"
//                         : "bg-red-100 text-red-800"
//                     }`}
//                   >
//                     {activeReport.riskLevel} risk
//                   </Badge>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-3xl font-bold text-green-600">
//                     {formatCurrency(activeReport.estimatedValue)}
//                   </div>
//                   <div className="text-sm text-gray-600">Estimated Value</div>
//                   <div className="text-xs text-gray-500 mt-1">
//                     {activeReport.confidenceLevel}% confidence
//                   </div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-3xl font-bold text-purple-600">
//                     {new Date(activeReport.generatedAt).toLocaleDateString()}
//                   </div>
//                   <div className="text-sm text-gray-600">Generated</div>
//                   <div className="text-xs text-gray-500 mt-1">
//                     {new Date(activeReport.generatedAt).toLocaleTimeString()}
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Detailed Checks */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Detailed Analysis</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {["Financial Health", "Legal Compliance", "Market Risk"].map(
//                   (category) => {
//                     const categoryChecks = activeReport.checks.filter(
//                       (check) => check.category === category
//                     );
//                     const avgScore = Math.round(
//                       categoryChecks.reduce(
//                         (sum, check) => sum + check.score,
//                         0
//                       ) / categoryChecks.length
//                     );

//                     return (
//                       <div key={category} className="border rounded-lg p-4">
//                         <div className="flex items-center justify-between mb-3">
//                           <h4 className="font-medium">{category}</h4>
//                           <div className="flex items-center space-x-2">
//                             <span className="text-sm font-medium">
//                               {avgScore}/100
//                             </span>
//                             <Progress value={avgScore} className="w-20" />
//                           </div>
//                         </div>
//                         <div className="space-y-2">
//                           {categoryChecks.map((check) => (
//                             <div
//                               key={check.id}
//                               className="flex items-center justify-between p-2 bg-gray-50 rounded"
//                             >
//                               <div className="flex items-center space-x-3">
//                                 {getStatusIcon(check.status)}
//                                 <div>
//                                   <div className="font-medium text-sm">
//                                     {check.check}
//                                   </div>
//                                   <div className="text-xs text-gray-600">
//                                     {check.details}
//                                   </div>
//                                 </div>
//                               </div>
//                               <div className="flex items-center space-x-2">
//                                 {check.automated && (
//                                   <Badge variant="outline" className="text-xs">
//                                     <Zap className="h-3 w-3 mr-1" />
//                                     Auto
//                                   </Badge>
//                                 )}
//                                 <Badge className={getStatusColor(check.status)}>
//                                   {check.status}
//                                 </Badge>
//                                 <span className="text-sm font-medium">
//                                   {check.score}
//                                 </span>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     );
//                   }
//                 )}
//               </div>
//             </CardContent>
//           </Card>

//           {/* Recommendations */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center">
//                 <TrendingUp className="h-5 w-5 mr-2" />
//                 AI Recommendations
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-3">
//                 {activeReport.recommendations.map((recommendation, index) => (
//                   <div
//                     key={index}
//                     className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg"
//                   >
//                     <div className="shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
//                       {index + 1}
//                     </div>
//                     <p className="text-sm text-blue-800">{recommendation}</p>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       )}

//       {/* Benefits Section */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Platform Benefits</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="text-center">
//               <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
//                 <Clock className="h-6 w-6 text-blue-600" />
//               </div>
//               <h4 className="font-medium mb-2">85% Time Reduction</h4>
//               <p className="text-sm text-gray-600">
//                 From weeks to minutes with AI-powered analysis
//               </p>
//             </div>
//             <div className="text-center">
//               <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
//                 <DollarSign className="h-6 w-6 text-green-600" />
//               </div>
//               <h4 className="font-medium mb-2">90% Cost Reduction</h4>
//               <p className="text-sm text-gray-600">
//                 Automated checks reduce manual review costs
//               </p>
//             </div>
//             <div className="text-center">
//               <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
//                 <Shield className="h-6 w-6 text-purple-600" />
//               </div>
//               <h4 className="font-medium mb-2">95% Accuracy</h4>
//               <p className="text-sm text-gray-600">
//                 AI-powered analysis with human oversight
//               </p>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// v2

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
  BarChart3,
  RefreshCw,
  ArrowRight,
  Scale,
  Target,
  Lightbulb,
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
  const [generationProgress, setGenerationProgress] = useState(0);
  const [activeReport, setActiveReport] = useState<DueDiligenceReport | null>(
    null
  );

  // Mock due diligence reports
  const mockReports: DueDiligenceReport[] = [
    {
      loanId: "1",
      borrower: "Meridian Holdings PLC",
      overallScore: 94,
      riskLevel: "low",
      status: "complete",
      generatedAt: "2025-01-02T14:30:00Z",
      estimatedValue: 67825000,
      confidenceLevel: 96,
      checks: [
        {
          id: "1",
          category: "Financial Health",
          check: "Net Leverage Ratio Analysis",
          status: "passed",
          score: 95,
          details:
            "Current Net Leverage of 3.2x vs covenant of 3.5x provides 0.3x headroom. Trending positively over last 3 quarters.",
          automated: true,
          lastUpdated: "2025-01-02T14:25:00Z",
        },
        {
          id: "2",
          category: "Financial Health",
          check: "Interest Cover Assessment",
          status: "warning",
          score: 78,
          details:
            "Interest Cover at 3.6x approaching 4.0x threshold. EBITDA growth needed to maintain compliance buffer.",
          automated: true,
          lastUpdated: "2025-01-02T14:25:00Z",
        },
        {
          id: "3",
          category: "Financial Health",
          check: "Cash Flow & Liquidity",
          status: "passed",
          score: 92,
          details:
            "Strong operating cash flow of £18.5M LTM. Adequate liquidity with £12M undrawn RCF availability.",
          automated: true,
          lastUpdated: "2025-01-02T14:26:00Z",
        },
        {
          id: "4",
          category: "Legal Compliance",
          check: "Facility Agreement Review",
          status: "passed",
          score: 98,
          details:
            "LMA-standard documentation. Clean transfer provisions under Clause 24. No consent requirements for par trades.",
          automated: false,
          lastUpdated: "2025-01-02T14:28:00Z",
        },
        {
          id: "5",
          category: "Legal Compliance",
          check: "Security Package Verification",
          status: "passed",
          score: 95,
          details:
            "First-ranking security over all material assets. Guarantees from all material subsidiaries (>5% of group EBITDA).",
          automated: false,
          lastUpdated: "2025-01-02T14:29:00Z",
        },
        {
          id: "6",
          category: "Legal Compliance",
          check: "KYC/AML Compliance",
          status: "passed",
          score: 100,
          details:
            "Borrower KYC documentation current. No adverse findings in sanctions screening or PEP checks.",
          automated: true,
          lastUpdated: "2025-01-02T14:26:00Z",
        },
        {
          id: "7",
          category: "Market Risk",
          check: "Industry & Sector Analysis",
          status: "passed",
          score: 88,
          details:
            "Industrial services sector stable. Borrower has diversified customer base across UK and Europe.",
          automated: true,
          lastUpdated: "2025-01-02T14:27:00Z",
        },
        {
          id: "8",
          category: "Market Risk",
          check: "Comparable Transaction Analysis",
          status: "passed",
          score: 91,
          details:
            "Pricing at 99.0 cents consistent with BB+ credits in current market. Recent comps: 98.5-99.5 range.",
          automated: true,
          lastUpdated: "2025-01-02T14:27:00Z",
        },
        {
          id: "9",
          category: "Market Risk",
          check: "Credit Rating Trajectory",
          status: "passed",
          score: 90,
          details:
            "Moody's B1 (stable), S&P BB+ (stable). No negative watch or outlook changes in past 12 months.",
          automated: true,
          lastUpdated: "2025-01-02T14:28:00Z",
        },
      ],
      recommendations: [
        "PROCEED WITH ACQUISITION - Strong credit profile with manageable covenant headroom",
        "Monitor Interest Cover ratio closely - recommend quarterly updates from Agent",
        "Pricing at 99.0 cents represents fair value for BB+ credit in current market",
        "Settlement via standard LMA trade confirmation - T+10 settlement recommended",
        "Consider requesting updated management accounts before settlement date",
      ],
    },
  ];

  const generateDueDiligenceReport = async () => {
    if (!selectedLoanId) {
      toast.error("Please select a loan to analyze");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate AI-powered due diligence generation with progress
    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 400);

    setTimeout(() => {
      const report = mockReports.find((r) => r.loanId === selectedLoanId);
      if (report) {
        setActiveReport(report);
        toast.success("Due diligence report generated successfully!");
      }
      setIsGenerating(false);
      clearInterval(progressInterval);
      setGenerationProgress(100);
    }, 3000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-slate-400" />;
      default:
        return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case "passed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "warning":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "failed":
        return "bg-red-50 text-red-700 border-red-200";
      case "pending":
        return "bg-slate-50 text-slate-600 border-slate-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const getRiskStyles = (risk: string) => {
    switch (risk) {
      case "low":
        return {
          bg: "bg-emerald-500",
          text: "text-emerald-600",
          label: "Low Risk",
        };
      case "medium":
        return {
          bg: "bg-amber-500",
          text: "text-amber-600",
          label: "Medium Risk",
        };
      case "high":
        return { bg: "bg-red-500", text: "text-red-600", label: "High Risk" };
      default:
        return { bg: "bg-slate-500", text: "text-slate-600", label: "Unknown" };
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
    <div className="space-y-6 px-4">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/20">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Due Diligence Engine
              </h2>
              <p className="text-sm text-slate-500">
                AI-powered credit analysis for secondary loan transactions
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {[
            { icon: Zap, label: "85% Faster", color: "text-blue-600" },
            { icon: Shield, label: "95% Accuracy", color: "text-emerald-600" },
            {
              icon: DollarSign,
              label: "90% Cost Reduction",
              color: "text-purple-600",
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100"
            >
              <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
              <span className="text-xs font-medium text-slate-600">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Generate Report Card */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Generate Analysis
                </h3>
                <p className="text-sm text-slate-500">
                  Select a loan position to run AI-powered due diligence
                  analysis
                </p>
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="loan-select"
                  className="text-sm font-medium text-slate-700"
                >
                  Select Loan Position
                </Label>
                <Select
                  value={selectedLoanId}
                  onValueChange={setSelectedLoanId}
                >
                  <SelectTrigger
                    id="loan-select"
                    className="h-11 bg-white border-slate-200 focus:ring-2 focus:ring-slate-200"
                  >
                    <SelectValue placeholder="Choose a loan position..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          Meridian Holdings PLC
                        </span>
                        <span className="text-xs text-slate-500">
                          £68.5M outstanding
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="2">
                      <div className="flex flex-col">
                        <span className="font-medium">Nordic Energy AS</span>
                        <span className="text-xs text-slate-500">
                          €115M outstanding
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="3">
                      <div className="flex flex-col">
                        <span className="font-medium">Atlas Logistics Inc</span>
                        <span className="text-xs text-slate-500">
                          $185M outstanding
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="4">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          Pinnacle Healthcare Group
                        </span>
                        <span className="text-xs text-slate-500">
                          $142.5M outstanding
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="5">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          Continental Manufacturing GmbH
                        </span>
                        <span className="text-xs text-slate-500">
                          €78.2M outstanding
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={generateDueDiligenceReport}
                disabled={isGenerating || !selectedLoanId}
                className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg shadow-lg shadow-slate-900/20 transition-all"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Analyzing... {generationProgress}%
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Generate Analysis
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </span>
                )}
              </Button>
            </div>

            {/* Progress Indicator */}
            <div className="lg:col-span-7">
              <div className="bg-slate-50 rounded-xl p-6 h-full min-h-[200px]">
                {isGenerating ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-slate-900">
                        AI Analysis Progress
                      </h4>
                      <span className="text-sm font-semibold text-blue-600">
                        {generationProgress}%
                      </span>
                    </div>
                    <Progress
                      value={generationProgress}
                      className="h-2 bg-slate-200"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        {
                          label: "Financial Analysis",
                          progress: Math.min(generationProgress * 1.2, 100),
                        },
                        {
                          label: "Legal Review",
                          progress: Math.min(generationProgress * 0.9, 100),
                        },
                        {
                          label: "Market Data",
                          progress: Math.min(generationProgress * 1.1, 100),
                        },
                        {
                          label: "Risk Assessment",
                          progress: Math.min(generationProgress * 0.85, 100),
                        },
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-600">{item.label}</span>
                            <span className="text-slate-400">
                              {Math.round(item.progress)}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 pt-2 border-t border-slate-200">
                      AI is analyzing financial statements, legal documentation,
                      and market comparables
                    </p>
                  </div>
                ) : activeReport ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Report Ready</span>
                    </div>
                    <p className="text-sm text-slate-600">
                      Due diligence analysis for{" "}
                      <span className="font-medium">
                        {activeReport.borrower}
                      </span>{" "}
                      is complete and ready for review.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-slate-900 text-white">
                        {activeReport.checks.length} Checks Passed
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-slate-200 text-slate-600"
                      >
                        {activeReport.confidenceLevel}% Confidence
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-8">
                    <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <FileSearch className="h-8 w-8 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        No Analysis Generated
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        Select a loan position and click generate to start
                        AI-powered due diligence
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Due Diligence Report */}
      {activeReport && (
        <div className="space-y-6">
          {/* Report Header Card */}
          <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-600 via-purple-500 to-emerald-500" />
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-slate-900 flex items-center justify-center">
                      <Scale className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        {activeReport.borrower}
                      </h3>
                      <p className="text-sm text-slate-500">
                        Due Diligence Report
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Badge className="bg-slate-900 text-white px-3 py-1">
                      Score: {activeReport.overallScore}/100
                    </Badge>
                    <Badge
                      className={`${
                        getRiskStyles(activeReport.riskLevel).bg
                      } text-white px-3 py-1`}
                    >
                      {getRiskStyles(activeReport.riskLevel).label}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-slate-200 text-slate-600 px-3 py-1"
                    >
                      {activeReport.checks.length} Analysis Checks
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 border-slate-200"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 border-slate-200"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Share Report
                  </Button>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
                {[
                  {
                    label: "Overall Score",
                    value: activeReport.overallScore,
                    suffix: "/100",
                    color: "text-slate-900",
                    bg: "bg-slate-50",
                  },
                  {
                    label: "Risk Level",
                    value: getRiskStyles(activeReport.riskLevel).label,
                    color: getRiskStyles(activeReport.riskLevel).text,
                    bg: "",
                  },
                  {
                    label: "Est. Value",
                    value: formatCurrency(activeReport.estimatedValue),
                    color: "text-emerald-600",
                    bg: "",
                  },
                  {
                    label: "Confidence",
                    value: `${activeReport.confidenceLevel}%`,
                    color: "text-blue-600",
                    bg: "",
                  },
                ].map((metric, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl p-4 ${metric.bg || ""}`}
                  >
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                      {metric.label}
                    </p>
                    <p className={`text-xl font-bold ${metric.color}`}>
                      {metric.value}
                      {metric.suffix || ""}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category Scores */}
            <Card className="lg:col-span-1 bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-slate-500" />
                  Category Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: "Financial Health",
                      score: 88,
                      color: "from-blue-500 to-blue-400",
                    },
                    {
                      name: "Legal Compliance",
                      score: 98,
                      color: "from-emerald-500 to-emerald-400",
                    },
                    {
                      name: "Market Risk",
                      score: 89,
                      color: "from-purple-500 to-purple-400",
                    },
                  ].map((category, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-700">
                          {category.name}
                        </span>
                        <span className="text-sm font-semibold text-slate-900">
                          {category.score}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${category.color} rounded-full transition-all duration-1000`}
                          style={{ width: `${category.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Checks by Category */}
            <Card className="lg:col-span-2 bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileSearch className="h-4 w-4 text-slate-500" />
                  Detailed Analysis Checks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["Financial Health", "Legal Compliance", "Market Risk"].map(
                    (category) => {
                      const categoryChecks = activeReport.checks.filter(
                        (check) => check.category === category
                      );

                      return (
                        <div key={category} className="space-y-3">
                          <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            {category}
                          </h4>
                          <div className="space-y-2">
                            {categoryChecks.map((check) => (
                              <div
                                key={check.id}
                                className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                              >
                                <div className="mt-0.5">
                                  {getStatusIcon(check.status)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="font-medium text-sm text-slate-900 truncate">
                                      {check.check}
                                    </span>
                                    <div className="flex items-center gap-2 shrink-0">
                                      {check.automated && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs border-slate-200 text-slate-500 h-5"
                                        >
                                          <Zap className="h-2.5 w-2.5 mr-0.5" />
                                          AI
                                        </Badge>
                                      )}
                                      <Badge
                                        variant="outline"
                                        className={`text-xs h-5 ${getStatusBadgeStyles(
                                          check.status
                                        )}`}
                                      >
                                        {check.status}
                                      </Badge>
                                      <span className="text-sm font-semibold text-slate-700 w-8 text-right">
                                        {check.score}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-xs text-slate-500 line-clamp-1">
                                    {check.details}
                                  </p>
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
          </div>

          {/* Recommendations */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeReport.recommendations.map((recommendation, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div className="shrink-0 w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trust Indicators */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="text-center md:text-left">
            <h4 className="font-semibold text-slate-900">
              Institutional-Grade Analysis
            </h4>
            <p className="text-sm text-slate-500 mt-1">
              Powered by advanced AI and verified methodologies
            </p>
          </div>
          <div className="col-span-2 grid grid-cols-3 gap-4">
            {[
              { icon: Shield, label: "LMA Compliant" },
              { icon: Clock, label: "Real-Time Updates" },
              { icon: TrendingUp, label: "Market-Aligned" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-100"
              >
                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <item.icon className="h-4 w-4 text-slate-600" />
                </div>
                <span className="text-xs font-medium text-slate-700">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
