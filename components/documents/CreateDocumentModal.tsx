"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  WideModal,
  WideModalContent,
  WideModalTitle,
} from "@/components/ui/WideModal";
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
import { Loader2, FileText, Save, Eye, Edit3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCreateDocument } from "@/hooks/useDocuments";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { toast } from "sonner";

// Form validation schema
const createDocumentSchema = z.object({
  title: z.string().min(1, "Document title is required"),
  documentType: z.string().min(1, "Document type is required"),
  loanAmount: z.number().min(1000, "Minimum loan amount is $1,000").optional(),
  interestRate: z
    .number()
    .min(0.1)
    .max(50, "Interest rate must be between 0.1% and 50%")
    .optional(),
  term: z
    .number()
    .min(1)
    .max(360, "Term must be between 1 and 360 months")
    .optional(),
  borrowerName: z.string().optional(),
  lenderName: z.string().optional(),
  content: z.string().min(1, "Document content is required"),
});

type CreateDocumentFormData = z.infer<typeof createDocumentSchema>;

interface CreateDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (documentId: string) => void;
}

const DOCUMENT_TYPES = [
  {
    value: "loan_agreement",
    label: "Loan Agreement",
    description: "Comprehensive loan contract",
  },
  {
    value: "term_sheet",
    label: "Term Sheet",
    description: "Summary of key loan terms",
  },
  {
    value: "credit_agreement",
    label: "Credit Agreement",
    description: "Credit facility documentation",
  },
  {
    value: "promissory_note",
    label: "Promissory Note",
    description: "Simple loan promise to pay",
  },
  {
    value: "security_agreement",
    label: "Security Agreement",
    description: "Collateral security document",
  },
  {
    value: "other",
    label: "Other",
    description: "Custom document type",
  },
];

export function CreateDocumentModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateDocumentModalProps) {
  const { auth } = useAuth();
  const createDocumentMutation = useCreateDocument();
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<CreateDocumentFormData>({
    resolver: zodResolver(createDocumentSchema),
    defaultValues: {
      title: "",
      documentType: "",
      loanAmount: undefined,
      interestRate: undefined,
      term: undefined,
      borrowerName: "",
      lenderName: "",
      content: "",
    },
  });

  const watchedValues = watch();

  const onSubmit = async (data: CreateDocumentFormData) => {
    if (!auth.user) {
      toast.error("User not authenticated");
      return;
    }

    createDocumentMutation.mutate(
      {
        title: data.title,
        document_type: data.documentType,
        content: data.content,
        loan_amount: data.loanAmount || undefined,
        interest_rate: data.interestRate || undefined,
        term_months: data.term || undefined,
        borrower_name: data.borrowerName || undefined,
        lender_name: data.lenderName || undefined,
      },
      {
        onSuccess: (document) => {
          toast.success("Document created successfully!");
          onSuccess?.(document.id);
          handleClose();
        },
        onError: (error) => {
          console.error("Create document error:", error);
          toast.error("Failed to create document");
        },
      }
    );
  };

  const handleClose = () => {
    if (!createDocumentMutation.isPending) {
      reset();
      setIsPreviewMode(false);
      onOpenChange(false);
    }
  };

  return (
    <WideModal open={open} onOpenChange={handleClose}>
      <WideModalContent className="overflow-hidden" showCloseButton={true}>
        <WideModalTitle className="sr-only">Create New Document</WideModalTitle>

        <div className="flex w-full h-full bg-background rounded-lg shadow-2xl border">
          {/* Left Sidebar - Form */}
          <div className="w-96 bg-card border-r flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    Create Document
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Manual document creation
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Document Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Document Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter document title"
                    {...register("title")}
                    className="h-10"
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                {/* Document Type */}
                <div className="space-y-2">
                  <Label>Document Type *</Label>
                  <Select
                    value={watchedValues.documentType}
                    onValueChange={(value) => setValue("documentType", value)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{type.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {type.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.documentType && (
                    <p className="text-sm text-destructive">
                      {errors.documentType.message}
                    </p>
                  )}
                </div>

                {/* Optional Loan Details */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="loanAmount">Loan Amount ($)</Label>
                    <Input
                      id="loanAmount"
                      type="number"
                      placeholder="100000"
                      {...register("loanAmount", { valueAsNumber: true })}
                      className="h-10"
                    />
                    {errors.loanAmount && (
                      <p className="text-sm text-destructive">
                        {errors.loanAmount.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interestRate">Interest Rate (%)</Label>
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.1"
                      placeholder="5.0"
                      {...register("interestRate", { valueAsNumber: true })}
                      className="h-10"
                    />
                    {errors.interestRate && (
                      <p className="text-sm text-destructive">
                        {errors.interestRate.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="term">Term (months)</Label>
                    <Input
                      id="term"
                      type="number"
                      placeholder="60"
                      {...register("term", { valueAsNumber: true })}
                      className="h-10"
                    />
                    {errors.term && (
                      <p className="text-sm text-destructive">
                        {errors.term.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="borrowerName">Borrower Name</Label>
                    <Input
                      id="borrowerName"
                      placeholder="Borrower name"
                      {...register("borrowerName")}
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lenderName">Lender Name</Label>
                    <Input
                      id="lenderName"
                      placeholder="Lender name"
                      {...register("lenderName")}
                      className="h-10"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t border-border">
              <div className="flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={createDocumentMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  onClick={handleSubmit(onSubmit)}
                  disabled={
                    createDocumentMutation.isPending ||
                    !watchedValues.title ||
                    !watchedValues.documentType ||
                    !watchedValues.content
                  }
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {createDocumentMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Document
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Side - Content Editor/Preview */}
          <div className="flex-1 flex flex-col bg-muted/30">
            {/* Editor Header */}
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Document Content</h2>
                  <p className="text-sm text-muted-foreground">
                    {isPreviewMode
                      ? "Preview your markdown content"
                      : "Write your document content in markdown"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={!isPreviewMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsPreviewMode(false)}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant={isPreviewMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsPreviewMode(true)}
                    disabled={!watchedValues.content}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 overflow-y-auto">
              {!isPreviewMode ? (
                <div className="h-full">
                  <Textarea
                    placeholder="Enter your document content here using markdown formatting...

Example:
# Loan Agreement

## Terms and Conditions

- **Loan Amount**: $100,000
- **Interest Rate**: 5.0% per annum
- **Term**: 60 months

### Payment Schedule

Monthly payments of $1,887.12 are due on the 1st of each month..."
                    {...register("content")}
                    className="min-h-full resize-none border-0 bg-transparent text-sm font-mono focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  {errors.content && (
                    <p className="text-sm text-destructive mt-2">
                      {errors.content.message}
                    </p>
                  )}
                </div>
              ) : (
                <div className="h-full">
                  {watchedValues.content ? (
                    <div className="bg-card p-6 rounded-lg border h-full overflow-y-auto">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw]}
                        >
                          {watchedValues.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No content to preview</p>
                        <p className="text-sm">
                          Start writing in the editor to see a preview
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </WideModalContent>
    </WideModal>
  );
}
