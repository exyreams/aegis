"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/navigation";
import { SiteHeader } from "@/components/layout";
import { SidebarInset, SidebarProvider } from "@/components/ui/Sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
  CardFooter,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { useAuth } from "@/hooks/useAuth";
import { GenerateDocumentModal } from "@/components/documents";
import { toast } from "sonner";
import {
  Plus,
  FileText,
  Search,
  X,
  Clock,
  Users,
  Zap,
  Edit3,
  Copy,
  Download,
  Eye,
  Sparkles,
} from "lucide-react";

export default function DocumentCreationPage() {
  const { auth } = useAuth();
  const user = auth.user;

  // Modal states
  const [createDocModalOpen, setCreateDocModalOpen] = useState(false);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Mock data - replace with real API calls later
  const documents: any[] = [];
  const stats = {
    total: 0,
    drafts: 0,
    inReview: 0,
    completed: 0,
  };

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setStatusFilter("all");
  };

  const hasActiveFilters =
    searchQuery || typeFilter !== "all" || statusFilter !== "all";

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Header */}
              <div className="flex items-center justify-between px-4 lg:px-6">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Document Creation
                  </h1>
                  <p className="text-muted-foreground">
                    {user?.role === "borrower"
                      ? "Generate and negotiate loan agreements efficiently"
                      : user?.role === "lender"
                      ? "Create and review loan documents with AI assistance"
                      : "Monitor all document creation and negotiation activities"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCreateDocModalOpen(true)}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Assistant
                  </Button>
                  <Button onClick={() => setCreateDocModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Document
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="px-4 lg:px-6">
                <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                  <Card className="@container/card">
                    <CardHeader>
                      <CardDescription>Total Documents</CardDescription>
                      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {stats.total}
                      </CardTitle>
                      <CardAction>
                        <Badge variant="outline">
                          <FileText className="h-3 w-3 mr-1" />
                          All time
                        </Badge>
                      </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                      <div className="line-clamp-1 flex gap-2 font-medium">
                        Created documents <FileText className="size-4" />
                      </div>
                      <div className="text-muted-foreground">
                        Total generated
                      </div>
                    </CardFooter>
                  </Card>

                  <Card className="@container/card">
                    <CardHeader>
                      <CardDescription>Drafts</CardDescription>
                      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {stats.drafts}
                      </CardTitle>
                      <CardAction>
                        <Badge variant="outline">
                          <Edit3 className="h-3 w-3 mr-1" />
                          Draft
                        </Badge>
                      </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                      <div className="line-clamp-1 flex gap-2 font-medium">
                        Work in progress <Edit3 className="size-4" />
                      </div>
                      <div className="text-muted-foreground">
                        Pending completion
                      </div>
                    </CardFooter>
                  </Card>

                  <Card className="@container/card">
                    <CardHeader>
                      <CardDescription>In Review</CardDescription>
                      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {stats.inReview}
                      </CardTitle>
                      <CardAction>
                        <Badge variant="outline">
                          <Users className="h-3 w-3 mr-1" />
                          Review
                        </Badge>
                      </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                      <div className="line-clamp-1 flex gap-2 font-medium">
                        Under negotiation <Users className="size-4" />
                      </div>
                      <div className="text-muted-foreground">
                        Awaiting approval
                      </div>
                    </CardFooter>
                  </Card>

                  <Card className="@container/card">
                    <CardHeader>
                      <CardDescription>Completed</CardDescription>
                      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {stats.completed}
                      </CardTitle>
                      <CardAction>
                        <Badge variant="outline">
                          <Zap className="h-3 w-3 mr-1" />
                          Final
                        </Badge>
                      </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                      <div className="line-clamp-1 flex gap-2 font-medium">
                        Finalized documents <Zap className="size-4" />
                      </div>
                      <div className="text-muted-foreground">
                        Ready for execution
                      </div>
                    </CardFooter>
                  </Card>
                </div>
              </div>

              {/* Main Content */}
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center justify-between">
                        <CardTitle>Document Library</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {documents.length} documents
                          </Badge>
                        </div>
                      </div>

                      {/* Search and Filter Controls */}
                      <div className="flex flex-col lg:flex-row gap-3 w-full">
                        <div className="flex-1 min-w-0">
                          <div className="relative w-full">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search by document name, type, or parties..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-10 w-full"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 flex-wrap lg:flex-nowrap">
                          <Select
                            value={typeFilter}
                            onValueChange={setTypeFilter}
                          >
                            <SelectTrigger className="w-full lg:w-40">
                              <SelectValue placeholder="Document Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Types</SelectItem>
                              <SelectItem value="loan_agreement">
                                Loan Agreement
                              </SelectItem>
                              <SelectItem value="term_sheet">
                                Term Sheet
                              </SelectItem>
                              <SelectItem value="credit_agreement">
                                Credit Agreement
                              </SelectItem>
                              <SelectItem value="security_document">
                                Security Document
                              </SelectItem>
                              <SelectItem value="guarantee">
                                Guarantee
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          <Select
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                          >
                            <SelectTrigger className="w-full lg:w-32">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="in_review">
                                In Review
                              </SelectItem>
                              <SelectItem value="negotiating">
                                Negotiating
                              </SelectItem>
                              <SelectItem value="completed">
                                Completed
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          {hasActiveFilters && (
                            <Button
                              variant="outline"
                              onClick={clearFilters}
                              size="sm"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Clear
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {documents.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          No Documents Found
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Create your first loan document with AI assistance to
                          get started.
                        </p>
                        <Button onClick={() => setCreateDocModalOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Document
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Document list will go here */}
                        <p className="text-muted-foreground">
                          Document list component will be implemented here
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* AI Features */}
              <div className="px-4 lg:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="hover:border-primary transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Sparkles className="h-5 w-5 text-purple-500" />
                        Smart Templates
                      </CardTitle>
                      <CardDescription>
                        Generate documents from intelligent templates
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setCreateDocModalOpen(true)}
                      >
                        Browse Templates
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:border-primary transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Edit3 className="h-5 w-5 text-blue-500" />
                        AI Negotiation
                      </CardTitle>
                      <CardDescription>
                        Spot inconsistencies and suggest improvements
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" size="sm" className="w-full">
                        Start Negotiation
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:border-primary transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Copy className="h-5 w-5 text-emerald-500" />
                        Version Control
                      </CardTitle>
                      <CardDescription>
                        Track changes and manage document versions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" size="sm" className="w-full">
                        View History
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Generate Document Modal */}
      <GenerateDocumentModal
        open={createDocModalOpen}
        onOpenChange={setCreateDocModalOpen}
        onSuccess={(document) => {
          console.log("Generated document:", document);
          toast.success("Document generated successfully!");
          setCreateDocModalOpen(false);
        }}
      />
    </SidebarProvider>
  );
}
