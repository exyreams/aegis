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
import { toast } from "sonner";
import {
  Award,
  Plus,
  Zap,
  Shield,
  Leaf,
  Users,
  Globe,
  Star,
  Eye,
  Satellite,
  Activity,
  CheckCircle,
  Clock,
  AlertTriangle,
  Search,
} from "lucide-react";
import {
  WideModal,
  WideModalContent,
  WideModalTitle,
} from "@/components/ui/WideModal";

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
  regulatoryAlignment: string[]; // e.g. ["SFDR", "EU Taxonomy"]
  verificationSource: "auditor" | "satellite" | "iot" | "legal";
}

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800";
      case "expiring":
        return "bg-amber-500/10 text-amber-700 border-amber-200 dark:text-amber-400 dark:border-amber-800";
      case "expired":
        return "bg-rose-500/10 text-rose-700 border-rose-200 dark:text-rose-400 dark:border-rose-800";
      case "not_started":
        return "bg-blue-500/10 text-blue-700 border-blue-200 dark:text-blue-400 dark:border-blue-800";
      default:
        return "bg-zinc-500/10 text-zinc-700 border-zinc-200 dark:text-zinc-400 dark:border-zinc-800";
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

const getVerificationSourceBadge = (source: string) => {
  switch (source) {
    case "satellite":
      return (
        <Badge
          variant="outline"
          className="bg-blue-500/10 text-blue-600 border-blue-500/20"
        >
          <Globe className="h-3 w-3 mr-1" /> Satellite Verified
        </Badge>
      );
    case "auditor":
      return (
        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
        >
          <Shield className="h-3 w-3 mr-1" /> Auditor Verified
        </Badge>
      );
    case "iot":
      return (
        <Badge
          variant="outline"
          className="bg-purple-500/10 text-purple-600 border-purple-500/20"
        >
          <Zap className="h-3 w-3 mr-1" /> Real-time IoT
        </Badge>
      );
    default:
      return null;
  }
};

const getLevelColor = (level: string) => {
  switch (level) {
    case "platinum":
      return "bg-slate-900 text-slate-100 border-slate-700 font-bold tracking-tight shadow-[0_0_15px_rgba(30,41,59,0.2)]";
    case "gold":
      return "bg-amber-100/50 text-amber-700 border-amber-200 font-bold dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-800";
    case "silver":
      return "bg-zinc-100 text-zinc-700 border-zinc-200 font-bold";
    case "bronze":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-zinc-100 text-zinc-700 border-zinc-200";
  }
};

export default function ESGCertificationsPage() {
  // useAuth removed or user data removed if unused

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
      regulatoryAlignment: ["B Impact", "SDG Alignment"],
      verificationSource: "auditor",
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
      regulatoryAlignment: ["EU Taxonomy", "SFDR Article 9"],
      verificationSource: "auditor",
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
      regulatoryAlignment: ["EU Taxonomy", "BREEAM Equivalent"],
      verificationSource: "satellite",
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
      regulatoryAlignment: ["ILO Standards", "UN Global Compact"],
      verificationSource: "auditor",
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
      regulatoryAlignment: ["SFDR Article 8", "TCFD"],
      verificationSource: "auditor",
    },
  ]);

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

  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);

  const handleStartCertification = (cert: Certification) => {
    toast.success(`Starting ${cert.name} certification process...`);
  };

  const handleRenewCertification = () => {
    toast.success("Renewal process manual triggered. Auditor notified.");
  };

  const handleViewDetails = (cert: Certification) => {
    setSelectedCert(cert);
    setIsDetailOpen(true);
  };

  const handleVerificationSource = (cert: Certification) => {
    setSelectedCert(cert);
    setIsVerificationOpen(true);
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

                                  {/* Regulatory Alignment */}
                                  <div className="flex flex-wrap gap-2 mb-4">
                                    {cert.regulatoryAlignment.map((reg) => (
                                      <Badge key={reg} variant="secondary" className="bg-blue-500/5 text-blue-700 hover:bg-blue-500/10 border-blue-500/10 text-[10px] px-2 py-0">
                                        {reg}
                                      </Badge>
                                    ))}
                                    {getVerificationSourceBadge(cert.verificationSource)}
                                  </div>

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
                                      <Eye className="h-4 w-4 mr-2" />
                                      Deep Dive
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
                                          handleRenewCertification()
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
                                            handleRenewCertification()
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

      {/* --- CERTIFICATION DETAIL MODAL --- */}
      <WideModal open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <WideModalContent className="max-w-4xl bg-white dark:bg-zinc-950 p-0 flex flex-col overflow-hidden">
          <div className="p-8 border-b bg-zinc-50 dark:bg-zinc-900/50 flex justify-between items-start">
            <div className="flex gap-6 items-center">
              <div className="h-16 w-16 rounded-2xl bg-white dark:bg-zinc-800 shadow-xl flex items-center justify-center border">
                {selectedCert && getCategoryIcon(selectedCert.category)}
              </div>
              <div>
                <WideModalTitle className="text-2xl font-black tracking-tight">{selectedCert?.name}</WideModalTitle>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline" className={selectedCert ? getStatusColor(selectedCert.status) : ""}>{selectedCert?.status}</Badge>
                  <Badge variant="outline" className={selectedCert ? getLevelColor(selectedCert.level) : ""}>{selectedCert?.level} TIER</Badge>
                </div>
              </div>
            </div>
            <Button onClick={() => setIsDetailOpen(false)}>Close</Button>
          </div>
          
          <div className="flex-1 overflow-auto p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Metric Deep Dive</h4>
                  <div className="space-y-4">
                    {[
                      { label: "SBTi Alignment", value: "88%", color: "text-emerald-500" },
                      { label: "Scope 1 Emissions", value: "2.4 tCO2e", color: "text-emerald-500" },
                      { label: "Water Intensity", value: "12m3/unit", color: "text-blue-500" },
                    ].map((m, i) => (
                      <div key={i} className="flex justify-between p-4 rounded-xl border bg-zinc-50/50 dark:bg-zinc-900/50">
                        <span className="font-medium">{m.label}</span>
                        <span className={`font-black ${m.color}`}>{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-linear-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/10">
                  <h4 className="font-bold flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-indigo-600" />
                    Regulatory Mapping
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">This certification satisfies 14 specific disclosure requirements under SFDR Article 9.</p>
                  <Button variant="secondary" size="sm" className="w-full">View Gap Analysis</Button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="aspect-video rounded-2xl bg-zinc-100 dark:bg-zinc-900 border overflow-hidden relative group">
                  <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2013&auto=format&fit=crop')" }}></div>
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <p className="text-[10px] font-bold text-white/50 uppercase">Verified Evidence Layer</p>
                    <p className="text-white font-bold flex items-center gap-2">
                      <Satellite className="h-4 w-4" />
                      Satellite Imagery: Sector 4B
                    </p>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => selectedCert && handleVerificationSource(selectedCert)}
                  >
                    Enter Live View
                  </Button>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold uppercase text-muted-foreground tracking-widest">Audit Trail</h4>
                  {[
                    { date: "Dec 15, 2024", event: "Automated Satellite Verification Passed" },
                    { date: "Oct 02, 2024", event: "Third-party Auditor On-site Review" },
                    { date: "Sep 28, 2024", event: "IoT Smart Meter Baseline Established" },
                  ].map((log, i) => (
                    <div key={i} className="flex gap-4 items-start py-2 group">
                      <div className="shrink-0 h-2 w-2 rounded-full bg-emerald-500 mt-1.5 group-hover:scale-150 transition-transform" />
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{log.date}</p>
                        <p className="text-sm font-medium">{log.event}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </WideModalContent>
      </WideModal>

      {/* --- LIVE VERIFICATION SOURCE MODAL --- */}
      <WideModal open={isVerificationOpen} onOpenChange={setIsVerificationOpen}>
        <WideModalContent className="max-w-6xl h-[90vh] bg-black p-0 border-none overflow-hidden relative">
          {/* HUD Overlay */}
          <div className="absolute inset-0 pointer-events-none z-10 border-20 border-white/5 flex flex-col justify-between p-12">
            <div className="flex justify-between items-start">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-500">
                  <div className="h-3 w-3 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="font-mono text-xs font-bold tracking-[0.3em] uppercase">System Live: {selectedCert?.verificationSource.toUpperCase()}</span>
                </div>
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-white tracking-tighter">DATA STREAM: {selectedCert?.name}</h2>
                  <p className="text-white/40 font-mono text-[10px]">COORDINATES: 51.5074° N, 0.1278° W • ACCURACY: 99.4%</p>
                </div>
              </div>
              <div className="text-right p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                <p className="text-[10px] font-bold text-white/50 mb-1 uppercase tracking-widest">Real-time Metric</p>
                <p className="text-4xl font-black text-white font-mono">{selectedCert?.category === "environmental" ? "2.4" : "96"}<span className="text-lg ml-1 opacity-50">{selectedCert?.category === "environmental" ? "tCO2e" : "%"}</span></p>
              </div>
            </div>

            <div className="mt-auto flex justify-between items-end">
              <div className="space-y-4 max-w-md">
                <div className="p-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl">
                  <p className="text-[10px] font-bold text-emerald-500 mb-2 uppercase">AI Integrity Check</p>
                  <p className="text-xs text-white/80 leading-relaxed font-mono">
                    Deepfake analysis baseline established. Zero tampering detected in visual evidence stream. Verified by Aegis Neural Gate V4.
                  </p>
                </div>
                <div className="flex gap-4">
                   <div className="flex-1 h-32 bg-white/5 border border-white/10 rounded-lg overflow-hidden relative">
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-emerald-500/20 animate-pulse" />
                      <div className="p-2 font-mono text-[8px] text-white/30">SPECTRAL ANALYSIS</div>
                   </div>
                   <div className="flex-1 h-32 bg-white/5 border border-white/10 rounded-lg overflow-hidden relative">
                      <div className="absolute h-px w-full bg-white/10 top-1/2" />
                      <div className="absolute w-px h-full bg-white/10 left-1/2" />
                      <div className="absolute bottom-4 left-4 font-mono text-[8px] text-emerald-500 animate-pulse">LIDAR: ACTIVE</div>
                   </div>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="h-48 w-48 rounded-full border border-white/20 flex items-center justify-center relative">
                    <div className="absolute h-[120%] w-[1px] bg-white/10 rotate-45" />
                    <div className="absolute h-[1px] w-[120%] bg-white/10 rotate-45" />
                    <div className="h-32 w-32 rounded-full border-2 border-emerald-500/50 flex items-center justify-center animate-spin-slow">
                        <Activity className="h-8 w-8 text-emerald-500" />
                    </div>
                </div>
              </div>
            </div>
          </div>

          {/* Background Visual (Mock Background) */}
          <div className="absolute inset-0 bg-zinc-900 overflow-hidden">
             <div className="absolute inset-0 opacity-50 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center" />
             <div className="absolute inset-0 bg-linear-to-b from-transparent via-black/20 to-black" />
             {/* Scanning lines */}
             <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent h-1 opacity-20 animate-scanline" />
          </div>

          <Button 
            className="absolute top-8 right-8 z-50 pointer-events-auto bg-white hover:bg-white/90 text-black"
            onClick={() => setIsVerificationOpen(false)}
          >
            Exit Live Stream
          </Button>
        </WideModalContent>
      </WideModal>
    </SidebarProvider>
  );
}
