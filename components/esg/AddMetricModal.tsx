"use client";

import { useState } from "react";
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
import { Checkbox } from "@/components/ui/Checkbox";
import { Separator } from "@/components/ui/Separator";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Leaf,
  Users,
  Shield,
  Sparkles,
  Target,
  Database,
  Activity,
  Calculator,
  ArrowRight,
  Zap,
} from "lucide-react";
import type { ESGMetric } from "./ESGDashboard";

const addMetricSchema = z.object({
  name: z.string().min(1, "Metric name is required"),
  category: z.enum(["environmental", "social", "governance"]),
  description: z.string().min(1, "Description is required"),
  currentValue: z.number().min(0, "Current value must be positive"),
  targetValue: z.number().min(0, "Target value must be positive"),
  unit: z.string().min(1, "Unit is required"),
  dataSource: z.string().min(1, "Data source is required"),
  verified: z.boolean(),
});

type AddMetricFormData = z.infer<typeof addMetricSchema>;

interface AddMetricModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMetricAdded: (metric: ESGMetric) => void;
}

const TEMPLATES = {
  environmental: [
    { name: "Carbon Emissions", description: "Scope 1 & 2 CO2 equivalent emissions", unit: "tonnes CO2e", dataSource: "Utility API / ERP" },
    { name: "Renewable Energy Mix", description: "Percentage of power from green sources", unit: "%", dataSource: "Utility Bills" },
    { name: "Water Intensity", description: "Water consumption per unit of production", unit: "L/unit", dataSource: "Facility CMS" },
  ],
  social: [
    { name: "Gender Pay Gap", description: "Median pay difference between demographics", unit: "%", dataSource: "HR Payroll" },
    { name: "Employee Turnover", description: "Annualized rate of voluntary attrition", unit: "%", dataSource: "HRIS" },
    { name: "Community Investment", description: "Total value of philanthropic contributions", unit: "USD", dataSource: "Finance/CSR" },
  ],
  governance: [
    { name: "Board Independence", description: "Ratio of non-executive board members", unit: "%", dataSource: "Governance Records" },
    { name: "Audit Committee Frequency", description: "Number of independent audit meetings", unit: "count", dataSource: "Meeting Minutes" },
    { name: "Ethics Policy Coverage", description: "Employee training completion status", unit: "%", dataSource: "Compliance Portal" },
  ],
};

export function AddMetricModal({
  open,
  onOpenChange,
  onMetricAdded,
}: AddMetricModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddMetricFormData>({
    resolver: zodResolver(addMetricSchema),
    defaultValues: {
      category: "environmental",
      verified: false,
      currentValue: 0,
      targetValue: 100,
    },
  });

  const selectedCategory = watch("category");

  const onSubmit = async (data: AddMetricFormData) => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const newMetric: ESGMetric = {
        id: `ESG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        ...data,
        status: data.currentValue >= data.targetValue ? "achieved" : "on_track",
        trend: "stable",
        lastUpdated: new Date().toISOString(),
      };
      onMetricAdded(newMetric);
      toast.success("New institutional metric provisioned");
      reset();
      setActiveTemplate(null);
      onOpenChange(false);
    } catch {
      toast.error("Provisioning failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyTemplate = (template: typeof TEMPLATES.environmental[0]) => {
    setValue("name", template.name);
    setValue("description", template.description);
    setValue("unit", template.unit);
    setValue("dataSource", template.dataSource);
    setActiveTemplate(template.name);
  };

  return (
    <WideModal open={open} onOpenChange={onOpenChange}>
      <WideModalContent className="flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex-none p-6 border-b bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-zinc-900 dark:bg-zinc-50 flex items-center justify-center text-white dark:text-zinc-900 shadow-xl">
              <Plus className="h-6 w-6" />
            </div>
            <div>
              <WideModalTitle className="text-xl font-bold tracking-tight">Provision Institutional Metric</WideModalTitle>
              <WideModalDescription>Initialize a new performance indicator for your ESG reporting hub.</WideModalDescription>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Column: Config & Templates */}
          <div className="w-[340px] flex-none border-r overflow-y-auto p-6 space-y-8 bg-zinc-50/50 dark:bg-zinc-900/20">
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Framework Alignment</Label>
              <div className="grid gap-2">
                {[
                  { id: "environmental", icon: <Leaf className="h-4 w-4" />, color: "text-emerald-500", bg: "hover:bg-emerald-50 dark:hover:bg-emerald-950/20" },
                  { id: "social", icon: <Users className="h-4 w-4" />, color: "text-blue-500", bg: "hover:bg-blue-50 dark:hover:bg-blue-950/20" },
                  { id: "governance", icon: <Shield className="h-4 w-4" />, color: "text-purple-500", bg: "hover:bg-purple-50 dark:hover:bg-purple-950/20" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                        setValue("category", cat.id as any);
                        setActiveTemplate(null);
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      selectedCategory === cat.id
                        ? "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800"
                        : "border-transparent text-muted-foreground " + cat.bg
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cat.color}>{cat.icon}</div>
                      <span className="text-sm font-semibold capitalize">{cat.id}</span>
                    </div>
                    {selectedCategory === cat.id && <Zap className="h-3 w-3 text-zinc-400" />}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Sparkles className="h-3 w-3" />
                Intelligent Templates
              </Label>
              <div className="space-y-2">
                {TEMPLATES[selectedCategory as keyof typeof TEMPLATES].map((template) => (
                  <button
                    key={template.name}
                    type="button"
                    onClick={() => applyTemplate(template)}
                    className={`w-full text-left p-4 rounded-xl border transition-all group ${
                      activeTemplate === template.name
                        ? "bg-zinc-900 border-zinc-900 text-white shadow-lg"
                        : "bg-white dark:bg-zinc-950 border-zinc-100 dark:border-zinc-800 hover:border-zinc-300"
                    }`}
                  >
                    <p className="text-sm font-bold">{template.name}</p>
                    <p className={`text-[11px] mt-1 line-clamp-1 ${activeTemplate === template.name ? "text-zinc-400" : "text-zinc-500"}`}>
                      {template.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Parameters & Logic */}
          <div className="flex-1 overflow-y-auto p-10 bg-white dark:bg-zinc-950">
            <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl mx-auto space-y-10">
              <div className="grid grid-cols-2 gap-8">
                <div className="col-span-2 space-y-3">
                  <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground font-bold">Regulatory Nomenclature</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="e.g., Carbon Sequestration Rate"
                    className="h-12 rounded-xl text-lg font-bold bg-muted/20 border-zinc-200 focus:border-zinc-900 focus:ring-0"
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                </div>

                <div className="col-span-2 space-y-3">
                  <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground font-bold">Strategic Context</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Describe the institutional significance..."
                    rows={4}
                    className="rounded-xl border-zinc-200 font-medium leading-relaxed resize-none p-4"
                  />
                  {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
                </div>

                <div className="space-y-3">
                    <Label htmlFor="currentValue" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground font-bold">Initial Observation</Label>
                    <div className="relative">
                        <Input
                            id="currentValue"
                            type="number"
                            step="0.01"
                            {...register("currentValue", { valueAsNumber: true })}
                            className="h-12 rounded-xl text-xl font-bold pl-12"
                        />
                        <Activity className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                    </div>
                </div>

                <div className="space-y-3">
                    <Label htmlFor="targetValue" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground font-bold">Benchmark Target</Label>
                    <div className="relative">
                        <Input
                            id="targetValue"
                            type="number"
                            step="0.01"
                            {...register("targetValue", { valueAsNumber: true })}
                            className="h-12 rounded-xl text-xl font-bold pl-12"
                        />
                        <Target className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                    </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="unit" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground font-bold">Measurement Unit</Label>
                  <div className="relative">
                    <Input id="unit" {...register("unit")} placeholder="e.g., tCO2e" className="h-12 rounded-xl pl-12 font-semibold" />
                    <Calculator className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="dataSource" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground font-bold">Primary Data Engine</Label>
                  <div className="relative">
                    <Input id="dataSource" {...register("dataSource")} placeholder="System of record..." className="h-12 rounded-xl pl-12 font-semibold" />
                    <Database className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                  </div>
                </div>

                <div className="col-span-2 space-y-6 pt-4">
                  <Separator />
                  <div className="flex items-center gap-4 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 transition-all hover:border-zinc-900/20">
                    <Checkbox
                      id="verified"
                      checked={watch("verified")}
                      onCheckedChange={(v) => setValue("verified", !!v)}
                      className="h-6 w-6 rounded-lg"
                    />
                    <div className="space-y-1">
                      <Label htmlFor="verified" className="text-sm font-bold cursor-pointer">Require External Attestation</Label>
                      <p className="text-xs text-muted-foreground">Flag this metric for third-party validation and ISO compliance check.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-between pt-10 border-t">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-semibold tracking-widest uppercase">
                    <Shield className="h-3 w-3" />
                    Secured by Aegis Protocol
                </div>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                    disabled={isSubmitting}
                    className="font-bold border border-transparent hover:border-zinc-200"
                  >
                    Discard
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 px-8 rounded-xl bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-bold shadow-2xl transition-all active:scale-95 group"
                  >
                    {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <span className="flex items-center gap-2">
                           Deploy Metric <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </WideModalContent>
    </WideModal>
  );
}
