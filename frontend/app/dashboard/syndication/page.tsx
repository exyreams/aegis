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
import { Plus, Users, Building, AlertTriangle } from "lucide-react";
import { syndicationApi } from "@/lib/api";
import type { SyndicatedLoan, SyndicateFormation } from "@/types/api";

export default function SyndicationPage() {
  const [loans, setLoans] = useState<SyndicatedLoan[]>([]);
  const [formations, setFormations] = useState<SyndicateFormation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("loans");

  // Form states
  const [showCreateLoan, setShowCreateLoan] = useState(false);
  const [showCreateFormation, setShowCreateFormation] = useState(false);
  const [loanForm, setLoanForm] = useState({
    loanId: "",
    borrower: "",
    leadLender: "",
    totalAmount: "",
    interestRate: "",
    arrangementFee: "",
    participationFee: "",
    terms: "",
  });
  const [formationForm, setFormationForm] = useState({
    formationId: "",
    leadLender: "",
    borrower: "",
    loanAmount: "",
    targetParticipants: 3,
    minimumCommitment: "",
    arrangementFee: "",
    participationFee: "",
    deadline: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setError(null);

    try {
      const [loansRes, formationsRes] = await Promise.all([
        syndicationApi.getSyndicatedLoans(),
        syndicationApi.getSyndicateFormations(),
      ]);

      if (loansRes.error) throw new Error(loansRes.error);
      if (formationsRes.error) throw new Error(formationsRes.error);

      setLoans(loansRes.data || []);
      setFormations(formationsRes.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load syndication data"
      );
    }
  };

  const handleCreateLoan = async () => {
    try {
      const response = await syndicationApi.createSyndicatedLoan(loanForm);

      if (response.error) {
        throw new Error(response.error);
      }

      setShowCreateLoan(false);
      setLoanForm({
        loanId: "",
        borrower: "",
        leadLender: "",
        totalAmount: "",
        interestRate: "",
        arrangementFee: "",
        participationFee: "",
        terms: "",
      });
      loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create syndicated loan"
      );
    }
  };

  const handleCreateFormation = async () => {
    try {
      const response = await syndicationApi.createSyndicateFormation({
        ...formationForm,
        deadline: new Date(formationForm.deadline).toISOString(),
      });

      if (response.error) {
        throw new Error(response.error);
      }

      setShowCreateFormation(false);
      setFormationForm({
        formationId: "",
        leadLender: "",
        borrower: "",
        loanAmount: "",
        targetParticipants: 3,
        minimumCommitment: "",
        arrangementFee: "",
        participationFee: "",
        deadline: "",
      });
      loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create syndicate formation"
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "forming":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
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
                Syndication Management
              </h1>
              <p className="text-muted-foreground">
                Manage syndicated loans and formation processes
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
              <TabsTrigger value="loans">Syndicated Loans</TabsTrigger>
              <TabsTrigger value="formations">Syndicate Formations</TabsTrigger>
            </TabsList>

            <TabsContent value="loans" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Syndicated Loans</h2>
                <Button onClick={() => setShowCreateLoan(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Loan
                </Button>
              </div>

              {showCreateLoan && (
                <Card>
                  <CardHeader>
                    <CardTitle>Create Syndicated Loan</CardTitle>
                    <CardDescription>
                      Create a new syndicated loan with multiple participants
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="loanId">Loan ID</Label>
                        <Input
                          id="loanId"
                          value={loanForm.loanId}
                          onChange={(e) =>
                            setLoanForm({ ...loanForm, loanId: e.target.value })
                          }
                          placeholder="Enter loan ID"
                        />
                      </div>
                      <div>
                        <Label htmlFor="borrower">Borrower</Label>
                        <Input
                          id="borrower"
                          value={loanForm.borrower}
                          onChange={(e) =>
                            setLoanForm({
                              ...loanForm,
                              borrower: e.target.value,
                            })
                          }
                          placeholder="Enter borrower party"
                        />
                      </div>
                      <div>
                        <Label htmlFor="leadLender">Lead Lender</Label>
                        <Input
                          id="leadLender"
                          value={loanForm.leadLender}
                          onChange={(e) =>
                            setLoanForm({
                              ...loanForm,
                              leadLender: e.target.value,
                            })
                          }
                          placeholder="Enter lead lender party"
                        />
                      </div>
                      <div>
                        <Label htmlFor="totalAmount">Total Amount</Label>
                        <Input
                          id="totalAmount"
                          value={loanForm.totalAmount}
                          onChange={(e) =>
                            setLoanForm({
                              ...loanForm,
                              totalAmount: e.target.value,
                            })
                          }
                          placeholder="Enter total amount"
                        />
                      </div>
                      <div>
                        <Label htmlFor="interestRate">Interest Rate (%)</Label>
                        <Input
                          id="interestRate"
                          type="number"
                          step="0.01"
                          value={loanForm.interestRate}
                          onChange={(e) =>
                            setLoanForm({
                              ...loanForm,
                              interestRate: e.target.value,
                            })
                          }
                          placeholder="e.g., 5.25"
                        />
                      </div>
                      <div>
                        <Label htmlFor="arrangementFee">Arrangement Fee</Label>
                        <Input
                          id="arrangementFee"
                          value={loanForm.arrangementFee}
                          onChange={(e) =>
                            setLoanForm({
                              ...loanForm,
                              arrangementFee: e.target.value,
                            })
                          }
                          placeholder="Enter arrangement fee"
                        />
                      </div>
                      <div>
                        <Label htmlFor="participationFee">
                          Participation Fee
                        </Label>
                        <Input
                          id="participationFee"
                          value={loanForm.participationFee}
                          onChange={(e) =>
                            setLoanForm({
                              ...loanForm,
                              participationFee: e.target.value,
                            })
                          }
                          placeholder="Enter participation fee"
                        />
                      </div>
                      <div>
                        <Label htmlFor="terms">Terms</Label>
                        <Input
                          id="terms"
                          value={loanForm.terms}
                          onChange={(e) =>
                            setLoanForm({ ...loanForm, terms: e.target.value })
                          }
                          placeholder="Enter loan terms"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCreateLoan}>Create Loan</Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowCreateLoan(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4">
                {loans.map((loan) => (
                  <Card key={loan.loanId}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Building className="h-5 w-5" />
                          {loan.loanId}
                        </CardTitle>
                        <Badge className={getStatusColor(loan.status)}>
                          {loan.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        {loan.borrower} ← {loan.leadLender} (Lead)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium">Total Amount</p>
                          <p className="text-2xl font-bold">
                            ${loan.totalAmount}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Interest Rate</p>
                          <p className="text-lg">{loan.interestRate}%</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Participants</p>
                          <p className="text-lg">{loan.participants.length}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Created</p>
                          <p className="text-sm">
                            {new Date(loan.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Participants</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {loan.participants.map((participant, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center p-2 bg-blue-50 rounded"
                            >
                              <span className="font-medium">
                                {participant.lender}
                              </span>
                              <span>
                                ${participant.commitment} ({participant.share}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Arrangement Fee</p>
                          <p>${loan.arrangementFee}</p>
                        </div>
                        <div>
                          <p className="font-medium">Participation Fee</p>
                          <p>${loan.participationFee}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {loans.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No syndicated loans found
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="formations" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Syndicate Formations</h2>
                <Button onClick={() => setShowCreateFormation(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Formation
                </Button>
              </div>

              {showCreateFormation && (
                <Card>
                  <CardHeader>
                    <CardTitle>Create Syndicate Formation</CardTitle>
                    <CardDescription>
                      Start forming a new syndicate for a loan
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="formationId">Formation ID</Label>
                        <Input
                          id="formationId"
                          value={formationForm.formationId}
                          onChange={(e) =>
                            setFormationForm({
                              ...formationForm,
                              formationId: e.target.value,
                            })
                          }
                          placeholder="Enter formation ID"
                        />
                      </div>
                      <div>
                        <Label htmlFor="leadLender">Lead Lender</Label>
                        <Input
                          id="leadLender"
                          value={formationForm.leadLender}
                          onChange={(e) =>
                            setFormationForm({
                              ...formationForm,
                              leadLender: e.target.value,
                            })
                          }
                          placeholder="Enter lead lender party"
                        />
                      </div>
                      <div>
                        <Label htmlFor="borrower">Borrower</Label>
                        <Input
                          id="borrower"
                          value={formationForm.borrower}
                          onChange={(e) =>
                            setFormationForm({
                              ...formationForm,
                              borrower: e.target.value,
                            })
                          }
                          placeholder="Enter borrower party"
                        />
                      </div>
                      <div>
                        <Label htmlFor="loanAmount">Loan Amount</Label>
                        <Input
                          id="loanAmount"
                          value={formationForm.loanAmount}
                          onChange={(e) =>
                            setFormationForm({
                              ...formationForm,
                              loanAmount: e.target.value,
                            })
                          }
                          placeholder="Enter loan amount"
                        />
                      </div>
                      <div>
                        <Label htmlFor="targetParticipants">
                          Target Participants
                        </Label>
                        <Input
                          id="targetParticipants"
                          type="number"
                          min="2"
                          value={formationForm.targetParticipants}
                          onChange={(e) =>
                            setFormationForm({
                              ...formationForm,
                              targetParticipants: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="minimumCommitment">
                          Minimum Commitment
                        </Label>
                        <Input
                          id="minimumCommitment"
                          value={formationForm.minimumCommitment}
                          onChange={(e) =>
                            setFormationForm({
                              ...formationForm,
                              minimumCommitment: e.target.value,
                            })
                          }
                          placeholder="Enter minimum commitment"
                        />
                      </div>
                      <div>
                        <Label htmlFor="deadline">Deadline</Label>
                        <Input
                          id="deadline"
                          type="datetime-local"
                          value={formationForm.deadline}
                          onChange={(e) =>
                            setFormationForm({
                              ...formationForm,
                              deadline: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCreateFormation}>
                        Create Formation
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowCreateFormation(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4">
                {formations.map((formation) => (
                  <Card key={formation.formationId}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          {formation.formationId}
                        </CardTitle>
                        <Badge className={getStatusColor(formation.status)}>
                          {formation.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        {formation.borrower} ← {formation.leadLender} (Lead)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium">Loan Amount</p>
                          <p className="text-2xl font-bold">
                            ${formation.loanAmount}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Target Participants
                          </p>
                          <p className="text-lg">
                            {formation.targetParticipants}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Current Commitments
                          </p>
                          <p className="text-lg">
                            {formation.commitments.length}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Deadline</p>
                          <p className="text-sm">
                            {new Date(formation.deadline).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {formation.commitments.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">
                            Commitments
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {formation.commitments.map((commitment, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center p-2 bg-green-50 rounded"
                              >
                                <span className="font-medium">
                                  {commitment.lender}
                                </span>
                                <span>${commitment.amount}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {formations.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No syndicate formations found
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
