"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import {
  Leaf,
  Users,
  Shield,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Edit,
  MoreHorizontal,
} from "lucide-react";

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

interface ESGMetricCardProps {
  metric: ESGMetric;
  onEdit?: (metric: ESGMetric) => void;
  onViewDetails?: (metric: ESGMetric) => void;
}

export function ESGMetricCard({
  metric,
  onEdit,
  onViewDetails,
}: ESGMetricCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "environmental":
        return <Leaf className="h-4 w-4 text-green-600" />;
      case "social":
        return <Users className="h-4 w-4 text-blue-600" />;
      case "governance":
        return <Shield className="h-4 w-4 text-purple-600" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "environmental":
        return "text-green-600 bg-green-50 border-green-200";
      case "social":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "governance":
        return "text-purple-600 bg-purple-50 border-purple-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "achieved":
        return "bg-green-100 text-green-800";
      case "on_track":
        return "bg-blue-100 text-blue-800";
      case "at_risk":
        return "bg-yellow-100 text-yellow-800";
      case "behind":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "achieved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "on_track":
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case "at_risk":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "behind":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case "down":
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      case "stable":
        return <div className="h-3 w-3 bg-gray-400 rounded-full" />;
      default:
        return <div className="h-3 w-3 bg-gray-400 rounded-full" />;
    }
  };

  const progressPercentage = Math.min(
    100,
    (metric.currentValue / metric.targetValue) * 100
  );

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div
              className={`p-2 rounded-lg border ${getCategoryColor(
                metric.category
              )}`}
            >
              {getCategoryIcon(metric.category)}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{metric.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {metric.description}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  className={getStatusColor(metric.status)}
                  variant="secondary"
                >
                  {metric.status.replace("_", " ")}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {metric.category}
                </Badge>
                {metric.verified && (
                  <Badge variant="outline" className="text-green-600">
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onEdit?.(metric)}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              {getStatusIcon(metric.status)}
              Progress
            </span>
            <span className="font-medium">
              {metric.currentValue} / {metric.targetValue} {metric.unit}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{Math.round(progressPercentage)}% complete</span>
            <span className="flex items-center gap-1">
              {getTrendIcon(metric.trend)}
              {metric.trend}
            </span>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>Source: {metric.dataSource}</span>
          <span>
            Updated: {new Date(metric.lastUpdated).toLocaleDateString()}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onViewDetails?.(metric)}
          >
            View Details
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit?.(metric)}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
