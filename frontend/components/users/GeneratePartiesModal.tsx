"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  WideModal,
  WideModalContent,
  WideModalTitle,
} from "@/components/ui/WideModal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";
import {
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  X,
  Users,
  Loader2,
} from "lucide-react";
import { IdCard } from "@/components/icons";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import type { UserData } from "@/types/api";

interface GeneratePartiesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: UserData[];
  onComplete: () => void;
  title?: string;
  partyStatusData?: Array<{
    userId: string;
    status: "valid" | "invalid" | "no_party";
  }>;
}

interface UserProgress {
  user: UserData;
  status: "pending" | "processing" | "success" | "failed";
  newParty?: string;
  error?: string;
}

export function GeneratePartiesModal({
  open,
  onOpenChange,
  users,
  onComplete,
  title = "Generate DAML Parties",
  partyStatusData = [],
}: GeneratePartiesModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSyncedParties, setShowSyncedParties] = useState(false);
  const [summary, setSummary] = useState<{
    total: number;
    successful: number;
    failed: number;
    skipped: number;
  } | null>(null);

  // Filter users based on sync status
  const filteredUsers = showSyncedParties
    ? users
    : users.filter((user) => {
        const userStatus = partyStatusData.find((p) => p.userId === user.id);
        return userStatus?.status !== "valid";
      });

  // Initialize progress when modal opens or filter changes
  useEffect(() => {
    if (open && !isProcessing) {
      const usersToProcess = showSyncedParties
        ? users
        : users.filter((user) => {
            const userStatus = partyStatusData.find(
              (p) => p.userId === user.id
            );
            return userStatus?.status !== "valid";
          });

      setUserProgress(
        usersToProcess.map((user) => ({
          user,
          status: "pending",
        }))
      );
      setCurrentIndex(0);
      setSummary(null);
    }
  }, [open, showSyncedParties, users, partyStatusData, isProcessing]);

  const processNextUser = async (index: number) => {
    if (index >= userProgress.length) {
      // All users processed - use a callback to get the latest state
      setIsProcessing(false);

      setUserProgress((currentProgress) => {
        const successful = currentProgress.filter(
          (p) => p.status === "success"
        ).length;
        const failed = currentProgress.filter(
          (p) => p.status === "failed"
        ).length;
        const skipped = currentProgress.filter(
          (p) => p.status === "pending"
        ).length;

        const summaryData = {
          total: filteredUsers.length,
          successful,
          failed,
          skipped,
        };

        setSummary(summaryData);

        toast.success(
          `Party generation completed: ${successful} successful, ${failed} failed`
        );

        return currentProgress; // Return unchanged state
      });

      onComplete();
      return;
    }

    const userToProcess = userProgress[index];

    // Update status to processing
    setUserProgress((prev) =>
      prev.map((p, i) => (i === index ? { ...p, status: "processing" } : p))
    );

    try {
      const result = await authApi.regenerateBulkParties(
        [userToProcess.user.id!],
        true
      );

      if (result.status === 200 && result.data) {
        const { results } = result.data;

        if (results.success.length > 0) {
          const successResult = results.success[0];
          setUserProgress((prev) =>
            prev.map((p, i) =>
              i === index
                ? {
                    ...p,
                    status: "success",
                    newParty: successResult.newParty,
                  }
                : p
            )
          );
        } else if (results.failed.length > 0) {
          const failedResult = results.failed[0];
          setUserProgress((prev) =>
            prev.map((p, i) =>
              i === index
                ? {
                    ...p,
                    status: "failed",
                    error: failedResult.error,
                  }
                : p
            )
          );
        }
      } else {
        throw new Error(result.error || "Failed to regenerate party");
      }
    } catch (error) {
      setUserProgress((prev) =>
        prev.map((p, i) =>
          i === index
            ? {
                ...p,
                status: "failed",
                error: error instanceof Error ? error.message : "Unknown error",
              }
            : p
        )
      );
    }

    // Wait a bit for visual feedback, then process next
    setTimeout(() => {
      setCurrentIndex(index + 1);
      processNextUser(index + 1);
    }, 500);
  };

  const startProcessing = async () => {
    setIsProcessing(true);
    setCurrentIndex(0);
    await processNextUser(0);
  };

  const handleClose = () => {
    if (!isProcessing) {
      onOpenChange(false);
    }
  };

  const progressPercentage =
    userProgress.length > 0
      ? Math.round((currentIndex / userProgress.length) * 100)
      : 0;

  const completedCount = userProgress.filter(
    (p) => p.status === "success" || p.status === "failed"
  ).length;

  return (
    <WideModal open={open} onOpenChange={handleClose}>
      <WideModalContent className="overflow-hidden" showCloseButton={false}>
        <WideModalTitle className="sr-only">{title}</WideModalTitle>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="flex w-full h-full bg-background rounded-lg shadow-2xl border relative"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="absolute top-3 right-3 z-20 p-2 hover:bg-muted/80 rounded-full transition-colors bg-background/80 backdrop-blur-sm border disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Left Sidebar - Progress Overview */}
          <div className="w-80 bg-gradient-to-t from-primary/5 to-card dark:bg-card rounded-xl border shadow-sm flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 ring-2 ring-primary/20">
                  <IdCard
                    size={40}
                    isAnimating={isProcessing}
                    className="text-primary"
                  />
                </div>
                <h1 className="text-xl font-bold text-foreground mb-2">
                  {title}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {filteredUsers.length} user
                  {filteredUsers.length !== 1 ? "s" : ""} to process
                </p>
              </div>
            </div>

            {/* Progress Section */}
            <div className="flex-1 p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {completedCount}/{userProgress.length}
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {progressPercentage}% complete
                  </p>
                </div>

                {summary && (
                  <Alert
                    variant="default"
                    className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="text-green-800 dark:text-green-300">
                      <p className="font-medium text-sm mb-1">
                        Generation Complete
                      </p>
                      <p className="text-xs">
                        {summary.successful} successful, {summary.failed} failed
                      </p>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Show Synced Parties Checkbox */}
                <div className="flex items-center space-x-2 pt-4">
                  <Checkbox
                    id="show-synced"
                    checked={showSyncedParties}
                    onCheckedChange={(checked) =>
                      setShowSyncedParties(checked === true)
                    }
                    disabled={isProcessing}
                  />
                  <Label
                    htmlFor="show-synced"
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    Show Synced Parties
                  </Label>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="p-6 border-t border-border">
              {!isProcessing && !summary ? (
                <Button onClick={startProcessing} className="w-full" size="sm">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Start Generation
                </Button>
              ) : summary ? (
                <Button
                  onClick={handleClose}
                  className="w-full"
                  size="sm"
                  variant="outline"
                >
                  Close
                </Button>
              ) : (
                <Button disabled className="w-full" size="sm">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </Button>
              )}
            </div>
          </div>

          {/* Main Content - User List */}
          <div className="flex-1 overflow-y-auto bg-muted/30 min-w-0">
            <div className="p-8 pt-16 pb-8 h-full min-h-full">
              <div className="space-y-4 max-w-2xl pb-8">
                <div className="flex items-center gap-2 mb-6">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">
                    User Processing Queue
                  </h2>
                </div>

                <div className="space-y-3">
                  {userProgress.map((progress) => (
                    <div
                      key={progress.user.id}
                      className={`p-4 rounded-lg border transition-all ${
                        progress.status === "processing"
                          ? "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                          : progress.status === "success"
                          ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                          : progress.status === "failed"
                          ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800"
                          : "bg-background border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {progress.status === "processing" && (
                              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                            )}
                            {progress.status === "success" && (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            )}
                            {progress.status === "failed" && (
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            )}
                            {progress.status === "pending" && (
                              <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {progress.user.name}
                            </p>
                            <p
                              className="text-xs text-muted-foreground font-mono max-w-[300px]"
                              title={progress.user.damlParty || "No party ID"}
                            >
                              {progress.user.damlParty &&
                              progress.user.damlParty.length > 24
                                ? `${progress.user.damlParty.slice(
                                    0,
                                    34
                                  )}....${progress.user.damlParty.slice(-34)}`
                                : progress.user.damlParty || "No party ID"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              progress.status === "success"
                                ? "default"
                                : progress.status === "failed"
                                ? "destructive"
                                : progress.status === "processing"
                                ? "secondary"
                                : "outline"
                            }
                            className={
                              progress.status === "pending"
                                ? "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-800"
                                : ""
                            }
                          >
                            {progress.status === "pending" && "Waiting"}
                            {progress.status === "processing" && "Processing"}
                            {progress.status === "success" && "Success"}
                            {progress.status === "failed" && "Failed"}
                          </Badge>
                        </div>
                      </div>

                      {progress.status === "success" && progress.newParty && (
                        <div className="mt-2 p-2 bg-muted rounded text-xs font-mono break-all">
                          {progress.newParty}
                        </div>
                      )}

                      {progress.status === "failed" && progress.error && (
                        <div className="mt-2 p-2 bg-red-100 dark:bg-red-950/30 rounded text-xs text-red-800 dark:text-red-300">
                          {progress.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </WideModalContent>
    </WideModal>
  );
}
