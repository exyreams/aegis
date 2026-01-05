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
import { toast } from "sonner";
import { Separator } from "@/components/ui/Separator";
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
  FileText,
  BarChart3,
  Calendar,
  ExternalLink,
  History,
  ShieldCheck,
  Globe,
  Award,
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
      await new Promise((resolve) => setTimeout(resolve, 800));

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

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case "environmental":
        return {
          icon: <Leaf className="h-5 w-5" />,
          color: "text-emerald-600",
          bg: "bg-emerald-50 dark:bg-emerald-950/30",
          border: "border-emerald-100 dark:border-emerald-800",
        };
      case "social":
        return {
          icon: <Users className="h-5 w-5" />,
          color: "text-blue-600",
          bg: "bg-blue-50 dark:bg-blue-950/30",
          border: "border-blue-100 dark:border-blue-800",
        };
      case "governance":
        return {
          icon: <Shield className="h-5 w-5" />,
          color: "text-purple-600",
          bg: "bg-purple-50 dark:bg-purple-950/30",
          border: "border-purple-100 dark:border-purple-800",
        };
      default:
        return {
          icon: <BarChart3 className="h-5 w-5" />,
          color: "text-gray-600",
          bg: "bg-gray-50 dark:bg-gray-950/30",
          border: "border-gray-100 dark:border-gray-800",
        };
    }
  };

  const statusConfig = {
    achieved: {
      label: "Achieved",
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    },
    on_track: {
      label: "On Track",
      color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    },
    at_risk: {
      label: "At Risk",
      color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    },
    behind: {
      label: "Behind",
      color: "bg-red-500/10 text-red-600 border-red-500/20",
    },
  };

  const theme = getCategoryTheme(metric.category);
  const progress = Math.min(
    100,
    Math.round((metric.currentValue / metric.targetValue) * 100)
  );

  return (
    <WideModal open={open} onOpenChange={onOpenChange}>
      <WideModalContent className="flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex-none p-6 border-b bg-white dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${theme.bg} ${theme.border} border`}>
                {theme.icon}
              </div>
              <div>
                <WideModalTitle className="text-xl font-semibold tracking-tight">
                  {metric.name}
                </WideModalTitle>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className={`capitalize ${theme.color} border-current py-0`}>
                    {metric.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">ID: {metric.id}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="font-medium"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Update Metric
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 text-muted-foreground"
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8 max-w-4xl mx-auto">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Metric Identity</Label>
                    <Input id="name" {...register("name")} className="font-medium" />
                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Strategic Category</Label>
                    <Select
                      value={watch("category")}
                      onValueChange={(v: "environmental" | "social" | "governance") =>
                        setValue("category", v)
                      }
                    >
                      <SelectTrigger className="font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="environmental">Environmental</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="governance">Governance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="unit" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Measurement Unit</Label>
                    <Input id="unit" {...register("unit")} placeholder="e.g., tonnes CO2e" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataSource" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">System of Record</Label>
                    <Input id="dataSource" {...register("dataSource")} />
                  </div>
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Institutional Definition & Context</Label>
                  <Textarea id="description" {...register("description")} rows={4} className="font-medium leading-relaxed" />
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="currentValue" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-semibold">Current Observation</Label>
                    <Input
                      id="currentValue"
                      type="number"
                      step="0.01"
                      {...register("currentValue", { valueAsNumber: true })}
                      className="text-lg font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetValue" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-semibold">Regulatory/Internal Target</Label>
                    <Input
                      id="targetValue"
                      type="number"
                      step="0.01"
                      {...register("targetValue", { valueAsNumber: true })}
                      className="text-lg font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-6 pt-8">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border">
                    <Checkbox
                      id="verified"
                      checked={watch("verified")}
                      onCheckedChange={(v) => setValue("verified", !!v)}
                      className="h-5 w-5"
                    />
                    <div className="space-y-1">
                      <Label htmlFor="verified" className="text-sm font-semibold cursor-pointer">Require Audit Proof</Label>
                      <p className="text-xs text-muted-foreground">Flag this metric for external third-party verification.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-8 border-t">
                <Button variant="ghost" onClick={() => setIsEditing(false)} className="font-semibold">Discard Changes</Button>
                <Button type="submit" disabled={isSubmitting} className="font-bold px-8">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Commit Updates
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
              {/* Left Column: Analytics */}
              <div className="lg:col-span-7 p-8 border-r overflow-y-auto">
                <div className="space-y-10">
                  {/* Progress Visualization */}
                  <div className="space-y-6">
                    <div className="flex items-end justify-between">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <TrendingUp className="h-3 w-3" />
                          Progress Trajectory
                        </label>
                        <p className="text-5xl font-bold tracking-tighter">
                          {progress}% <span className="text-lg font-medium text-muted-foreground tracking-normal ml-2">alignment</span>
                        </p>
                      </div>
                      <Badge variant="outline" className={`py-1.5 px-4 font-bold ${statusConfig[metric.status as keyof typeof statusConfig]?.color || ""}`}>
                        {statusConfig[metric.status as keyof typeof statusConfig]?.label || metric.status}
                      </Badge>
                    </div>
                    <Progress value={progress} className="h-5 bg-muted" />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl bg-muted/20 border flex flex-col gap-1">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">Benchmark Target</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold">{metric.targetValue}</span>
                          <span className="text-sm font-medium text-muted-foreground">{metric.unit}</span>
                        </div>
                      </div>
                      <div className="p-5 rounded-2xl bg-muted/20 border flex flex-col gap-1">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">Current State</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold">{metric.currentValue}</span>
                          <span className="text-sm font-medium text-muted-foreground">{metric.unit}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Impact Narrative */}
                  <div className="space-y-4">
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <FileText className="h-3 w-3" />
                      Strategic Narrative
                    </label>
                    <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {metric.description}
                    </div>
                  </div>

                  {/* performance history placeholder */}
                  <div className="space-y-4">
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <History className="h-3 w-3" />
                      Submission History
                    </label>
                    <div className="space-y-3">
                      {[
                        { date: "Dec 15, 2024", value: metric.currentValue, user: "ClimateRisk_AI" },
                        { date: "Nov 28, 2024", value: metric.currentValue * 0.95, user: "System_Auth" },
                        { date: "Nov 12, 2024", value: metric.currentValue * 0.92, user: "Manual_Input" },
                      ].map((log, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl border bg-white dark:bg-zinc-950/50">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                              <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{log.date}</p>
                              <p className="text-[10px] text-muted-foreground">Updated by {log.user}</p>
                            </div>
                          </div>
                          <span className="text-sm font-bold">{log.value.toFixed(1)} {metric.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Metadata & Controls */}
              <div className="lg:col-span-5 p-8 bg-zinc-50/50 dark:bg-zinc-900/40 flex flex-col gap-8 h-full overflow-y-auto">
                {/* Data Proof */}
                <div className="space-y-4">
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Database className="h-3 w-3" />
                    Data Provenance
                  </label>
                  <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border space-y-4 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Source</span>
                      <span className="text-sm font-bold flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5 text-zinc-400" />
                        {metric.dataSource}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Last Reconciliation</span>
                      <span className="text-sm font-bold flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-zinc-400" />
                        {new Date(metric.lastUpdated).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Frequency</span>
                      <Badge variant="secondary" className="font-bold">Real-time API</Badge>
                    </div>
                  </div>
                </div>

                {/* Assurance status */}
                <div className="space-y-4">
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Audit Alignment
                  </label>
                  {metric.verified ? (
                    <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                         <Award className="h-24 w-24" />
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-emerald-500 text-white shadow-lg">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                        <div>
                          <h5 className="font-bold text-emerald-800 dark:text-emerald-400">Verified by Aegis-Assure™</h5>
                          <p className="text-xs text-emerald-700/70 dark:text-emerald-500/60 mt-0.5 leading-relaxed">
                            This data has been cross-referenced with satellite telemetry and verified by ISO-certified third-party laboratories.
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full bg-white dark:bg-zinc-900 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/30">
                        View Audit Certificate
                      </Button>
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 space-y-4">
                       <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-amber-500 text-white">
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div>
                          <h5 className="font-bold text-amber-800 dark:text-amber-400">Verification Required</h5>
                          <p className="text-xs text-amber-700/70 dark:text-amber-500/60 mt-0.5 leading-relaxed">
                            This is high-impact data point currently in a self-reported state. To maintain Greensium compliance, external audit is recommended.
                          </p>
                        </div>
                      </div>
                      <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg shadow-amber-500/20">
                        Initiate External Audit
                      </Button>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="mt-auto space-y-2">
                  <Button className="w-full h-12 font-bold shadow-xl">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Export Regulatory Report
                  </Button>
                  <Button variant="ghost" className="w-full text-xs font-semibold text-muted-foreground hover:text-red-500 transition-colors">
                     Report Data Discrepancy
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </WideModalContent>
    </WideModal>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
