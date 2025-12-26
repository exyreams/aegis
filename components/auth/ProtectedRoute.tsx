"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/Card";
import { ProtectedRoutesLoader } from "@/components/ui/Loader";
import type { UserRole } from "@/types/api";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
  requiredPermission?: {
    resource: string;
    action: string;
  };
}

export function ProtectedRoute({
  children,
  requiredRole,
  allowedRoles,
}: ProtectedRouteProps) {
  const { auth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.push("/auth");
    }
  }, [auth.isLoading, auth.isAuthenticated, router]);

  // Show loading while checking authentication
  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ProtectedRoutesLoader />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!auth.isAuthenticated) {
    return null;
  }

  // Check role permissions
  if (requiredRole && auth.user?.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h2 className="text-lg font-semibold text-red-600">
                Access Denied
              </h2>
              <p className="text-sm text-slate-600">
                You need {requiredRole} role to access this page.
              </p>
              <p className="text-xs text-slate-500">
                Your current role: {auth.user?.role}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (
    allowedRoles &&
    auth.user?.role &&
    !allowedRoles.includes(auth.user.role)
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h2 className="text-lg font-semibold text-red-600">
                Access Denied
              </h2>
              <p className="text-sm text-slate-600">
                You need one of these roles: {allowedRoles.join(", ")}
              </p>
              <p className="text-xs text-slate-500">
                Your current role: {auth.user?.role}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
