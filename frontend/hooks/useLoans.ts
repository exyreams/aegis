import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";

interface LoanData {
  contractId: string;
  id: string;
  title: string;
  borrower: string;
  lender: string;
  loanAmount: number;
  interestRate: number;
  repaidAmount: number;
  remainingAmount: number;
  startDate: string;
  dueDate: string;
  status: "active" | "completed" | "defaulted" | "overdue";
  collateralAsset: string;
  collateralAmount: number;
  monthlyPayment: number;
  nextPaymentDate: string;
}

interface LoanStats {
  activeLoans: number;
  totalBorrowed: number;
  totalRepaid: number;
  averageInterestRate: number;
  loansDueSoon: number;
}

interface LoanResponse {
  data: LoanData[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

if (!API_BASE_URL) {
  throw new Error(
    "NEXT_PUBLIC_BACKEND_API_URL environment variable is required"
  );
}

export function useLoans(filters?: { status?: string; lender?: string }) {
  const [data, setData] = useState<LoanData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false,
  });
  const { auth } = useAuth();

  const fetchLoans = async () => {
    if (!auth.token) {
      setError("No authentication token available");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // For now, we'll fetch from RFQs and simulate loan data
      // In a real implementation, you'd have a dedicated loans endpoint
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.lender) params.append("lender", filters.lender);

      const response = await fetch(`${API_BASE_URL}/api/rfqs?${params}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // Transform completed RFQs into loan data
      const loans: LoanData[] = result.data
        .filter((rfq: any) => rfq.status === "completed")
        .map((rfq: any, index: number) => {
          const loanAmount = rfq.loanAmount;
          const repaidAmount = Math.floor(
            loanAmount * (0.2 + Math.random() * 0.6)
          ); // 20-80% repaid
          const interestRate = 4 + Math.random() * 4; // 4-8% interest
          const monthsElapsed = Math.floor(Math.random() * 12) + 1;
          const startDate = new Date(
            Date.now() - monthsElapsed * 30 * 24 * 60 * 60 * 1000
          );
          const dueDate = new Date(
            startDate.getTime() + 24 * 30 * 24 * 60 * 60 * 1000
          ); // 24 months loan

          return {
            contractId: rfq.contractId,
            id: `LOAN-${rfq.contractId.slice(-8)}`,
            title: rfq.title,
            borrower: rfq.borrower,
            lender: rfq.approvedLenders[0] || "Unknown Lender",
            loanAmount,
            interestRate,
            repaidAmount,
            remainingAmount: loanAmount - repaidAmount,
            startDate: startDate.toISOString(),
            dueDate: dueDate.toISOString(),
            status: repaidAmount >= loanAmount ? "completed" : "active",
            collateralAsset: rfq.collateralAsset,
            collateralAmount: rfq.collateralAmount,
            monthlyPayment: Math.floor(
              (loanAmount / 24) * (1 + interestRate / 100)
            ),
            nextPaymentDate: new Date(
              Date.now() + 15 * 24 * 60 * 60 * 1000
            ).toISOString(),
          };
        });

      setData(loans);
      setPagination({
        total: loans.length,
        limit: 50,
        offset: 0,
        hasMore: false,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch loans";
      setError(errorMessage);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.token) {
      fetchLoans();
    }
  }, [auth.token, filters?.status, filters?.lender]);

  return { data, loading, error, pagination, refetch: fetchLoans };
}

export function useLoanStats() {
  const [stats, setStats] = useState<LoanStats>({
    activeLoans: 0,
    totalBorrowed: 0,
    totalRepaid: 0,
    averageInterestRate: 0,
    loansDueSoon: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { auth } = useAuth();

  const fetchStats = async () => {
    if (!auth.token) {
      setError("No authentication token available");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/rfqs`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const completedRFQs = result.data.filter(
        (rfq: any) => rfq.status === "completed"
      );

      // Calculate stats from completed RFQs (simulating loans)
      const activeLoans = completedRFQs.length;
      const totalBorrowed = completedRFQs.reduce(
        (sum: number, rfq: any) => sum + rfq.loanAmount,
        0
      );
      const totalRepaid = Math.floor(totalBorrowed * 0.4); // Simulate 40% average repayment
      const averageInterestRate = 5.2; // Simulated average
      const loansDueSoon = Math.floor(activeLoans * 0.25); // 25% due soon

      setStats({
        activeLoans,
        totalBorrowed,
        totalRepaid,
        averageInterestRate,
        loansDueSoon,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch loan stats";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.token) {
      fetchStats();
    }
  }, [auth.token]);

  return { stats, loading, error, refetch: fetchStats };
}
