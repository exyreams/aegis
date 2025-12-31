"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Lightbulb,
  Plus,
  Check,
  X,
  Search,
  Filter,
  Sparkles,
  AlertTriangle,
  Shield,
  TrendingUp,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface ClauseSuggestion {
  id: string;
  title: string;
  category: "protection" | "flexibility" | "compliance" | "risk-mitigation";
  priority: "high" | "medium" | "low";
  description: string;
  clauseText: string;
  reasoning: string;
  applicableDocuments: string[];
  estimatedImpact: "positive" | "neutral" | "negative";
  legalComplexity: "simple" | "moderate" | "complex";
}

interface SmartClauseSuggestionsProps {
  documentType: string;
  documentContent: string;
  loanAmount?: number;
  interestRate?: number;
  onClauseAccepted?: (clause: ClauseSuggestion) => void;
  onClauseRejected?: (clause: ClauseSuggestion) => void;
}

export function SmartClauseSuggestions({
  documentType,
  documentContent,
  loanAmount,
  interestRate,
  onClauseAccepted,
  onClauseRejected,
}: SmartClauseSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<ClauseSuggestion[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<
    ClauseSuggestion[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Mock suggestions - in real implementation, these would come from AI analysis
  useEffect(() => {
    const mockSuggestions: ClauseSuggestion[] = [
      {
        id: "1",
        title: "Force Majeure Enhancement",
        category: "protection",
        priority: "high",
        description:
          "Enhanced force majeure clause covering modern risks including cyber attacks and pandemics",
        clauseText: `Force Majeure: Neither party shall be liable for any failure or delay in performance under this Agreement which is due to fire, flood, earthquake, elements of nature or acts of God, acts of war, terrorism, riots, civil disorders, rebellions or revolutions, cyber attacks, pandemics, or any other cause beyond the reasonable control of such party.`,
        reasoning:
          "Recent global events have shown the importance of comprehensive force majeure clauses that cover modern risks.",
        applicableDocuments: ["loan_agreement", "credit_agreement"],
        estimatedImpact: "positive",
        legalComplexity: "moderate",
      },
      {
        id: "2",
        title: "Interest Rate Cap Protection",
        category: "risk-mitigation",
        priority: "high",
        description:
          "Automatic interest rate cap to protect against excessive rate increases",
        clauseText: `Interest Rate Cap: Notwithstanding any other provision in this Agreement, the interest rate shall not exceed ${
          (interestRate || 5) + 2
        }% per annum under any circumstances, including default scenarios.`,
        reasoning:
          "Protects borrower from excessive interest rate penalties while maintaining lender's rights.",
        applicableDocuments: ["loan_agreement", "promissory_note"],
        estimatedImpact: "positive",
        legalComplexity: "simple",
      },
      {
        id: "3",
        title: "Green Financing Incentive",
        category: "flexibility",
        priority: "medium",
        description:
          "Interest rate reduction for meeting environmental sustainability targets",
        clauseText: `Sustainability Incentive: If Borrower achieves and maintains specified environmental sustainability metrics as defined in Schedule A, the interest rate shall be reduced by 0.25% per annum for the period such metrics are maintained.`,
        reasoning:
          "Encourages sustainable business practices while providing financial incentives.",
        applicableDocuments: ["loan_agreement", "credit_agreement"],
        estimatedImpact: "positive",
        legalComplexity: "moderate",
      },
      {
        id: "4",
        title: "Digital Signature Validation",
        category: "compliance",
        priority: "medium",
        description:
          "Explicit acceptance of digital signatures and electronic documents",
        clauseText: `Electronic Signatures: The parties agree that electronic signatures, digital signatures, and electronically transmitted documents shall have the same legal effect as original signatures and documents.`,
        reasoning:
          "Ensures legal validity of electronic execution in all jurisdictions.",
        applicableDocuments: [
          "loan_agreement",
          "security_agreement",
          "promissory_note",
        ],
        estimatedImpact: "neutral",
        legalComplexity: "simple",
      },
      {
        id: "5",
        title: "Prepayment Flexibility",
        category: "flexibility",
        priority: "low",
        description:
          "Partial prepayment rights without penalties after initial period",
        clauseText: `Prepayment Rights: After the first 12 months, Borrower may prepay all or any portion of the outstanding principal without penalty, provided that partial prepayments shall be in minimum amounts of $10,000.`,
        reasoning:
          "Provides borrower flexibility while protecting lender's initial investment period.",
        applicableDocuments: ["loan_agreement", "promissory_note"],
        estimatedImpact: "positive",
        legalComplexity: "simple",
      },
    ];

    setSuggestions(mockSuggestions);
    setFilteredSuggestions(mockSuggestions);
  }, [documentType, loanAmount, interestRate]);

  // Filter suggestions based on search and filters
  useEffect(() => {
    let filtered = suggestions;

    if (searchQuery) {
      filtered = filtered.filter(
        (suggestion) =>
          suggestion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          suggestion.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          suggestion.clauseText
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (suggestion) => suggestion.category === categoryFilter
      );
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(
        (suggestion) => suggestion.priority === priorityFilter
      );
    }

    setFilteredSuggestions(filtered);
  }, [suggestions, searchQuery, categoryFilter, priorityFilter]);

  const generateSuggestions = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to generate AI-powered suggestions
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success("Smart suggestions generated!");
    } catch (error) {
      toast.error("Failed to generate suggestions");
    } finally {
      setIsLoading(false);
    }
  };

  const acceptClause = (clause: ClauseSuggestion) => {
    onClauseAccepted?.(clause);
    toast.success(`"${clause.title}" clause accepted`);
  };

  const rejectClause = (clause: ClauseSuggestion) => {
    onClauseRejected?.(clause);
    toast.success(`"${clause.title}" clause rejected`);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "protection":
        return <Shield className="h-4 w-4" />;
      case "flexibility":
        return <TrendingUp className="h-4 w-4" />;
      case "compliance":
        return <Check className="h-4 w-4" />;
      case "risk-mitigation":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "protection":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "flexibility":
        return "text-green-600 bg-green-50 border-green-200";
      case "compliance":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "risk-mitigation":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "positive":
        return "text-green-600";
      case "negative":
        return "text-red-600";
      case "neutral":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Smart Clause Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              AI-powered suggestions to improve your document with modern
              clauses, risk mitigation, and compliance enhancements.
            </p>

            <Button
              onClick={generateSuggestions}
              disabled={isLoading}
              className="w-full"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isLoading
                ? "Generating Suggestions..."
                : "Generate AI Suggestions"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search suggestions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="protection">Protection</SelectItem>
                <SelectItem value="flexibility">Flexibility</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="risk-mitigation">Risk Mitigation</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full lg:w-36">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Suggestions ({filteredSuggestions.length})
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Updated 2 minutes ago</span>
          </div>
        </div>

        <AnimatePresence>
          {filteredSuggestions.map((suggestion) => (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg border ${getCategoryColor(
                          suggestion.category
                        )}`}
                      >
                        {getCategoryIcon(suggestion.category)}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {suggestion.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            className={getPriorityColor(suggestion.priority)}
                          >
                            {suggestion.priority} priority
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {suggestion.category.replace("-", " ")}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {suggestion.legalComplexity} complexity
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => acceptClause(suggestion)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => rejectClause(suggestion)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {suggestion.description}
                    </p>

                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-xs font-medium text-muted-foreground mb-2">
                        SUGGESTED CLAUSE TEXT:
                      </div>
                      <div className="text-sm font-mono bg-background p-3 rounded border">
                        {suggestion.clauseText}
                      </div>
                    </div>

                    <div className="flex items-start gap-4 text-sm">
                      <div className="flex-1">
                        <div className="font-medium mb-1">Reasoning:</div>
                        <div className="text-muted-foreground">
                          {suggestion.reasoning}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium mb-1">Impact:</div>
                        <div
                          className={`capitalize ${getImpactColor(
                            suggestion.estimatedImpact
                          )}`}
                        >
                          {suggestion.estimatedImpact}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Applicable to:</span>
                      {suggestion.applicableDocuments.map((doc) => (
                        <Badge
                          key={doc}
                          variant="secondary"
                          className="text-xs"
                        >
                          {doc.replace("_", " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredSuggestions.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                No Suggestions Found
              </h3>
              <p className="text-muted-foreground">
                {searchQuery ||
                categoryFilter !== "all" ||
                priorityFilter !== "all"
                  ? "Try adjusting your filters or search terms."
                  : "Generate AI suggestions to see personalized clause recommendations."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
