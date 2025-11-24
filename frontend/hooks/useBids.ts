"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bidsApi } from "@/lib/api";
import { toast } from "sonner";

/**
 * Hook to get bids submitted by the current user (for lenders)
 */
export function useMyBids() {
  return useQuery({
    queryKey: ["bids", "my-bids"],
    queryFn: async () => {
      const response = await bidsApi.getMyBids();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data || [];
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Hook to get bids received on user's RFQs (for borrowers)
 */
export function useReceivedBids() {
  return useQuery({
    queryKey: ["bids", "received"],
    queryFn: async () => {
      const response = await bidsApi.getReceivedBids();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data || [];
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Hook to get bidding statistics for dashboard
 */
export function useBidStats() {
  return useQuery({
    queryKey: ["bids", "stats"],
    queryFn: async () => {
      const response = await bidsApi.getBidStats();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data || {};
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // Refetch every 5 minutes
  });
}

/**
 * Hook to get bids for a specific RFQ
 */
export function useRFQBids(rfqContractId: string | null) {
  return useQuery({
    queryKey: ["bids", "rfq", rfqContractId],
    queryFn: async () => {
      if (!rfqContractId) return [];

      const response = await bidsApi.getRFQBids(rfqContractId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data || [];
    },
    enabled: !!rfqContractId,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Hook to accept a bid (for borrowers)
 */
export function useAcceptBid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      rfqContractId,
      bidContractId,
    }: {
      rfqContractId: string;
      bidContractId: string;
    }) => {
      const response = await bidsApi.acceptBid(rfqContractId, bidContractId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      toast.success("Bid accepted successfully!");

      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ["bids"] });
      queryClient.invalidateQueries({ queryKey: ["rfqs"] });
      queryClient.invalidateQueries({ queryKey: ["loans"] });

      // Specifically invalidate the RFQ bids query
      queryClient.invalidateQueries({
        queryKey: ["bids", "rfq", variables.rfqContractId],
      });
    },
    onError: (error) => {
      toast.error(`Failed to accept bid: ${error.message}`);
    },
  });
}

/**
 * Hook to refresh all bid-related data
 */
export function useRefreshBids() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ["bids"] });
  };
}
