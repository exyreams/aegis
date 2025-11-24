"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { useAuth } from "@/hooks/useAuth";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  User,
  Settings,
  Shield,
  Bell,
} from "lucide-react";

export default function SettingsPage() {
  const { auth, updateProfile } = useAuth();
  const [name, setName] = useState(auth.user?.name || "");
  const [email, setEmail] = useState(auth.user?.email || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const handleSaveProfile = async () => {
    setIsUpdating(true);
    setUpdateError("");
    setUpdateSuccess(false);

    try {
      await updateProfile({ name, email });
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      setUpdateError(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>

          <Tabs defaultValue="account" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="account" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Account
              </TabsTrigger>
              <TabsTrigger
                value="preferences"
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Preferences
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {updateSuccess && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Profile updated successfully!
                      </AlertDescription>
                    </Alert>
                  )}

                  {updateError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{updateError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="party">DAML Party ID</Label>
                    <Input
                      id="party"
                      value={auth.user?.damlParty || ""}
                      disabled
                      className="bg-muted font-mono"
                    />
                    <p className="text-xs text-muted-foreground">
                      Your unique identifier on the DAML ledger (cannot be
                      changed)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your display name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={auth.user?.role || ""}
                      disabled
                      className="bg-muted capitalize"
                    />
                    <p className="text-xs text-muted-foreground">
                      Contact an administrator to change your role
                    </p>
                  </div>

                  <Button onClick={handleSaveProfile} disabled={isUpdating}>
                    {isUpdating && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Theme</Label>
                      <p className="text-sm text-muted-foreground">
                        Choose your preferred color theme
                      </p>
                    </div>
                    <ThemeToggle />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New RFQ Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when new RFQs are created
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Bid Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when bids are submitted on your RFQs
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Loan Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about loan status changes
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>System Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about system maintenance and updates
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="api-url">Backend API URL</Label>
                    <Input
                      id="api-url"
                      value={process.env.NEXT_PUBLIC_BACKEND_API_URL}
                      disabled
                      className="bg-muted font-mono"
                    />
                    <p className="text-xs text-muted-foreground">
                      Configured via environment variables
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="daml-url">DAML Ledger URL</Label>
                    <Input
                      id="daml-url"
                      value={process.env.NEXT_PUBLIC_DAML_LEDGER_URL}
                      disabled
                      className="bg-muted font-mono"
                    />
                    <p className="text-xs text-muted-foreground">
                      Configured via environment variables
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="json-api-url">DAML JSON API URL</Label>
                    <Input
                      id="json-api-url"
                      value={process.env.NEXT_PUBLIC_DAML_JSON_API_URL}
                      disabled
                      className="bg-muted font-mono"
                    />
                    <p className="text-xs text-muted-foreground">
                      Configured via environment variables
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Button variant="outline" className="w-full justify-start">
                      Change Password
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Update your account password for better security
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Two-Factor Authentication</Label>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                      <Switch />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Session Management</Label>
                    <Button variant="outline" className="w-full justify-start">
                      View Active Sessions
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Manage your active login sessions across devices
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
