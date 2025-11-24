"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import {
  Trash2,
  AlertTriangle,
  UserX,
  Skull,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import type { UserData } from "@/types/api";

interface UserDeletionActionsProps {
  selectedUsers: UserData[];
  currentUser: UserData | null;
  onUsersDeleted: () => void;
  onDeleteSingleUser?: (user: UserData) => void;
}

export interface UserDeletionActionsRef {
  handleDeleteSingleUser: (user: UserData) => void;
}

export const UserDeletionActions = forwardRef<
  UserDeletionActionsRef,
  UserDeletionActionsProps
>(({ selectedUsers, currentUser, onUsersDeleted }, ref) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showNuclearModal, setShowNuclearModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [deleteType, setDeleteType] = useState<
    "single" | "selected" | "non-admin" | "all"
  >("single");
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);

  const verifyAdminPassword = async (password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/admin/verify-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      return response.ok;
    } catch (error) {
      console.error("Password verification error:", error);
      return false;
    }
  };

  const handleDeleteSingleUser = async (user: UserData) => {
    if (!user.id) return;

    // Check if trying to delete self
    if (currentUser && user.id === currentUser.id) {
      toast.error("You cannot delete your own account");
      return;
    }

    setUserToDelete(user);
    setDeleteType("single");
    setShowPasswordModal(true);
  };

  const executeDeleteSingleUser = async () => {
    if (!userToDelete?.id || !adminPassword) return;

    setIsDeleting(true);
    try {
      // Verify admin password first
      const isPasswordValid = await verifyAdminPassword(adminPassword);
      if (!isPasswordValid) {
        toast.error("Invalid admin password");
        return;
      }

      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "User deleted successfully");
        onUsersDeleted();
        closePasswordModal();
      } else {
        toast.error(result.message || "Failed to delete user");
      }
    } catch (error) {
      toast.error("Failed to delete user");
      console.error("Delete user error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSelectedUsers = async () => {
    if (deletableSelectedUsers.length === 0) return;

    setIsDeleting(true);
    try {
      // Verify admin password first
      const isPasswordValid = await verifyAdminPassword(adminPassword);
      if (!isPasswordValid) {
        toast.error("Invalid admin password");
        return;
      }

      const deletePromises = deletableSelectedUsers.map((user) =>
        fetch(`/api/admin/users/${user.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        })
      );

      const responses = await Promise.all(deletePromises);
      const results = await Promise.all(responses.map((r) => r.json()));

      const successful = results.filter((_, index) => responses[index].ok);
      const failed = results.filter((_, index) => !responses[index].ok);

      if (successful.length > 0) {
        toast.success(`Successfully deleted ${successful.length} user(s)`);
      }
      if (failed.length > 0) {
        toast.error(`Failed to delete ${failed.length} user(s)`);
      }

      onUsersDeleted();
      closePasswordModal();
    } catch (error) {
      toast.error("Failed to delete selected users");
      console.error("Delete selected users error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteNonAdminUsers = async () => {
    setIsDeleting(true);
    try {
      // Verify admin password first
      const isPasswordValid = await verifyAdminPassword(adminPassword);
      if (!isPasswordValid) {
        toast.error("Invalid admin password");
        return;
      }

      const response = await fetch("/api/admin/users/non-admin", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(
          `Successfully deleted ${result.deletedCount} non-admin users`
        );
        onUsersDeleted();
        closePasswordModal();
      } else {
        toast.error(result.message || "Failed to delete non-admin users");
      }
    } catch (error) {
      toast.error("Failed to delete non-admin users");
      console.error("Delete non-admin users error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAllUsers = async () => {
    setIsDeleting(true);
    try {
      // Verify admin password first
      const isPasswordValid = await verifyAdminPassword(adminPassword);
      if (!isPasswordValid) {
        toast.error("Invalid admin password");
        return;
      }

      const response = await fetch("/api/admin/users/all", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`Successfully deleted all ${result.deletedCount} users`);
        onUsersDeleted();
        closePasswordModal();
      } else {
        toast.error(result.message || "Failed to delete all users");
      }
    } catch (error) {
      toast.error("Failed to delete all users");
      console.error("Delete all users error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteModal = (
    type: "single" | "selected" | "non-admin" | "all"
  ) => {
    setDeleteType(type);
    if (type === "non-admin" || type === "all") {
      setShowNuclearModal(true);
    } else if (type === "selected") {
      setShowBulkDeleteModal(true);
    }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setShowBulkDeleteModal(false);
    setShowNuclearModal(false);
    setAdminPassword("");
    setShowPassword(false);
    setUserToDelete(null);
  };

  const executeDelete = () => {
    if (!adminPassword.trim()) {
      toast.error("Admin password is required");
      return;
    }

    switch (deleteType) {
      case "single":
        executeDeleteSingleUser();
        break;
      case "selected":
        handleDeleteSelectedUsers();
        break;
      case "non-admin":
        handleDeleteNonAdminUsers();
        break;
      case "all":
        handleDeleteAllUsers();
        break;
    }
  };

  const handlePasswordConfirm = () => {
    if (deleteType === "selected") {
      setShowBulkDeleteModal(false);
    } else if (deleteType === "non-admin" || deleteType === "all") {
      setShowNuclearModal(false);
    }
    setShowPasswordModal(true);
  };

  // Filter out current user from selected users to prevent self-deletion
  const deletableSelectedUsers = selectedUsers.filter(
    (user) => user.id !== currentUser?.id
  );

  // Expose handleDeleteSingleUser method via ref
  useImperativeHandle(ref, () => ({
    handleDeleteSingleUser,
  }));

  return (
    <>
      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {deletableSelectedUsers.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => openDeleteModal("selected")}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected ({deletableSelectedUsers.length})
          </Button>
        )}

        <Button
          variant="destructive"
          size="sm"
          onClick={() => openDeleteModal("non-admin")}
        >
          <UserX className="h-4 w-4 mr-2" />
          Delete Non-Admins
        </Button>

        <Button
          variant="destructive"
          size="sm"
          onClick={() => openDeleteModal("all")}
          className="bg-red-600 hover:bg-red-700"
        >
          <Skull className="h-4 w-4 mr-2" />
          Delete ALL Users
        </Button>
      </div>

      {/* Admin Password Confirmation Modal */}
      <Dialog open={showPasswordModal} onOpenChange={closePasswordModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-destructive" />
              Admin Authentication Required
            </DialogTitle>
            <DialogDescription>
              {deleteType === "single" && userToDelete
                ? `Enter your admin password to delete user: ${
                    userToDelete.name || userToDelete.email
                  }`
                : deleteType === "selected"
                ? `Enter your admin password to delete ${deletableSelectedUsers.length} selected user(s)`
                : deleteType === "non-admin"
                ? "Enter your admin password to delete all non-admin users"
                : "Enter your admin password to delete ALL users"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Security Check:</strong> This action requires admin
                password confirmation and cannot be undone.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="admin-password">Admin Password</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter your admin password"
                  className="pr-10"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && adminPassword.trim()) {
                      executeDelete();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {deleteType === "single" && userToDelete && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm font-medium mb-1">User to be deleted:</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    {userToDelete.name} ({userToDelete.email})
                  </span>
                  <Badge variant="outline">{userToDelete.role}</Badge>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closePasswordModal}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={executeDelete}
              disabled={isDeleting || !adminPassword.trim()}
              className={
                deleteType === "all" ? "bg-red-600 hover:bg-red-700" : ""
              }
            >
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Selected Users Modal */}
      <Dialog open={showBulkDeleteModal} onOpenChange={closePasswordModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete Selected Users
            </DialogTitle>
            <DialogDescription>
              You are about to permanently delete{" "}
              {deletableSelectedUsers.length} selected user(s) and all their
              related data.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>This action cannot be undone!</strong>
                <br />
                All user data, sessions, accounts, and DAML party assignments
                will be permanently removed.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <p className="text-sm font-medium">Users to be deleted:</p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {deletableSelectedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 bg-muted rounded"
                  >
                    <span className="text-sm">
                      {user.name} ({user.email})
                    </span>
                    <Badge variant="outline">{user.role}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closePasswordModal}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handlePasswordConfirm}
              disabled={isDeleting}
            >
              Continue to Password Confirmation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Nuclear Options Modal */}
      <Dialog open={showNuclearModal} onOpenChange={closePasswordModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {deleteType === "all" ? (
                <Skull className="h-5 w-5 text-red-600" />
              ) : (
                <UserX className="h-5 w-5 text-destructive" />
              )}
              {deleteType === "all"
                ? "Delete ALL Users"
                : "Delete All Non-Admin Users"}
            </DialogTitle>
            <DialogDescription>
              {deleteType === "all"
                ? "You are about to permanently delete ALL users including admins!"
                : "You are about to permanently delete all non-admin users (borrowers, lenders, etc.)."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>EXTREME CAUTION REQUIRED!</strong>
                <br />
                {deleteType === "all"
                  ? "This will delete ALL users including your admin account. You may lose access to the system!"
                  : "This will permanently remove all borrowers, lenders, and other non-admin users."}
              </AlertDescription>
            </Alert>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">What will be deleted:</p>
              <ul className="text-sm space-y-1">
                <li>• All user accounts and profiles</li>
                <li>• All sessions and authentication data</li>
                <li>• All DAML party assignments</li>
                <li>• All lender profiles and configurations</li>
                {deleteType === "all" && (
                  <li className="text-red-600 font-medium">
                    • ALL ADMIN ACCOUNTS (including yours!)
                  </li>
                )}
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closePasswordModal}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handlePasswordConfirm}
              disabled={isDeleting}
              className={
                deleteType === "all" ? "bg-red-600 hover:bg-red-700" : ""
              }
            >
              Continue to Password Confirmation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});

UserDeletionActions.displayName = "UserDeletionActions";
