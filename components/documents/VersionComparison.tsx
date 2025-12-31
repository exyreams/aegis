"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  GitBranch,
  Clock,
  User,
  ArrowRight,
  Download,
  Eye,
  Diff,
  History,
  Plus,
  Minus,
} from "lucide-react";
import { toast } from "sonner";

interface DocumentVersion {
  id: string;
  version: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: Date;
  changes: string[];
  status: "draft" | "review" | "approved" | "archived";
}

interface VersionDiff {
  type: "added" | "removed" | "modified";
  section: string;
  oldText?: string;
  newText?: string;
  lineNumber?: number;
}

interface VersionComparisonProps {
  documentId: string;
  currentVersion?: DocumentVersion;
  onVersionSelect?: (version: DocumentVersion) => void;
  onVersionRestore?: (version: DocumentVersion) => void;
}

export function VersionComparison({
  documentId,
  currentVersion,
  onVersionSelect,
  onVersionRestore,
}: VersionComparisonProps) {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [selectedVersionA, setSelectedVersionA] = useState<string>("");
  const [selectedVersionB, setSelectedVersionB] = useState<string>("");
  const [comparison, setComparison] = useState<VersionDiff[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  // Mock data - in real implementation, this would come from your backend
  useEffect(() => {
    const mockVersions: DocumentVersion[] = [
      {
        id: "v1",
        version: "1.0",
        title: "Initial Draft",
        content: "Original loan agreement content...",
        createdBy: "John Smith",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        changes: ["Initial document creation"],
        status: "draft",
      },
      {
        id: "v2",
        version: "1.1",
        title: "Interest Rate Adjustment",
        content: "Updated loan agreement with revised interest rate...",
        createdBy: "Acme Corp",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        changes: [
          "Reduced interest rate from 5.0% to 4.75%",
          "Updated payment schedule",
        ],
        status: "review",
      },
      {
        id: "v3",
        version: "1.2",
        title: "Collateral Updates",
        content: "Final loan agreement with collateral specifications...",
        createdBy: "Legal Team",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        changes: [
          "Added collateral specifications",
          "Updated default clauses",
          "Legal review completed",
        ],
        status: "approved",
      },
      {
        id: "v4",
        version: "2.0",
        title: "Current Version",
        content: "Current working version of the loan agreement...",
        createdBy: "System",
        createdAt: new Date(),
        changes: ["Auto-saved changes", "Negotiation updates"],
        status: "draft",
      },
    ];

    setVersions(mockVersions);
    if (mockVersions.length > 0) {
      setSelectedVersionA(mockVersions[mockVersions.length - 1].id);
      if (mockVersions.length > 1) {
        setSelectedVersionB(mockVersions[mockVersions.length - 2].id);
      }
    }
  }, [documentId]);

  const compareVersions = async () => {
    if (!selectedVersionA || !selectedVersionB) {
      toast.error("Please select two versions to compare");
      return;
    }

    setIsComparing(true);

    try {
      // Simulate API call for version comparison
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock comparison results
      const mockDiffs: VersionDiff[] = [
        {
          type: "modified",
          section: "Interest Rate",
          oldText: "5.0% per annum",
          newText: "4.75% per annum",
          lineNumber: 15,
        },
        {
          type: "added",
          section: "Collateral Specifications",
          newText:
            "The borrower shall provide real estate collateral valued at 120% of the loan amount",
          lineNumber: 45,
        },
        {
          type: "modified",
          section: "Payment Terms",
          oldText: "Monthly payments of $2,083.33",
          newText: "Monthly payments of $2,041.67",
          lineNumber: 28,
        },
        {
          type: "removed",
          section: "Prepayment Penalty",
          oldText: "2% penalty for prepayment within first 12 months",
          lineNumber: 52,
        },
      ];

      setComparison(mockDiffs);
      toast.success("Version comparison completed");
    } catch (error) {
      toast.error("Failed to compare versions");
    } finally {
      setIsComparing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "review":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-blue-100 text-blue-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDiffIcon = (type: string) => {
    switch (type) {
      case "added":
        return <Plus className="h-4 w-4 text-green-600" />;
      case "removed":
        return <Minus className="h-4 w-4 text-red-600" />;
      case "modified":
        return <Diff className="h-4 w-4 text-blue-600" />;
      default:
        return <Diff className="h-4 w-4" />;
    }
  };

  const getDiffColor = (type: string) => {
    switch (type) {
      case "added":
        return "border-green-200 bg-green-50";
      case "removed":
        return "border-red-200 bg-red-50";
      case "modified":
        return "border-blue-200 bg-blue-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const downloadVersion = (version: DocumentVersion) => {
    const blob = new Blob([version.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${version.title}_v${version.version}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Version ${version.version} downloaded`);
  };

  return (
    <div className="space-y-6">
      {/* Version History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Version History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {versions.map((version, index) => (
              <div
                key={version.id}
                className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {version.version}
                    </span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{version.title}</h4>
                    <Badge className={getStatusColor(version.status)}>
                      {version.status}
                    </Badge>
                    {index === 0 && <Badge variant="outline">Current</Badge>}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {version.createdBy}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(version.createdAt)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <ul className="text-xs text-muted-foreground">
                      {version.changes.map((change, changeIndex) => (
                        <li
                          key={changeIndex}
                          className="flex items-center gap-1"
                        >
                          <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onVersionSelect?.(version)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadVersion(version)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {index !== 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onVersionRestore?.(version)}
                    >
                      Restore
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Version Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Compare Versions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium">Version A</label>
                <Select
                  value={selectedVersionA}
                  onValueChange={setSelectedVersionA}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select version" />
                  </SelectTrigger>
                  <SelectContent>
                    {versions.map((version) => (
                      <SelectItem key={version.id} value={version.id}>
                        v{version.version} - {version.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Version B</label>
                <Select
                  value={selectedVersionB}
                  onValueChange={setSelectedVersionB}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select version" />
                  </SelectTrigger>
                  <SelectContent>
                    {versions.map((version) => (
                      <SelectItem key={version.id} value={version.id}>
                        v{version.version} - {version.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={compareVersions}
              disabled={
                !selectedVersionA ||
                !selectedVersionB ||
                selectedVersionA === selectedVersionB ||
                isComparing
              }
              className="w-full"
            >
              <Diff className="h-4 w-4 mr-2" />
              {isComparing ? "Comparing..." : "Compare Versions"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {comparison.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-green-600" />
                  <span>
                    {comparison.filter((d) => d.type === "added").length}{" "}
                    additions
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Minus className="h-4 w-4 text-red-600" />
                  <span>
                    {comparison.filter((d) => d.type === "removed").length}{" "}
                    deletions
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Diff className="h-4 w-4 text-blue-600" />
                  <span>
                    {comparison.filter((d) => d.type === "modified").length}{" "}
                    modifications
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {comparison.map((diff, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border ${getDiffColor(
                      diff.type
                    )}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {getDiffIcon(diff.type)}
                      <span className="font-medium">{diff.section}</span>
                      {diff.lineNumber && (
                        <Badge variant="outline" className="text-xs">
                          Line {diff.lineNumber}
                        </Badge>
                      )}
                    </div>

                    {diff.type === "modified" && (
                      <div className="space-y-2">
                        <div className="p-2 bg-red-100 border border-red-200 rounded text-sm">
                          <div className="text-red-600 font-medium text-xs mb-1">
                            - Removed
                          </div>
                          <div className="line-through text-red-800">
                            {diff.oldText}
                          </div>
                        </div>
                        <div className="p-2 bg-green-100 border border-green-200 rounded text-sm">
                          <div className="text-green-600 font-medium text-xs mb-1">
                            + Added
                          </div>
                          <div className="text-green-800">{diff.newText}</div>
                        </div>
                      </div>
                    )}

                    {diff.type === "added" && (
                      <div className="p-2 bg-green-100 border border-green-200 rounded text-sm">
                        <div className="text-green-600 font-medium text-xs mb-1">
                          + Added
                        </div>
                        <div className="text-green-800">{diff.newText}</div>
                      </div>
                    )}

                    {diff.type === "removed" && (
                      <div className="p-2 bg-red-100 border border-red-200 rounded text-sm">
                        <div className="text-red-600 font-medium text-xs mb-1">
                          - Removed
                        </div>
                        <div className="line-through text-red-800">
                          {diff.oldText}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
