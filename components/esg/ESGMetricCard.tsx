"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
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
  Trash2,
  Eye,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

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
  onDelete?: (metric: ESGMetric) => void;
}

export function ESGMetricCard({
  metric,
  onEdit,
  onViewDetails,
  onDelete,
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
        return "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20";
      case "social":
        return "text-blue-600 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20";
      case "governance":
        return "text-purple-600 bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-500/10 border-gray-100 dark:border-gray-500/20";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-2.5 w-2.5 text-emerald-500" />;
      case "down": return <TrendingUp className="h-2.5 w-2.5 text-red-500 rotate-180" />;
      default: return <div className="h-1.5 w-1.5 bg-slate-400 rounded-full" />;
    }
  };

  const progressPercentage = Math.min(
    100,
    (metric.currentValue / metric.targetValue) * 100
  );

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-zinc-200/50 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/30 backdrop-blur-sm overflow-hidden h-full flex flex-col">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 truncate">
            <div className={cn(
              "p-2 rounded-lg shrink-0 transition-transform group-hover:scale-110 duration-300",
              getCategoryColor(metric.category)
            )}>
              {getCategoryIcon(metric.category)}
            </div>
            <div className="truncate">
              <CardTitle className="text-sm font-black tracking-tight text-slate-900 dark:text-slate-100 truncate">
                {metric.name}
              </CardTitle>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">
                  {metric.category}
                </span>
                {metric.verified && (
                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-black uppercase tracking-tighter bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                    <CheckCircle className="h-2.5 w-2.5" />
                    Verified
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 shrink-0">
                <MoreHorizontal className="h-4 w-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 rounded-xl p-1 shadow-2xl border-zinc-200/50 dark:border-zinc-800/50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl">
              <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 px-2 py-1.5">
                Metric Logic
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onViewDetails?.(metric)} className="rounded-lg cursor-pointer flex items-center gap-2 text-xs font-semibold py-2">
                <Eye className="h-3.5 w-3.5 text-blue-500" />
                Inspect Detail
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(metric)} className="rounded-lg cursor-pointer flex items-center gap-2 text-xs font-semibold py-2">
                <Edit className="h-3.5 w-3.5 text-emerald-500" />
                Modify Parameters
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete?.(metric)} className="rounded-lg cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-500/10 flex items-center gap-2 text-xs py-2 font-bold">
                <Trash2 className="h-3.5 w-3.5" />
                Archive Metric
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-1 space-y-4 flex-1">
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <div className="space-y-0.5">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Performance</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
                  {metric.currentValue}
                </span>
                <span className="text-xs font-bold text-slate-400">/ {metric.targetValue}</span>
                <span className="text-[10px] font-medium text-slate-500 lowercase">{metric.unit}</span>
              </div>
            </div>
            <div className={cn(
              "flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-md",
              metric.status === "achieved" ? "text-emerald-600 bg-emerald-500/10" : 
              metric.status === "at_risk" ? "text-amber-600 bg-amber-500/10" :
              "text-blue-600 bg-blue-500/10"
            )}>
              {metric.status.replace("_", " ")}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="text-slate-500">{Math.round(progressPercentage)}% reached</span>
              <span className="flex items-center gap-1 text-slate-400">
                {getTrendIcon(metric.trend)}
                <span className="uppercase tracking-tighter">{metric.trend}</span>
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-1000",
                  metric.status === "achieved" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                )}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium italic truncate max-w-[140px]">
            <Database className="h-3 w-3 shrink-0" />
            <span className="truncate">{metric.dataSource}</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onViewDetails?.(metric)}
              className="text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest hover:underline active:scale-95 transition-transform"
            >
              Analyze
            </button>
            <div className="h-3 w-px bg-slate-200 dark:bg-slate-700" />
            <button 
              onClick={() => onEdit?.(metric)}
              className="text-slate-900 dark:text-white font-black uppercase tracking-widest hover:opacity-70 active:scale-95 transition-transform"
            >
              Edit
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
