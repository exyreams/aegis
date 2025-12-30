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
    // Only redirect if we're certain there's no user (not loading and no user)
    if (!auth.loading && !auth.user && !auth.session) {
      router.push("/auth");
    }
  }, [auth.loading, auth.user, auth.session, router]);

  // Show loading only if we're still checking auth AND don't have a session
  if (auth.loading && !auth.session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ProtectedRoutesLoader />
      </div>
    );
  }

  // If we have a session but no user profile yet, show the protected content
  // (profile will load in background)
  if (auth.session) {
    return <>{children}</>;
  }

  // Redirect to login if not authenticated
  if (!auth.loading && !auth.user && !auth.session) {
    return null;
  }

  return <>{children}</>;
}
