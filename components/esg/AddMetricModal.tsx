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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
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
  FileText,
  Activity,
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
    { name: "Carbon Emissions", description: "Total CO2 equivalent emissions from operations", unit: "tonnes CO2e", dataSource: "Environmental Management System" },
    { name: "Energy Consumption", description: "Total energy usage across facilities", unit: "MWh", dataSource: "Utility Bills" },
    { name: "Water Usage", description: "Annual water consumption", unit: "cubic meters", dataSource: "Facility Management" },
    { name: "Waste Recycling Rate", description: "Percentage of waste diverted from landfill", unit: "%", dataSource: "Waste Management Reports" },
  ],
  social: [
    { name: "Employee Diversity", description: "Percentage of diverse employees in leadership", unit: "%", dataSource: "HR Records" },
    { name: "Training Hours", description: "Average annual training hours per employee", unit: "hours", dataSource: "LMS" },
    { name: "Employee Satisfaction", description: "Annual employee satisfaction score", unit: "%", dataSource: "Survey Data" },
    { name: "Workplace Safety", description: "Lost time injury frequency rate", unit: "LTIFR", dataSource: "Safety Reports" },
  ],
  governance: [
    { name: "Board Independence", description: "Percentage of independent board members", unit: "%", dataSource: "Board Records" },
    { name: "Ethics Compliance", description: "Ethics training completion rate", unit: "%", dataSource: "Compliance System" },
    { name: "Supplier Audit Score", description: "Average ESG score of key suppliers", unit: "score", dataSource: "Procurement" },
    { name: "Data Privacy Compliance", description: "GDPR/Privacy regulation compliance rate", unit: "%", dataSource: "Legal Department" },
  ],
};

export function AddMetricModal({
  open,
  onOpenChange,
  onMetricAdded,
}: AddMetricModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

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
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newMetric: ESGMetric = {
        id: Date.now().toString(),
        ...data,
        status: data.currentValue >= data.targetValue ? "achieved" : "on_track",
        trend: "stable",
        lastUpdated: new Date().toISOString(),
      };
      onMetricAdded(newMetric);
      toast.success("Metric added successfully");
      reset();
      setSelectedTemplate(null);
      onOpenChange(false);
    } catch {
      toast.error("Failed to add metric");
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyTemplate = (template: typeof TEMPLATES.environmental[0]) => {
    setValue("name", template.name);
    setValue("description", template.description);
    setValue("unit", template.unit);
    setValue("dataSource", template.dataSource);
    setSelectedTemplate(template.name);
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

  return (
    <WideModal open={open} onOpenChange={onOpenChange}>
      <WideModalContent className="flex flex-col overflow-hidden">
        {/* Header */}
        <div className={`flex-none p-6 pb-4 bg-gradient-to-b ${getCategoryColor(selectedCategory)}`}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 shadow-sm">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <WideModalTitle className="text-xl font-semibold">
                Add New Metric
              </WideModalTitle>
              <WideModalDescription className="mt-1">
                Create a new ESG performance indicator
              </WideModalDescription>
            </div>
          </div>
        </div>

        {/* Content - Two Column Layout */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Column - Templates */}
          <div className="w-80 flex-none border-r overflow-y-auto p-6 bg-muted/30">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={(v: "environmental" | "social" | "governance") => {
                    setValue("category", v);
                    setSelectedTemplate(null);
                  }}
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

              <Separator />

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5" />
                  Quick Templates
                </Label>
                <div className="space-y-2">
                  {TEMPLATES[selectedCategory].map((template) => (
                    <button
                      key={template.name}
                      type="button"
                      onClick={() => applyTemplate(template)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedTemplate === template.name
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <p className="font-medium text-sm">{template.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {template.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    Metric Name
                  </Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="e.g., Carbon Emissions"
                    className="h-11"
                  />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Describe what this metric measures..."
                    rows={3}
                  />
                  {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentValue" className="flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                    Current Value
                  </Label>
                  <Input
                    id="currentValue"
                    type="number"
                    step="0.01"
                    {...register("currentValue", { valueAsNumber: true })}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetValue" className="flex items-center gap-2">
                    <Target className="h-3.5 w-3.5 text-muted-foreground" />
                    Target Value
                  </Label>
                  <Input
                    id="targetValue"
                    type="number"
                    step="0.01"
                    {...register("targetValue", { valueAsNumber: true })}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit of Measurement</Label>
                  <Input
                    id="unit"
                    {...register("unit")}
                    placeholder="e.g., tonnes CO2e"
                    className="h-11"
                  />
                  {errors.unit && <p className="text-xs text-red-500">{errors.unit.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataSource" className="flex items-center gap-2">
                    <Database className="h-3.5 w-3.5 text-muted-foreground" />
                    Data Source
                  </Label>
                  <Input
                    id="dataSource"
                    {...register("dataSource")}
                    placeholder="e.g., ERP System"
                    className="h-11"
                  />
                  {errors.dataSource && <p className="text-xs text-red-500">{errors.dataSource.message}</p>}
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <Checkbox
                  id="verified"
                  checked={watch("verified")}
                  onCheckedChange={(checked) => setValue("verified", !!checked)}
                />
                <Label htmlFor="verified" className="cursor-pointer">
                  This metric has been externally verified
                </Label>
              </div>

              <Separator />

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add Metric
                </Button>
              </div>
            </form>
          </div>
        </div>
      </WideModalContent>
    </WideModal>
  );
}
