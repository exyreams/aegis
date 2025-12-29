"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppSidebar } from "@/components/navigation";
import { SiteHeader } from "@/components/layout";
import { SidebarInset, SidebarProvider } from "@/components/ui/Sidebar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DocumentViewer } from "@/components/documents/DocumentViewer";
import { DocumentEditor } from "@/components/documents/DocumentEditor";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Separator } from "@/components/ui/Separator";
import { useDocument, useDeleteDocument } from "@/hooks/useDocuments";
import { toast } from "sonner";
import {
  ArrowLeft,
  Edit3,
  Eye,
  Download,
  Copy,
  Share2,
  Trash2,
  Save,
  X,
  FileText,
  Calendar,
  User,
  DollarSign,
  Percent,
  Clock,
  Loader2,
} from "lucide-react";

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;

  const { data: document, isLoading, error } = useDocument(documentId);
  const deleteDocumentMutation = useDeleteDocument();
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = async () => {
    if (!document) return;

    if (
      !confirm(
        "Are you sure you want to delete this document? This action cannot be undone."
      )
    ) {
      return;
    }

    deleteDocumentMutation.mutate(document.id, {
      onSuccess: () => {
        router.push("/dashboard/documents");
      },
    });
  };

  const handleCopyContent = async () => {
    if (!document) return;

    try {
      await navigator.clipboard.writeText(document.content);
      toast.success("Document content copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy content");
    }
  };

  const handleDownload = () => {
    if (!document) return;

    const blob = new Blob([document.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${document.title}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Document downloaded");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <SidebarProvider>
          <AppSidebar variant="inset" />
          <SidebarInset>
            <SiteHeader />
            <div className="flex flex-1 items-center justify-center">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading document...</span>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <SidebarProvider>
          <AppSidebar variant="inset" />
          <SidebarInset>
            <SiteHeader />
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <h2 className="text-lg font-semibold mb-2">
                  Document not found
                </h2>
                <p className="text-muted-foreground mb-4">
                  The document you're looking for doesn't exist or you don't
                  have access to it.
                </p>
                <Button onClick={() => router.push("/dashboard/documents")}>
                  Back to Documents
                </Button>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRoute>
    );
  }

  if (!document) {
    return null;
  }

  return (
    <ProtectedRoute>
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
            <div className="flex flex-col gap-4 p-4 md:p-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/dashboard/documents")}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Documents
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <h1 className="text-2xl font-bold">{document.title}</h1>
                    <Badge variant="secondary" className="capitalize">
                      {document.document_type.replace("_", " ")}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(false)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyContent}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        disabled={deleteDocumentMutation.isPending}
                      >
                        {deleteDocumentMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Document Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {document.loan_amount && (
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Loan Amount
                      </p>
                      <p className="font-semibold">
                        {formatCurrency(document.loan_amount)}
                      </p>
                    </div>
                  </div>
                )}

                {document.interest_rate && (
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Percent className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Interest Rate
                      </p>
                      <p className="font-semibold">{document.interest_rate}%</p>
                    </div>
                  </div>
                )}

                {document.term_months && (
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Term</p>
                      <p className="font-semibold">
                        {document.term_months} months
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-semibold text-sm">
                      {formatDate(document.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Parties Information */}
              {(document.borrower_name || document.lender_name) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {document.borrower_name && (
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <User className="h-4 w-4 text-indigo-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Borrower
                        </p>
                        <p className="font-semibold">
                          {document.borrower_name}
                        </p>
                      </div>
                    </div>
                  )}

                  {document.lender_name && (
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <User className="h-4 w-4 text-teal-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Lender</p>
                        <p className="font-semibold">{document.lender_name}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Document Content */}
              <div className="flex-1">
                {isEditing ? (
                  <DocumentEditor
                    document={document}
                    onCancel={() => setIsEditing(false)}
                  />
                ) : (
                  <DocumentViewer document={document} />
                )}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
