import { useState, useEffect, useRef } from "react";

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

interface ConnectionStats {
  damlConnected: boolean;
  backendConnected: boolean;
  lastCheck: Date;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

// Global state for health data to prevent duplicate requests
let globalHealthData: HealthData | null = null;
let globalHealthError: string | null = null;
let globalHealthLoading = false;
let lastHealthFetch = 0;
const healthSubscribers = new Set<() => void>();

// Debounce health checks to prevent excessive requests
const HEALTH_CACHE_DURATION = 10000; // 10 seconds
const HEALTH_REFRESH_INTERVAL = 60000; // 1 minute (reduced from 30 seconds)

async function fetchGlobalHealth() {
  const now = Date.now();

  // Return cached data if recent
  if (now - lastHealthFetch < HEALTH_CACHE_DURATION && globalHealthData) {
    return;
  }

  // Prevent duplicate concurrent requests
  if (globalHealthLoading) {
    return;
  }

  globalHealthLoading = true;
  globalHealthError = null;

  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const healthData = await response.json();
    globalHealthData = healthData;
    lastHealthFetch = now;
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Failed to fetch health data";
    globalHealthError = errorMessage;
    globalHealthData = null;
  } finally {
    globalHealthLoading = false;

    // Notify all subscribers
    healthSubscribers.forEach((callback) => callback());
  }
}

export function useHealth(autoRefresh = false) {
  const [data, setData] = useState<HealthData | null>(globalHealthData);
  const [loading, setLoading] = useState(globalHealthLoading);
  const [error, setError] = useState<string | null>(globalHealthError);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateState = () => {
    setData(globalHealthData);
    setLoading(globalHealthLoading);
    setError(globalHealthError);
  };

  useEffect(() => {
    // Subscribe to global health updates
    healthSubscribers.add(updateState);

    // Initial fetch if no recent data
    if (
      !globalHealthData ||
      Date.now() - lastHealthFetch > HEALTH_CACHE_DURATION
    ) {
      fetchGlobalHealth();
    }

    // Set up auto-refresh if requested (only one global interval)
    if (autoRefresh && !intervalRef.current) {
      intervalRef.current = setInterval(
        fetchGlobalHealth,
        HEALTH_REFRESH_INTERVAL
      );
    }

    return () => {
      healthSubscribers.delete(updateState);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoRefresh]);

  const refetch = async () => {
    await fetchGlobalHealth();
  };

  return { data, loading, error, refetch };
}

export function useConnectionStats() {
  const [stats, setStats] = useState<ConnectionStats>({
    damlConnected: false,
    backendConnected: false,
    lastCheck: new Date(),
  });
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkConnections = async () => {
    // Use global health data if available and recent
    if (
      globalHealthData &&
      Date.now() - lastHealthFetch < HEALTH_CACHE_DURATION
    ) {
      setStats({
        damlConnected: globalHealthData.services?.daml === "healthy",
        backendConnected: globalHealthData.status === "healthy",
        lastCheck: new Date(lastHealthFetch),
      });
      return;
    }

    setLoading(true);

    try {
      // Trigger global health fetch
      await fetchGlobalHealth();

      setStats({
        damlConnected: globalHealthData?.services?.daml === "healthy" || false,
        backendConnected: globalHealthData?.status === "healthy" || false,
        lastCheck: new Date(),
      });
    } catch (error) {
      setStats({
        damlConnected: false,
        backendConnected: false,
        lastCheck: new Date(),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnections();

    // Reduced frequency and use global health data
    intervalRef.current = setInterval(
      checkConnections,
      HEALTH_REFRESH_INTERVAL
    );

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { stats, loading, refetch: checkConnections };
}
