"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

interface Trade {
  id: string;
  loanId: string;
  borrower: string;
  tradeType: "buy" | "sell";
  amount: number;
  price: number;
  status: "pending" | "executed" | "cancelled" | "failed";
  timestamp: string;
  counterparty?: string;
  yieldToMaturity: number;
  dueDiligenceScore: number;
}

interface Position {
  id: string;
  loanId: string;
  borrower: string;
  originalAmount: number;
  currentAmount: number;
  purchasePrice: number;
  currentValue: number;
  yieldToMaturity: number;
  maturityDate: string;
  creditRating: string;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
}

export function TradingDashboard() {
  const [activeTab, setActiveTab] = useState<
    "positions" | "orders" | "history"
  >("positions");
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    null
  );
  const [sellAmount, setSellAmount] = useState("");
  const [sellPrice, setSellPrice] = useState("");

  // Mock trading data
  const positions: Position[] = [
    {
      id: "1",
      loanId: "LOAN001",
      borrower: "TechCorp Industries",
      originalAmount: 42000000,
      currentAmount: 42000000,
      purchasePrice: 41500000,
      currentValue: 42800000,
      yieldToMaturity: 8.2,
      maturityDate: "2027-01-15",
      creditRating: "A-",
      unrealizedPnL: 1300000,
      unrealizedPnLPercent: 3.13,
    },
    {
      id: "2",
      loanId: "LOAN002",
      borrower: "Green Energy Solutions",
      originalAmount: 23500000,
      currentAmount: 23500000,
      purchasePrice: 23200000,
      currentValue: 23100000,
      yieldToMaturity: 7.8,
      maturityDate: "2026-06-30",
      creditRating: "BBB+",
      unrealizedPnL: -100000,
      unrealizedPnLPercent: -0.43,
    },
  ];

  const activeOrders: Trade[] = [
    {
      id: "1",
      loanId: "LOAN003",
      borrower: "Manufacturing Corp",
      tradeType: "buy",
      amount: 12800000,
      price: 12200000,
      status: "pending",
      timestamp: "2025-01-01T14:30:00Z",
      yieldToMaturity: 11.5,
      dueDiligenceScore: 74,
    },
  ];

  const tradeHistory: Trade[] = [
    {
      id: "1",
      loanId: "LOAN001",
      borrower: "TechCorp Industries",
      tradeType: "buy",
      amount: 42000000,
      price: 41500000,
      status: "executed",
      timestamp: "2024-12-15T10:00:00Z",
      counterparty: "First National Bank",
      yieldToMaturity: 8.2,
      dueDiligenceScore: 92,
    },
    {
      id: "2",
      loanId: "LOAN002",
      borrower: "Green Energy Solutions",
      tradeType: "buy",
      amount: 23500000,
      price: 23200000,
      status: "executed",
      timestamp: "2024-12-20T15:45:00Z",
      counterparty: "Sustainable Capital",
      yieldToMaturity: 7.8,
      dueDiligenceScore: 88,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "executed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "executed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? "+" : ""}${percent.toFixed(2)}%`;
  };

  const totalPortfolioValue = positions.reduce(
    (sum, pos) => sum + pos.currentValue,
    0
  );
  const totalUnrealizedPnL = positions.reduce(
    (sum, pos) => sum + pos.unrealizedPnL,
    0
  );
  const totalUnrealizedPnLPercent =
    totalPortfolioValue > 0
      ? (totalUnrealizedPnL / (totalPortfolioValue - totalUnrealizedPnL)) * 100
      : 0;

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Portfolio Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalPortfolioValue)}
            </div>
            <div
              className={`flex items-center text-sm ${
                totalUnrealizedPnL >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {totalUnrealizedPnL >= 0 ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              {formatPercent(totalUnrealizedPnLPercent)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Unrealized P&L
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                totalUnrealizedPnL >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(totalUnrealizedPnL)}
            </div>
            <div className="text-sm text-gray-600">
              {positions.length} active positions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOrders.length}</div>
            <div className="text-sm text-gray-600">
              {formatCurrency(
                activeOrders.reduce((sum, order) => sum + order.price, 0)
              )}{" "}
              pending
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Yield</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {positions.length > 0
                ? (
                    positions.reduce(
                      (sum, pos) => sum + pos.yieldToMaturity,
                      0
                    ) / positions.length
                  ).toFixed(1)
                : 0}
              %
            </div>
            <div className="text-sm text-gray-600">Weighted average</div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === "positions" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("positions")}
        >
          Positions ({positions.length})
        </Button>
        <Button
          variant={activeTab === "orders" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("orders")}
        >
          Orders ({activeOrders.length})
        </Button>
        <Button
          variant={activeTab === "history" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("history")}
        >
          History ({tradeHistory.length})
        </Button>
      </div>

      {/* Content based on active tab */}
      {activeTab === "positions" && (
        <Card>
          <CardHeader>
            <CardTitle>Current Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {positions.map((position) => (
                <div key={position.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{position.borrower}</h4>
                      <p className="text-sm text-gray-600">
                        {position.creditRating} • Matures{" "}
                        {new Date(position.maturityDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {position.yieldToMaturity.toFixed(1)}% Yield
                      </Badge>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPosition(position)}
                          >
                            Sell
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Sell Position - {position.borrower}
                            </DialogTitle>
                            <DialogDescription>
                              Create a sell order for your loan position
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="sell-amount">
                                Amount to Sell
                              </Label>
                              <Input
                                id="sell-amount"
                                placeholder="Enter amount"
                                value={sellAmount}
                                onChange={(e) => setSellAmount(e.target.value)}
                              />
                              <p className="text-sm text-gray-600 mt-1">
                                Available:{" "}
                                {formatCurrency(position.currentAmount)}
                              </p>
                            </div>
                            <div>
                              <Label htmlFor="sell-price">Asking Price</Label>
                              <Input
                                id="sell-price"
                                placeholder="Enter price"
                                value={sellPrice}
                                onChange={(e) => setSellPrice(e.target.value)}
                              />
                              <p className="text-sm text-gray-600 mt-1">
                                Current value:{" "}
                                {formatCurrency(position.currentValue)}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => {
                                  toast.success(
                                    "Sell order created successfully!"
                                  );
                                  setSellAmount("");
                                  setSellPrice("");
                                }}
                                className="flex-1"
                              >
                                Create Sell Order
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Position Size</div>
                      <div className="font-medium">
                        {formatCurrency(position.currentAmount)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Purchase Price</div>
                      <div className="font-medium">
                        {formatCurrency(position.purchasePrice)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Current Value</div>
                      <div className="font-medium">
                        {formatCurrency(position.currentValue)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Unrealized P&L</div>
                      <div
                        className={`font-medium ${
                          position.unrealizedPnL >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(position.unrealizedPnL)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Return</div>
                      <div
                        className={`font-medium ${
                          position.unrealizedPnLPercent >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatPercent(position.unrealizedPnLPercent)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "orders" && (
        <Card>
          <CardHeader>
            <CardTitle>Active Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{order.borrower}</h4>
                      <p className="text-sm text-gray-600">
                        {order.tradeType.toUpperCase()} order •{" "}
                        {new Date(order.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.toUpperCase()}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Cancel
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Amount</div>
                      <div className="font-medium">
                        {formatCurrency(order.amount)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Price</div>
                      <div className="font-medium">
                        {formatCurrency(order.price)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Expected Yield</div>
                      <div className="font-medium text-blue-600">
                        {order.yieldToMaturity.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">DD Score</div>
                      <div className="font-medium">
                        {order.dueDiligenceScore}/100
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {activeOrders.length === 0 && (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No active orders
                  </h3>
                  <p className="text-gray-600">
                    Your buy and sell orders will appear here.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "history" && (
        <Card>
          <CardHeader>
            <CardTitle>Trade History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tradeHistory.map((trade) => (
                <div key={trade.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{trade.borrower}</h4>
                      <p className="text-sm text-gray-600">
                        {trade.tradeType.toUpperCase()} •{" "}
                        {new Date(trade.timestamp).toLocaleString()}
                        {trade.counterparty && ` • with ${trade.counterparty}`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(trade.status)}
                      <Badge className={getStatusColor(trade.status)}>
                        {trade.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Amount</div>
                      <div className="font-medium">
                        {formatCurrency(trade.amount)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Price</div>
                      <div className="font-medium">
                        {formatCurrency(trade.price)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Yield</div>
                      <div className="font-medium text-blue-600">
                        {trade.yieldToMaturity.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">DD Score</div>
                      <div className="font-medium">
                        {trade.dueDiligenceScore}/100
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
