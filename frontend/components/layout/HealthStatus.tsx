"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { useHealthContext } from "@/contexts/HealthContext";
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";

interface HealthStatusProps {
  className?: string;
}

export function HealthStatus({ className }: HealthStatusProps) {
  const { healthData, loading, error, refetch } = useHealthContext();

  const getStatusIcon = () => {
    if (loading) {
      return <RefreshCw className="h-3 w-3 animate-spin" />;
    }

    if (healthData?.status === "healthy") {
      return <CheckCircle className="h-3 w-3" />;
    }

    if (error || healthData?.status === "unhealthy") {
      return <XCircle className="h-3 w-3" />;
    }

    return <AlertCircle className="h-3 w-3" />;
  };

  const getStatusColor = () => {
    if (healthData?.status === "healthy") {
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    }

    if (error || healthData?.status === "unhealthy") {
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    }

    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
  };

  const getStatusText = () => {
    if (loading) return "Checking...";
    if (healthData?.status === "healthy") return "Healthy";
    if (error || healthData?.status === "unhealthy") return "Unhealthy";
    return "Unknown";
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className={className}>
          <Badge className={`${getStatusColor()} flex items-center gap-1`}>
            {getStatusIcon()}
            <span className="text-xs">{getStatusText()}</span>
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">System Health</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={refetch}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>

          {healthData && (
            <div className="space-y-3">
              {/* Overall Status */}
              <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <span className="text-sm">Overall Status</span>
                <Badge className={getStatusColor()}>{healthData.status}</Badge>
              </div>

              {/* Service Status */}
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Services</h5>
                {Object.entries(healthData.services || {}).map(
                  ([service, status]) => (
                    <div
                      key={service}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="capitalize">{service}</span>
                      <Badge
                        className={
                          status === "healthy"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                        }
                      >
                        {status as string}
                      </Badge>
                    </div>
                  )
                )}
              </div>

              {/* Stats */}
              {healthData.details?.stats && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Statistics</h5>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">RFQs:</span>
                      <span className="ml-1 font-medium">
                        {healthData.details.stats.rfq_count}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Bids:</span>
                      <span className="ml-1 font-medium">
                        {healthData.details.stats.bid_count}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Users:</span>
                      <span className="ml-1 font-medium">
                        {healthData.details.stats.user_count}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Uptime:</span>
                      <span className="ml-1 font-medium">
                        {Math.floor(healthData.uptime / 60)}m
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Details */}
              {error && (
                <div className="p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded">
                  <p className="text-xs text-red-800 dark:text-red-200">
                    {error}
                  </p>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
