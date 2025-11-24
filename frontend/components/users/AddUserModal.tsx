"use client";

import { useState, useEffect } from "react";
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
import { RolePermissions } from "@/lib/rolePermissions";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import {
  Loader2,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
  Copy,
  IdCard,
  X,
  Shuffle,
  Building2,
} from "lucide-react";

import { toast } from "sonner";
import { authApi } from "@/lib/api";
import type { UserRole } from "@/types/api";
import {
  GlassAvatar,
  generateGlassAvatarUrl,
} from "@/components/ui/GlassAvatar";
import { Users } from "@/components/icons/Users";

// Zod validation schema
const registrationSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .regex(
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address"
      ),
    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters long"),
    damlParty: z
      .string()
      .min(1, "DAML Party is required")
      .refine((val) => val.includes("::"), "Invalid DAML party format"),
    role: z.enum([
      "borrower",
      "lender",
      "admin",
      "risk_analyst",
      "compliance_officer",
      "market_maker",
      "auditor",
    ]),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

interface AddUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddUserModal({
  open,
  onOpenChange,
  onSuccess,
}: AddUserModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    damlParty: "",
    role: "" as UserRole,
    image: "", // Avatar data URL
    // Lender profile fields (optional)
    lenderCategoryTier: "none" as
      | "none"
      | "Tier1Bank"
      | "RegionalBank"
      | "InvestmentFund"
      | "PrivateEquity"
      | "InsuranceCompany"
      | "PensionFund"
      | "SpecialtyLender",
    lenderRatingTier: "none" as "none" | "Premium" | "Standard" | "Basic",
    lenderInternalRating: "" as
      | ""
      | "AAA"
      | "AA"
      | "A"
      | "BBB"
      | "BB"
      | "B"
      | "CCC"
      | "CC"
      | "C"
      | "D",
    lenderCapacityTier: "none" as "none" | "Large" | "Medium" | "Small",
    lenderGeographicScope: "none" as "none" | "Global" | "Regional" | "Local",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isPartyGenerated, setIsPartyGenerated] = useState(false);
  const [generatingParty, setGeneratingParty] = useState(false);
  const [isPasswordGenerated, setIsPasswordGenerated] = useState(false);
  const [avatarSeed, setAvatarSeed] = useState("");
  const [generatingAvatar, setGeneratingAvatar] = useState(false);

  // Generate initial avatar when modal opens
  useEffect(() => {
    if (open && !avatarSeed) {
      const initialSeed = Math.random().toString(36).substring(2, 15);
      setAvatarSeed(initialSeed);
      setFormData((prev) => ({ ...prev, image: initialSeed }));
    }
  }, [open, avatarSeed]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear errors when user starts typing
    if (error) setError("");
    if (success) setSuccess("");

    // If user manually types password, mark as not generated
    if (field === "password" || field === "confirmPassword") {
      setIsPasswordGenerated(false);
    }
  };

  // Function to reset party generation
  const resetPartyGeneration = () => {
    setIsPartyGenerated(false);
    setFormData((prev) => ({ ...prev, damlParty: "" }));
  };

  // Function to copy DAML party to clipboard
  const copyToClipboard = async () => {
    if (formData.damlParty) {
      try {
        await navigator.clipboard.writeText(formData.damlParty);
        toast.success("DAML party copied to clipboard!");
      } catch {
        toast.error("Failed to copy to clipboard");
      }
    }
  };

  // Function to generate avatar
  const generateAvatar = () => {
    setGeneratingAvatar(true);

    // Generate random seed for avatar
    const newSeed = Math.random().toString(36).substring(2, 15);
    setAvatarSeed(newSeed);

    // Update form data with the seed (we'll generate JSON data on form submission)
    setFormData((prev) => ({ ...prev, image: newSeed }));

    setTimeout(() => {
      setGeneratingAvatar(false);
      toast.success("New avatar generated!");
    }, 500);
  };

  // Function to generate secure password
  const generatePassword = () => {
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    const allChars = lowercase + uppercase + numbers + symbols;
    let password = "";

    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill remaining 8 characters randomly
    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password to randomize positions
    const shuffled = password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");

    setFormData((prev) => ({
      ...prev,
      password: shuffled,
      confirmPassword: shuffled,
    }));

    setIsPasswordGenerated(true);
    toast.success("Secure password generated!");
  };

  // Function to generate actual DAML party via backend
  const generateDamlParty = async () => {
    // Check if role is selected first
    if (!formData.role) {
      toast.error("Please select a role first before generating party ID");
      return;
    }

    setGeneratingParty(true);
    setError("");

    try {
      // Generate secure anonymous party ID
      const randomId =
        Math.random().toString(36).substring(2) +
        Math.random().toString(36).substring(2);
      const finalRandomId = randomId.substring(0, 12); // Ensure exactly 12 chars
      const identifierHint = `aegis_${finalRandomId}`;
      const displayName = formData.role;

      const response = await fetch("http://localhost:8000/api/create-party", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifierHint,
          displayName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate DAML party");
      }

      const data = await response.json();
      const partyId = data.party.identifier;

      setFormData((prev) => ({ ...prev, damlParty: partyId }));
      setIsPartyGenerated(true);

      toast.success("DAML party generated successfully!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate party";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setGeneratingParty(false);
    }
  };

  const validateForm = (): string | null => {
    // First check if party was generated (business logic validation)
    if (!isPartyGenerated) {
      return "Please use the 'Generate Party' button to create a valid DAML party";
    }

    try {
      registrationSchema.parse(formData);
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.issues[0].message;
      }
      return "Validation failed";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Generate JSON avatar data from seed for database storage
      const avatarDataUrl = generateGlassAvatarUrl(
        formData.image || avatarSeed,
        200
      );

      // Prepare lender profile data if provided
      const lenderProfile =
        formData.role === "lender" && formData.lenderCategoryTier !== "none"
          ? {
              categoryTier: formData.lenderCategoryTier,
              ratingTier:
                formData.lenderRatingTier !== "none"
                  ? formData.lenderRatingTier
                  : "Standard",
              capacityTier:
                formData.lenderCapacityTier !== "none"
                  ? formData.lenderCapacityTier
                  : "Medium",
              geographicScope:
                formData.lenderGeographicScope !== "none"
                  ? formData.lenderGeographicScope
                  : "Regional",
            }
          : undefined;

      const result = await authApi.createUser(
        formData.email,
        formData.password,
        formData.name,
        formData.damlParty,
        formData.role,
        avatarDataUrl, // Avatar JSON data for database
        lenderProfile
      );

      if (result.status === 201) {
        const successMessage = lenderProfile
          ? `User ${formData.name} created with lender profile!`
          : `User ${formData.name} created successfully!`;

        setSuccess("User created successfully!");
        toast.success(successMessage);

        // Reset form
        setFormData({
          email: "",
          password: "",
          confirmPassword: "",
          name: "",
          damlParty: "",
          role: "" as UserRole,
          image: "",
          lenderCategoryTier: "none",
          lenderRatingTier: "none",
          lenderInternalRating: "",
          lenderCapacityTier: "none",
          lenderGeographicScope: "none",
        });
        setIsPartyGenerated(false);
        setIsPasswordGenerated(false);
        setAvatarSeed("");

        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        }

        // Close modal after short delay
        setTimeout(() => {
          onOpenChange(false);
        }, 1000);
      } else {
        const errorMessage = result.error || "Registration failed";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Registration failed";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      // Reset form when closing
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
        damlParty: "",
        role: "" as UserRole,
        image: "",
        lenderCategoryTier: "none",
        lenderRatingTier: "none",
        lenderInternalRating: "",
        lenderCapacityTier: "none",
        lenderGeographicScope: "none",
      });
      setError("");
      setSuccess("");
      setIsPartyGenerated(false);
      setIsPasswordGenerated(false);
      setAvatarSeed("");
      onOpenChange(false);
    }
  };

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
        <WideModalTitle className="sr-only">Add New User</WideModalTitle>

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

          {/* Left Sidebar - Header & Avatar */}
          <div className="w-80 bg-gradient-to-t from-primary/5 to-card dark:bg-card rounded-xl border shadow-sm flex flex-col min-h-0">
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 ring-2 ring-primary/20">
                  <Users size={40} className="text-primary" />
                </div>
                <div className="mb-3">
                  <h1 className="text-xl font-bold text-foreground mb-2">
                    Add New User
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Register a new user account for the platform
                  </p>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-6">
                <Alert
                  variant="default"
                  className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                >
                  <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-800 dark:text-blue-300">
                    <p className="font-medium text-sm mb-1">Account Setup</p>
                    <p className="text-xs">
                      Generate a DAML party ID and secure password for the new
                      user account.
                    </p>
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </div>

          {/* Main Content - Form */}
          <div className="flex-1 overflow-y-auto bg-muted/30 min-w-0">
            <div className="p-8 pt-16 h-full min-h-full">
              <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50 text-green-800 dark:bg-green-950/20 dark:border-green-800 dark:text-green-300">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="text"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      disabled={loading}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="e.g., Liam Carter"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      disabled={loading}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleInputChange("role", value)}
                    disabled={loading}
                  >
                    <SelectTrigger className="min-h-[45px]">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      {RolePermissions.getAllRoles().map((role) => {
                        const config = RolePermissions.getRoleConfig(role);
                        return (
                          <SelectItem key={role} value={role}>
                            <div className="flex flex-col items-start">
                              <span>{config.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {config.description}
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Lender Profile Section - Only show for lenders */}
                {formData.role === "lender" && (
                  <div className="space-y-4 p-4 border border-primary/20 rounded-lg bg-primary/5">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      <Label className="text-sm font-medium text-primary">
                        Lender Profile (Optional)
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Configure lender profile now or let the user complete it
                      during onboarding
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="lenderCategoryTier">
                          Institution Type
                        </Label>
                        <Select
                          value={formData.lenderCategoryTier}
                          onValueChange={(value) =>
                            handleInputChange("lenderCategoryTier", value)
                          }
                          disabled={loading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              Let user choose
                            </SelectItem>
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
                          value={formData.lenderRatingTier}
                          onValueChange={(value) =>
                            handleInputChange("lenderRatingTier", value)
                          }
                          disabled={loading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select rating" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              Let user choose
                            </SelectItem>
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
                          value={formData.lenderInternalRating || "auto"}
                          onValueChange={(value) =>
                            handleInputChange(
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
                          value={formData.lenderCapacityTier}
                          onValueChange={(value) =>
                            handleInputChange("lenderCapacityTier", value)
                          }
                          disabled={loading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select capacity" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              Let user choose
                            </SelectItem>
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
                          value={formData.lenderGeographicScope}
                          onValueChange={(value) =>
                            handleInputChange("lenderGeographicScope", value)
                          }
                          disabled={loading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select scope" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              Let user choose
                            </SelectItem>
                            <SelectItem value="Global">Global</SelectItem>
                            <SelectItem value="Regional">Regional</SelectItem>
                            <SelectItem value="Local">Local</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {formData.lenderCategoryTier !== "none" && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">
                          Anonymous ID Preview:
                        </p>
                        <code className="text-sm font-mono text-primary">
                          {formData.lenderCategoryTier === "Tier1Bank" &&
                            "AEGIS-INST-T1-XXX"}
                          {formData.lenderCategoryTier === "RegionalBank" &&
                            "AEGIS-REGNL-XXX"}
                          {formData.lenderCategoryTier === "InvestmentFund" &&
                            "AEGIS-INVST-FUND-XXX"}
                          {formData.lenderCategoryTier === "PrivateEquity" &&
                            "AEGIS-PRIV-EQ-XXX"}
                          {formData.lenderCategoryTier === "InsuranceCompany" &&
                            "AEGIS-INSUR-XXX"}
                          {formData.lenderCategoryTier === "PensionFund" &&
                            "AEGIS-PENS-FUND-XXX"}
                          {formData.lenderCategoryTier === "SpecialtyLender" &&
                            "AEGIS-SPEC-XXX"}
                        </code>
                      </div>
                    )}
                  </div>
                )}

                {/* Profile Avatar Section */}
                <div className="space-y-2">
                  <Label>Profile Avatar</Label>
                  <div className="flex items-center gap-4 p-4 border border-border rounded-lg bg-muted/30">
                    <div className="relative">
                      {formData.image || avatarSeed ? (
                        <div className="relative">
                          <GlassAvatar
                            seed={formData.image || avatarSeed}
                            size={64}
                            className="ring-2 ring-primary/20"
                          />
                          {generatingAvatar && (
                            <div className="absolute inset-0 bg-background/80 rounded-full flex items-center justify-center">
                              <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                          <User className="h-7 w-7 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-foreground mb-1">
                        User Profile Avatar
                      </h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        This unique avatar will represent the user across the
                        platform
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateAvatar}
                        disabled={loading || generatingAvatar}
                        className="h-7 px-3 text-xs"
                      >
                        {generatingAvatar ? (
                          <>
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Shuffle className="mr-1 h-3 w-3" />
                            Generate New Avatar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="damlParty">DAML Party ID</Label>
                    <div className="flex items-center gap-2">
                      {!isPartyGenerated && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={generateDamlParty}
                          disabled={loading || generatingParty}
                          className="h-7 px-3 text-xs"
                        >
                          {generatingParty ? (
                            <>
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <span className="text-muted-foreground dark:text-gray-300">
                              Generate Party ID
                            </span>
                          )}
                        </Button>
                      )}
                      {isPartyGenerated && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={resetPartyGeneration}
                          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground dark:text-gray-300 dark:hover:text-gray-400"
                        >
                          Reset
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <IdCard
                      className={`absolute left-3 top-2 h-5 w-5 ${
                        isPartyGenerated
                          ? "text-green-600 dark:text-green-400"
                          : "text-muted-foreground"
                      }`}
                    />
                    <Input
                      id="damlParty"
                      type="text"
                      placeholder={
                        isPartyGenerated
                          ? "Generated DAML party identifier"
                          : "Generate unique DAML Party ID"
                      }
                      value={formData.damlParty}
                      readOnly={true}
                      disabled={true}
                      className={`pl-10 pr-20 bg-muted border-muted cursor-not-allowed ${
                        isPartyGenerated
                          ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                          : ""
                      }`}
                    />
                    <div className="absolute right-3 top-3 flex items-center gap-1">
                      {formData.damlParty && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={copyToClipboard}
                          className="h-6 w-6 p-0 hover:bg-muted"
                          title="Copy to clipboard"
                        >
                          <Copy className="absolute left-2 -top-0.5 h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="text-sm">
                    <p
                      className={`${
                        isPartyGenerated
                          ? "text-green-600 dark:text-green-400 font-semibold text-xs"
                          : "text-muted-foreground text-xs"
                      }`}
                    >
                      {isPartyGenerated
                        ? "Generated successfully"
                        : "Click 'Generate Party' to create DAML identity"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={generatePassword}
                      disabled={loading}
                      className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground dark:text-gray-300 dark:hover:text-gray-400"
                    >
                      Generate
                    </Button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a secure password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      disabled={loading}
                      className="pl-10 pr-16"
                    />
                    <div className="absolute right-1 top-1 flex items-center gap-1">
                      {formData.password && isPasswordGenerated && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(
                                formData.password
                              );
                              toast.success("Password copied to clipboard!");
                            } catch {
                              toast.error("Failed to copy password");
                            }
                          }}
                          className="h-8 w-8 p-0 hover:bg-muted"
                          title="Copy generated password"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-muted"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Minimum 8 characters required
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      disabled={loading}
                      className="pl-10 pr-16"
                    />
                    <div className="absolute right-1 top-1 flex items-center gap-1">
                      {formData.confirmPassword && isPasswordGenerated && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(
                                formData.confirmPassword
                              );
                              toast.success("Password copied to clipboard!");
                            } catch {
                              toast.error("Failed to copy password");
                            }
                          }}
                          className="h-8 w-8 p-0 hover:bg-muted"
                          title="Copy generated password"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-muted"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        disabled={loading}
                        title={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={loading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Create Account
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground text-center pt-4 pb-6">
                  By creating an account, you agree to our terms of service and
                  privacy policy.
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </WideModalContent>
    </WideModal>
  );
}
