"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import {
  Users,
  UserPlus,
  DollarSign,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { aegisApi, authApi } from "@/lib/api";
import type { AssetType } from "@/lib/api/aegis";
import {
  RegisterLenderModal,
  FundLenderModal,
  ReimburseLenderModal,
} from "@/components/admin/lenders";

export default function LendersPage() {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [fundModalOpen, setFundModalOpen] = useState(false);
  const [reimburseModalOpen, setReimburseModalOpen] = useState(false);

  // Fetch platform
  const {
    data: platform,
    isLoading: platformLoading,
    refetch: refetchPlatform,
  } = useQuery({
    queryKey: ["aegis-platform"],
    queryFn: async () => {
      const result = await aegisApi.getPlatform();
      if (result.error) throw new Error(result.error);
      return result.data;
    },
  });

  // Fetch lenders
  const {
    data: lenders = [],
    isLoading: lendersLoading,
    refetch: refetchLenders,
  } = useQuery({
    queryKey: ["lenders"],
    queryFn: async () => {
      const result = await authApi.listLenders();
      if (result.error) throw new Error(result.error);
      return result.data || [];
    },
  });

  // Fetch asset balances
  const {
    data: balances = [],
    isLoading: balancesLoading,
    refetch: refetchBalances,
  } = useQuery({
    queryKey: ["asset-balances"],
    queryFn: async () => {
      const result = await aegisApi.getAssetBalances();
      if (result.error) throw new Error(result.error);
      return result.data || [];
    },
  });

  const handleRefresh = async () => {
    await Promise.all([refetchPlatform(), refetchLenders(), refetchBalances()]);
    toast.success("Data refreshed");
  };

  const handleSuccess = () => {
    refetchPlatform();
    refetchLenders();
    refetchBalances();
  };

  const activeLendersCount = platform?.activeLenders?.length || 0;
  const registeredLendersCount = lenders.length;
  const lenderBalances = balances.filter((b) =>
    lenders.some((l) => l.damlParty === b.owner)
  );

  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Users className="h-8 w-8" />
                Lender Management
              </h1>
              <p className="text-muted-foreground">
                Register lenders and manage funding operations
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={platformLoading || lendersLoading || balancesLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${
                    platformLoading || lendersLoading || balancesLoading
                      ? "animate-spin"
                      : ""
                  }`}
                />
                Refresh
              </Button>
            </div>
          </div>

          {!platform && !platformLoading && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Platform not initialized. Please create a platform first.
              </AlertDescription>
            </Alert>
          )}

          {/* Statistics */}
          <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
            <Card className="@container/card">
              <CardHeader>
                <CardDescription>Active Lenders</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {activeLendersCount}
                </CardTitle>
                <CardAction>
                  <Badge variant="outline">
                    <Users className="h-4 w-4" />
                    Platform
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  Platform lenders
                </div>
                <div className="text-muted-foreground">
                  On platform contract
                </div>
              </CardFooter>
            </Card>

            <Card className="@container/card">
              <CardHeader>
                <CardDescription>Registered Users</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {registeredLendersCount}
                </CardTitle>
                <CardAction>
                  <Badge variant="outline">
                    <UserPlus className="h-4 w-4" />
                    Users
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  User accounts
                </div>
                <div className="text-muted-foreground">With lender role</div>
              </CardFooter>
            </Card>

            <Card className="@container/card">
              <CardHeader>
                <CardDescription>Asset Balances</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {lenderBalances.length}
                </CardTitle>
                <CardAction>
                  <Badge variant="outline">
                    <Wallet className="h-4 w-4" />
                    Records
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  Balance records
                </div>
                <div className="text-muted-foreground">
                  Asset balance records
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Lender Operations</CardTitle>
              <CardDescription>
                Manage lender registration and funding operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  className="w-full"
                  disabled={!platform}
                  onClick={() => setRegisterModalOpen(true)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Register Lender
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  disabled={!platform}
                  onClick={() => setFundModalOpen(true)}
                >
                  <ArrowUpCircle className="h-4 w-4 mr-2" />
                  Fund Lender
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  disabled={!platform}
                  onClick={() => setReimburseModalOpen(true)}
                >
                  <ArrowDownCircle className="h-4 w-4 mr-2" />
                  Reimburse Lender
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lender Balances */}
          <Card>
            <CardHeader>
              <CardTitle>Lender Asset Balances</CardTitle>
              <CardDescription>
                View and monitor asset balances for all registered lenders
              </CardDescription>
            </CardHeader>
            <CardContent>
              {balancesLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Loading balances...
                  </p>
                </div>
              ) : lenderBalances.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Wallet className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium mb-1">
                    No lender balances found
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Register lenders to see their asset balances here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lenderBalances.map((balance, index) => {
                    const lender = lenders.find(
                      (l) => l.damlParty === balance.owner
                    );
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground mb-1">
                            {lender?.name || balance.owner}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {balance.assetType.tag}
                            </Badge>
                            <span className="text-sm text-muted-foreground font-mono">
                              {balance.assetType.value}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold tabular-nums mb-1">
                            {balance.totalBalance}
                          </div>
                          <div className="flex gap-3 text-xs text-muted-foreground">
                            <span>
                              Available:{" "}
                              <span className="font-medium text-foreground">
                                {balance.availableBalance}
                              </span>
                            </span>
                            <span>
                              Locked:{" "}
                              <span className="font-medium text-foreground">
                                {balance.lockedBalance}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modals */}
        {platform && (
          <>
            <RegisterLenderModal
              open={registerModalOpen}
              onOpenChange={setRegisterModalOpen}
              platform={platform}
              onSuccess={handleSuccess}
            />
            <FundLenderModal
              open={fundModalOpen}
              onOpenChange={setFundModalOpen}
              platform={platform}
              onSuccess={handleSuccess}
            />
            <ReimburseLenderModal
              open={reimburseModalOpen}
              onOpenChange={setReimburseModalOpen}
              platform={platform}
              onSuccess={handleSuccess}
            />
          </>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
