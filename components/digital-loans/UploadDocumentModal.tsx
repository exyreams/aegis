"use client";

import { useState, useCallback } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Progress } from "@/components/ui/Progress";
import {
  Upload,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Eye,
  Download,
  Zap,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";

// Form validation schema
const uploadDocumentSchema = z.object({
  documentType: z.string().min(1, "Document type is required"),
  documentName: z.string().min(1, "Document name is required"),
  borrowerName: z.string().optional(),
  lenderName: z.string().optional(),
  extractionMode: z.enum(["basic", "advanced", "full"]),
});

type UploadDocumentFormData = z.infer<typeof uploadDocumentSchema>;

interface UploadDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (extractedData: any) => void;
}

const DOCUMENT_TYPES = [
  {
    value: "loan_agreement",
    label: "Loan Agreement",
    description: "Primary loan contract",
  },
  {
    value: "term_sheet",
    label: "Term Sheet",
    description: "Summary of loan terms",
  },
  {
    value: "credit_agreement",
    label: "Credit Agreement",
    description: "Credit facility terms",
  },
  {
    value: "security_document",
    label: "Security Document",
    description: "Collateral agreements",
  },
  {
    value: "guarantee",
    label: "Guarantee",
    description: "Third-party guarantees",
  },
  {
    value: "amendment",
    label: "Amendment",
    description: "Contract modifications",
  },
];

const EXTRACTION_MODES = [
  {
    value: "basic",
    label: "Basic Extraction",
    description: "Key terms only (amount, rate, term)",
    time: "~30 seconds",
    accuracy: "95%",
  },
  {
    value: "advanced",
    label: "Advanced Extraction",
    description: "Full terms + covenants + parties",
    time: "~2 minutes",
    accuracy: "98%",
  },
  {
    value: "full",
    label: "Full Analysis",
    description: "Complete analysis + risk assessment + ESG",
    time: "~5 minutes",
    accuracy: "99%",
  },
];

export function UploadDocumentModal({
  open,
  onOpenChange,
  onSuccess,
}: UploadDocumentModalProps) {
  const { auth } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<any>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<UploadDocumentFormData>({
    resolver: zodResolver(uploadDocumentSchema),
    defaultValues: {
      documentType: "",
      documentName: "",
      borrowerName: "",
      lenderName: "",
      extractionMode: "advanced",
    },
  });

  const watchedValues = watch();

  // File upload handling
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setUploadedFile(file);
        setValue("documentName", file.name.replace(/\.[^/.]+$/, ""));
        toast.success(`File "${file.name}" uploaded successfully`);
      }
    },
    [setValue]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  // Simulate AI extraction process
  const simulateExtraction = async (mode: string) => {
    const steps = mode === "basic" ? 3 : mode === "advanced" ? 6 : 10;
    const stepTime =
      mode === "basic" ? 10000 : mode === "advanced" ? 20000 : 30000;

    for (let i = 0; i <= steps; i++) {
      await new Promise((resolve) => setTimeout(resolve, stepTime / steps));
      setExtractionProgress((i / steps) * 100);
    }

    // Mock extracted data
    const mockData = {
      loanAmount: 5000000,
      interestRate: 4.25,
      term: 60,
      borrower: "Acme Corporation Ltd",
      lender: "First National Bank",
      currency: "USD",
      covenants:
        mode !== "basic"
          ? [
              {
                type: "financial",
                description: "Debt-to-equity ratio < 2.0",
                frequency: "quarterly",
              },
              {
                type: "operational",
                description: "Maintain insurance coverage",
                frequency: "ongoing",
              },
            ]
          : [],
      esgMetrics:
        mode === "full"
          ? [
              {
                category: "environmental",
                metric: "Carbon emissions reduction",
                target: "20% by 2025",
              },
              {
                category: "social",
                metric: "Employee diversity",
                target: "40% women in leadership",
              },
            ]
          : [],
      riskScore: mode === "full" ? 7.2 : null,
      confidence: mode === "basic" ? 95 : mode === "advanced" ? 98 : 99,
    };

    setExtractedData(mockData);
  };

  const nextStep = () => {
    console.log("Current step:", currentStep);
    console.log("Watched values:", watchedValues);
    console.log("Uploaded file:", uploadedFile);

    if (currentStep === 1) {
      if (!uploadedFile) {
        toast.error("Please upload a document first");
        return;
      }
      // Document name is optional for step 1, can be set automatically
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: UploadDocumentFormData) => {
    if (!uploadedFile) {
      toast.error("No file uploaded");
      return;
    }

    setIsProcessing(true);
    setCurrentStep(3); // Move to processing step

    try {
      await simulateExtraction(data.extractionMode);
      setCurrentStep(4); // Move to results step
      toast.success("Document processed successfully!");
    } catch (error) {
      toast.error("Failed to process document");
      setCurrentStep(2); // Go back to form
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      reset();
      setCurrentStep(1);
      setUploadedFile(null);
      setExtractedData(null);
      setExtractionProgress(0);
      onOpenChange(false);
    }
  };

  const handleSaveResults = () => {
    if (extractedData) {
      onSuccess?.(extractedData);
      handleClose();
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  const stepTitles = [
    "Upload Document",
    "Configure Extraction",
    "AI Processing",
    "Review Results",
  ];

  const stepDescriptions = [
    "Upload your loan document for AI analysis",
    "Set document type and extraction preferences",
    "AI is extracting structured data from your document",
    "Review and verify the extracted loan data",
  ];

  return (
    <WideModal open={open} onOpenChange={handleClose}>
      <WideModalContent className="overflow-hidden" showCloseButton={false}>
        <WideModalTitle className="sr-only">
          Upload Document - Step {currentStep} of 4:{" "}
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
            disabled={isProcessing}
            className="absolute top-3 right-3 z-20 p-2 hover:bg-muted/80 rounded-full transition-colors bg-background/80 backdrop-blur-sm border"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Left Sidebar - Progress */}
          <div className="w-80 bg-gradient-to-t from-primary/5 to-card dark:bg-card rounded-xl border shadow-sm flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Upload size={24} className="text-foreground" />
                <div>
                  <h1 className="text-lg font-bold text-foreground">
                    Document Upload
                  </h1>
                  <p className="text-muted-foreground text-xs">
                    AI-Powered Analysis
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
                    {Math.round((currentStep / 4) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <motion.div
                    className="bg-primary h-1.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / 4) * 100}%` }}
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
                  disabled={currentStep === 1 || isProcessing}
                  variant="ghost"
                  size="sm"
                  className="disabled:opacity-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={
                      currentStep === 2 ? handleSubmit(onSubmit) : nextStep
                    }
                    disabled={
                      (currentStep === 1 && !uploadedFile) ||
                      (currentStep === 2 &&
                        (!watchedValues.documentType ||
                          !watchedValues.extractionMode))
                    }
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {currentStep === 2 ? (
                      <>
                        <Zap className="h-4 w-4 mr-1" />
                        Process
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                ) : currentStep === 4 ? (
                  <Button
                    type="button"
                    onClick={handleSaveResults}
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Save Results
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
                  {/* Step 1: File Upload */}
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
                          Upload Loan Document
                        </h2>
                        <p className="text-muted-foreground">
                          Upload a PDF or Word document for AI analysis
                        </p>
                      </div>

                      {/* File Upload Area */}
                      <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                          isDragActive
                            ? "border-primary bg-primary/5"
                            : uploadedFile
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        }`}
                      >
                        <input {...getInputProps()} />
                        <div className="space-y-4">
                          {uploadedFile ? (
                            <>
                              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                              <div>
                                <h3 className="text-lg font-semibold text-foreground">
                                  File Uploaded Successfully
                                </h3>
                                <p className="text-muted-foreground">
                                  {uploadedFile.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {(uploadedFile.size / 1024 / 1024).toFixed(2)}{" "}
                                  MB
                                </p>
                              </div>
                            </>
                          ) : (
                            <>
                              <Upload className="h-16 w-16 text-muted-foreground mx-auto" />
                              <div>
                                <h3 className="text-lg font-semibold text-foreground">
                                  {isDragActive
                                    ? "Drop your document here"
                                    : "Drag & drop your document"}
                                </h3>
                                <p className="text-muted-foreground">
                                  or click to browse files
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                  Supports PDF, DOC, DOCX (max 50MB)
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {uploadedFile && (
                        <div className="space-y-4">
                          <Label htmlFor="documentName">Document Name</Label>
                          <Input
                            id="documentName"
                            placeholder="Enter document name"
                            {...register("documentName")}
                            className="h-10"
                          />
                          {errors.documentName && (
                            <p className="text-sm text-destructive">
                              {errors.documentName.message}
                            </p>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 2: Configuration */}
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
                          Configure Extraction
                        </h2>
                        <p className="text-muted-foreground">
                          Set document type and AI analysis preferences
                        </p>
                      </div>

                      {/* Document Type */}
                      <div className="space-y-4">
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
                          <p className="text-sm text-destructive">
                            {errors.documentType.message}
                          </p>
                        )}
                      </div>

                      {/* Extraction Mode */}
                      <div className="space-y-4">
                        <Label>AI Extraction Mode</Label>
                        <div className="grid gap-4">
                          {EXTRACTION_MODES.map((mode) => (
                            <div
                              key={mode.value}
                              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                watchedValues.extractionMode === mode.value
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/30"
                              }`}
                              onClick={() =>
                                setValue("extractionMode", mode.value as any)
                              }
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-semibold">
                                    {mode.label}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {mode.description}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <Badge variant="outline">{mode.time}</Badge>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {mode.accuracy} accuracy
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Optional Fields */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="borrowerName">
                            Borrower Name (Optional)
                          </Label>
                          <Input
                            id="borrowerName"
                            placeholder="e.g., Acme Corp"
                            {...register("borrowerName")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lenderName">
                            Lender Name (Optional)
                          </Label>
                          <Input
                            id="lenderName"
                            placeholder="e.g., First Bank"
                            {...register("lenderName")}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Processing */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      variants={stepVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-6"
                    >
                      <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-foreground mb-2">
                          AI Processing Document
                        </h2>
                        <p className="text-muted-foreground">
                          Our AI is analyzing your document and extracting
                          structured data
                        </p>
                      </div>

                      <div className="max-w-md mx-auto space-y-6">
                        <div className="text-center">
                          <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
                          <h3 className="text-lg font-semibold">
                            Processing {uploadedFile?.name}
                          </h3>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{Math.round(extractionProgress)}%</span>
                          </div>
                          <Progress
                            value={extractionProgress}
                            className="h-2"
                          />
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                          <p>
                            Extracting loan terms, parties, and covenants...
                          </p>
                          <p className="mt-2">This may take a few minutes</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Results */}
                  {currentStep === 4 && extractedData && (
                    <motion.div
                      key="step4"
                      variants={stepVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-6"
                    >
                      <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-foreground mb-2">
                          Extraction Complete
                        </h2>
                        <p className="text-muted-foreground">
                          Review the extracted data and make any necessary
                          corrections
                        </p>
                      </div>

                      <div className="grid gap-6">
                        {/* Key Terms */}
                        <div className="bg-card p-6 rounded-lg border">
                          <h3 className="text-lg font-semibold mb-4">
                            Key Loan Terms
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-muted-foreground">
                                Loan Amount
                              </Label>
                              <p className="text-xl font-bold">
                                ${extractedData.loanAmount?.toLocaleString()}{" "}
                                {extractedData.currency}
                              </p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">
                                Interest Rate
                              </Label>
                              <p className="text-xl font-bold">
                                {extractedData.interestRate}%
                              </p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">
                                Term
                              </Label>
                              <p className="text-xl font-bold">
                                {extractedData.term} months
                              </p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">
                                Confidence
                              </Label>
                              <p className="text-xl font-bold text-green-600">
                                {extractedData.confidence}%
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Parties */}
                        <div className="bg-card p-6 rounded-lg border">
                          <h3 className="text-lg font-semibold mb-4">
                            Parties
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-muted-foreground">
                                Borrower
                              </Label>
                              <p className="font-medium">
                                {extractedData.borrower}
                              </p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">
                                Lender
                              </Label>
                              <p className="font-medium">
                                {extractedData.lender}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Covenants */}
                        {extractedData.covenants?.length > 0 && (
                          <div className="bg-card p-6 rounded-lg border">
                            <h3 className="text-lg font-semibold mb-4">
                              Covenants
                            </h3>
                            <div className="space-y-3">
                              {extractedData.covenants.map(
                                (covenant: any, index: number) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-muted rounded"
                                  >
                                    <div>
                                      <p className="font-medium">
                                        {covenant.description}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {covenant.type} • {covenant.frequency}
                                      </p>
                                    </div>
                                    <Badge variant="outline">
                                      {covenant.type}
                                    </Badge>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {/* ESG Metrics */}
                        {extractedData.esgMetrics?.length > 0 && (
                          <div className="bg-card p-6 rounded-lg border">
                            <h3 className="text-lg font-semibold mb-4">
                              ESG Metrics
                            </h3>
                            <div className="space-y-3">
                              {extractedData.esgMetrics.map(
                                (metric: any, index: number) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-muted rounded"
                                  >
                                    <div>
                                      <p className="font-medium">
                                        {metric.metric}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        Target: {metric.target}
                                      </p>
                                    </div>
                                    <Badge variant="outline">
                                      {metric.category}
                                    </Badge>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
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
