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
import { Alert, AlertDescription } from "@/components/ui/Alert";
import {
  AlertTriangle,
  UserX,
  Users,
  X,
  ChevronLeft,
  Info,
} from "lucide-react";
import { Trash } from "@/components/icons/Trash";
import { Nuclear } from "@/components/icons/Nuclear";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import type { UserData } from "@/types/api";

interface DeleteUsersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUsers: UserData[];
  currentUser: UserData | null;
  onUsersDeleted: () => void;
  skipTypeSelection?: boolean; // Skip type selection and go directly to "selected" confirmation
}

type DeleteType = "selected" | "non-admin" | "all";

export function DeleteUsersModal({
  open,
  onOpenChange,
  selectedUsers,
  currentUser,
  onUsersDeleted,
  skipTypeSelection = false,
}: DeleteUsersModalProps) {
  const [deleteType, setDeleteType] = useState<DeleteType>("selected");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Filter out current user from selected users to prevent self-deletion
  const deletableSelectedUsers = selectedUsers.filter(
    (user) => user.id !== currentUser?.id
  );

  // Determine if this is a single user deletion
  const isSingleUser = deletableSelectedUsers.length === 1;

  // Fetch all users when modal opens
  useEffect(() => {
    if (open) {
      fetchAllUsers();
    }
  }, [open]);

  const fetchAllUsers = async () => {
    setLoadingUsers(true);
    try {
      const result = await authApi.listUsers();
      if (result.status === 200 && result.data) {
        setAllUsers(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load user list");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Get users to be deleted based on delete type
  const getUsersToDelete = (): UserData[] => {
    switch (deleteType) {
      case "selected":
        return deletableSelectedUsers;
      case "non-admin":
        return allUsers.filter(
          (user) => user.role !== "admin" && user.id !== currentUser?.id
        );
      case "all":
        return allUsers.filter((user) => user.id !== currentUser?.id);
      default:
        return [];
    }
  };

  const usersToDelete = getUsersToDelete();

  const executeDelete = async () => {
    setIsDeleting(true);
    try {
      switch (deleteType) {
        case "selected":
          // Delete selected users
          const deletePromises = deletableSelectedUsers.map((user) =>
            authApi.deleteUser(user.id)
          );

          const results = await Promise.all(deletePromises);

          const successful = results.filter((result) => result.status === 200);
          const failed = results.filter((result) => result.status !== 200);

          if (successful.length > 0) {
            toast.success(
              isSingleUser
                ? "User deleted successfully"
                : `Successfully deleted ${successful.length} user(s)`
            );
          }
          if (failed.length > 0) {
            toast.error(
              isSingleUser
                ? "Failed to delete user"
                : `Failed to delete ${failed.length} user(s)`
            );
          }

          onUsersDeleted();
          handleClose();
          return;

        case "non-admin":
          const nonAdminResult = await authApi.deleteNonAdminUsers();
          if (nonAdminResult.status === 200 && nonAdminResult.data) {
            toast.success(
              `Successfully deleted ${nonAdminResult.data.deletedCount} non-admin users`
            );
            onUsersDeleted();
            handleClose();
          } else {
            toast.error(
              nonAdminResult.error || "Failed to delete non-admin users"
            );
          }
          return;

        case "all":
          const allUsersResult = await authApi.deleteAllUsers();
          if (allUsersResult.status === 200 && allUsersResult.data) {
            toast.success(
              `Successfully deleted all ${allUsersResult.data.deletedCount} users`
            );
            onUsersDeleted();
            handleClose();
          } else {
            toast.error(allUsersResult.error || "Failed to delete all users");
          }
          return;

        default:
          throw new Error("Invalid delete type");
      }
    } catch (error) {
      toast.error("Failed to delete users");
      console.error("Delete users error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setShowConfirmation(false);
      setDeleteType("selected");
      onOpenChange(false);
    }
  };

  const handleDeleteTypeSelect = (type: DeleteType) => {
    setDeleteType(type);
    setShowConfirmation(true);
  };

  const getDeleteTypeInfo = () => {
    switch (deleteType) {
      case "selected":
        return {
          title: isSingleUser ? "Delete User" : "Delete Selected Users",
          description: isSingleUser
            ? `Delete ${deletableSelectedUsers[0]?.name}`
            : `Delete ${usersToDelete.length} selected user(s)`,
          icon: <Trash className="text-destructive" size={32} />,
          warningLevel: "destructive" as const,
        };
      case "non-admin":
        return {
          title: "Delete All Non-Admin Users",
          description: `Delete ${usersToDelete.length} non-admin users`,
          icon: <UserX className="h-8 w-8 text-destructive" />,
          warningLevel: "destructive" as const,
        };
      case "all":
        return {
          title: "Delete ALL Users",
          description: `Delete ALL ${usersToDelete.length} users (EXTREME CAUTION!)`,
          icon: <Nuclear className="text-red-600" size={32} />,
          warningLevel: "destructive" as const,
        };
    }
  };

  const typeInfo = getDeleteTypeInfo();

  // Skip type selection for single user OR when skipTypeSelection is true
  const shouldShowTypeSelection =
    !skipTypeSelection && !isSingleUser && !showConfirmation;
  const shouldShowConfirmation =
    skipTypeSelection || isSingleUser || showConfirmation;

  return (
    <WideModal open={open} onOpenChange={handleClose}>
      <WideModalContent className="overflow-hidden" showCloseButton={false}>
        <WideModalTitle className="sr-only">Delete Users</WideModalTitle>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="flex w-full h-full bg-background rounded-lg shadow-2xl border relative"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="absolute top-3 right-3 z-20 p-2 hover:bg-muted/80 rounded-full transition-colors bg-background/80 backdrop-blur-sm border disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Left Sidebar */}
          <div className="w-80 bg-gradient-to-t from-destructive/5 to-card dark:bg-card rounded-xl border shadow-sm flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4 ring-2 ring-destructive/20">
                  {shouldShowConfirmation ? (
                    typeInfo.icon
                  ) : (
                    <Trash className="text-destructive" size={32} />
                  )}
                </div>
                <h1 className="text-xl font-bold text-foreground mb-2">
                  {shouldShowConfirmation ? typeInfo.title : "Delete Users"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {shouldShowConfirmation
                    ? typeInfo.description
                    : "Choose deletion type"}
                </p>
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Action Button */}
            <div className="p-6 border-t border-border">
              {shouldShowTypeSelection ? (
                <Button
                  onClick={handleClose}
                  className="w-full"
                  size="sm"
                  variant="outline"
                >
                  Cancel
                </Button>
              ) : !isDeleting ? (
                <Button
                  onClick={executeDelete}
                  className={`w-full ${
                    deleteType === "all" ? "bg-red-600 hover:bg-red-700" : ""
                  }`}
                  size="sm"
                  variant="destructive"
                >
                  <Trash className="mr-2" size={16} />
                  {isSingleUser ? "Delete User" : "Confirm Delete"}
                </Button>
              ) : (
                <Button disabled className="w-full" size="sm">
                  <Trash className="mr-2" size={16} />
                  Deleting...
                </Button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto bg-muted/30 min-w-0">
            <div className="p-8 pt-16 pb-8 h-full min-h-full">
              <div className="space-y-4 max-w-2xl pb-8">
                {shouldShowTypeSelection ? (
                  // Step 1: Select delete type (only for multiple users)
                  <>
                    <div className="flex items-center gap-2 mb-6">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <h2 className="text-lg font-semibold">
                        Choose Deletion Type
                      </h2>
                    </div>

                    <Alert variant="destructive" className="mb-6">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Warning:</strong> All deletion operations are
                        permanent and cannot be undone.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-start h-auto p-6 border-destructive/20 hover:bg-destructive/5"
                        onClick={() => handleDeleteTypeSelect("selected")}
                        disabled={deletableSelectedUsers.length === 0}
                      >
                        <div className="flex items-center gap-4">
                          <Trash className="text-destructive" size={24} />
                          <div className="text-left">
                            <div className="font-medium text-base">
                              Delete Selected Users
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {deletableSelectedUsers.length === 0 ? (
                                <span className="flex items-center gap-1">
                                  <Info size={14} />
                                  Select users first to enable deletion
                                </span>
                              ) : (
                                `Delete ${deletableSelectedUsers.length} selected user(s)`
                              )}
                            </div>
                          </div>
                        </div>
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full justify-start h-auto p-6 border-destructive/20 hover:bg-destructive/5"
                        onClick={() => handleDeleteTypeSelect("non-admin")}
                      >
                        <div className="flex items-center gap-4">
                          <UserX className="h-6 w-6 text-destructive" />
                          <div className="text-left">
                            <div className="font-medium text-base">
                              Delete Non-Admin Users
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {loadingUsers
                                ? "Loading..."
                                : `Remove ${
                                    allUsers.filter(
                                      (u) =>
                                        u.role !== "admin" &&
                                        u.id !== currentUser?.id
                                    ).length
                                  } non-admin users`}
                            </div>
                          </div>
                        </div>
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full justify-start h-auto p-6 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/20"
                        onClick={() => handleDeleteTypeSelect("all")}
                      >
                        <div className="flex items-center gap-4">
                          <Nuclear className="text-red-600" size={24} />
                          <div className="text-left">
                            <div className="font-medium text-base text-red-600">
                              Delete ALL Users
                            </div>
                            <div className="text-sm text-red-500">
                              {loadingUsers
                                ? "Loading..."
                                : `Nuclear option - deletes all ${
                                    allUsers.filter(
                                      (u) => u.id !== currentUser?.id
                                    ).length
                                  } users!`}
                            </div>
                          </div>
                        </div>
                      </Button>
                    </div>
                  </>
                ) : (
                  // Step 2: Confirmation and user preview
                  <>
                    {/* Back to Selection Button - Above title on left */}
                    {!isSingleUser && (
                      <div className="mb-4">
                        <Button
                          variant="outline"
                          onClick={() => setShowConfirmation(false)}
                          size="sm"
                          disabled={isDeleting}
                        >
                          <ChevronLeft className="mr-2" size={16} />
                          Back to Selection
                        </Button>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-6">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <h2 className="text-lg font-semibold">
                        Confirm Deletion
                      </h2>
                    </div>

                    <Alert variant="destructive" className="mb-6">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Final Warning:</strong> This action will
                        permanently delete all selected user data and cannot be
                        undone.
                        {deleteType === "all" && (
                          <>
                            <br />
                            <strong className="text-red-600">
                              You are about to delete ALL users including
                              admins!
                            </strong>
                          </>
                        )}
                      </AlertDescription>
                    </Alert>

                    {/* User Preview */}
                    {usersToDelete.length > 0 && (
                      <>
                        <div className="flex items-center gap-2 mb-4">
                          <Users className="h-5 w-5 text-muted-foreground" />
                          <h3 className="text-base font-semibold">
                            {isSingleUser
                              ? "User to be deleted"
                              : `${usersToDelete.length} users to be deleted`}
                          </h3>
                        </div>

                        {loadingUsers ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-destructive mx-auto mb-2"></div>
                              <p className="text-sm text-muted-foreground">
                                Loading users...
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {usersToDelete.map((user) => (
                              <div
                                key={user.id}
                                className="p-4 rounded-lg border bg-background"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-sm">
                                      {user.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {user.email}
                                    </p>
                                    {user.damlParty && (
                                      <p className="text-xs text-muted-foreground font-mono mt-1">
                                        {user.damlParty.length > 40
                                          ? `${user.damlParty.slice(
                                              0,
                                              20
                                            )}...${user.damlParty.slice(-20)}`
                                          : user.damlParty}
                                      </p>
                                    )}
                                  </div>
                                  <Badge
                                    variant={
                                      user.role === "admin"
                                        ? "destructive"
                                        : "outline"
                                    }
                                  >
                                    {user.role}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </WideModalContent>
    </WideModal>
  );
}
