"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { useConnectionStats } from "@/hooks/useApi";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Wifi,
  Database,
} from "lucide-react";

export function ConnectionStatus() {
  const { stats, loading, refetch } = useConnectionStats();

  const getOverallStatus = () => {
    if (loading) return "checking";
    if (stats.damlConnected && stats.backendConnected) return "connected";
    if (!stats.backendConnected) return "disconnected";
    return "partial";
  };

  const getStatusIcon = () => {
    const status = getOverallStatus();

    if (loading) {
      return <RefreshCw className="h-3 w-3 animate-spin" />;
    }

    switch (status) {
      case "connected":
        return <CheckCircle className="h-3 w-3" />;
      case "disconnected":
        return <XCircle className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  const getStatusColor = () => {
    const status = getOverallStatus();

    switch (status) {
      case "connected":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "disconnected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    }
  };

  const getStatusText = () => {
    const status = getOverallStatus();

    switch (status) {
      case "connected":
        return "Connected";
      case "disconnected":
        return "Offline";
      case "partial":
        return "Partial";
      default:
        return "Checking";
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          <Badge className={`${getStatusColor()} flex items-center gap-1`}>
            {getStatusIcon()}
            <span className="text-xs">{getStatusText()}</span>
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Connection Status</h4>
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

          <div className="space-y-3">
            {/* Backend Connection */}
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                <span className="text-sm">Backend API</span>
              </div>
              <Badge
                className={
                  stats.backendConnected
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                }
              >
                {stats.backendConnected ? "Connected" : "Disconnected"}
              </Badge>
            </div>

            {/* DAML Connection */}
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span className="text-sm">DAML Ledger</span>
              </div>
              <Badge
                className={
                  stats.damlConnected
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                }
              >
                {stats.damlConnected ? "Connected" : "Disconnected"}
              </Badge>
            </div>

            <div className="text-xs text-muted-foreground">
              Last checked: {stats.lastCheck.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
