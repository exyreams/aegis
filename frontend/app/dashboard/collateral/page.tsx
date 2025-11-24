"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Plus, Shield, AlertTriangle, TrendingDown } from "lucide-react";
import { collateralApi } from "@/lib/api";
import type { CollateralPool, CollateralLiquidation } from "@/types/api";

export default function CollateralPage() {
  const [pools, setPools] = useState<CollateralPool[]>([]);
  const [liquidations, setLiquidations] = useState<CollateralLiquidation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("pools");

  // Form states
  const [showCreatePool, setShowCreatePool] = useState(false);
  const [poolForm, setPoolForm] = useState({
    poolId: "",
    borrower: "",
    lender: "",
    loanId: "",
    requiredRatio: "1.5",
    assetType: "",
    amount: "",
    valuation: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setError(null);

    try {
      const [poolsRes, liquidationsRes] = await Promise.all([
        collateralApi.getCollateralPools(),
        collateralApi.getCollateralLiquidations(),
      ]);

      if (poolsRes.error) throw new Error(poolsRes.error);
      if (liquidationsRes.error) throw new Error(liquidationsRes.error);

      setPools(poolsRes.data || []);
      setLiquidations(liquidationsRes.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load collateral data"
      );
    }
  };

  const handleCreatePool = async () => {
    try {
      const response = await collateralApi.createCollateralPool({
        poolId: poolForm.poolId,
        borrower: poolForm.borrower,
        lender: poolForm.lender,
        loanId: poolForm.loanId,
        collateralAssets: [
          {
            assetType: poolForm.assetType,
            amount: poolForm.amount,
            valuation: poolForm.valuation,
          },
        ],
        requiredRatio: poolForm.requiredRatio,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      setShowCreatePool(false);
      setPoolForm({
        poolId: "",
        borrower: "",
        lender: "",
        loanId: "",
        requiredRatio: "1.5",
        assetType: "",
        amount: "",
        valuation: "",
      });
      loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create collateral pool"
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "margin_call":
        return "bg-yellow-100 text-yellow-800";
      case "liquidating":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRatioColor = (currentRatio: string, requiredRatio: string) => {
    const current = parseFloat(currentRatio);
    const required = parseFloat(requiredRatio);

    if (current >= required * 1.2) return "text-green-600";
    if (current >= required) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Collateral Management
              </h1>
              <p className="text-muted-foreground">
                Manage collateral pools, monitor ratios, and handle liquidations
              </p>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pools">Collateral Pools</TabsTrigger>
              <TabsTrigger value="liquidations">Liquidations</TabsTrigger>
            </TabsList>

            <TabsContent value="pools" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Collateral Pools</h2>
                <Button onClick={() => setShowCreatePool(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Pool
                </Button>
              </div>

              {showCreatePool && (
                <Card>
                  <CardHeader>
                    <CardTitle>Create Collateral Pool</CardTitle>
                    <CardDescription>
                      Create a new collateral pool for a loan
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="poolId">Pool ID</Label>
                        <Input
                          id="poolId"
                          value={poolForm.poolId}
                          onChange={(e) =>
                            setPoolForm({ ...poolForm, poolId: e.target.value })
                          }
                          placeholder="Enter pool ID"
                        />
                      </div>
                      <div>
                        <Label htmlFor="loanId">Loan ID</Label>
                        <Input
                          id="loanId"
                          value={poolForm.loanId}
                          onChange={(e) =>
                            setPoolForm({ ...poolForm, loanId: e.target.value })
                          }
                          placeholder="Enter loan ID"
                        />
                      </div>
                      <div>
                        <Label htmlFor="borrower">Borrower</Label>
                        <Input
                          id="borrower"
                          value={poolForm.borrower}
                          onChange={(e) =>
                            setPoolForm({
                              ...poolForm,
                              borrower: e.target.value,
                            })
                          }
                          placeholder="Enter borrower party"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lender">Lender</Label>
                        <Input
                          id="lender"
                          value={poolForm.lender}
                          onChange={(e) =>
                            setPoolForm({ ...poolForm, lender: e.target.value })
                          }
                          placeholder="Enter lender party"
                        />
                      </div>
                      <div>
                        <Label htmlFor="assetType">Asset Type</Label>
                        <Input
                          id="assetType"
                          value={poolForm.assetType}
                          onChange={(e) =>
                            setPoolForm({
                              ...poolForm,
                              assetType: e.target.value,
                            })
                          }
                          placeholder="e.g., BTC, ETH, USDC"
                        />
                      </div>
                      <div>
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                          id="amount"
                          value={poolForm.amount}
                          onChange={(e) =>
                            setPoolForm({ ...poolForm, amount: e.target.value })
                          }
                          placeholder="Enter amount"
                        />
                      </div>
                      <div>
                        <Label htmlFor="valuation">Valuation</Label>
                        <Input
                          id="valuation"
                          value={poolForm.valuation}
                          onChange={(e) =>
                            setPoolForm({
                              ...poolForm,
                              valuation: e.target.value,
                            })
                          }
                          placeholder="Enter valuation"
                        />
                      </div>
                      <div>
                        <Label htmlFor="requiredRatio">Required Ratio</Label>
                        <Input
                          id="requiredRatio"
                          type="number"
                          step="0.1"
                          min="1.0"
                          value={poolForm.requiredRatio}
                          onChange={(e) =>
                            setPoolForm({
                              ...poolForm,
                              requiredRatio: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCreatePool}>Create Pool</Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowCreatePool(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4">
                {pools.map((pool) => (
                  <Card key={pool.poolId}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          {pool.poolId}
                        </CardTitle>
                        <Badge className={getStatusColor(pool.status)}>
                          {pool.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        Loan: {pool.loanId} | {pool.borrower} → {pool.lender}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium">Total Valuation</p>
                          <p className="text-2xl font-bold">
                            ${pool.totalValuation}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Required Ratio</p>
                          <p className="text-lg">{pool.requiredRatio}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Current Ratio</p>
                          <p
                            className={`text-lg font-semibold ${getRatioColor(
                              pool.currentRatio,
                              pool.requiredRatio
                            )}`}
                          >
                            {pool.currentRatio}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Last Updated</p>
                          <p className="text-sm">
                            {new Date(
                              pool.lastValuationUpdate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">
                          Collateral Assets
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {pool.collateralAssets.map((asset, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center p-2 bg-gray-50 rounded"
                            >
                              <span className="font-medium">
                                {asset.assetType}
                              </span>
                              <span>
                                {asset.amount} (${asset.valuation})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {pools.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No collateral pools found
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="liquidations" className="space-y-4">
              <h2 className="text-xl font-semibold">Liquidations</h2>

              <div className="grid gap-4">
                {liquidations.map((liquidation) => (
                  <Card key={liquidation.liquidationId}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <TrendingDown className="h-5 w-5" />
                          {liquidation.liquidationId}
                        </CardTitle>
                        <Badge className={getStatusColor(liquidation.status)}>
                          {liquidation.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        Pool: {liquidation.poolId} | Reason:{" "}
                        {liquidation.triggerReason}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium">
                            Estimated Proceeds
                          </p>
                          <p className="text-lg font-semibold">
                            ${liquidation.estimatedProceeds}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Liquidation Costs
                          </p>
                          <p className="text-lg">
                            ${liquidation.liquidationCosts}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Net Proceeds</p>
                          <p className="text-lg font-semibold text-green-600">
                            $
                            {(
                              parseFloat(liquidation.estimatedProceeds) -
                              parseFloat(liquidation.liquidationCosts)
                            ).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Initiated At</p>
                          <p className="text-sm">
                            {new Date(
                              liquidation.initiatedAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">
                          Assets to Liquidate
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {liquidation.assetsToLiquidate.map((asset, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center p-2 bg-red-50 rounded"
                            >
                              <span className="font-medium">
                                {asset.assetType}
                              </span>
                              <span>{asset.amount}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {liquidations.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <TrendingDown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No liquidations found
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
