import { useState, useEffect } from "react";
import { toast } from "sonner";

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

export interface ESGStats {
  totalMetrics: number;
  environmental: number;
  social: number;
  governance: number;
  onTrack: number;
  atRisk: number;
  behind: number;
  achieved: number;
  overallScore: number;
}

export function useESG() {
  const [metrics, setMetrics] = useState<ESGMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch ESG metrics
  const fetchMetrics = async (filters?: {
    category?: string;
    status?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.category) params.append("category", filters.category);
      if (filters?.status) params.append("status", filters.status);

      const response = await fetch(`/api/esg/metrics?${params.toString()}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch metrics");
      }

      setMetrics(data.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      toast.error(`Failed to fetch ESG metrics: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Add new ESG metric
  const addMetric = async (
    metricData: Omit<ESGMetric, "id" | "status" | "trend" | "lastUpdated">
  ) => {
    try {
      const response = await fetch("/api/esg/metrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metricData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to add metric");
      }

      setMetrics((prev) => [...prev, data.data]);
      toast.success("ESG metric added successfully!");
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to add metric: ${errorMessage}`);
      throw err;
    }
  };

  // Update ESG metric
  const updateMetric = async (id: string, updates: Partial<ESGMetric>) => {
    try {
      const response = await fetch("/api/esg/metrics", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, ...updates }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to update metric");
      }

      setMetrics((prev) =>
        prev.map((metric) => (metric.id === id ? data.data : metric))
      );
      toast.success("ESG metric updated successfully!");
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to update metric: ${errorMessage}`);
      throw err;
    }
  };

  // Delete ESG metric
  const deleteMetric = async (id: string) => {
    try {
      const response = await fetch(`/api/esg/metrics?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to delete metric");
      }

      setMetrics((prev) => prev.filter((metric) => metric.id !== id));
      toast.success("ESG metric deleted successfully!");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to delete metric: ${errorMessage}`);
      throw err;
    }
  };

  // Calculate ESG statistics
  const calculateStats = (): ESGStats => {
    const environmental = metrics.filter((m) => m.category === "environmental");
    const social = metrics.filter((m) => m.category === "social");
    const governance = metrics.filter((m) => m.category === "governance");

    const onTrack = metrics.filter((m) => m.status === "on_track");
    const atRisk = metrics.filter((m) => m.status === "at_risk");
    const behind = metrics.filter((m) => m.status === "behind");
    const achieved = metrics.filter((m) => m.status === "achieved");

    // Calculate overall score based on progress towards targets
    const overallScore =
      metrics.length > 0
        ? Math.round(
            metrics.reduce((sum, metric) => {
              const progress = Math.min(
                100,
                (metric.currentValue / metric.targetValue) * 100
              );
              return sum + progress;
            }, 0) / metrics.length
          )
        : 0;

    return {
      totalMetrics: metrics.length,
      environmental: environmental.length,
      social: social.length,
      governance: governance.length,
      onTrack: onTrack.length,
      atRisk: atRisk.length,
      behind: behind.length,
      achieved: achieved.length,
      overallScore,
    };
  };

  // Load metrics on mount
  useEffect(() => {
    fetchMetrics();
  }, []);

  return {
    metrics,
    loading,
    error,
    stats: calculateStats(),
    fetchMetrics,
    addMetric,
    updateMetric,
    deleteMetric,
    refetch: fetchMetrics,
  };
}
