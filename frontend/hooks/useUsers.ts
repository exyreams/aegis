"use client";

import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import type { UserData as User } from "@/types/api";

export function useUsers() {
  const {
    data: users = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await authApi.listUsers();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data || [];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    users,
    loading,
    error: error?.message || null,
    refetch,
  };
}
