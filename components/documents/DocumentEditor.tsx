"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Separator } from "@/components/ui/Separator";
import { type Document } from "@/lib/documents";
import { useUpdateDocument } from "@/hooks/useDocuments";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import {
  Save,
  X,
  Eye,
  Edit3,
  Loader2,
  FileText,
  DollarSign,
  User,
  AlertCircle,
} from "lucide-react";

const editDocumentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  document_type: z.string().min(1, "Document type is required"),
  content: z.string().min(1, "Content is required"),
  loan_amount: z.number().optional(),
  interest_rate: z.number().min(0).max(100).optional(),
  term_months: z.number().min(1).max(360).optional(),
  borrower_name: z.string().optional(),
  lender_name: z.string().optional(),
  collateral: z.string().optional(),
  purpose: z.string().optional(),
  additional_terms: z.string().optional(),
});

type EditDocumentFormData = z.infer<typeof editDocumentSchema>;

interface DocumentEditorProps {
  document: Document;
  onCancel: () => void;
}

const DOCUMENT_TYPES = [
  { value: "loan_agreement", label: "Loan Agreement" },
  { value: "term_sheet", label: "Term Sheet" },
  { value: "credit_agreement", label: "Credit Agreement" },
  { value: "promissory_note", label: "Promissory Note" },
  { value: "security_agreement", label: "Security Agreement" },
];

export function DocumentEditor({ document, onCancel }: DocumentEditorProps) {
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [hasChanges, setHasChanges] = useState(false);
  const updateDocumentMutation = useUpdateDocument();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<EditDocumentFormData>({
    resolver: zodResolver(editDocumentSchema),
    defaultValues: {
      title: document.title,
      document_type: document.document_type,
      content: document.content,
      loan_amount: document.loan_amount || undefined,
      interest_rate: document.interest_rate || undefined,
      term_months: document.term_months || undefined,
      borrower_name: document.borrower_name || "",
      lender_name: document.lender_name || "",
      collateral: document.collateral || "",
      purpose: document.purpose || "",
      additional_terms: document.additional_terms || "",
    },
  });

  const watchedContent = watch("content");
  const watchedTitle = watch("title");

  useEffect(() => {
    setHasChanges(isDirty);
  }, [isDirty]);

  const onSubmit = async (data: EditDocumentFormData) => {
    // Convert empty strings to undefined for optional fields
    const cleanedData = {
      ...data,
      loan_amount: data.loan_amount || undefined,
      interest_rate: data.interest_rate || undefined,
      term_months: data.term_months || undefined,
      borrower_name: data.borrower_name || undefined,
      lender_name: data.lender_name || undefined,
      collateral: data.collateral || undefined,
      purpose: data.purpose || undefined,
      additional_terms: data.additional_terms || undefined,
    };

    updateDocumentMutation.mutate(
      {
        id: document.id,
        data: cleanedData,
      },
      {
        onSuccess: () => {
          onCancel(); // Close the editor after successful save
        },
      }
    );
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (
        confirm("You have unsaved changes. Are you sure you want to cancel?")
      ) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              <CardTitle>Edit Document</CardTitle>
              {hasChanges && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Unsaved Changes
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setViewMode(viewMode === "edit" ? "preview" : "edit")
                }
              >
                {viewMode === "edit" ? (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={updateDocumentMutation.isPending}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>

              <Button
                size="sm"
                onClick={handleSubmit(onSubmit)}
                disabled={updateDocumentMutation.isPending || !hasChanges}
              >
                {updateDocumentMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {viewMode === "edit" ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Document Title</Label>
                  <Input
                    id="title"
                    {...register("title")}
                    placeholder="Enter document title"
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document_type">Document Type</Label>
                  <Select
                    value={watch("document_type")}
                    onValueChange={(value) => setValue("document_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.document_type && (
                    <p className="text-sm text-destructive">
                      {errors.document_type.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Loan Details */}
              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Loan Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="loan_amount">Loan Amount ($)</Label>
                    <Input
                      id="loan_amount"
                      type="number"
                      step="0.01"
                      {...register("loan_amount", { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                    {errors.loan_amount && (
                      <p className="text-sm text-destructive">
                        {errors.loan_amount.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interest_rate">Interest Rate (%)</Label>
                    <Input
                      id="interest_rate"
                      type="number"
                      step="0.01"
                      {...register("interest_rate", { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                    {errors.interest_rate && (
                      <p className="text-sm text-destructive">
                        {errors.interest_rate.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="term_months">Term (Months)</Label>
                    <Input
                      id="term_months"
                      type="number"
                      {...register("term_months", { valueAsNumber: true })}
                      placeholder="12"
                    />
                    {errors.term_months && (
                      <p className="text-sm text-destructive">
                        {errors.term_months.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Parties */}
              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Parties
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="borrower_name">Borrower Name</Label>
                    <Input
                      id="borrower_name"
                      {...register("borrower_name")}
                      placeholder="Enter borrower name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lender_name">Lender Name</Label>
                    <Input
                      id="lender_name"
                      {...register("lender_name")}
                      placeholder="Enter lender name"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Additional Information
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose</Label>
                  <Textarea
                    id="purpose"
                    {...register("purpose")}
                    placeholder="Describe the purpose of the loan"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="collateral">Collateral</Label>
                  <Textarea
                    id="collateral"
                    {...register("collateral")}
                    placeholder="Describe any collateral"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additional_terms">Additional Terms</Label>
                  <Textarea
                    id="additional_terms"
                    {...register("additional_terms")}
                    placeholder="Any additional terms or conditions"
                    rows={3}
                  />
                </div>
              </div>

              <Separator />

              {/* Document Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Document Content</Label>
                <Textarea
                  id="content"
                  {...register("content")}
                  placeholder="Enter document content (Markdown supported)"
                  rows={20}
                  className="font-mono text-sm"
                />
                {errors.content && (
                  <p className="text-sm text-destructive">
                    {errors.content.message}
                  </p>
                )}
              </div>
            </form>
          ) : (
            /* Preview Mode */
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-bold">{watchedTitle}</h2>
                <Badge variant="outline" className="capitalize">
                  {watch("document_type").replace("_", " ")}
                </Badge>
              </div>

              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {watchedContent}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
