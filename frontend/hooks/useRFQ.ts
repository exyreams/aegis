import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { rfqApi } from "@/lib/api";

interface RFQData {
  contractId: string;
  id: string;
  title: string;
  borrower: string;
  loanAmount: number;
  collateralAmount: number;
  collateralAsset: string;
  loanDuration: unknown;
  approvedLenders: string[];
  createdAt: string;
  expiresAt: string;
  status: "active" | "expired" | "completed";
  collateralRatio: string;
  daysRemaining: number;
}

interface RFQStats {
  total: number;
  active: number;
  totalValue: number;
  successRate: number;
}

interface RFQResponse {
  data: RFQData[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  filters: {
    status: string;
    borrower: string;
    asset: string;
  };
}

export function useRFQs(filters?: {
  status?: string;
  borrower?: string;
  asset?: string;
}) {
  const { auth } = useAuth();

  const {
    data: response,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["rfqs", filters],
    queryFn: async () => {
      const result = await rfqApi.getRFQs(filters);
      if (result.status !== 200) {
        throw new Error(result.error || "Failed to fetch RFQs");
      }
      return {
        data: result.data || [],
        pagination: result.pagination || {
          total: 0,
          limit: 50,
          offset: 0,
          hasMore: false,
        },
        filters: result.filters || {},
      };
    },
    enabled: !!auth.isAuthenticated, // Only run query when authenticated
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    data: response?.data || [],
    loading,
    error: error?.message || null,
    pagination: response?.pagination || {
      total: 0,
      limit: 50,
      offset: 0,
      hasMore: false,
    },
    refetch,
  };
}

export function useRFQStats() {
  const { auth } = useAuth();

  const {
    data: stats = {
      total: 0,
      active: 0,
      totalValue: 0,
      successRate: 0,
    },
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["rfq-stats"],
    queryFn: async () => {
      const result = await rfqApi.getRFQs();
      if (result.status !== 200) {
        throw new Error(result.error || "Failed to fetch RFQ stats");
      }

      const rfqs = result.data || [];

      // Calculate stats from the data
      const total = rfqs.length;
      const active = rfqs.filter((rfq) => rfq.status === "active").length;
      const totalValue = rfqs.reduce((sum, rfq) => sum + rfq.loanAmount, 0);
      const completed = rfqs.filter((rfq) => rfq.status === "completed").length;
      const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        total,
        active,
        totalValue,
        successRate,
      };
    },
    enabled: !!auth.isAuthenticated, // Only run when authenticated
    staleTime: 1000 * 60 * 3, // 3 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  return { stats, loading, error: error?.message || null, refetch };
}

export function useCreateRFQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rfqData: {
      borrower: string;
      loanAmount: number;
      collateralAmount: number;
      collateralAsset: string;
      collateralCategory: string;
      loanDurationDays: number;
      approvedLenders: string[];
    }) => {
      const result = await rfqApi.createRFQ(rfqData);
      if (result.status !== 201) {
        throw new Error(result.error || "Failed to create RFQ");
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate and refetch RFQ queries
      queryClient.invalidateQueries({ queryKey: ["rfqs"] });
      queryClient.invalidateQueries({ queryKey: ["rfq-stats"] });
    },
  });
}

export function useSubmitBid() {
  const { auth } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      rfqContractId,
      bidData,
    }: {
      rfqContractId: string;
      bidData: {
        interestRate: number;
        paymentFrequency: string;
        additionalTerms: string;
      };
    }) => {
      if (!auth.user?.damlParty) {
        throw new Error("User not authenticated or missing DAML party");
      }

      // Add the lender information to the bid data
      const completeBidData = {
        lender: auth.user.damlParty,
        interestRate: bidData.interestRate,
        paymentFrequency: bidData.paymentFrequency,
        additionalTerms: bidData.additionalTerms,
      };

      const result = await rfqApi.submitBid(rfqContractId, completeBidData);
      if (result.status !== 201) {
        throw new Error(result.error || "Failed to submit bid");
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate RFQ queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["rfqs"] });
      queryClient.invalidateQueries({ queryKey: ["rfq-stats"] });
    },
  });
}

// Hook for fetching individual RFQ details
export function useRFQDetails(rfqId: string) {
  const { auth } = useAuth();

  return useQuery({
    queryKey: ["rfq", rfqId],
    queryFn: async () => {
      const result = await rfqApi.getRFQ(rfqId);
      if (result.status !== 200) {
        throw new Error(result.error || "Failed to fetch RFQ details");
      }
      return result.data;
    },
    enabled: !!auth.isAuthenticated && !!rfqId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook for fetching RFQ bids
export function useRFQBids(rfqId: string) {
  const { auth } = useAuth();

  return useQuery({
    queryKey: ["rfq-bids", rfqId],
    queryFn: async () => {
      const result = await rfqApi.getBids(rfqId);
      if (result.status !== 200) {
        throw new Error(result.error || "Failed to fetch RFQ bids");
      }
      return result.data;
    },
    enabled: !!auth.isAuthenticated && !!rfqId,
    staleTime: 1000 * 60 * 1, // 1 minute (bids change more frequently)
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}
