"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Progress } from "@/components/ui/Progress";
import {
  Loader2,
  ArrowLeft,
  X,
  Download,
  Copy,
  Sparkles,
  Zap,
  Save,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { documentService } from "@/lib/documents";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { toast } from "sonner";

// Form validation schema
const generateDocumentSchema = z.object({
  documentType: z.string().min(1, "Document type is required"),
  loanAmount: z.number().min(1000, "Minimum loan amount is $1,000"),
  interestRate: z
    .number()
    .min(0.1)
    .max(50, "Interest rate must be between 0.1% and 50%"),
  term: z.number().min(1).max(360, "Term must be between 1 and 360 months"),
  borrowerName: z.string().min(1, "Borrower name is required"),
  lenderName: z.string().min(1, "Lender name is required"),
  collateral: z.string().optional(),
  purpose: z.string().optional(),
  additionalTerms: z.string().optional(),
});

type GenerateDocumentFormData = z.infer<typeof generateDocumentSchema>;

interface GenerateDocumentModalProps {
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
];

export function GenerateDocumentModal({
  open,
  onOpenChange,
  onSuccess,
}: GenerateDocumentModalProps) {
  const { auth } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedDocument, setGeneratedDocument] = useState<string>("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<GenerateDocumentFormData>({
    resolver: zodResolver(generateDocumentSchema),
    defaultValues: {
      documentType: "",
      loanAmount: 100000,
      interestRate: 5.0,
      term: 60,
      borrowerName: "",
      lenderName: "",
      collateral: "",
      purpose: "",
      additionalTerms: "",
    },
  });

  const watchedValues = watch();

  const generateDocument = async (data: GenerateDocumentFormData) => {
    setIsGenerating(true);
    setCurrentStep(2);
    setGenerationProgress(0);

    try {
      const response = await fetch("/api/generate-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // If API key not configured, show error
        if (errorData.error?.includes("API key not configured")) {
          toast.error(
            "Cerebras API key not configured. Please configure the API key."
          );
          setCurrentStep(1);
          return;
        }

        throw new Error(errorData.error || "Failed to generate document");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      let fullDocument = "";
      let progress = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              setGenerationProgress(100);
              setCurrentStep(3);
              break;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullDocument += parsed.content;
                setGeneratedDocument(fullDocument);

                // Update progress (estimate based on content length)
                progress = Math.min(95, (fullDocument.length / 5000) * 100);
                setGenerationProgress(progress);
              }
            } catch (e) {
              // Ignore parsing errors for partial chunks
            }
          }
        }
      }

      toast.success("Document generated successfully!");
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate document");
      setCurrentStep(1);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveDocument = async () => {
    if (!generatedDocument || !auth.user) {
      toast.error("No document to save or user not authenticated");
      return;
    }

    setIsSaving(true);

    try {
      const documentTitle = `${
        DOCUMENT_TYPES.find((t) => t.value === watchedValues.documentType)
          ?.label || "Document"
      } - ${watchedValues.borrowerName}`;

      const document = await documentService.createDocument({
        title: documentTitle,
        document_type: watchedValues.documentType,
        content: generatedDocument,
        loan_amount: watchedValues.loanAmount,
        interest_rate: watchedValues.interestRate,
        term_months: watchedValues.term,
        borrower_name: watchedValues.borrowerName,
        lender_name: watchedValues.lenderName,
        collateral: watchedValues.collateral,
        purpose: watchedValues.purpose,
        additional_terms: watchedValues.additionalTerms,
      });

      toast.success("Document saved successfully!");
      onSuccess?.(document.id);
      handleClose();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save document");
    } finally {
      setIsSaving(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1 && !isGenerating) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: GenerateDocumentFormData) => {
    await generateDocument(data);
  };

  const handleClose = () => {
    if (!isGenerating && !isSaving) {
      reset();
      setCurrentStep(1);
      setGeneratedDocument("");
      setGenerationProgress(0);
      onOpenChange(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedDocument);
    toast.success("Document copied to clipboard!");
  };

  const downloadDocument = () => {
    const blob = new Blob([generatedDocument], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${watchedValues.documentType || "document"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Document downloaded!");
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  const stepTitles = ["Document Details", "AI Generation", "Review Document"];

  const stepDescriptions = [
    "Enter loan terms and document requirements",
    "AI is generating your professional loan document",
    "Review and save the generated document",
  ];

  return (
    <WideModal open={open} onOpenChange={handleClose}>
      <WideModalContent className="overflow-hidden" showCloseButton={false}>
        <WideModalTitle className="sr-only">
          Generate Document - Step {currentStep} of 3:{" "}
          {stepTitles[currentStep - 1]}
        </WideModalTitle>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="flex w-full h-full bg-background rounded-lg shadow-2xl border relative"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            disabled={isGenerating || isSaving}
            className="absolute top-3 right-3 z-20 p-2 hover:bg-muted/80 rounded-full transition-colors bg-background/80 backdrop-blur-sm border"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Left Sidebar - Progress */}
          <div className="w-80 bg-gradient-to-t from-primary/5 to-card dark:bg-card rounded-xl border shadow-sm flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Sparkles size={24} className="text-foreground" />
                <div>
                  <h1 className="text-lg font-bold text-foreground">
                    AI Document Generator
                  </h1>
                  <p className="text-muted-foreground text-xs">
                    Powered by Cerebras AI
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="flex-1 p-4">
              <div className="space-y-4">
                {stepTitles.map((title, index) => {
                  const stepNumber = index + 1;
                  const isActive = stepNumber === currentStep;
                  const isCompleted = stepNumber < currentStep;

                  return (
                    <motion.div
                      key={stepNumber}
                      className={`flex items-start gap-3 ${
                        isActive
                          ? "opacity-100"
                          : isCompleted
                          ? "opacity-80"
                          : "opacity-50"
                      }`}
                      animate={{
                        scale: isActive ? 1.02 : 1,
                      }}
                    >
                      <div
                        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCompleted
                            ? "bg-primary text-primary-foreground"
                            : isActive
                            ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? "✓" : stepNumber}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-medium text-sm ${
                            isActive
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {title}
                        </h3>
                        <p className="text-xs text-muted-foreground/80 mt-0.5 line-clamp-2">
                          {stepDescriptions[index]}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">
                    Progress
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    {Math.round((currentStep / 3) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <motion.div
                    className="bg-primary h-1.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / 3) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="p-4 border-t border-border/30">
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1 || isGenerating || isSaving}
                  variant="ghost"
                  size="sm"
                  className="disabled:opacity-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                {currentStep === 1 ? (
                  <Button
                    type="button"
                    onClick={handleSubmit(onSubmit)}
                    disabled={
                      !watchedValues.documentType ||
                      !watchedValues.borrowerName ||
                      !watchedValues.lenderName
                    }
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Zap className="h-4 w-4 mr-1" />
                    Generate
                  </Button>
                ) : currentStep === 3 ? (
                  <Button
                    type="button"
                    onClick={saveDocument}
                    disabled={isSaving}
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-1" />
                    )}
                    Save Document
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto bg-muted/30 min-w-0">
            <div className="p-8 pt-16 h-full min-h-full">
              <form onSubmit={handleSubmit(onSubmit)}>
                <AnimatePresence mode="wait">
                  {/* Step 1: Document Configuration */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      variants={stepVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-6"
                    >
                      <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-foreground mb-2">
                          Configure Document
                        </h2>
                        <p className="text-muted-foreground">
                          Enter the loan details to generate a professional
                          document
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        {/* Document Type */}
                        <div className="col-span-2">
                          <Label>Document Type</Label>
                          <Select
                            value={watchedValues.documentType}
                            onValueChange={(value) =>
                              setValue("documentType", value)
                            }
                          >
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select document type" />
                            </SelectTrigger>
                            <SelectContent>
                              {DOCUMENT_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  <div className="flex flex-col items-start">
                                    <span className="font-medium">
                                      {type.label}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {type.description}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.documentType && (
                            <p className="text-sm text-destructive mt-1">
                              {errors.documentType.message}
                            </p>
                          )}
                        </div>

                        {/* Loan Amount */}
                        <div>
                          <Label htmlFor="loanAmount">Loan Amount ($)</Label>
                          <Input
                            id="loanAmount"
                            type="number"
                            placeholder="100000"
                            {...register("loanAmount", { valueAsNumber: true })}
                            className="h-10"
                          />
                          {errors.loanAmount && (
                            <p className="text-sm text-destructive mt-1">
                              {errors.loanAmount.message}
                            </p>
                          )}
                        </div>

                        {/* Interest Rate */}
                        <div>
                          <Label htmlFor="interestRate">
                            Interest Rate (%)
                          </Label>
                          <Input
                            id="interestRate"
                            type="number"
                            step="0.1"
                            placeholder="5.0"
                            {...register("interestRate", {
                              valueAsNumber: true,
                            })}
                            className="h-10"
                          />
                          {errors.interestRate && (
                            <p className="text-sm text-destructive mt-1">
                              {errors.interestRate.message}
                            </p>
                          )}
                        </div>

                        {/* Term */}
                        <div>
                          <Label htmlFor="term">Term (months)</Label>
                          <Input
                            id="term"
                            type="number"
                            placeholder="60"
                            {...register("term", { valueAsNumber: true })}
                            className="h-10"
                          />
                          {errors.term && (
                            <p className="text-sm text-destructive mt-1">
                              {errors.term.message}
                            </p>
                          )}
                        </div>

                        {/* Borrower Name */}
                        <div>
                          <Label htmlFor="borrowerName">Borrower Name</Label>
                          <Input
                            id="borrowerName"
                            placeholder="Acme Corporation"
                            {...register("borrowerName")}
                            className="h-10"
                          />
                          {errors.borrowerName && (
                            <p className="text-sm text-destructive mt-1">
                              {errors.borrowerName.message}
                            </p>
                          )}
                        </div>

                        {/* Lender Name */}
                        <div>
                          <Label htmlFor="lenderName">Lender Name</Label>
                          <Input
                            id="lenderName"
                            placeholder="First National Bank"
                            {...register("lenderName")}
                            className="h-10"
                          />
                          {errors.lenderName && (
                            <p className="text-sm text-destructive mt-1">
                              {errors.lenderName.message}
                            </p>
                          )}
                        </div>

                        {/* Collateral */}
                        <div className="col-span-2">
                          <Label htmlFor="collateral">
                            Collateral (Optional)
                          </Label>
                          <Input
                            id="collateral"
                            placeholder="Real estate, equipment, inventory..."
                            {...register("collateral")}
                            className="h-10"
                          />
                        </div>

                        {/* Purpose */}
                        <div className="col-span-2">
                          <Label htmlFor="purpose">
                            Loan Purpose (Optional)
                          </Label>
                          <Input
                            id="purpose"
                            placeholder="Working capital, equipment purchase, expansion..."
                            {...register("purpose")}
                            className="h-10"
                          />
                        </div>

                        {/* Additional Terms */}
                        <div className="col-span-2">
                          <Label htmlFor="additionalTerms">
                            Additional Terms (Optional)
                          </Label>
                          <Textarea
                            id="additionalTerms"
                            placeholder="Any specific clauses, covenants, or special conditions..."
                            {...register("additionalTerms")}
                            className="min-h-20"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: AI Generation */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      variants={stepVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-6"
                    >
                      <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-foreground mb-2">
                          AI Generating Document
                        </h2>
                        <p className="text-muted-foreground">
                          Our AI is creating a professional loan document based
                          on your specifications
                        </p>
                      </div>

                      <div className="max-w-md mx-auto space-y-6">
                        <div className="text-center">
                          <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
                          <h3 className="text-lg font-semibold">
                            Generating{" "}
                            {
                              DOCUMENT_TYPES.find(
                                (t) => t.value === watchedValues.documentType
                              )?.label
                            }
                          </h3>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{Math.round(generationProgress)}%</span>
                          </div>
                          <Progress
                            value={generationProgress}
                            className="h-2"
                          />
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                          <p>Creating professional legal document...</p>
                          <p className="mt-2">This may take 1-2 minutes</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Review Document */}
                  {currentStep === 3 && generatedDocument && (
                    <motion.div
                      key="step3"
                      variants={stepVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-6"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-2xl font-bold text-foreground mb-2">
                            Document Generated
                          </h2>
                          <p className="text-muted-foreground">
                            Review your AI-generated document and save it to
                            your library
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={copyToClipboard}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={downloadDocument}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>

                      <div className="bg-card p-6 rounded-lg border max-h-96 overflow-y-auto">
                        <ReactMarkdown
                          className="prose prose-sm max-w-none dark:prose-invert"
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw]}
                        >
                          {generatedDocument}
                        </ReactMarkdown>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>
          </div>
        </motion.div>
      </WideModalContent>
    </WideModal>
  );
}
