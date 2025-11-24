"use client";

import { useState, useEffect } from "react";
import { authApi } from "@/lib/api";
import type { UserData } from "@/types/api";
import { toast } from "sonner";

export function useLenders() {
  const [lenders, setLenders] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLenders = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.listUsers();
      if (response.data) {
        // Filter for lenders only
        const lenderUsers = response.data.filter(
          (user) => user.role === "lender"
        );
        setLenders(lenderUsers);
      } else {
        throw new Error(response.error || "Failed to fetch lenders");
      }
    } catch (err) {
      const errorMsg = authApi.handleError(err);
      setError(errorMsg);
      toast.error(`Failed to fetch lenders: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLenders();
  }, []);

  return {
    lenders,
    loading,
    error,
    refetch: fetchLenders,
  };
}
