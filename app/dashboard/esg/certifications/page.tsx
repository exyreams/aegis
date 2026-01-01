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
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Award,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  Star,
  Shield,
  Leaf,
  Users,
  Globe,
} from "lucide-react";

interface Certification {
  id: string;
  name: string;
  provider: string;
  category: "environmental" | "social" | "governance" | "comprehensive";
  status: "active" | "pending" | "expired" | "not_started";
  level: "bronze" | "silver" | "gold" | "platinum";
  score?: number;
  maxScore?: number;
  issueDate?: string;
  expiryDate?: string;
  renewalDate?: string;
  description: string;
  requirements: string[];
  benefits: string[];
  cost: string;
  duration: string;
  credibility: number; // 1-5 stars
}

export default function ESGCertificationsPage() {
  const { auth } = useAuth();
  const user = auth.user;

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Mock certifications data
  const [certifications] = useState<Certification[]>([
    {
      id: "1",
      name: "B Corporation Certification",
      provider: "B Lab",
      category: "comprehensive",
      status: "active",
      level: "gold",
      score: 85,
      maxScore: 100,
      issueDate: "2024-01-15",
      expiryDate: "2027-01-15",
      renewalDate: "2026-10-15",
      description:
        "Comprehensive certification for companies meeting high standards of social and environmental performance, accountability, and transparency.",
      requirements: [
        "Complete B Impact Assessment",
        "Achieve minimum score of 80",
        "Meet legal accountability requirements",
        "Pay annual certification fee",
      ],
      benefits: [
        "Enhanced brand reputation",
        "Access to B Corp community",
        "Marketing and recruitment advantages",
        "Stakeholder trust building",
      ],
      cost: "$2,500 - $25,000 annually",
      duration: "3-6 months initial process",
      credibility: 5,
    },
    {
      id: "2",
      name: "ISO 14001 Environmental Management",
      provider: "International Organization for Standardization",
      category: "environmental",
      status: "active",
      level: "silver",
      issueDate: "2023-06-20",
      expiryDate: "2026-06-20",
      renewalDate: "2026-03-20",
      description:
        "International standard for environmental management systems helping organizations improve environmental performance.",
      requirements: [
        "Establish environmental management system",
        "Conduct environmental impact assessment",
        "Set environmental objectives and targets",
        "Regular internal audits",
      ],
      benefits: [
        "Reduced environmental impact",
        "Cost savings through efficiency",
        "Regulatory compliance",
        "Competitive advantage",
      ],
      cost: "$5,000 - $15,000",
      duration: "6-12 months",
      credibility: 5,
    },
    {
      id: "3",
      name: "LEED Green Building Certification",
      provider: "U.S. Green Building Council",
      category: "environmental",
      status: "pending",
      level: "gold",
      score: 72,
      maxScore: 100,
      description:
        "Leadership in Energy and Environmental Design certification for sustainable building practices.",
      requirements: [
        "Meet LEED rating system requirements",
        "Register project with GBCI",
        "Submit documentation for review",
        "Pass third-party verification",
      ],
      benefits: [
        "Lower operating costs",
        "Increased property value",
        "Healthier work environment",
        "Marketing advantages",
      ],
      cost: "$2,000 - $27,500",
      duration: "3-12 months",
      credibility: 4,
    },
    {
      id: "4",
      name: "SA8000 Social Accountability",
      provider: "Social Accountability International",
      category: "social",
      status: "expired",
      level: "bronze",
      issueDate: "2021-03-10",
      expiryDate: "2024-03-10",
      description:
        "International standard for social accountability covering workers' rights and working conditions.",
      requirements: [
        "Implement SA8000 management system",
        "Ensure compliance with labor standards",
        "Regular worker interviews",
        "Third-party audits",
      ],
      benefits: [
        "Improved worker conditions",
        "Enhanced supply chain management",
        "Risk mitigation",
        "Stakeholder confidence",
      ],
      cost: "$10,000 - $50,000",
      duration: "6-18 months",
      credibility: 4,
    },
    {
      id: "5",
      name: "GRI Standards Reporting",
      provider: "Global Reporting Initiative",
      category: "comprehensive",
      status: "not_started",
      level: "silver",
      description:
        "Global standards for sustainability reporting providing framework for transparent communication.",
      requirements: [
        "Adopt GRI Standards framework",
        "Conduct materiality assessment",
        "Collect and verify data",
        "Publish sustainability report",
      ],
      benefits: [
        "Enhanced transparency",
        "Improved stakeholder engagement",
        "Better risk management",
        "Benchmarking capabilities",
      ],
      cost: "$5,000 - $20,000",
      duration: "4-8 months",
      credibility: 5,
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "not_started":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "expired":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "not_started":
        return <Plus className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "environmental":
        return <Leaf className="h-4 w-4 text-green-600" />;
      case "social":
        return <Users className="h-4 w-4 text-blue-600" />;
      case "governance":
        return <Shield className="h-4 w-4 text-purple-600" />;
      case "comprehensive":
        return <Globe className="h-4 w-4 text-orange-600" />;
      default:
        return <Award className="h-4 w-4" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "platinum":
        return "bg-gray-200 text-gray-800";
      case "gold":
        return "bg-yellow-100 text-yellow-800";
      case "silver":
        return "bg-gray-100 text-gray-700";
      case "bronze":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStartCertification = (cert: Certification) => {
    toast.success(`Starting ${cert.name} certification process...`);
  };

  const handleRenewCertification = (cert: Certification) => {
    toast.success(`Renewal process initiated for ${cert.name}`);
  };

  const handleViewDetails = (cert: Certification) => {
    toast.info("Opening certification details...");
  };

  const filteredCertifications = certifications.filter((cert) => {
    const matchesSearch =
      cert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || cert.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" || cert.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    active: certifications.filter((c) => c.status === "active").length,
    pending: certifications.filter((c) => c.status === "pending").length,
    expired: certifications.filter((c) => c.status === "expired").length,
    total: certifications.length,
  };

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
                    ESG Certifications
                  </h1>
                  <p className="text-muted-foreground">
                    Track and manage your ESG certifications and ratings
                  </p>
                </div>
                <Button
                  onClick={() => toast.info("Explore new certifications...")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Explore Certifications
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="px-4 lg:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">
                            {stats.active}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Active Certifications
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                          <Clock className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">
                            {stats.pending}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            In Progress
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 rounded-lg">
                          <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">
                            {stats.expired}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Need Renewal
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Award className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">
                            {stats.total}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total Tracked
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Filters */}
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Certifications Portfolio</CardTitle>
                    <CardDescription>
                      Manage your ESG certifications and explore new
                      opportunities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col lg:flex-row gap-4 mb-6">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search certifications..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Select
                          value={categoryFilter}
                          onValueChange={setCategoryFilter}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="environmental">
                              Environmental
                            </SelectItem>
                            <SelectItem value="social">Social</SelectItem>
                            <SelectItem value="governance">
                              Governance
                            </SelectItem>
                            <SelectItem value="comprehensive">
                              Comprehensive
                            </SelectItem>
                          </SelectContent>
                        </Select>

                        <Select
                          value={statusFilter}
                          onValueChange={setStatusFilter}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                            <SelectItem value="not_started">
                              Not Started
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Certifications List */}
                    <div className="space-y-4">
                      {filteredCertifications.map((cert) => (
                        <Card
                          key={cert.id}
                          className="hover:shadow-md transition-shadow"
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-start gap-4 flex-1">
                                <div className="p-3 bg-gray-100 rounded-lg">
                                  {getCategoryIcon(cert.category)}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-lg font-semibold">
                                      {cert.name}
                                    </h3>
                                    <Badge
                                      className={getStatusColor(cert.status)}
                                      variant="secondary"
                                    >
                                      {getStatusIcon(cert.status)}
                                      <span className="ml-1">
                                        {cert.status.replace("_", " ")}
                                      </span>
                                    </Badge>
                                    <Badge
                                      className={getLevelColor(cert.level)}
                                      variant="outline"
                                    >
                                      {cert.level}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {cert.provider}
                                  </p>
                                  <p className="text-sm mb-3">
                                    {cert.description}
                                  </p>

                                  {/* Score Progress */}
                                  {cert.score && cert.maxScore && (
                                    <div className="mb-3">
                                      <div className="flex justify-between text-sm mb-1">
                                        <span>Score</span>
                                        <span>
                                          {cert.score}/{cert.maxScore}
                                        </span>
                                      </div>
                                      <Progress
                                        value={
                                          (cert.score / cert.maxScore) * 100
                                        }
                                        className="h-2"
                                      />
                                    </div>
                                  )}

                                  {/* Dates */}
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                                    {cert.issueDate && (
                                      <span>
                                        Issued:{" "}
                                        {new Date(
                                          cert.issueDate
                                        ).toLocaleDateString()}
                                      </span>
                                    )}
                                    {cert.expiryDate && (
                                      <span>
                                        Expires:{" "}
                                        {new Date(
                                          cert.expiryDate
                                        ).toLocaleDateString()}
                                      </span>
                                    )}
                                    {cert.renewalDate && (
                                      <span>
                                        Renewal Due:{" "}
                                        {new Date(
                                          cert.renewalDate
                                        ).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>

                                  {/* Credibility Rating */}
                                  <div className="flex items-center gap-2 mb-3">
                                    <span className="text-sm">
                                      Credibility:
                                    </span>
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`h-4 w-4 ${
                                            i < cert.credibility
                                              ? "text-yellow-400 fill-current"
                                              : "text-gray-300"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  </div>

                                  {/* Cost and Duration */}
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                    <span>Cost: {cert.cost}</span>
                                    <span>•</span>
                                    <span>Duration: {cert.duration}</span>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleViewDetails(cert)}
                                    >
                                      View Details
                                    </Button>
                                    {cert.status === "not_started" && (
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          handleStartCertification(cert)
                                        }
                                      >
                                        Start Process
                                      </Button>
                                    )}
                                    {cert.status === "expired" && (
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          handleRenewCertification(cert)
                                        }
                                      >
                                        Renew
                                      </Button>
                                    )}
                                    {cert.status === "active" &&
                                      cert.renewalDate && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            handleRenewCertification(cert)
                                          }
                                        >
                                          Schedule Renewal
                                        </Button>
                                      )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {filteredCertifications.length === 0 && (
                      <div className="text-center py-12">
                        <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          No Certifications Found
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {searchQuery ||
                          categoryFilter !== "all" ||
                          statusFilter !== "all"
                            ? "Try adjusting your filters"
                            : "Start building your ESG credentials"}
                        </p>
                        <Button
                          onClick={() =>
                            toast.info("Explore certifications...")
                          }
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Explore Certifications
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
