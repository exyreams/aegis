"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
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
import type { UserRole } from "@/types/api";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { useAuth } from "@/hooks/useAuth";
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
  Shuffle,
} from "lucide-react";
import { toast } from "sonner";
import {
  GlassAvatar,
  generateGlassAvatarUrl,
} from "@/components/ui/GlassAvatar";

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
    role: z.enum(["borrower", "lender", "admin"]),
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

interface RegistrationFormProps {
  onSuccess?: (data: unknown) => void;
  onCancel?: () => void;
}

export function RegistrationForm({
  onSuccess,
  onCancel,
}: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    role: "" as UserRole,
    image: "", // Avatar seed
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { register } = useAuth();

  const [isPasswordGenerated, setIsPasswordGenerated] = useState(false);
  const [avatarSeed, setAvatarSeed] = useState("");
  const [generatingAvatar, setGeneratingAvatar] = useState(false);

  // Generate initial avatar when component mounts
  useEffect(() => {
    if (!avatarSeed) {
      const initialSeed = Math.random().toString(36).substring(2, 15);
      setAvatarSeed(initialSeed);
      setFormData((prev) => ({ ...prev, image: initialSeed }));
    }
  }, [avatarSeed]);

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

  // Function to copy to clipboard
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  // Function to generate avatar
  const generateAvatar = () => {
    setGeneratingAvatar(true);

    // Generate random seed for avatar
    const newSeed = Math.random().toString(36).substring(2, 15);
    setAvatarSeed(newSeed);

    // Update form data with the seed (we'll generate data URL on form submission)
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

  const validateForm = (): string | null => {
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
      // Generate data URL from seed for database storage
      const avatarDataUrl = generateGlassAvatarUrl(
        formData.image || avatarSeed,
        200
      );

      const user = await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
        image: avatarDataUrl, // Avatar data URL for database
      });

      setSuccess("Registration successful! You are now logged in.");
      toast.success(`Welcome ${formData.name}! Registration successful.`);

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(user);
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

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Join the Aegis Platform
        </h1>
        <p className="text-muted-foreground">
          Create your account to access the complete loan lifecycle platform
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
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
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
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
              onChange={(e) => handleInputChange("name", e.target.value)}
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
                Your Profile Avatar
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                This unique avatar will represent you across the platform
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
              onChange={(e) => handleInputChange("password", e.target.value)}
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
                    await copyToClipboard(formData.password, "Password");
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
                    await copyToClipboard(formData.confirmPassword, "Password");
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
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
                title={showConfirmPassword ? "Hide password" : "Show password"}
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

        <div className="flex gap-2">
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

          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground text-center">
          By creating an account, you agree to our terms of service and privacy
          policy.
        </div>
      </form>
    </div>
  );
}
