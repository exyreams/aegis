"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Leaf,
  Users,
  Shield,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  Plus,
  Edit3,
  Trash2,
  CheckCircle,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

interface ESGMetric {
  id: string;
  name: string;
  category: "environmental" | "social" | "governance";
  description: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  deadline: string;
  status: "on_track" | "at_risk" | "behind" | "achieved";
  trend: "up" | "down" | "stable";
  lastUpdated: string;
  dataSource: string;
  verified: boolean;
}

interface ESGMetricsTrackerProps {
  onMetricAdded?: (metric: ESGMetric) => void;
  onMetricUpdated?: (metric: ESGMetric) => void;
  onMetricDeleted?: (metricId: string) => void;
}

export function ESGMetricsTracker({
  onMetricAdded,
  onMetricUpdated,
  onMetricDeleted,
}: ESGMetricsTrackerProps) {
  const [metrics, setMetrics] = useState<ESGMetric[]>([]);
  const [isAddingMetric, setIsAddingMetric] = useState(false);
  const [editingMetric, setEditingMetric] = useState<string | null>(null);
  const [newMetric, setNewMetric] = useState({
    name: "",
    category: "environmental" as const,
    description: "",
    currentValue: 0,
    targetValue: 0,
    unit: "",
    deadline: "",
    dataSource: "",
  });

  // Mock data - in real implementation, this would come from your backend
  useEffect(() => {
    const mockMetrics: ESGMetric[] = [
      {
        id: "1",
        name: "Carbon Emissions Reduction",
        category: "environmental",
        description: "Reduce CO2 emissions by 30% compared to 2020 baseline",
        currentValue: 22,
        targetValue: 30,
        unit: "% reduction",
        deadline: "2025-12-31",
        status: "on_track",
        trend: "up",
        lastUpdated: new Date().toISOString(),
        dataSource: "Environmental Management System",
        verified: true,
      },
      {
        id: "2",
        name: "Renewable Energy Usage",
        category: "environmental",
        description: "Increase renewable energy to 80% of total consumption",
        currentValue: 65,
        targetValue: 80,
        unit: "% renewable",
        deadline: "2024-12-31",
        status: "on_track",
        trend: "up",
        lastUpdated: new Date().toISOString(),
        dataSource: "Energy Management Platform",
        verified: true,
      },
      {
        id: "3",
        name: "Workforce Diversity",
        category: "social",
        description: "Achieve 40% women in leadership positions",
        currentValue: 32,
        targetValue: 40,
        unit: "% women leaders",
        deadline: "2025-06-30",
        status: "at_risk",
        trend: "up",
        lastUpdated: new Date().toISOString(),
        dataSource: "HR Information System",
        verified: true,
      },
      {
        id: "4",
        name: "Board Independence",
        category: "governance",
        description: "Maintain 75% independent board members",
        currentValue: 78,
        targetValue: 75,
        unit: "% independent",
        deadline: "2024-12-31",
        status: "achieved",
        trend: "stable",
        lastUpdated: new Date().toISOString(),
        dataSource: "Corporate Governance Records",
        verified: true,
      },
      {
        id: "5",
        name: "Water Usage Efficiency",
        category: "environmental",
        description: "Reduce water consumption per unit of production",
        currentValue: 15,
        targetValue: 25,
        unit: "% reduction",
        deadline: "2024-12-31",
        status: "behind",
        trend: "down",
        lastUpdated: new Date().toISOString(),
        dataSource: "Facility Management System",
        verified: false,
      },
    ];

    setMetrics(mockMetrics);
  }, []);

  const addMetric = () => {
    if (!newMetric.name || !newMetric.targetValue) {
      toast.error("Please fill in required fields");
      return;
    }

    const metric: ESGMetric = {
      id: Date.now().toString(),
      ...newMetric,
      status: "on_track",
      trend: "stable",
      lastUpdated: new Date().toISOString(),
      verified: false,
    };

    setMetrics([...metrics, metric]);
    onMetricAdded?.(metric);
    setNewMetric({
      name: "",
      category: "environmental",
      description: "",
      currentValue: 0,
      targetValue: 0,
      unit: "",
      deadline: "",
      dataSource: "",
    });
    setIsAddingMetric(false);
    toast.success("ESG metric added successfully");
  };

  const deleteMetric = (id: string) => {
    if (confirm("Are you sure you want to delete this metric?")) {
      setMetrics(metrics.filter((m) => m.id !== id));
      onMetricDeleted?.(id);
      toast.success("Metric deleted");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "achieved":
        return "bg-green-100 text-green-800 border-green-200";
      case "on_track":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "at_risk":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "behind":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "environmental":
        return <Leaf className="h-4 w-4 text-green-600" />;
      case "social":
        return <Users className="h-4 w-4 text-blue-600" />;
      case "governance":
        return <Shield className="h-4 w-4 text-purple-600" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case "stable":
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
      default:
        return null;
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min(100, (current / target) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Add Metric Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">ESG Metrics Tracker</h2>
        <Button onClick={() => setIsAddingMetric(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Metric
        </Button>
      </div>

      {/* Add Metric Form */}
      <AnimatePresence>
        {isAddingMetric && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Add New ESG Metric</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Metric Name *</Label>
                    <Input
                      id="name"
                      value={newMetric.name}
                      onChange={(e) =>
                        setNewMetric({ ...newMetric, name: e.target.value })
                      }
                      placeholder="e.g., Carbon Emissions Reduction"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={newMetric.category}
                      onValueChange={(value: any) =>
                        setNewMetric({ ...newMetric, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="environmental">
                          Environmental
                        </SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="governance">Governance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newMetric.description}
                      onChange={(e) =>
                        setNewMetric({
                          ...newMetric,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe the metric and its importance"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentValue">Current Value</Label>
                    <Input
                      id="currentValue"
                      type="number"
                      value={newMetric.currentValue}
                      onChange={(e) =>
                        setNewMetric({
                          ...newMetric,
                          currentValue: Number(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetValue">Target Value *</Label>
                    <Input
                      id="targetValue"
                      type="number"
                      value={newMetric.targetValue}
                      onChange={(e) =>
                        setNewMetric({
                          ...newMetric,
                          targetValue: Number(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      value={newMetric.unit}
                      onChange={(e) =>
                        setNewMetric({ ...newMetric, unit: e.target.value })
                      }
                      placeholder="e.g., %, tons CO2, kWh"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline">Target Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={newMetric.deadline}
                      onChange={(e) =>
                        setNewMetric({ ...newMetric, deadline: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="dataSource">Data Source</Label>
                    <Input
                      id="dataSource"
                      value={newMetric.dataSource}
                      onChange={(e) =>
                        setNewMetric({
                          ...newMetric,
                          dataSource: e.target.value,
                        })
                      }
                      placeholder="e.g., Environmental Management System"
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button onClick={addMetric}>Add Metric</Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingMetric(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {metrics.map((metric) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(metric.category)}
                      <div>
                        <CardTitle className="text-lg">{metric.name}</CardTitle>
                        <Badge
                          variant="outline"
                          className={`mt-1 capitalize ${getStatusColor(
                            metric.status
                          )}`}
                        >
                          {metric.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(metric.trend)}
                      {metric.verified && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      {!metric.verified && (
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {metric.description}
                  </p>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>
                        {metric.currentValue} / {metric.targetValue}{" "}
                        {metric.unit}
                      </span>
                    </div>
                    <Progress
                      value={getProgressPercentage(
                        metric.currentValue,
                        metric.targetValue
                      )}
                      className="h-2"
                    />
                    <div className="text-xs text-muted-foreground">
                      {Math.round(
                        getProgressPercentage(
                          metric.currentValue,
                          metric.targetValue
                        )
                      )}
                      % of target achieved
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-2 text-xs text-muted-foreground">
                    {metric.deadline && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Target:{" "}
                          {new Date(metric.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      <span>Source: {metric.dataSource}</span>
                    </div>
                    <div>
                      Last updated:{" "}
                      {new Date(metric.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingMetric(metric.id)}
                    >
                      <Edit3 className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMetric(metric.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {metrics.length === 0 && !isAddingMetric && (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No ESG Metrics Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start tracking your sustainability performance by adding your
              first ESG metric.
            </p>
            <Button onClick={() => setIsAddingMetric(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Metric
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
