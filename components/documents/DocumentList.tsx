"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  useDocuments,
  useDeleteDocument,
  usePrefetchDocument,
} from "@/hooks/useDocuments";
import { type Document } from "@/lib/documents";
import { toast } from "sonner";
import {
  FileText,
  Eye,
  Copy,
  Download,
  Trash2,
  Calendar,
  DollarSign,
  User,
  Loader2,
  Plus,
  RefreshCw,
} from "lucide-react";

interface DocumentListProps {
  onDocumentSelect?: (document: Document) => void;
}

export function DocumentList({ onDocumentSelect }: DocumentListProps) {
  const { data: documents = [], isLoading, error, refetch } = useDocuments();
  const deleteDocumentMutation = useDeleteDocument();
  const prefetchDocument = usePrefetchDocument();

  const handleDelete = async (documentId: string, documentTitle: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${documentTitle}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    deleteDocumentMutation.mutate(documentId);
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Document content copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy content");
    }
  };

  const handleDownload = (document: Document) => {
    const blob = new Blob([document.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = `${document.title}.md`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Document downloaded");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-destructive mb-4">
          <FileText className="h-12 w-12 mx-auto mb-2" />
          <h3 className="text-lg font-semibold">Failed to load documents</h3>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading documents...</span>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Documents Found</h3>
        <p className="text-muted-foreground mb-4">
          Create your first loan document with AI assistance to get started.
        </p>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Document
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {documents.map((document) => (
        <Card
          key={document.id}
          className="hover:shadow-md transition-shadow"
          onMouseEnter={() => prefetchDocument(document.id)} // Prefetch on hover
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg truncate">
                  {document.title}
                </CardTitle>
                <Badge variant="secondary" className="mt-1 capitalize">
                  {document.document_type.replace("_", " ")}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Document Details */}
            <div className="space-y-2 text-sm">
              {document.loan_amount && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span>{formatCurrency(document.loan_amount)}</span>
                  {document.interest_rate && (
                    <span className="text-muted-foreground">
                      @ {document.interest_rate}%
                    </span>
                  )}
                </div>
              )}

              {(document.borrower_name || document.lender_name) && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="truncate">
                    {document.borrower_name && document.lender_name
                      ? `${document.borrower_name} ↔ ${document.lender_name}`
                      : document.borrower_name || document.lender_name}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Created {formatDate(document.created_at)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <Link
                href={`/dashboard/documents/${document.id}`}
                className="flex-1"
              >
                <Button size="sm" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
              </Link>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(document.content)}
              >
                <Copy className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(document)}
              >
                <Download className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(document.id, document.title)}
                disabled={deleteDocumentMutation.isPending}
                className="text-destructive hover:text-destructive"
              >
                {deleteDocumentMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
