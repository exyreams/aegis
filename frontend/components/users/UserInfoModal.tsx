"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  WideModal,
  WideModalContent,
  WideModalTitle,
} from "@/components/ui/WideModal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Label } from "@/components/ui/Label";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import {
  Mail,
  IdCard,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Copy,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { GlassAvatar } from "@/components/ui/GlassAvatar";
import { authApi } from "@/lib/api";
import type { UserData } from "@/types/api";

interface UserInfoModalProps {
  user: UserData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegenerateParty?: () => void;
  onUserUpdate?: (updatedUser: UserData) => void;
}

export function UserInfoModal({
  user,
  open,
  onOpenChange,
  onRegenerateParty,
  onUserUpdate,
}: UserInfoModalProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerateParty = async () => {
    if (!user?.id) return;

    setIsRegenerating(true);
    try {
      // Use the new bulk API for consistency and better error handling
      const result = await authApi.regenerateBulkParties([user.id], true);

      if (result.status === 200 && result.data) {
        const { summary, results } = result.data;

        if (summary.successful > 0) {
          const successResult = results.success[0];
          toast.success(
            user.damlParty
              ? "DAML party regenerated successfully!"
              : "DAML party generated successfully!"
          );

          // Update the user object with new party ID for real-time display
          if (successResult?.newParty && onUserUpdate) {
            const updatedUser = { ...user, damlParty: successResult.newParty };
            onUserUpdate(updatedUser);
          }

          // Trigger parent component refresh
          onRegenerateParty?.();
        } else if (summary.failed > 0) {
          const failedResult = results.failed[0];
          throw new Error(failedResult?.error || "Failed to regenerate party");
        } else if (summary.skipped > 0) {
          const skippedResult = results.skipped[0];
          toast.info(skippedResult?.reason || "Party regeneration was skipped");
        }
      } else {
        throw new Error(result.error || "Failed to regenerate DAML party");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to regenerate DAML party";
      toast.error(errorMessage);
    } finally {
      setIsRegenerating(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    } catch {
      toast.error(`Failed to copy ${label.toLowerCase()}`);
    }
  };

  const handleClose = () => {
    if (!isRegenerating) {
      onOpenChange(false);
    }
  };

  if (!user) return null;

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
        duration: 0.4,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 10,
      transition: { duration: 0.2 },
    },
  };

  return (
    <WideModal open={open} onOpenChange={handleClose}>
      <WideModalContent className="overflow-hidden" showCloseButton={false}>
        <WideModalTitle className="sr-only">
          User Details - {user.name}
        </WideModalTitle>

        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="flex w-full h-full bg-background rounded-lg shadow-2xl border relative"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            disabled={isRegenerating}
            className="absolute top-3 right-3 z-20 p-2 hover:bg-muted/80 rounded-full transition-colors bg-background/80 backdrop-blur-sm border"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Left Sidebar - User Avatar & Basic Info */}
          <div className="w-80 bg-gradient-to-t from-primary/5 to-card dark:bg-card rounded-xl border shadow-sm flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4">
                  <GlassAvatar
                    seed={user.image || user.name || user.email}
                    size={80}
                    className="ring-2 ring-primary/20"
                  />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <h1 className="text-xl font-bold text-foreground">
                    {user.name}
                  </h1>
                  <Badge variant="default" className="text-xs">
                    {user.role}
                  </Badge>
                </div>
                {user.damlParty && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-green-100 text-green-800 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800"
                  >
                    <IdCard className="h-3 w-3 mr-1" />
                    DAML Party Active
                  </Badge>
                )}
              </div>
            </div>

            {/* Lender Profile - Anonymous ID */}
            {user.role === "lender" && user.lenderProfile && (
              <div className="p-6 border-b border-border">
                <div className="space-y-3">
                  <Label className="text-xs text-muted-foreground">
                    Anonymous ID
                  </Label>
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                      {user.lenderProfile.anonymousId}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          user.lenderProfile!.anonymousId,
                          "Anonymous ID"
                        )
                      }
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Category:</span>
                      <div className="font-medium">
                        {user.lenderProfile.categoryTier}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rating:</span>
                      <div className="font-medium">
                        {user.lenderProfile.ratingTier}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Capacity:</span>
                      <div className="font-medium">
                        {user.lenderProfile.capacityTier}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Scope:</span>
                      <div className="font-medium">
                        {user.lenderProfile.geographicScope}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Privacy-protected identifier shown to borrowers
                  </p>
                </div>
              </div>
            )}

            {/* Account Dates */}
            <div className="flex-1 p-6">
              <div className="space-y-4">
                <div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Account Created
                      </Label>
                      <p className="text-sm font-medium">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "Unknown"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Last Updated
                      </Label>
                      <p className="text-sm font-medium">
                        {user.updatedAt
                          ? new Date(user.updatedAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Regenerate Button */}
            <div className="p-6 border-t border-border">
              <Button
                onClick={handleRegenerateParty}
                disabled={isRegenerating}
                className="w-full"
                size="sm"
              >
                {isRegenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {user.damlParty ? "Regenerating..." : "Generating..."}
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {user.damlParty
                      ? "Regenerate Party ID"
                      : "Generate Party ID"}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto bg-muted/30 min-w-0">
            <div className="p-8 pt-16 h-full min-h-full">
              <div className="space-y-8">
                {/* Account Information */}
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-6">
                    Account Information
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Email Address
                      </Label>
                      <Alert variant="default">
                        <Mail className="h-4 w-4" />
                        <AlertDescription>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-sm">
                              {user.email}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(user.email, "Email")
                              }
                              className="h-6 w-6 p-0 ml-2"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                        User ID
                      </Label>
                      <Alert variant="default">
                        <IdCard className="h-4 w-4" />
                        <AlertDescription>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-sm">{user.id}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(user.id || "", "User ID")
                              }
                              className="h-6 w-6 p-0 ml-2"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                </div>

                {/* DAML Integration */}
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-6">
                    DAML Integration
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                        DAML Party ID
                      </Label>
                      {user.damlParty ? (
                        <Alert variant="default">
                          <CheckCircle2 className="h-4 w-4" />
                          <AlertDescription>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-sm">
                                  Active DAML Party
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    copyToClipboard(
                                      user.damlParty!,
                                      "DAML Party ID"
                                    )
                                  }
                                  className="h-6 w-6 p-0"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                              <code className="text-xs font-mono break-all block p-2 bg-muted rounded">
                                {user.damlParty}
                              </code>
                              <p className="text-xs">
                                This user can participate in DAML contract
                                operations
                              </p>
                            </div>
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert variant="default">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <div className="space-y-1">
                              <p className="font-medium text-sm">
                                No DAML Party ID
                              </p>
                              <p className="text-sm">
                                This user needs a DAML party ID to participate
                                in contract operations. Click the &quot;Generate
                                Party ID&quot; button to create one.
                              </p>
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    {/* Lender Profile Information */}
                    {user.role === "lender" && user.lenderProfile && (
                      <div className="pb-6">
                        <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                          Lender Profile
                        </Label>
                        <Alert variant="default">
                          <IdCard className="h-4 w-4" />
                          <AlertDescription>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-sm">
                                  Anonymous ID
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    copyToClipboard(
                                      user.lenderProfile!.anonymousId,
                                      "Anonymous ID"
                                    )
                                  }
                                  className="h-6 w-6 p-0"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                              <code className="text-sm font-mono font-bold block p-2 bg-primary/10 text-primary rounded">
                                {user.lenderProfile.anonymousId}
                              </code>

                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">
                                    Category:
                                  </span>
                                  <div className="font-medium">
                                    {user.lenderProfile.categoryTier}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Rating:
                                  </span>
                                  <div className="font-medium">
                                    {user.lenderProfile.ratingTier}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Capacity:
                                  </span>
                                  <div className="font-medium">
                                    {user.lenderProfile.capacityTier}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Scope:
                                  </span>
                                  <div className="font-medium">
                                    {user.lenderProfile.geographicScope}
                                  </div>
                                </div>
                              </div>

                              <p className="text-xs text-muted-foreground">
                                This anonymous ID is shown to borrowers for
                                privacy protection. Real identity remains
                                confidential.
                              </p>
                            </div>
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </WideModalContent>
    </WideModal>
  );
}
