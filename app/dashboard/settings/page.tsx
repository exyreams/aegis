"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/navigation";
import { SiteHeader } from "@/components/layout";
import { SidebarInset, SidebarProvider } from "@/components/ui/Sidebar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
  CardFooter,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  User,
  Settings,
  Shield,
  Bell,
  Key,
  Monitor,
  Database,
  Globe,
  Save,
  Eye,
  EyeOff,
  Smartphone,
  Lock,
  Activity,
} from "lucide-react";

export default function SettingsPage() {
  const { auth, updateProfile } = useAuth();
  const user = auth.user;

  // Profile form states
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isUpdating, setIsUpdating] = useState(false);

  // Notification preferences
  const [notifications, setNotifications] = useState({
    documentUpdates: true,
    marketActivity: true,
    systemAlerts: true,
    emailDigest: false,
    pushNotifications: true,
  });

  // Security settings
  const [showApiKey, setShowApiKey] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleSaveProfile = async () => {
    setIsUpdating(true);

    try {
      await updateProfile({ name, email });
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
    toast.success("Notification preferences updated");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ProtectedRoute>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                {/* Header */}
                <div className="flex items-center justify-between px-4 lg:px-6">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                      Settings
                    </h1>
                    <p className="text-muted-foreground">
                      {user?.role === "borrower"
                        ? "Manage your account settings and loan preferences"
                        : user?.role === "lender"
                        ? "Configure your lending profile and system preferences"
                        : "Administer system settings and user management"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {user?.role || "User"}
                    </Badge>
                  </div>
                </div>

                {/* Main Content */}
                <div className="px-4 lg:px-6">
                  <Tabs defaultValue="account" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger
                        value="account"
                        className="flex items-center gap-2"
                      >
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
                      <TabsTrigger
                        value="security"
                        className="flex items-center gap-2"
                      >
                        <Shield className="h-4 w-4" />
                        Security
                      </TabsTrigger>
                      <TabsTrigger
                        value="system"
                        className="flex items-center gap-2"
                      >
                        <Monitor className="h-4 w-4" />
                        System
                      </TabsTrigger>
                    </TabsList>

                    {/* Account Tab */}
                    <TabsContent value="account" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Profile Information
                          </CardTitle>
                          <CardDescription>
                            Update your personal information and account details
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              <Label htmlFor="role">Account Role</Label>
                              <Input
                                id="role"
                                value={user?.role || ""}
                                disabled
                                className="bg-muted capitalize"
                              />
                              <p className="text-xs text-muted-foreground">
                                Contact an administrator to change your role
                              </p>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="created">Member Since</Label>
                              <Input
                                id="created"
                                value={
                                  user?.created_at
                                    ? formatDate(user.created_at)
                                    : "Unknown"
                                }
                                disabled
                                className="bg-muted"
                              />
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button
                            onClick={handleSaveProfile}
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4 mr-2" />
                            )}
                            Save Changes
                          </Button>
                        </CardFooter>
                      </Card>

                      {/* Account Statistics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardHeader>
                            <CardDescription>Documents Created</CardDescription>
                            <CardTitle className="text-2xl font-semibold">
                              12
                            </CardTitle>
                            <CardAction>
                              <Badge variant="outline">
                                <Activity className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            </CardAction>
                          </CardHeader>
                          <CardFooter className="text-sm text-muted-foreground">
                            Total documents generated
                          </CardFooter>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardDescription>Market Activity</CardDescription>
                            <CardTitle className="text-2xl font-semibold">
                              5
                            </CardTitle>
                            <CardAction>
                              <Badge variant="outline">
                                <Globe className="h-3 w-3 mr-1" />
                                Trading
                              </Badge>
                            </CardAction>
                          </CardHeader>
                          <CardFooter className="text-sm text-muted-foreground">
                            Active positions
                          </CardFooter>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardDescription>Last Login</CardDescription>
                            <CardTitle className="text-lg font-semibold">
                              Today
                            </CardTitle>
                            <CardAction>
                              <Badge variant="outline">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Secure
                              </Badge>
                            </CardAction>
                          </CardHeader>
                          <CardFooter className="text-sm text-muted-foreground">
                            Session active
                          </CardFooter>
                        </Card>
                      </div>
                    </TabsContent>

                    {/* Preferences Tab */}
                    <TabsContent value="preferences" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Monitor className="h-5 w-5" />
                            Appearance
                          </CardTitle>
                          <CardDescription>
                            Customize your interface and display preferences
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Color Theme</Label>
                              <p className="text-sm text-muted-foreground">
                                Choose between light and dark themes
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
                          <CardDescription>
                            Configure how you receive updates and alerts
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Document Updates</Label>
                              <p className="text-sm text-muted-foreground">
                                Get notified when documents are created or
                                modified
                              </p>
                            </div>
                            <Switch
                              checked={notifications.documentUpdates}
                              onCheckedChange={(checked) =>
                                handleNotificationChange(
                                  "documentUpdates",
                                  checked
                                )
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Market Activity</Label>
                              <p className="text-sm text-muted-foreground">
                                Get notified about secondary market trades and
                                offers
                              </p>
                            </div>
                            <Switch
                              checked={notifications.marketActivity}
                              onCheckedChange={(checked) =>
                                handleNotificationChange(
                                  "marketActivity",
                                  checked
                                )
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>System Alerts</Label>
                              <p className="text-sm text-muted-foreground">
                                Get notified about system maintenance and
                                updates
                              </p>
                            </div>
                            <Switch
                              checked={notifications.systemAlerts}
                              onCheckedChange={(checked) =>
                                handleNotificationChange(
                                  "systemAlerts",
                                  checked
                                )
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Email Digest</Label>
                              <p className="text-sm text-muted-foreground">
                                Receive weekly summary emails
                              </p>
                            </div>
                            <Switch
                              checked={notifications.emailDigest}
                              onCheckedChange={(checked) =>
                                handleNotificationChange("emailDigest", checked)
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Push Notifications</Label>
                              <p className="text-sm text-muted-foreground">
                                Receive browser push notifications
                              </p>
                            </div>
                            <Switch
                              checked={notifications.pushNotifications}
                              onCheckedChange={(checked) =>
                                handleNotificationChange(
                                  "pushNotifications",
                                  checked
                                )
                              }
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            Account Security
                          </CardTitle>
                          <CardDescription>
                            Manage your password and authentication settings
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label>Password</Label>
                            <Button
                              variant="outline"
                              className="w-full justify-start"
                            >
                              <Key className="h-4 w-4 mr-2" />
                              Change Password
                            </Button>
                            <p className="text-xs text-muted-foreground">
                              Update your account password for better security
                            </p>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Two-Factor Authentication</Label>
                              <p className="text-sm text-muted-foreground">
                                Add an extra layer of security to your account
                              </p>
                            </div>
                            <Switch
                              checked={twoFactorEnabled}
                              onCheckedChange={setTwoFactorEnabled}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Active Sessions</Label>
                            <Button
                              variant="outline"
                              className="w-full justify-start"
                            >
                              <Smartphone className="h-4 w-4 mr-2" />
                              Manage Sessions
                            </Button>
                            <p className="text-xs text-muted-foreground">
                              View and manage your active login sessions
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Key className="h-5 w-5" />
                            API Access
                          </CardTitle>
                          <CardDescription>
                            Manage API keys and integration settings
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="api-key">API Key</Label>
                            <div className="flex gap-2">
                              <Input
                                id="api-key"
                                type={showApiKey ? "text" : "password"}
                                value="ak_1234567890abcdef"
                                disabled
                                className="bg-muted font-mono"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowApiKey(!showApiKey)}
                              >
                                {showApiKey ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Use this key to authenticate API requests
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Generate New Key
                            </Button>
                            <Button variant="outline" size="sm">
                              Copy Key
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* System Tab */}
                    <TabsContent value="system" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            System Information
                          </CardTitle>
                          <CardDescription>
                            View system configuration and environment details
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="app-name">Application Name</Label>
                              <Input
                                id="app-name"
                                value={
                                  process.env.NEXT_PUBLIC_APP_NAME ||
                                  "LMA Digital Loans"
                                }
                                disabled
                                className="bg-muted"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="app-version">Version</Label>
                              <Input
                                id="app-version"
                                value="1.0.0"
                                disabled
                                className="bg-muted"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="supabase-url">Supabase URL</Label>
                              <Input
                                id="supabase-url"
                                value={
                                  process.env.NEXT_PUBLIC_SUPABASE_URL ||
                                  "Not configured"
                                }
                                disabled
                                className="bg-muted font-mono text-xs"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="environment">Environment</Label>
                              <Input
                                id="environment"
                                value={
                                  process.env.NODE_ENV === "production"
                                    ? "Production"
                                    : "Development"
                                }
                                disabled
                                className="bg-muted"
                              />
                            </div>
                          </div>

                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              System configuration is managed through
                              environment variables and cannot be modified from
                              this interface.
                            </AlertDescription>
                          </Alert>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            System Status
                          </CardTitle>
                          <CardDescription>
                            Current system health and performance metrics
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-full">
                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <p className="font-medium text-green-900 dark:text-green-100">
                                  Database
                                </p>
                                <p className="text-sm text-green-700 dark:text-green-300">
                                  Operational
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-full">
                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <p className="font-medium text-green-900 dark:text-green-100">
                                  AI Services
                                </p>
                                <p className="text-sm text-green-700 dark:text-green-300">
                                  Available
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-full">
                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <p className="font-medium text-green-900 dark:text-green-100">
                                  Authentication
                                </p>
                                <p className="text-sm text-green-700 dark:text-green-300">
                                  Active
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
