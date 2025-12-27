"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/Card";
import { ProtectedRoutesLoader } from "@/components/ui/Loader";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { auth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.loading && !auth.user) {
      router.push("/auth");
    }
  }, [auth.loading, auth.user, router]);

  // Show loading while checking authentication
  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ProtectedRoutesLoader />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!auth.user) {
    return null;
  }

  return <>{children}</>;
}
