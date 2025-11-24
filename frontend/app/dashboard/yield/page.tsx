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
import { Plus, Coins, Award, AlertTriangle } from "lucide-react";
import { yieldApi } from "@/lib/api";
import type { LiquidityPool, StakingRewards } from "@/types/api";

export default function YieldPage() {
  const [pools, setPools] = useState<LiquidityPool[]>([]);
  const [stakingRewards, setStakingRewards] = useState<StakingRewards[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("pools");

  // Form states
  const [showCreatePool, setShowCreatePool] = useState(false);
  const [showCreateStaking, setShowCreateStaking] = useState(false);
  const [poolForm, setPoolForm] = useState({
    poolId: "",
    manager: "",
    strategy: "",
    initialLiquidity: "",
  });
  const [stakingForm, setStakingForm] = useState({
    rewardId: "",
    participant: "",
    poolId: "",
    stakedAmount: "",
    rewardRate: "",
    stakingPeriod: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setError(null);

    try {
      const [poolsRes, stakingRes] = await Promise.all([
        yieldApi.getLiquidityPools(),
        yieldApi.getStakingRewards(),
      ]);

      if (poolsRes.error) throw new Error(poolsRes.error);
      if (stakingRes.error) throw new Error(stakingRes.error);

      setPools(poolsRes.data || []);
      setStakingRewards(stakingRes.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load yield data"
      );
    }
  };

  const handleCreatePool = async () => {
    try {
      const response = await yieldApi.createLiquidityPool(poolForm);

      if (response.error) {
        throw new Error(response.error);
      }

      setShowCreatePool(false);
      setPoolForm({
        poolId: "",
        manager: "",
        strategy: "",
        initialLiquidity: "",
      });
      loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create liquidity pool"
      );
    }
  };

  const handleCreateStaking = async () => {
    try {
      const response = await yieldApi.createStakingReward(stakingForm);

      if (response.error) {
        throw new Error(response.error);
      }

      setShowCreateStaking(false);
      setStakingForm({
        rewardId: "",
        participant: "",
        poolId: "",
        stakedAmount: "",
        rewardRate: "",
        stakingPeriod: "",
      });
      loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create staking reward"
      );
    }
  };

  const getPerformanceColor = (returnValue: string) => {
    const value = parseFloat(returnValue);
    if (value >= 10) return "text-green-600";
    if (value >= 5) return "text-blue-600";
    if (value >= 0) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "staking":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "claimed":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Yield Generation
              </h1>
              <p className="text-muted-foreground">
                Manage liquidity pools, staking rewards, and yield optimization
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
              <TabsTrigger value="pools">Liquidity Pools</TabsTrigger>
              <TabsTrigger value="staking">Staking Rewards</TabsTrigger>
            </TabsList>

            <TabsContent value="pools" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Liquidity Pools</h2>
                <Button onClick={() => setShowCreatePool(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Pool
                </Button>
              </div>

              {showCreatePool && (
                <Card>
                  <CardHeader>
                    <CardTitle>Create Liquidity Pool</CardTitle>
                    <CardDescription>
                      Create a new liquidity pool for yield generation
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
                        <Label htmlFor="manager">Manager</Label>
                        <Input
                          id="manager"
                          value={poolForm.manager}
                          onChange={(e) =>
                            setPoolForm({
                              ...poolForm,
                              manager: e.target.value,
                            })
                          }
                          placeholder="Enter manager party"
                        />
                      </div>
                      <div>
                        <Label htmlFor="strategy">Strategy</Label>
                        <Input
                          id="strategy"
                          value={poolForm.strategy}
                          onChange={(e) =>
                            setPoolForm({
                              ...poolForm,
                              strategy: e.target.value,
                            })
                          }
                          placeholder="e.g., Conservative, Aggressive, Balanced"
                        />
                      </div>
                      <div>
                        <Label htmlFor="initialLiquidity">
                          Initial Liquidity
                        </Label>
                        <Input
                          id="initialLiquidity"
                          value={poolForm.initialLiquidity}
                          onChange={(e) =>
                            setPoolForm({
                              ...poolForm,
                              initialLiquidity: e.target.value,
                            })
                          }
                          placeholder="Enter initial liquidity amount"
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
                          <Coins className="h-5 w-5" />
                          {pool.poolId}
                        </CardTitle>
                        <Badge className="bg-blue-100 text-blue-800">
                          {pool.strategy}
                        </Badge>
                      </div>
                      <CardDescription>
                        Managed by: {pool.manager}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium">Total Liquidity</p>
                          <p className="text-2xl font-bold">
                            ${pool.totalLiquidity}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Available</p>
                          <p className="text-lg text-green-600">
                            ${pool.availableLiquidity}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Deployed</p>
                          <p className="text-lg text-blue-600">
                            ${pool.deployedLiquidity}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Current Yield</p>
                          <p
                            className={`text-lg font-semibold ${getPerformanceColor(
                              pool.currentYield
                            )}`}
                          >
                            {pool.currentYield}%
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium">Total Return</p>
                          <p
                            className={`text-lg ${getPerformanceColor(
                              pool.performanceMetrics.totalReturn
                            )}`}
                          >
                            {pool.performanceMetrics.totalReturn}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Annualized Return
                          </p>
                          <p
                            className={`text-lg ${getPerformanceColor(
                              pool.performanceMetrics.annualizedReturn
                            )}`}
                          >
                            {pool.performanceMetrics.annualizedReturn}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Sharpe Ratio</p>
                          <p className="text-lg">
                            {pool.performanceMetrics.sharpeRatio}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">
                          Participants ({pool.participants.length})
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                          {pool.participants
                            .slice(0, 6)
                            .map((participant, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center p-2 bg-blue-50 rounded text-sm"
                              >
                                <span className="font-medium truncate">
                                  {participant.party}
                                </span>
                                <span>${participant.contribution}</span>
                              </div>
                            ))}
                          {pool.participants.length > 6 && (
                            <div className="text-sm text-muted-foreground p-2">
                              +{pool.participants.length - 6} more participants
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {pools.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Coins className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No liquidity pools found
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="staking" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Staking Rewards</h2>
                <Button onClick={() => setShowCreateStaking(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Staking
                </Button>
              </div>

              {showCreateStaking && (
                <Card>
                  <CardHeader>
                    <CardTitle>Create Staking Reward</CardTitle>
                    <CardDescription>
                      Set up a new staking reward program
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="rewardId">Reward ID</Label>
                        <Input
                          id="rewardId"
                          value={stakingForm.rewardId}
                          onChange={(e) =>
                            setStakingForm({
                              ...stakingForm,
                              rewardId: e.target.value,
                            })
                          }
                          placeholder="Enter reward ID"
                        />
                      </div>
                      <div>
                        <Label htmlFor="participant">Participant</Label>
                        <Input
                          id="participant"
                          value={stakingForm.participant}
                          onChange={(e) =>
                            setStakingForm({
                              ...stakingForm,
                              participant: e.target.value,
                            })
                          }
                          placeholder="Enter participant party"
                        />
                      </div>
                      <div>
                        <Label htmlFor="poolId">Pool ID</Label>
                        <Input
                          id="poolId"
                          value={stakingForm.poolId}
                          onChange={(e) =>
                            setStakingForm({
                              ...stakingForm,
                              poolId: e.target.value,
                            })
                          }
                          placeholder="Enter pool ID"
                        />
                      </div>
                      <div>
                        <Label htmlFor="stakedAmount">Staked Amount</Label>
                        <Input
                          id="stakedAmount"
                          value={stakingForm.stakedAmount}
                          onChange={(e) =>
                            setStakingForm({
                              ...stakingForm,
                              stakedAmount: e.target.value,
                            })
                          }
                          placeholder="Enter staked amount"
                        />
                      </div>
                      <div>
                        <Label htmlFor="rewardRate">Reward Rate (%)</Label>
                        <Input
                          id="rewardRate"
                          type="number"
                          step="0.01"
                          value={stakingForm.rewardRate}
                          onChange={(e) =>
                            setStakingForm({
                              ...stakingForm,
                              rewardRate: e.target.value,
                            })
                          }
                          placeholder="e.g., 8.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="stakingPeriod">
                          Staking Period (days)
                        </Label>
                        <Input
                          id="stakingPeriod"
                          value={stakingForm.stakingPeriod}
                          onChange={(e) =>
                            setStakingForm({
                              ...stakingForm,
                              stakingPeriod: e.target.value,
                            })
                          }
                          placeholder="e.g., 30, 90, 365"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCreateStaking}>
                        Create Staking
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowCreateStaking(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4">
                {stakingRewards.map((reward) => (
                  <Card key={reward.rewardId}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Award className="h-5 w-5" />
                          {reward.rewardId}
                        </CardTitle>
                        <Badge className={getStatusColor(reward.status)}>
                          {reward.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        Participant: {reward.participant} | Pool:{" "}
                        {reward.poolId}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium">Staked Amount</p>
                          <p className="text-2xl font-bold">
                            ${reward.stakedAmount}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Reward Rate</p>
                          <p className="text-lg text-green-600">
                            {reward.rewardRate}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Accrued Rewards</p>
                          <p className="text-lg font-semibold text-blue-600">
                            ${reward.accruedRewards}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Staking Period</p>
                          <p className="text-lg">{reward.stakingPeriod} days</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Last Claim Date</p>
                          <p>
                            {reward.lastClaimDate
                              ? new Date(
                                  reward.lastClaimDate
                                ).toLocaleDateString()
                              : "Never"}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Status</p>
                          <p className="capitalize">{reward.status}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {stakingRewards.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No staking rewards found
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
