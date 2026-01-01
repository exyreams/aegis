"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
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
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import type { ESGMetric } from "./ESGMetricCard";

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

const METRIC_TEMPLATES = {
  environmental: [
    {
      name: "Carbon Emissions",
      description: "Total CO2 equivalent emissions",
      unit: "tonnes CO2e",
      dataSource: "Environmental Management System",
    },
    {
      name: "Energy Consumption",
      description: "Total energy consumption",
      unit: "MWh",
      dataSource: "Utility Bills",
    },
    {
      name: "Water Usage",
      description: "Total water consumption",
      unit: "cubic meters",
      dataSource: "Water Meter Readings",
    },
    {
      name: "Waste Recycling Rate",
      description: "Percentage of waste recycled",
      unit: "%",
      dataSource: "Waste Management Reports",
    },
  ],
  social: [
    {
      name: "Employee Diversity",
      description: "Percentage of diverse employees",
      unit: "%",
      dataSource: "HR Records",
    },
    {
      name: "Training Hours",
      description: "Average training hours per employee",
      unit: "hours",
      dataSource: "Learning Management System",
    },
    {
      name: "Employee Satisfaction",
      description: "Employee satisfaction score",
      unit: "score (1-10)",
      dataSource: "Employee Survey",
    },
    {
      name: "Community Investment",
      description: "Investment in community programs",
      unit: "USD",
      dataSource: "Financial Records",
    },
  ],
  governance: [
    {
      name: "Board Independence",
      description: "Percentage of independent board members",
      unit: "%",
      dataSource: "Board Records",
    },
    {
      name: "Ethics Training",
      description: "Percentage of employees completing ethics training",
      unit: "%",
      dataSource: "Training Records",
    },
    {
      name: "Data Security Score",
      description: "Cybersecurity assessment score",
      unit: "score (1-100)",
      dataSource: "Security Audit",
    },
    {
      name: "Compliance Rate",
      description: "Regulatory compliance rate",
      unit: "%",
      dataSource: "Compliance Reports",
    },
  ],
};

export function AddMetricModal({
  open,
  onOpenChange,
  onMetricAdded,
}: AddMetricModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

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
      verified: false,
    },
  });

  const selectedCategory = watch("category");

  const onSubmit = async (data: AddMetricFormData) => {
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create new metric
      const newMetric: ESGMetric = {
        id: Date.now().toString(),
        ...data,
        status: data.currentValue >= data.targetValue ? "achieved" : "on_track",
        trend: "stable",
        lastUpdated: new Date().toISOString(),
      };

      onMetricAdded(newMetric);
      toast.success("ESG metric added successfully!");
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to add metric");
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyTemplate = (template: any) => {
    setValue("name", template.name);
    setValue("description", template.description);
    setValue("unit", template.unit);
    setValue("dataSource", template.dataSource);
    setSelectedTemplate(template.name);
  };

  const availableTemplates = selectedCategory
    ? METRIC_TEMPLATES[selectedCategory]
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add ESG Metric
          </DialogTitle>
          <DialogDescription>
            Add a new ESG metric to track your sustainability performance.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={watch("category")}
              onValueChange={(
                value: "environmental" | "social" | "governance"
              ) => {
                setValue("category", value);
                setSelectedTemplate("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select ESG category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="environmental">Environmental</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="governance">Governance</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive">
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Templates */}
          {availableTemplates.length > 0 && (
            <div className="space-y-2">
              <Label>Quick Templates</Label>
              <div className="grid grid-cols-2 gap-2">
                {availableTemplates.map((template) => (
                  <Button
                    key={template.name}
                    type="button"
                    variant={
                      selectedTemplate === template.name ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => applyTemplate(template)}
                    className="justify-start text-left h-auto p-3"
                  >
                    <div>
                      <div className="font-medium text-sm">{template.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {template.description}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Metric Name *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="e.g., Carbon Emissions"
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Input
                id="unit"
                {...register("unit")}
                placeholder="e.g., tonnes CO2e, %, hours"
              />
              {errors.unit && (
                <p className="text-sm text-destructive">
                  {errors.unit.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe what this metric measures and why it's important"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentValue">Current Value *</Label>
              <Input
                id="currentValue"
                type="number"
                step="0.01"
                {...register("currentValue", { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.currentValue && (
                <p className="text-sm text-destructive">
                  {errors.currentValue.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetValue">Target Value *</Label>
              <Input
                id="targetValue"
                type="number"
                step="0.01"
                {...register("targetValue", { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.targetValue && (
                <p className="text-sm text-destructive">
                  {errors.targetValue.message}
                </p>
              )}
            </div>
          </div>

          {/* Data Source */}
          <div className="space-y-2">
            <Label htmlFor="dataSource">Data Source *</Label>
            <Input
              id="dataSource"
              {...register("dataSource")}
              placeholder="e.g., Environmental Management System, HR Records"
            />
            {errors.dataSource && (
              <p className="text-sm text-destructive">
                {errors.dataSource.message}
              </p>
            )}
          </div>

          {/* Verification */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="verified"
              checked={watch("verified")}
              onCheckedChange={(checked) => setValue("verified", !!checked)}
            />
            <Label htmlFor="verified" className="text-sm">
              This data has been verified by a third party
            </Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Metric
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
