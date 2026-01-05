"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { MetricDetailsModal } from "./MetricDetailsModal";
import { toast } from "sonner";
import {
  Leaf,
  Users,
  Shield,
  Award,
  Target,
  AlertTriangle,
  CheckCircle,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

// Re-export ESGMetric type for consumers
export interface ESGMetric {
  id: string;
  name: string;
  category: "environmental" | "social" | "governance";
  description: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  status: "on_track" | "at_risk" | "behind" | "achieved";
  trend: "up" | "down" | "stable";
  lastUpdated: string;
  dataSource: string;
  verified: boolean;
}

interface ESGDashboardProps {
  metrics: ESGMetric[];
  onEditMetric?: (metric: ESGMetric) => void;
  onViewMetricDetails?: (metric: ESGMetric) => void;
  onDeleteMetric?: (metricId: string) => void;
  onUpdateMetric?: (metric: ESGMetric) => void;
}

export function ESGDashboard({
  metrics,
  onEditMetric,
  onViewMetricDetails,
  onDeleteMetric,
  onUpdateMetric,
}: ESGDashboardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<ESGMetric | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [metricToDelete, setMetricToDelete] = useState<ESGMetric | null>(null);

  // Calculate statistics
  const stats = useMemo(() => {
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
      onTrack: onTrack.length,
      atRisk: atRisk.length,
      behind: behind.length,
      overallScore,
      verified: metrics.filter((m) => m.verified).length,
    };
  }, [metrics]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "environmental":
        return <Leaf className="h-4 w-4 text-emerald-600" />;
      case "social":
        return <Users className="h-4 w-4 text-blue-600" />;
      case "governance":
        return <Shield className="h-4 w-4 text-purple-600" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    const styles = {
      environmental: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      social: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      governance: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    };
    return styles[category as keyof typeof styles] || "bg-gray-100 text-gray-700";
  };

  const getStatusBadge = (status: string) => {
    const config = {
      achieved: { label: "Achieved", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
      on_track: { label: "On Track", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
      at_risk: { label: "At Risk", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
      behind: { label: "Behind", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
    };
    return config[status as keyof typeof config] || { label: status, className: "bg-gray-100 text-gray-700" };
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />;
      case "down":
        return <ArrowDownRight className="h-3.5 w-3.5 text-red-600" />;
      default:
        return <Minus className="h-3.5 w-3.5 text-gray-400" />;
    }
  };

  const handleViewDetails = (metric: ESGMetric) => {
    setSelectedMetric(metric);
    setIsDetailsOpen(true);
    onViewMetricDetails?.(metric);
  };

  const handleEdit = (metric: ESGMetric) => {
    setSelectedMetric(metric);
    setIsDetailsOpen(true);
    onEditMetric?.(metric);
  };

  const handleDelete = (metric: ESGMetric) => {
    setMetricToDelete(metric);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (metricToDelete) {
      onDeleteMetric?.(metricToDelete.id);
      toast.success("Metric deleted successfully");
      setMetricToDelete(null);
    }
    setDeleteConfirmOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Target className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-semibold">{stats.overallScore}%</p>
            <p className="text-xs text-muted-foreground">Overall Score</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-emerald-600">{stats.onTrack}</p>
            <p className="text-xs text-muted-foreground">On Track</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-amber-600">{stats.atRisk}</p>
            <p className="text-xs text-muted-foreground">At Risk</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <Award className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-semibold">{stats.verified}</p>
            <p className="text-xs text-muted-foreground">Verified</p>
          </div>
        </div>
      </div>

      {/* Metrics Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">ESG Metrics</CardTitle>
            <Badge variant="secondary">{metrics.length} total</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Metric</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.map((metric) => {
                const progress = Math.min(100, (metric.currentValue / metric.targetValue) * 100);
                const statusConfig = getStatusBadge(metric.status);
                
                return (
                  <TableRow key={metric.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-muted">
                          {getCategoryIcon(metric.category)}
                        </div>
                        <div>
                          <p className="font-medium">{metric.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {metric.currentValue} / {metric.targetValue} {metric.unit}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getCategoryBadge(metric.category)}>
                        {metric.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <Progress value={progress} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground w-10">
                          {Math.round(progress)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusConfig.className}>
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(metric.trend)}
                        <span className="text-xs capitalize text-muted-foreground">
                          {metric.trend}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-muted-foreground truncate max-w-[120px]">
                          {metric.dataSource}
                        </span>
                        {metric.verified && (
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(metric)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(metric)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(metric)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {metrics.length === 0 && (
            <div className="text-center py-12">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Metrics Found</h3>
              <p className="text-muted-foreground">
                Start tracking your ESG performance by adding metrics.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <MetricDetailsModal
        metric={selectedMetric}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onMetricUpdated={onUpdateMetric || (() => {})}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-red-50 dark:bg-red-950/20 p-6 flex flex-col items-center text-center space-y-4">
            <div className="h-14 w-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
              <Trash2 className="h-7 w-7" />
            </div>
            <div className="space-y-1">
               <DialogTitle className="text-xl font-bold text-red-900 dark:text-red-400">Confirm Deletion</DialogTitle>
               <DialogDescription className="text-red-700/70 dark:text-red-400/60 font-medium">
                  This action cannot be undone. Permanent data loss will occur for the metric:
               </DialogDescription>
            </div>
            {metricToDelete && (
              <div className="px-4 py-2 rounded-lg bg-red-100/50 dark:bg-red-900/40 border border-red-200 dark:border-red-800">
                <p className="text-sm font-bold text-red-900 dark:text-red-300">{metricToDelete.name}</p>
              </div>
            )}
          </div>
          <div className="p-4 bg-white dark:bg-zinc-950 flex gap-3">
            <Button variant="ghost" onClick={() => setDeleteConfirmOpen(false)} className="flex-1 font-bold">
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} className="flex-1 font-bold bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20">
              Delete Metric
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
