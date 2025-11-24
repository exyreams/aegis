"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface HealthData {
  status: "healthy" | "unhealthy";
  services: {
    daml: "healthy" | "unhealthy";
    database: "healthy" | "unhealthy";
    [key: string]: string;
  };
  uptime: number;
  details?: {
    stats: {
      rfq_count: number;
      bid_count: number;
      user_count: number;
    };
  };
}

interface HealthContextType {
  healthData: HealthData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export function HealthProvider({ children }: { children: React.ReactNode }) {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setHealthData(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch health data";
      setError(errorMessage);
      setHealthData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchHealth();

    // Set up polling - reduced to 2 minutes to minimize requests
    const interval = setInterval(fetchHealth, 120000);

    return () => clearInterval(interval);
  }, []);

  const value: HealthContextType = {
    healthData,
    loading,
    error,
    refetch: fetchHealth,
  };

  return (
    <HealthContext.Provider value={value}>{children}</HealthContext.Provider>
  );
}

export function useHealthContext() {
  const context = useContext(HealthContext);
  if (context === undefined) {
    throw new Error("useHealthContext must be used within a HealthProvider");
  }
  return context;
}
