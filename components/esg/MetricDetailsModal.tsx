"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  WideModal,
  WideModalContent,
  WideModalTitle,
  WideModalDescription,
} from "@/components/ui/WideModal";
import { Button } from "@/components/ui/Button";
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
import { Checkbox } from "@/components/ui/Checkbox";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Separator } from "@/components/ui/Separator";
import { toast } from "sonner";
import {
  Loader2,
  Leaf,
  Users,
  Shield,
  TrendingUp,
  TrendingDown,
  Database,
  CheckCircle,
  Clock,
  Edit,
  Minus,
  Target,
  BarChart3,
  Calendar,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from "lucide-react";
import type { ESGMetric } from "./ESGDashboard";

const editMetricSchema = z.object({
  name: z.string().min(1, "Metric name is required"),
  category: z.enum(["environmental", "social", "governance"]),
  description: z.string().min(1, "Description is required"),
  currentValue: z.number().min(0, "Current value must be positive"),
  targetValue: z.number().min(0, "Target value must be positive"),
  unit: z.string().min(1, "Unit is required"),
  dataSource: z.string().min(1, "Data source is required"),
  verified: z.boolean(),
});

type EditMetricFormData = z.infer<typeof editMetricSchema>;

interface MetricDetailsModalProps {
  metric: ESGMetric | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMetricUpdated: (metric: ESGMetric) => void;
}

export function MetricDetailsModal({
  metric,
  open,
  onOpenChange,
  onMetricUpdated,
}: MetricDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditMetricFormData>({
    resolver: zodResolver(editMetricSchema),
  });

  useEffect(() => {
    if (metric) {
      reset({
        name: metric.name,
        category: metric.category,
        description: metric.description,
        currentValue: metric.currentValue,
        targetValue: metric.targetValue,
        unit: metric.unit,
        dataSource: metric.dataSource,
        verified: metric.verified,
      });
      setIsEditing(false);
    }
  }, [metric, reset, open]);

  if (!metric) return null;

  const onSubmit = async (data: EditMetricFormData) => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const updatedMetric: ESGMetric = {
        ...metric,
        ...data,
        status: data.currentValue >= data.targetValue ? "achieved" : "on_track",
        lastUpdated: new Date().toISOString(),
      };

      onMetricUpdated(updatedMetric);
      toast.success("Metric updated successfully");
      setIsEditing(false);
    } catch {
      toast.error("Failed to update metric");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "environmental":
        return <Leaf className="h-5 w-5 text-emerald-600" />;
      case "social":
        return <Users className="h-5 w-5 text-blue-600" />;
      case "governance":
        return <Shield className="h-5 w-5 text-purple-600" />;
      default:
        return <Target className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "environmental":
        return "from-emerald-500/20 to-emerald-500/5";
      case "social":
        return "from-blue-500/20 to-blue-500/5";
      case "governance":
        return "from-purple-500/20 to-purple-500/5";
      default:
        return "from-gray-500/20 to-gray-500/5";
    }
  };

  const getStatusConfig = (status: string) => {
    const config = {
      achieved: {
        label: "Achieved",
        className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        icon: <CheckCircle className="h-3.5 w-3.5" />,
      },
      on_track: {
        label: "On Track",
        className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        icon: <TrendingUp className="h-3.5 w-3.5" />,
      },
      at_risk: {
        label: "At Risk",
        className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        icon: <Activity className="h-3.5 w-3.5" />,
      },
      behind: {
        label: "Behind",
        className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        icon: <TrendingDown className="h-3.5 w-3.5" />,
      },
    };
    return config[status as keyof typeof config] || config.on_track;
  };

  const getTrendDisplay = (trend: string) => {
    switch (trend) {
      case "up":
        return { icon: <ArrowUpRight className="h-4 w-4" />, label: "Trending Up", color: "text-emerald-600" };
      case "down":
        return { icon: <ArrowDownRight className="h-4 w-4" />, label: "Trending Down", color: "text-red-600" };
      default:
        return { icon: <Minus className="h-4 w-4" />, label: "Stable", color: "text-gray-500" };
    }
  };

  const progress = Math.min(100, Math.round((metric.currentValue / metric.targetValue) * 100));
  const statusConfig = getStatusConfig(metric.status);
  const trendDisplay = getTrendDisplay(metric.trend);

  return (
    <WideModal open={open} onOpenChange={onOpenChange}>
      <WideModalContent className="flex flex-col overflow-hidden">
        {/* Header */}
        <div className={`flex-none p-6 pb-4 bg-gradient-to-b ${getCategoryColor(metric.category)}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 shadow-sm">
                {getCategoryIcon(metric.category)}
              </div>
              <div>
                <WideModalTitle className="text-xl font-semibold">
                  {metric.name}
                </WideModalTitle>
                <WideModalDescription className="mt-1">
                  {metric.category.charAt(0).toUpperCase() + metric.category.slice(1)} Metric
                </WideModalDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={statusConfig.className}>
                {statusConfig.icon}
                <span className="ml-1">{statusConfig.label}</span>
              </Badge>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isEditing ? (
            /* Edit Form */
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="name">Metric Name</Label>
                  <Input id="name" {...register("name")} className="h-11" />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={watch("category")}
                    onValueChange={(v: "environmental" | "social" | "governance") => setValue("category", v)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="environmental">
                        <div className="flex items-center gap-2">
                          <Leaf className="h-4 w-4 text-emerald-600" /> Environmental
                        </div>
                      </SelectItem>
                      <SelectItem value="social">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-600" /> Social
                        </div>
                      </SelectItem>
                      <SelectItem value="governance">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-purple-600" /> Governance
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit of Measurement</Label>
                  <Input id="unit" {...register("unit")} className="h-11" />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" {...register("description")} rows={3} />
                  {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentValue">Current Value</Label>
                  <Input
                    id="currentValue"
                    type="number"
                    step="0.01"
                    {...register("currentValue", { valueAsNumber: true })}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetValue">Target Value</Label>
                  <Input
                    id="targetValue"
                    type="number"
                    step="0.01"
                    {...register("targetValue", { valueAsNumber: true })}
                    className="h-11"
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="dataSource">Data Source</Label>
                  <Input id="dataSource" {...register("dataSource")} className="h-11" />
                </div>

                <div className="col-span-2">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                    <Checkbox
                      id="verified"
                      checked={watch("verified")}
                      onCheckedChange={(v) => setValue("verified", !!v)}
                    />
                    <Label htmlFor="verified" className="cursor-pointer">
                      This metric has been externally verified
                    </Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          ) : (
            /* View Mode */
            <div className="p-6">
              <div className="grid grid-cols-3 gap-6">
                {/* Left Column - Progress & Stats */}
                <div className="col-span-2 space-y-6">
                  {/* Progress Section */}
                  <div className="p-6 rounded-xl bg-muted/30 border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        Progress Toward Target
                      </h3>
                      <span className="text-2xl font-semibold">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-3 mb-4" />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-background">
                        <p className="text-xs text-muted-foreground mb-1">Current Value</p>
                        <p className="text-xl font-semibold">
                          {metric.currentValue.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">{metric.unit}</span>
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-background">
                        <p className="text-xs text-muted-foreground mb-1">Target Value</p>
                        <p className="text-xl font-semibold">
                          {metric.targetValue.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">{metric.unit}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      Description
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {metric.description}
                    </p>
                  </div>

                  {/* Trend */}
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                    <div className={`p-2 rounded-lg bg-background ${trendDisplay.color}`}>
                      {trendDisplay.icon}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Performance Trend</p>
                      <p className="font-medium">{trendDisplay.label}</p>
                    </div>
                  </div>
                </div>

                {/* Right Column - Metadata */}
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border space-y-4">
                    <h3 className="font-medium text-sm">Metric Details</h3>
                    <Separator />
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Database className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Data Source</p>
                          <p className="text-sm">{metric.dataSource}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Last Updated</p>
                          <p className="text-sm">{new Date(metric.lastUpdated).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Target className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Category</p>
                          <p className="text-sm capitalize">{metric.category}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Verification Status */}
                  <div className={`p-4 rounded-xl border ${metric.verified ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30' : 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {metric.verified ? (
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-amber-600" />
                      )}
                      <span className={`text-sm font-medium ${metric.verified ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                        {metric.verified ? 'Verified' : 'Pending Verification'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {metric.verified 
                        ? 'This metric has been externally verified and audited.'
                        : 'This metric is self-reported and awaiting third-party verification.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </WideModalContent>
    </WideModal>
  );
}
