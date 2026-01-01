"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { ESGMetricCard, type ESGMetric } from "./ESGMetricCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Leaf,
  Users,
  Shield,
  TrendingUp,
  Award,
  Target,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface ESGDashboardProps {
  metrics: ESGMetric[];
  onEditMetric?: (metric: ESGMetric) => void;
  onViewMetricDetails?: (metric: ESGMetric) => void;
}

export function ESGDashboard({
  metrics,
  onEditMetric,
  onViewMetricDetails,
}: ESGDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Calculate statistics
  const stats = useMemo(() => {
    const environmental = metrics.filter((m) => m.category === "environmental");
    const social = metrics.filter((m) => m.category === "social");
    const governance = metrics.filter((m) => m.category === "governance");

    const onTrack = metrics.filter(
      (m) => m.status === "on_track" || m.status === "achieved"
    );
    const atRisk = metrics.filter((m) => m.status === "at_risk");
    const behind = metrics.filter((m) => m.status === "behind");

    const overallScore =
      metrics.length > 0
        ? Math.round((onTrack.length / metrics.length) * 100)
        : 0;

    return {
      total: metrics.length,
      environmental: environmental.length,
      social: social.length,
      governance: governance.length,
      onTrack: onTrack.length,
      atRisk: atRisk.length,
      behind: behind.length,
      overallScore,
      verified: metrics.filter((m) => m.verified).length,
    };
  }, [metrics]);

  // Filter metrics based on selected category
  const filteredMetrics = useMemo(() => {
    if (selectedCategory === "all") return metrics;
    return metrics.filter((m) => m.category === selectedCategory);
  }, [metrics, selectedCategory]);

  // Prepare chart data
  const categoryData = [
    { name: "Environmental", value: stats.environmental, color: "#10b981" },
    { name: "Social", value: stats.social, color: "#3b82f6" },
    { name: "Governance", value: stats.governance, color: "#8b5cf6" },
  ];

  const statusData = [
    { name: "On Track", value: stats.onTrack, color: "#10b981" },
    { name: "At Risk", value: stats.atRisk, color: "#f59e0b" },
    { name: "Behind", value: stats.behind, color: "#ef4444" },
  ];

  // Mock trend data
  const trendData = [
    { month: "Jan", score: 72 },
    { month: "Feb", score: 75 },
    { month: "Mar", score: 78 },
    { month: "Apr", score: 82 },
    { month: "May", score: 85 },
    { month: "Jun", score: stats.overallScore },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.overallScore}%</div>
                <div className="text-sm text-muted-foreground">ESG Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.onTrack}</div>
                <div className="text-sm text-muted-foreground">On Track</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {stats.atRisk + stats.behind}
                </div>
                <div className="text-sm text-muted-foreground">
                  Needs Attention
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.verified}</div>
                <div className="text-sm text-muted-foreground">Verified</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>ESG Score Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {categoryData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Filter by category:</span>
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("all")}
        >
          All ({stats.total})
        </Button>
        <Button
          variant={selectedCategory === "environmental" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("environmental")}
          className="text-green-600"
        >
          <Leaf className="h-4 w-4 mr-1" />
          Environmental ({stats.environmental})
        </Button>
        <Button
          variant={selectedCategory === "social" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("social")}
          className="text-blue-600"
        >
          <Users className="h-4 w-4 mr-1" />
          Social ({stats.social})
        </Button>
        <Button
          variant={selectedCategory === "governance" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("governance")}
          className="text-purple-600"
        >
          <Shield className="h-4 w-4 mr-1" />
          Governance ({stats.governance})
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMetrics.map((metric) => (
          <ESGMetricCard
            key={metric.id}
            metric={metric}
            onEdit={onEditMetric}
            onViewDetails={onViewMetricDetails}
          />
        ))}
      </div>

      {filteredMetrics.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Metrics Found</h3>
            <p className="text-muted-foreground">
              {selectedCategory === "all"
                ? "Start tracking your ESG performance by adding metrics."
                : `No ${selectedCategory} metrics found. Try a different category.`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
