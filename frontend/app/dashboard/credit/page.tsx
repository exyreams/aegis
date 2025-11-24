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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Plus, CreditCard, TrendingUp, AlertTriangle } from "lucide-react";
import { creditApi } from "@/lib/api";
import type { CreditProfile, CreditInquiry, RiskAssessment } from "@/types/api";

export default function CreditPage() {
  const [profiles, setProfiles] = useState<CreditProfile[]>([]);
  const [inquiries, setInquiries] = useState<CreditInquiry[]>([]);
  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("profiles");

  // Form states
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [showCreateInquiry, setShowCreateInquiry] = useState(false);
  const [profileForm, setProfileForm] = useState({
    party: "",
    profileId: "",
    creditScore: 700,
    riskRating: "B",
    privacyLevel: "RestrictedCredit",
  });
  const [inquiryForm, setInquiryForm] = useState({
    inquiryId: "",
    borrower: "",
    lender: "",
    purpose: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setError(null);

    try {
      const [profilesRes, inquiriesRes, assessmentsRes] = await Promise.all([
        creditApi.getCreditProfiles(),
        creditApi.getCreditInquiries(),
        creditApi.getRiskAssessments(),
      ]);

      if (profilesRes.error) throw new Error(profilesRes.error);
      if (inquiriesRes.error) throw new Error(inquiriesRes.error);
      if (assessmentsRes.error) throw new Error(assessmentsRes.error);

      setProfiles(profilesRes.data || []);
      setInquiries(inquiriesRes.data || []);
      setAssessments(assessmentsRes.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load credit data"
      );
    }
  };

  const handleCreateProfile = async () => {
    try {
      const response = await creditApi.createCreditProfile({
        ...profileForm,
        totalBorrowed: "0.0",
        totalRepaid: "0.0",
        currentOutstanding: "0.0",
        numberOfLoans: 0,
        numberOfDefaults: 0,
        numberOfLatePayments: 0,
        averageRepaymentTime: "0.0",
        longestDelayDays: 0,
        defaultHistory: [],
        lastUpdated: new Date().toISOString(),
      });

      if (response.error) {
        throw new Error(response.error);
      }

      setShowCreateProfile(false);
      setProfileForm({
        party: "",
        profileId: "",
        creditScore: 700,
        riskRating: "B",
        privacyLevel: "RestrictedCredit",
      });
      loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create credit profile"
      );
    }
  };

  const handleCreateInquiry = async () => {
    try {
      const response = await creditApi.createCreditInquiry(inquiryForm);

      if (response.error) {
        throw new Error(response.error);
      }

      setShowCreateInquiry(false);
      setInquiryForm({
        inquiryId: "",
        borrower: "",
        lender: "",
        purpose: "",
      });
      loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create credit inquiry"
      );
    }
  };

  const getRiskColor = (rating: string) => {
    switch (rating) {
      case "AAA":
      case "AA":
      case "A":
        return "bg-green-100 text-green-800";
      case "BBB":
      case "BB":
      case "B":
        return "bg-yellow-100 text-yellow-800";
      case "CCC":
      case "CC":
      case "C":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Credit Management
              </h1>
              <p className="text-muted-foreground">
                Manage credit profiles, inquiries, and risk assessments
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profiles">Credit Profiles</TabsTrigger>
              <TabsTrigger value="inquiries">Credit Inquiries</TabsTrigger>
              <TabsTrigger value="assessments">Risk Assessments</TabsTrigger>
            </TabsList>

            <TabsContent value="profiles" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Credit Profiles</h2>
                <Button onClick={() => setShowCreateProfile(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Profile
                </Button>
              </div>

              {showCreateProfile && (
                <Card>
                  <CardHeader>
                    <CardTitle>Create Credit Profile</CardTitle>
                    <CardDescription>
                      Create a new credit profile for a party
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="party">Party</Label>
                        <Input
                          id="party"
                          value={profileForm.party}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              party: e.target.value,
                            })
                          }
                          placeholder="Enter party identifier"
                        />
                      </div>
                      <div>
                        <Label htmlFor="profileId">Profile ID</Label>
                        <Input
                          id="profileId"
                          value={profileForm.profileId}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              profileId: e.target.value,
                            })
                          }
                          placeholder="Enter profile ID"
                        />
                      </div>
                      <div>
                        <Label htmlFor="creditScore">Credit Score</Label>
                        <Input
                          id="creditScore"
                          type="number"
                          min="300"
                          max="850"
                          value={profileForm.creditScore}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              creditScore: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="riskRating">Risk Rating</Label>
                        <Select
                          value={profileForm.riskRating}
                          onValueChange={(value) =>
                            setProfileForm({
                              ...profileForm,
                              riskRating: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AAA">AAA</SelectItem>
                            <SelectItem value="AA">AA</SelectItem>
                            <SelectItem value="A">A</SelectItem>
                            <SelectItem value="BBB">BBB</SelectItem>
                            <SelectItem value="BB">BB</SelectItem>
                            <SelectItem value="B">B</SelectItem>
                            <SelectItem value="CCC">CCC</SelectItem>
                            <SelectItem value="CC">CC</SelectItem>
                            <SelectItem value="C">C</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCreateProfile}>
                        Create Profile
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowCreateProfile(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4">
                {profiles.map((profile) => (
                  <Card key={profile.profileId}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5" />
                          {profile.profileId}
                        </CardTitle>
                        <Badge className={getRiskColor(profile.riskRating)}>
                          {profile.riskRating}
                        </Badge>
                      </div>
                      <CardDescription>Party: {profile.party}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm font-medium">Credit Score</p>
                          <p className="text-2xl font-bold">
                            {profile.creditScore}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Total Borrowed</p>
                          <p className="text-lg">{profile.totalBorrowed}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Total Repaid</p>
                          <p className="text-lg">{profile.totalRepaid}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Outstanding</p>
                          <p className="text-lg">
                            {profile.currentOutstanding}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Number of Loans</p>
                          <p className="text-lg">{profile.numberOfLoans}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Defaults</p>
                          <p className="text-lg">{profile.numberOfDefaults}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Late Payments</p>
                          <p className="text-lg">
                            {profile.numberOfLatePayments}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Privacy Level</p>
                          <p className="text-lg">{profile.privacyLevel}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {profiles.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No credit profiles found
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="inquiries" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Credit Inquiries</h2>
                <Button onClick={() => setShowCreateInquiry(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Inquiry
                </Button>
              </div>

              {showCreateInquiry && (
                <Card>
                  <CardHeader>
                    <CardTitle>Create Credit Inquiry</CardTitle>
                    <CardDescription>
                      Request credit information from a borrower
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="inquiryId">Inquiry ID</Label>
                        <Input
                          id="inquiryId"
                          value={inquiryForm.inquiryId}
                          onChange={(e) =>
                            setInquiryForm({
                              ...inquiryForm,
                              inquiryId: e.target.value,
                            })
                          }
                          placeholder="Enter inquiry ID"
                        />
                      </div>
                      <div>
                        <Label htmlFor="borrower">Borrower</Label>
                        <Input
                          id="borrower"
                          value={inquiryForm.borrower}
                          onChange={(e) =>
                            setInquiryForm({
                              ...inquiryForm,
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
                          value={inquiryForm.lender}
                          onChange={(e) =>
                            setInquiryForm({
                              ...inquiryForm,
                              lender: e.target.value,
                            })
                          }
                          placeholder="Enter lender party"
                        />
                      </div>
                      <div>
                        <Label htmlFor="purpose">Purpose</Label>
                        <Input
                          id="purpose"
                          value={inquiryForm.purpose}
                          onChange={(e) =>
                            setInquiryForm({
                              ...inquiryForm,
                              purpose: e.target.value,
                            })
                          }
                          placeholder="Enter inquiry purpose"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCreateInquiry}>
                        Create Inquiry
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowCreateInquiry(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4">
                {inquiries.map((inquiry) => (
                  <Card key={inquiry.inquiryId}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{inquiry.inquiryId}</CardTitle>
                        <Badge
                          variant={
                            inquiry.status === "InquiryApproved"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {inquiry.status}
                        </Badge>
                      </div>
                      <CardDescription>{inquiry.purpose}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Borrower</p>
                          <p>{inquiry.borrower}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Lender</p>
                          <p>{inquiry.lender}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Requested At</p>
                          <p>
                            {new Date(inquiry.requestedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {inquiries.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No credit inquiries found
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="assessments" className="space-y-4">
              <h2 className="text-xl font-semibold">Risk Assessments</h2>

              <div className="grid gap-4">
                {assessments.map((assessment) => (
                  <Card key={assessment.assessmentId}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{assessment.assessmentId}</CardTitle>
                        <Badge className={getRiskColor(assessment.riskRating)}>
                          {assessment.riskRating}
                        </Badge>
                      </div>
                      <CardDescription>
                        Assessment for {assessment.borrower} by{" "}
                        {assessment.lender}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm font-medium">Credit Score</p>
                          <p className="text-lg font-semibold">
                            {assessment.creditScore}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Recommended Rate
                          </p>
                          <p className="text-lg">
                            {assessment.recommendedInterestRate}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Max Loan Amount</p>
                          <p className="text-lg">{assessment.maxLoanAmount}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Assessed At</p>
                          <p className="text-sm">
                            {new Date(
                              assessment.assessedAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm font-medium">
                          Assessment Details
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {assessment.assessmentDetails}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {assessments.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No risk assessments found
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
