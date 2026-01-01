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
import { Progress } from "@/components/ui/Progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
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
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Building,
  Globe,
  Leaf,
  Users,
  Shield,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";

interface BenchmarkData {
  category: string;
  yourScore: number;
  industryAverage: number;
  topPerformer: number;
  trend: "up" | "down" | "stable";
}

interface IndustryComparison {
  industry: string;
  companies: number;
  avgScore: number;
  yourRank: number;
  yourScore: number;
}

export default function ESGBenchmarksPage() {
  const { auth } = useAuth();
  const user = auth.user;

  const [selectedIndustry, setSelectedIndustry] = useState("technology");
  const [selectedRegion, setSelectedRegion] = useState("global");

  // Mock benchmark data
  const benchmarkData: BenchmarkData[] = [
    {
      category: "Environmental",
      yourScore: 78,
      industryAverage: 72,
      topPerformer: 95,
      trend: "up",
    },
    {
      category: "Social",
      yourScore: 65,
      industryAverage: 68,
      topPerformer: 88,
      trend: "down",
    },
    {
      category: "Governance",
      yourScore: 82,
      industryAverage: 75,
      topPerformer: 92,
      trend: "up",
    },
  ];

  const radarData = [
    { subject: "Carbon Emissions", yourScore: 85, industry: 70, fullMark: 100 },
    {
      subject: "Energy Efficiency",
      yourScore: 75,
      industry: 75,
      fullMark: 100,
    },
    { subject: "Water Management", yourScore: 70, industry: 65, fullMark: 100 },
    { subject: "Waste Reduction", yourScore: 80, industry: 72, fullMark: 100 },
    {
      subject: "Employee Diversity",
      yourScore: 60,
      industry: 68,
      fullMark: 100,
    },
    { subject: "Community Impact", yourScore: 70, industry: 65, fullMark: 100 },
    {
      subject: "Board Independence",
      yourScore: 90,
      industry: 78,
      fullMark: 100,
    },
    {
      subject: "Ethics & Compliance",
      yourScore: 85,
      industry: 80,
      fullMark: 100,
    },
  ];

  const industryComparisons: IndustryComparison[] = [
    {
      industry: "Technology",
      companies: 1250,
      avgScore: 72,
      yourRank: 285,
      yourScore: 78,
    },
    {
      industry: "Financial Services",
      companies: 890,
      avgScore: 75,
      yourRank: 320,
      yourScore: 78,
    },
    {
      industry: "Manufacturing",
      companies: 2100,
      avgScore: 68,
      yourRank: 420,
      yourScore: 78,
    },
    {
      industry: "Healthcare",
      companies: 650,
      avgScore: 74,
      yourRank: 180,
      yourScore: 78,
    },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <ArrowUp className="h-4 w-4 text-green-600" />;
      case "down":
        return <ArrowDown className="h-4 w-4 text-red-600" />;
      case "stable":
        return <Minus className="h-4 w-4 text-gray-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPerformanceColor = (yourScore: number, average: number) => {
    if (yourScore > average + 10) return "text-green-600";
    if (yourScore < average - 10) return "text-red-600";
    return "text-yellow-600";
  };

  const getPerformanceLabel = (yourScore: number, average: number) => {
    if (yourScore > average + 10) return "Above Average";
    if (yourScore < average - 10) return "Below Average";
    return "Average";
  };

  const overallScore = Math.round(
    benchmarkData.reduce((sum, item) => sum + item.yourScore, 0) /
      benchmarkData.length
  );

  const industryAverage = Math.round(
    benchmarkData.reduce((sum, item) => sum + item.industryAverage, 0) /
      benchmarkData.length
  );

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
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    ESG Benchmarks
                  </h1>
                  <p className="text-muted-foreground">
                    Compare your ESG performance against industry standards
                  </p>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={selectedIndustry}
                    onValueChange={setSelectedIndustry}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="manufacturing">
                        Manufacturing
                      </SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedRegion}
                    onValueChange={setSelectedRegion}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">Global</SelectItem>
                      <SelectItem value="north-america">
                        North America
                      </SelectItem>
                      <SelectItem value="europe">Europe</SelectItem>
                      <SelectItem value="asia-pacific">Asia Pacific</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Overview Cards */}
              <div className="px-4 lg:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Target className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">
                            {overallScore}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Your ESG Score
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-100 rounded-lg">
                          <Building className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">
                            {industryAverage}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Industry Average
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                          <Award className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">285</div>
                          <div className="text-sm text-muted-foreground">
                            Industry Rank
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <Globe className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">77%</div>
                          <div className="text-sm text-muted-foreground">
                            Percentile
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Category Benchmarks */}
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Category Performance</CardTitle>
                    <CardDescription>
                      Compare your performance across ESG categories
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {benchmarkData.map((item) => (
                        <div key={item.category} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                {item.category === "Environmental" && (
                                  <Leaf className="h-5 w-5 text-green-600" />
                                )}
                                {item.category === "Social" && (
                                  <Users className="h-5 w-5 text-blue-600" />
                                )}
                                {item.category === "Governance" && (
                                  <Shield className="h-5 w-5 text-purple-600" />
                                )}
                                <h3 className="font-semibold">
                                  {item.category}
                                </h3>
                              </div>
                              <Badge
                                variant="outline"
                                className={getPerformanceColor(
                                  item.yourScore,
                                  item.industryAverage
                                )}
                              >
                                {getPerformanceLabel(
                                  item.yourScore,
                                  item.industryAverage
                                )}
                              </Badge>
                              {getTrendIcon(item.trend)}
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold">
                                {item.yourScore}/100
                              </div>
                              <div className="text-sm text-muted-foreground">
                                vs {item.industryAverage} avg
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Your Score</span>
                              <span>{item.yourScore}%</span>
                            </div>
                            <Progress value={item.yourScore} className="h-2" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Industry Avg: {item.industryAverage}%</span>
                              <span>Top Performer: {item.topPerformer}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="px-4 lg:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Comparison</CardTitle>
                      <CardDescription>
                        Your scores vs industry benchmarks
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={benchmarkData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="category" />
                          <YAxis />
                          <Tooltip />
                          <Bar
                            dataKey="yourScore"
                            fill="#3b82f6"
                            name="Your Score"
                          />
                          <Bar
                            dataKey="industryAverage"
                            fill="#94a3b8"
                            name="Industry Average"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Detailed Metrics Radar</CardTitle>
                      <CardDescription>
                        Comprehensive performance breakdown
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} />
                          <Radar
                            name="Your Score"
                            dataKey="yourScore"
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            fillOpacity={0.3}
                          />
                          <Radar
                            name="Industry Average"
                            dataKey="industry"
                            stroke="#94a3b8"
                            fill="#94a3b8"
                            fillOpacity={0.1}
                          />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Industry Comparisons */}
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Cross-Industry Comparison</CardTitle>
                    <CardDescription>
                      See how you perform across different industries
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {industryComparisons.map((industry) => (
                        <div
                          key={industry.industry}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <Building className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold">
                                {industry.industry}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {industry.companies} companies
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-semibold">
                                #{industry.yourRank}
                              </span>
                              <Badge
                                variant="outline"
                                className={getPerformanceColor(
                                  industry.yourScore,
                                  industry.avgScore
                                )}
                              >
                                {industry.yourScore > industry.avgScore
                                  ? "Above Avg"
                                  : "Below Avg"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {industry.yourScore} vs {industry.avgScore} avg
                            </p>
                          </div>
                        </div>
                      ))}
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
