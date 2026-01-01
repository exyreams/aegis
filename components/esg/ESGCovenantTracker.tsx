"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
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
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  Plus,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

interface ESGCovenant {
  id: string;
  loanId: string;
  loanName: string;
  type: "environmental" | "social" | "governance";
  description: string;
  metric: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  testFrequency: "monthly" | "quarterly" | "annually";
  nextTestDate: string;
  status: "compliant" | "at_risk" | "breach" | "pending";
  penalty?: string;
  lastUpdated: string;
  trend: "improving" | "stable" | "declining";
}

interface LoanAgreement {
  id: string;
  borrower: string;
  amount: number;
  startDate: string;
  maturityDate: string;
  esgCovenants: number;
  status: "active" | "completed" | "defaulted";
}

export function ESGCovenantTracker() {
  const [selectedLoan, setSelectedLoan] = useState<string>("1");
  const [isAddCovenantOpen, setIsAddCovenantOpen] = useState(false);
  const [newCovenant, setNewCovenant] = useState({
    type: "environmental" as const,
    description: "",
    metric: "",
    targetValue: 0,
    unit: "",
    testFrequency: "quarterly" as const,
    penalty: "",
  });

  // Mock loan agreements
  const loanAgreements: LoanAgreement[] = [
    {
      id: "1",
      borrower: "GreenTech Industries",
      amount: 50000000,
      startDate: "2024-01-15",
      maturityDate: "2027-01-15",
      esgCovenants: 5,
      status: "active",
    },
    {
      id: "2",
      borrower: "Sustainable Energy Corp",
      amount: 75000000,
      startDate: "2024-06-01",
      maturityDate: "2029-06-01",
      esgCovenants: 7,
      status: "active",
    },
    {
      id: "3",
      borrower: "EcoSolutions Ltd",
      amount: 25000000,
      startDate: "2023-09-01",
      maturityDate: "2026-09-01",
      esgCovenants: 3,
      status: "active",
    },
  ];

  // Mock ESG covenants
  const [esgCovenants] = useState<ESGCovenant[]>([
    {
      id: "1",
      loanId: "1",
      loanName: "GreenTech Industries - $50M Term Loan",
      type: "environmental",
      description: "Maintain carbon emissions below specified threshold",
      metric: "Carbon Emissions",
      targetValue: 1000,
      currentValue: 850,
      unit: "tonnes CO2e",
      testFrequency: "quarterly",
      nextTestDate: "2025-03-31",
      status: "compliant",
      penalty: "0.25% rate increase if breached for 2 consecutive quarters",
      lastUpdated: "2024-12-15",
      trend: "improving",
    },
    {
      id: "2",
      loanId: "1",
      loanName: "GreenTech Industries - $50M Term Loan",
      type: "social",
      description: "Maintain minimum workforce diversity percentage",
      metric: "Workforce Diversity",
      targetValue: 40,
      currentValue: 35,
      unit: "%",
      testFrequency: "annually",
      nextTestDate: "2025-01-15",
      status: "at_risk",
      penalty: "Mandatory diversity training program funding",
      lastUpdated: "2024-12-10",
      trend: "stable",
    },
    {
      id: "3",
      loanId: "1",
      loanName: "GreenTech Industries - $50M Term Loan",
      type: "governance",
      description: "Maintain board independence ratio",
      metric: "Board Independence",
      targetValue: 50,
      currentValue: 60,
      unit: "%",
      testFrequency: "annually",
      nextTestDate: "2025-01-15",
      status: "compliant",
      lastUpdated: "2024-12-01",
      trend: "stable",
    },
    {
      id: "4",
      loanId: "2",
      loanName: "Sustainable Energy Corp - $75M Term Loan",
      type: "environmental",
      description: "Achieve renewable energy percentage target",
      metric: "Renewable Energy %",
      targetValue: 80,
      currentValue: 85,
      unit: "%",
      testFrequency: "quarterly",
      nextTestDate: "2025-03-31",
      status: "compliant",
      lastUpdated: "2024-12-20",
      trend: "improving",
    },
    {
      id: "5",
      loanId: "2",
      loanName: "Sustainable Energy Corp - $75M Term Loan",
      type: "environmental",
      description: "Reduce water consumption per unit of production",
      metric: "Water Intensity",
      targetValue: 2.5,
      currentValue: 3.2,
      unit: "m³/MWh",
      testFrequency: "quarterly",
      nextTestDate: "2025-03-31",
      status: "breach",
      penalty: "Mandatory water efficiency improvement plan",
      lastUpdated: "2024-12-18",
      trend: "declining",
    },
  ]);

  const currentLoan =
    loanAgreements.find((l) => l.id === selectedLoan) || loanAgreements[0];
  const loanCovenants = esgCovenants.filter((c) => c.loanId === selectedLoan);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "at_risk":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "breach":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "bg-green-100 text-green-800";
      case "at_risk":
        return "bg-yellow-100 text-yellow-800";
      case "breach":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "environmental":
        return "bg-green-100 text-green-800";
      case "social":
        return "bg-blue-100 text-blue-800";
      case "governance":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateProgress = (
    current: number,
    target: number,
    isReverse: boolean = false
  ) => {
    if (isReverse) {
      // For metrics where lower is better (e.g., emissions, water usage)
      return Math.max(
        0,
        Math.min(100, ((target - current) / target) * 100 + 100)
      );
    } else {
      // For metrics where higher is better (e.g., diversity, renewable energy)
      return Math.max(0, Math.min(100, (current / target) * 100));
    }
  };

  const handleAddCovenant = () => {
    if (!newCovenant.description || !newCovenant.metric) {
      toast.error("Please fill in all required fields");
      return;
    }

    toast.success("ESG covenant added successfully");
    setIsAddCovenantOpen(false);
    setNewCovenant({
      type: "environmental",
      description: "",
      metric: "",
      targetValue: 0,
      unit: "",
      testFrequency: "quarterly",
      penalty: "",
    });
  };

  const covenantStats = {
    total: loanCovenants.length,
    compliant: loanCovenants.filter((c) => c.status === "compliant").length,
    atRisk: loanCovenants.filter((c) => c.status === "at_risk").length,
    breach: loanCovenants.filter((c) => c.status === "breach").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">ESG Covenant Tracking</h3>
        <div className="flex space-x-2">
          <Select value={selectedLoan} onValueChange={setSelectedLoan}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {loanAgreements.map((loan) => (
                <SelectItem key={loan.id} value={loan.id}>
                  {loan.borrower} - ${(loan.amount / 1000000).toFixed(0)}M
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isAddCovenantOpen} onOpenChange={setIsAddCovenantOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Covenant
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add ESG Covenant</DialogTitle>
                <DialogDescription>
                  Define a new ESG covenant for this loan agreement
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="type">Covenant Type</Label>
                  <Select
                    value={newCovenant.type}
                    onValueChange={(
                      value: "environmental" | "social" | "governance"
                    ) => setNewCovenant({ ...newCovenant, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="environmental">
                        Environmental
                      </SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="governance">Governance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="e.g., Maintain carbon emissions below threshold"
                    value={newCovenant.description}
                    onChange={(e) =>
                      setNewCovenant({
                        ...newCovenant,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="metric">Metric</Label>
                  <Input
                    id="metric"
                    placeholder="e.g., Carbon Emissions"
                    value={newCovenant.metric}
                    onChange={(e) =>
                      setNewCovenant({ ...newCovenant, metric: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="target">Target Value</Label>
                    <Input
                      id="target"
                      type="number"
                      value={newCovenant.targetValue}
                      onChange={(e) =>
                        setNewCovenant({
                          ...newCovenant,
                          targetValue: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      placeholder="e.g., tonnes CO2e"
                      value={newCovenant.unit}
                      onChange={(e) =>
                        setNewCovenant({ ...newCovenant, unit: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="frequency">Test Frequency</Label>
                  <Select
                    value={newCovenant.testFrequency}
                    onValueChange={(
                      value: "monthly" | "quarterly" | "annually"
                    ) =>
                      setNewCovenant({ ...newCovenant, testFrequency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="penalty">Penalty/Remedy</Label>
                  <Input
                    id="penalty"
                    placeholder="e.g., 0.25% rate increase"
                    value={newCovenant.penalty}
                    onChange={(e) =>
                      setNewCovenant({
                        ...newCovenant,
                        penalty: e.target.value,
                      })
                    }
                  />
                </div>
                <Button onClick={handleAddCovenant} className="w-full">
                  Add Covenant
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Loan Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{currentLoan.borrower}</CardTitle>
              <p className="text-gray-600">
                ${(currentLoan.amount / 1000000).toFixed(0)}M •{" "}
                {currentLoan.startDate} to {currentLoan.maturityDate}
              </p>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {currentLoan.esgCovenants} ESG Covenants
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {covenantStats.total}
              </div>
              <div className="text-sm text-gray-600">Total Covenants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {covenantStats.compliant}
              </div>
              <div className="text-sm text-gray-600">Compliant</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {covenantStats.atRisk}
              </div>
              <div className="text-sm text-gray-600">At Risk</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {covenantStats.breach}
              </div>
              <div className="text-sm text-gray-600">In Breach</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Covenant Details */}
      <div className="space-y-4">
        {loanCovenants.map((covenant) => (
          <Card key={covenant.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge
                    className={getTypeColor(covenant.type)}
                    variant="secondary"
                  >
                    {covenant.type}
                  </Badge>
                  <h4 className="font-medium">{covenant.metric}</h4>
                </div>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(covenant.trend)}
                  <Badge className={getStatusColor(covenant.status)}>
                    {getStatusIcon(covenant.status)}
                    <span className="ml-1 capitalize">{covenant.status}</span>
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-700">{covenant.description}</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>
                      Current: {covenant.currentValue} {covenant.unit}
                    </span>
                    <span>
                      Target: {covenant.targetValue} {covenant.unit}
                    </span>
                  </div>
                  <Progress
                    value={calculateProgress(
                      covenant.currentValue,
                      covenant.targetValue,
                      covenant.metric.toLowerCase().includes("emission") ||
                        covenant.metric.toLowerCase().includes("water")
                    )}
                    className="h-2"
                  />
                </div>
                <div className="text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Test Frequency:</span>
                    <span className="capitalize">{covenant.testFrequency}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Next Test:</span>
                    <span>{covenant.nextTestDate}</span>
                  </div>
                </div>
              </div>

              {covenant.penalty && (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-yellow-800">
                        Penalty/Remedy
                      </div>
                      <div className="text-sm text-yellow-700">
                        {covenant.penalty}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Last updated: {covenant.lastUpdated}</span>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
