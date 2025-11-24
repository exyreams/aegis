import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import type { UserRole } from "@/types/api";

interface DashboardStats {
  totalRFQs: number;
  activeRFQs: number;
  activeLoans: number;
  totalValue: number;
  successRate: number;
  monthlyGrowth: {
    rfqs: number;
    loans: number;
    value: number;
  };
}

interface ActivityItem {
  id: string;
  type:
    | "bid_received"
    | "rfq_created"
    | "loan_payment"
    | "loan_created"
    | "bid_accepted";
  title: string;
  description: string;
  timestamp: string;
  relativeTime: string;
  status: "success" | "info" | "warning" | "error";
}

interface DashboardData {
  stats: DashboardStats;
  recentActivity: ActivityItem[];
  userRole: UserRole;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export function useDashboard() {
  const [data, setData] = useState<DashboardData>({
    stats: {
      totalRFQs: 0,
      activeRFQs: 0,
      activeLoans: 0,
      totalValue: 0,
      successRate: 0,
      monthlyGrowth: { rfqs: 0, loans: 0, value: 0 },
    },
    recentActivity: [],
    userRole: "borrower",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { auth } = useAuth();

  const fetchDashboardData = async () => {
    if (!auth.token) {
      setError("No authentication token available");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch RFQ data
      const rfqResponse = await fetch(`${API_BASE_URL}/api/rfqs`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
        },
      });

      // Fetch health data for additional stats
      const healthResponse = await fetch(`${API_BASE_URL}/health`);

      let rfqData = { data: [] };
      let healthData = null;

      if (rfqResponse.ok) {
        rfqData = await rfqResponse.json();
      }

      if (healthResponse.ok) {
        healthData = await healthResponse.json();
      }

      // Process RFQ data
      const rfqs = rfqData.data || [];
      const totalRFQs = rfqs.length;
      const activeRFQs = rfqs.filter(
        (rfq: any) => rfq.status === "active"
      ).length;
      const completedRFQs = rfqs.filter(
        (rfq: any) => rfq.status === "completed"
      ).length;
      const totalValue = rfqs.reduce(
        (sum: number, rfq: any) => sum + (rfq.loanAmount || 0),
        0
      );
      const successRate =
        totalRFQs > 0 ? Math.round((completedRFQs / totalRFQs) * 100) : 0;

      // Generate recent activity from RFQ data
      const recentActivity: ActivityItem[] = [];

      // Add RFQ-based activities
      rfqs.slice(0, 5).forEach((rfq: any, index: number) => {
        const hoursAgo = index * 2 + 1;
        const timestamp = new Date(
          Date.now() - hoursAgo * 60 * 60 * 1000
        ).toISOString();

        if (rfq.status === "active") {
          recentActivity.push({
            id: `rfq-${rfq.contractId}`,
            type: "rfq_created",
            title: "RFQ created",
            description: `${rfq.title} - ${formatCurrency(rfq.loanAmount)}`,
            timestamp,
            relativeTime: `${hoursAgo}h ago`,
            status: "info",
          });
        } else if (rfq.status === "completed") {
          recentActivity.push({
            id: `loan-${rfq.contractId}`,
            type: "loan_created",
            title: "Loan activated",
            description: `${rfq.title} - ${formatCurrency(rfq.loanAmount)}`,
            timestamp,
            relativeTime: `${hoursAgo}h ago`,
            status: "success",
          });
        }
      });

      // Add some synthetic activity for demonstration
      if (recentActivity.length < 3) {
        const syntheticActivities = [
          {
            id: "bid-1",
            type: "bid_received" as const,
            title: "New bid received",
            description: "Corporate Bond Financing - 5.2% interest rate",
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            relativeTime: "30m ago",
            status: "success" as const,
          },
          {
            id: "payment-1",
            type: "loan_payment" as const,
            title: "Payment received",
            description: "Monthly payment of $12,500",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            relativeTime: "2h ago",
            status: "success" as const,
          },
        ];
        recentActivity.push(...syntheticActivities);
      }

      // Sort by timestamp (most recent first)
      recentActivity.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setData({
        stats: {
          totalRFQs,
          activeRFQs,
          activeLoans: Math.floor(completedRFQs * 0.8), // Estimate active loans
          totalValue,
          successRate,
          monthlyGrowth: {
            rfqs: Math.floor(Math.random() * 5) + 1, // Mock growth data
            loans: Math.floor(Math.random() * 3) + 1,
            value: Math.floor(Math.random() * 15) + 5,
          },
        },
        recentActivity: recentActivity.slice(0, 6),
        userRole: auth.user?.role || "borrower",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch dashboard data";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.token) {
      fetchDashboardData();
    }
  }, [auth.token]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return { data, loading, error, refetch: fetchDashboardData, formatCurrency };
}
