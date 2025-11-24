"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
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
import { GlassAvatar } from "@/components/ui/GlassAvatar";
import {
  Loader2,
  Building,
  AlertCircle,
  Save,
  X,
  Edit3,
  IdCard,
} from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import type { UserData } from "@/types/api";

const editUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "borrower", "lender"], {
    message: "Role is required",
  }),
  // Lender profile fields (optional)
  lenderCategoryTier: z.string().optional(),
  lenderRatingTier: z.string().optional(),
  lenderInternalRating: z.string().optional(),
  lenderCapacityTier: z.string().optional(),
  lenderGeographicScope: z.string().optional(),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

interface EditUserInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserData | null;
  onSuccess: () => void;
}

export function EditUserInfoModal({
  open,
  onOpenChange,
  user,
  onSuccess,
}: EditUserInfoModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
  });

  const watchedRole = watch("role");
  const isLender = watchedRole === "lender";

  // Populate form when user changes
  useEffect(() => {
    if (user && open) {
      reset({
        name: user.name || "",
        email: user.email || "",
        role: user.role as "admin" | "borrower" | "lender",
        lenderCategoryTier: user.lenderProfile?.categoryTier || undefined,
        lenderRatingTier: user.lenderProfile?.ratingTier || undefined,
        lenderInternalRating: user.lenderProfile?.internalRating || undefined,
        lenderCapacityTier: user.lenderProfile?.capacityTier || undefined,
        lenderGeographicScope: user.lenderProfile?.geographicScope || undefined,
      });
    }
  }, [user, open, reset]);

  const onSubmit = async (data: EditUserFormData) => {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      // Prepare update data
      const updateData: {
        name: string;
        email: string;
        role: string;
        lenderProfile?: {
          categoryTier?: string;
          ratingTier?: string;
          internalRating?: string;
          capacityTier?: string;
          geographicScope?: string;
        };
      } = {
        name: data.name,
        email: data.email,
        role: data.role,
      };

      // Add lender profile data if user is a lender
      if (data.role === "lender") {
        updateData.lenderProfile = {
          categoryTier: data.lenderCategoryTier || undefined,
          ratingTier: data.lenderRatingTier || undefined,
          internalRating: data.lenderInternalRating || undefined,
          capacityTier: data.lenderCapacityTier || undefined,
          geographicScope: data.lenderGeographicScope || undefined,
        };
      }

      const result = await authApi.updateUser(user.id, updateData);

      if (result.status === 200) {
        toast.success("User updated successfully!");
        onSuccess();
        onOpenChange(false);
      } else {
        setError(result.error || "Failed to update user");
        toast.error("Failed to update user");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError("");
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
          Edit User Information - {user.name}
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
            disabled={loading}
            className="absolute top-3 right-3 z-20 p-2 hover:bg-muted/80 rounded-full transition-colors bg-background/80 backdrop-blur-sm border"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Left Sidebar - User Info & Preview */}
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
                  <Edit3 className="h-4 w-4 text-primary" />
                  <h1 className="text-lg font-bold text-foreground">
                    Edit User
                  </h1>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-sm font-medium text-muted-foreground">
                    {user.name}
                  </h2>
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

            {/* Account Dates */}
            <div className="p-6">
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Account Created
                  </Label>
                  <p className="text-xs font-medium">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Unknown"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Last Updated
                  </Label>
                  <p className="text-xs font-medium">
                    {user.updatedAt
                      ? new Date(user.updatedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Unknown"}
                  </p>
                </div>
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Action Buttons */}
            <div className="p-6 border-t border-border">
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                  form="edit-user-form"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update User
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content - Edit Form */}
          <div className="flex-1 overflow-y-auto bg-muted/30 min-w-0">
            <form
              id="edit-user-form"
              onSubmit={handleSubmit(onSubmit)}
              className="p-8 pt-16 h-full"
            >
              <div className="space-y-8 pb-6">
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Basic Information Section */}
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-6">
                    Basic Information
                  </h2>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          {...register("name")}
                          disabled={loading}
                          placeholder="Enter full name"
                          className="bg-background"
                        />
                        {errors.name && (
                          <p className="text-sm text-destructive">
                            {errors.name.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          {...register("email")}
                          disabled={loading}
                          placeholder="Enter email address"
                          className="bg-background"
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive">
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-sm font-medium">
                        User Role
                      </Label>
                      <Select
                        value={watchedRole}
                        onValueChange={(value) =>
                          setValue(
                            "role",
                            value as "admin" | "borrower" | "lender"
                          )
                        }
                        disabled={loading}
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="borrower">Borrower</SelectItem>
                          <SelectItem value="lender">Lender</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.role && (
                        <p className="text-sm text-destructive">
                          {errors.role.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lender Profile Section */}
                {isLender && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 p-4 border border-primary/20 rounded-lg bg-primary/5"
                  >
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-primary" />
                      <Label className="text-sm font-medium text-primary">
                        Lender Profile Settings
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Configure lender profile settings for this user
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="lenderCategoryTier">
                          Category Tier
                        </Label>
                        <Select
                          value={watch("lenderCategoryTier") || undefined}
                          onValueChange={(value) =>
                            setValue("lenderCategoryTier", value)
                          }
                          disabled={loading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Tier1Bank">
                              Tier 1 Bank
                            </SelectItem>
                            <SelectItem value="RegionalBank">
                              Regional Bank
                            </SelectItem>
                            <SelectItem value="InvestmentFund">
                              Investment Fund
                            </SelectItem>
                            <SelectItem value="PrivateEquity">
                              Private Equity
                            </SelectItem>
                            <SelectItem value="InsuranceCompany">
                              Insurance Company
                            </SelectItem>
                            <SelectItem value="PensionFund">
                              Pension Fund
                            </SelectItem>
                            <SelectItem value="SpecialtyLender">
                              Specialty Lender
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lenderRatingTier">
                          Rating Tier (Public)
                        </Label>
                        <Select
                          value={watch("lenderRatingTier") || undefined}
                          onValueChange={(value) =>
                            setValue("lenderRatingTier", value)
                          }
                          disabled={loading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select rating (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Premium">Premium</SelectItem>
                            <SelectItem value="Standard">Standard</SelectItem>
                            <SelectItem value="Basic">Basic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lenderInternalRating">
                          Internal Rating (Admin Override)
                          <span className="text-xs text-muted-foreground ml-2">
                            Leave empty for auto-calculation
                          </span>
                        </Label>
                        <Select
                          value={watch("lenderInternalRating") || "auto"}
                          onValueChange={(value) =>
                            setValue(
                              "lenderInternalRating",
                              value === "auto" ? "" : value
                            )
                          }
                          disabled={loading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Auto-calculate" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">
                              Auto-calculate from performance
                            </SelectItem>
                            <SelectItem value="AAA">
                              AAA - Highest quality, minimal risk
                            </SelectItem>
                            <SelectItem value="AA">
                              AA - High quality
                            </SelectItem>
                            <SelectItem value="A">
                              A - Upper medium grade
                            </SelectItem>
                            <SelectItem value="BBB">
                              BBB - Medium grade, adequate capacity
                            </SelectItem>
                            <SelectItem value="BB">
                              BB - Lower medium grade
                            </SelectItem>
                            <SelectItem value="B">B - Speculative</SelectItem>
                            <SelectItem value="CCC">
                              CCC - Currently vulnerable
                            </SelectItem>
                            <SelectItem value="CC">
                              CC - Highly vulnerable
                            </SelectItem>
                            <SelectItem value="C">
                              C - Extremely vulnerable
                            </SelectItem>
                            <SelectItem value="D">D - In default</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lenderCapacityTier">
                          Capacity Tier
                        </Label>
                        <Select
                          value={watch("lenderCapacityTier") || undefined}
                          onValueChange={(value) =>
                            setValue("lenderCapacityTier", value)
                          }
                          disabled={loading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select capacity (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Large">Large</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Small">Small</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lenderGeographicScope">
                          Geographic Scope
                        </Label>
                        <Select
                          value={watch("lenderGeographicScope") || undefined}
                          onValueChange={(value) =>
                            setValue("lenderGeographicScope", value)
                          }
                          disabled={loading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select scope (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Global">Global</SelectItem>
                            <SelectItem value="Regional">Regional</SelectItem>
                            <SelectItem value="Local">Local</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Account Information Section */}
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-6">
                    Account Information
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                        User ID
                      </Label>
                      <Alert variant="default">
                        <IdCard className="h-4 w-4" />
                        <AlertDescription>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-sm text-muted-foreground">
                              {user.id}
                            </span>
                          </div>
                        </AlertDescription>
                      </Alert>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                        DAML Party ID
                      </Label>
                      <Alert variant="default">
                        <IdCard className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm text-muted-foreground">
                                {user.damlParty
                                  ? "Active DAML Party"
                                  : "No DAML Party"}
                              </span>
                            </div>
                            {user.damlParty && (
                              <code className="text-xs font-mono break-all block p-2 bg-muted rounded text-muted-foreground">
                                {user.damlParty}
                              </code>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {user.damlParty
                                ? "This user can participate in DAML contract operations"
                                : "This user needs a DAML party ID to participate in contract operations"}
                            </p>
                          </div>
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </WideModalContent>
    </WideModal>
  );
}
