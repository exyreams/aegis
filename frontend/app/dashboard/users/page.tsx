"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

import { Alert, AlertDescription } from "@/components/ui/Alert";
import {
  UserInfoModal,
  UserLists,
  UserStatistics,
  AddUserModal,
  EditUserInfoModal,
  GeneratePartiesModal,
  DeleteUsersModal,
} from "@/components/users";
import {
  Users,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Search,
  X,
  IdCard,
} from "lucide-react";
import { RefreshCw, Trash } from "@/components/icons";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { UserData } from "@/types/api";

export default function UsersPage() {
  const { auth } = useAuth();
  const currentUser = auth.user;
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserData | null>(null);
  const [isHoveringRefresh, setIsHoveringRefresh] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isIndividualDelete, setIsIndividualDelete] = useState(false);
  const [usersToRegenerate, setUsersToRegenerate] = useState<UserData[]>([]);

  // Fetch real party status from DAML ledger
  const {
    data: partyStatusData,
    isLoading: partyStatsLoading,
    refetch: refetchPartyStatus,
  } = useQuery({
    queryKey: ["party-status"],
    queryFn: async () => {
      const result = await authApi.getPartyStatus();
      if (result.status === 200 && result.data) {
        return result.data;
      }
      throw new Error(result.error || "Failed to fetch party status");
    },
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // TanStack Query for fetching users
  const {
    data: users = [],
    isLoading: loading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const result = await authApi.listUsers();
      if (result.status === 200 && result.data) {
        return result.data;
      }
      throw new Error(result.error || "Failed to fetch users");
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success("Users refreshed successfully");
    } catch (error) {
      console.error("Error refreshing users:", error);
      toast.error("Failed to refresh users");
    }
  };

  // Filter users based on search and role
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.damlParty?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleAddUserSuccess = () => {
    refetch(); // Refresh the user list
  };

  const handleEditUser = (user: UserData) => {
    setUserToEdit(user);
    setShowEditUserModal(true);
  };

  const handleEditUserSuccess = () => {
    refetch(); // Refresh the user list
    refetchPartyStatus(); // Refresh party status
  };

  const handleUserToggle = (userId: string) => {
    const newSelected = selectedUsers.includes(userId)
      ? selectedUsers.filter((id) => id !== userId)
      : [...selectedUsers, userId];
    setSelectedUsers(newSelected);
  };

  const handleUserClick = (user: UserData) => {
    setSelectedUser(user);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
  };

  const handleRegenerateParty = () => {
    // Refresh both users list and party status after regeneration
    refetch();
    refetchPartyStatus();
  };

  const handleBulkRegenerateParties = async () => {
    if (selectedUsers.length === 0) {
      toast.error("No users selected for party regeneration");
      return;
    }

    const selectedUserObjects = users.filter((user) =>
      selectedUsers.includes(user.damlParty || user.id?.toString() || "")
    );

    // Handle single user regeneration directly without modal
    if (selectedUserObjects.length === 1) {
      const user = selectedUserObjects[0];
      try {
        const result = await authApi.regenerateBulkParties([user.id!], true);

        if (result.status === 200 && result.data) {
          const { results } = result.data;

          if (results.success.length > 0) {
            toast.success(`Party regenerated successfully for ${user.name}`);
          } else if (results.failed.length > 0) {
            toast.error(
              `Failed to regenerate party for ${user.name}: ${results.failed[0].error}`
            );
          }
        } else {
          toast.error(
            `Failed to regenerate party for ${user.name}: ${result.error}`
          );
        }

        // Refresh data and clear selection
        setSelectedUsers([]);
        refetch();
        refetchPartyStatus();
      } catch (error) {
        toast.error(
          `Failed to regenerate party for ${user.name}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
      return;
    }

    // Handle multiple users with modal
    setUsersToRegenerate(selectedUserObjects);
    setShowGenerateModal(true);
  };

  const handleRegenerateAll = () => {
    if (users.length === 0) {
      toast.error("No users found to regenerate parties for");
      return;
    }

    setUsersToRegenerate(users);
    setShowGenerateModal(true);
  };

  const handleGenerationComplete = () => {
    setSelectedUsers([]);
    refetch();
    refetchPartyStatus();
    setShowGenerateModal(false);
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                User Management
              </h1>
              <p className="text-muted-foreground">
                Manage registered users and regenerate DAML party identities
              </p>
            </div>

            <div className="flex items-center gap-2">
              <motion.div
                onHoverStart={() => setIsHoveringRefresh(true)}
                onHoverEnd={() => setIsHoveringRefresh(false)}
              >
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isRefetching || loading}
                >
                  <RefreshCw
                    size={16}
                    className="mr-2"
                    isSpinning={isRefetching || loading}
                    forceHover={isHoveringRefresh && !isRefetching && !loading}
                  />
                  {isRefetching ? "Refreshing..." : "Refresh"}
                </Button>
              </motion.div>
              {users.length > 0 && (
                <>
                  <Button
                    variant="regenerate"
                    onClick={handleRegenerateAll}
                    disabled={isRefetching || loading}
                    size="sm"
                  >
                    <IdCard className="h-4 w-4 mr-2" />
                    Bulk Regenerate Parties
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setIsIndividualDelete(false);
                      setShowDeleteModal(true);
                    }}
                    disabled={isRefetching || loading}
                    size="sm"
                  >
                    <Trash className="mr-2" size={16} />
                    Bulk Delete Users
                  </Button>
                </>
              )}
              <Button onClick={() => setShowAddUserModal(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Error Loading Users</strong>
                <br />
                {error instanceof Error
                  ? error.message
                  : "Failed to load users"}
              </AlertDescription>
            </Alert>
          )}

          {/* Statistics Cards */}
          <UserStatistics
            users={filteredUsers}
            loading={loading}
            partyStats={partyStatusData?.stats}
            partyStatsLoading={partyStatsLoading}
          />

          {/* Users List with Integrated Search/Filter */}
          <Card>
            <CardHeader>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <CardTitle>Registered Users</CardTitle>
                  {filteredUsers.length > 0 && (
                    <div className="flex items-center gap-2">
                      {selectedUsers.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedUsers([])}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel Selection
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const allSelected = filteredUsers.every((user) =>
                            selectedUsers.includes(
                              user.damlParty || user.id?.toString() || ""
                            )
                          );
                          if (allSelected) {
                            setSelectedUsers([]);
                          } else {
                            const allUserIds = filteredUsers.map(
                              (u) => u.damlParty || u.id?.toString() || ""
                            );
                            setSelectedUsers(allUserIds);
                          }
                        }}
                      >
                        {filteredUsers.every((user) =>
                          selectedUsers.includes(
                            user.damlParty || user.id?.toString() || ""
                          )
                        )
                          ? "Deselect All"
                          : "Select All"}
                      </Button>
                      {selectedUsers.length > 0 && (
                        <>
                          <Button
                            variant="regenerate"
                            size="sm"
                            onClick={handleBulkRegenerateParties}
                            disabled={isRefetching || loading}
                          >
                            <IdCard className="h-4 w-4 mr-2" />
                            {selectedUsers.length === 1
                              ? "Regenerate Party"
                              : `Bulk Regenerate Parties (${selectedUsers.length})`}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setIsIndividualDelete(true);
                              setShowDeleteModal(true);
                            }}
                            disabled={isRefetching || loading}
                          >
                            <Trash className="mr-2" size={16} />
                            {selectedUsers.length === 1
                              ? "Delete User"
                              : `Delete Selected (${selectedUsers.length})`}
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Integrated Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <div className="flex-1 min-w-0">
                    <div className="relative w-full">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, email, or party ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-full"
                      />
                    </div>
                  </div>
                  <div className="flex-shrink-0 sm:w-44">
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter by role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="lender">Lender</SelectItem>
                        <SelectItem value="borrower">Borrower</SelectItem>
                        <SelectItem value="risk_analyst">
                          Risk Analyst
                        </SelectItem>
                        <SelectItem value="compliance_officer">
                          Compliance Officer
                        </SelectItem>
                        <SelectItem value="market_maker">
                          Market Maker
                        </SelectItem>
                        <SelectItem value="auditor">Auditor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(searchQuery || roleFilter !== "all") && (
                    <div className="flex-shrink-0">
                      <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="w-full sm:w-auto"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Clear
                      </Button>
                    </div>
                  )}
                </div>

                {/* Filter Results Info */}
                {filteredUsers.length !== users.length && (
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredUsers.length} of {users.length} users
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <RefreshCw
                      size={32}
                      className="animate-spin mx-auto mb-3 text-primary"
                    />
                    <p className="text-muted-foreground">Loading users...</p>
                  </div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {users.length === 0
                      ? "No Users Found"
                      : "No Matching Users"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {users.length === 0
                      ? "Get started by registering your first user."
                      : "Try adjusting your search or filter criteria."}
                  </p>
                  {users.length === 0 && (
                    <Button onClick={() => setShowAddUserModal(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Register First User
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {selectedUsers.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4"
                    >
                      <Alert variant="rfq">
                        <CheckCircle2 className="h-3 w-3" />
                        <AlertDescription>
                          <p className="font-medium text-xs">
                            {selectedUsers.length} User
                            {selectedUsers.length !== 1 ? "s" : ""} Selected
                          </p>
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredUsers.map((user, index) => {
                      const userPartyStatus =
                        partyStatusData?.partyStatus?.find(
                          (p) => p.userId === user.id
                        );

                      return (
                        <UserLists
                          key={user.damlParty || user.id?.toString() || index}
                          user={user}
                          index={index}
                          isSelected={selectedUsers.includes(
                            user.damlParty || user.id?.toString() || ""
                          )}
                          onToggleSelect={handleUserToggle}
                          onViewDetails={handleUserClick}
                          onEditUser={handleEditUser}
                          onDeleteUser={(userToDelete) => {
                            // Set the user as selected and open delete modal
                            const userId =
                              userToDelete.damlParty ||
                              userToDelete.id?.toString() ||
                              "";
                            setSelectedUsers([userId]);
                            setIsIndividualDelete(true);
                            setShowDeleteModal(true);
                          }}
                          currentUser={currentUser}
                          partyStatus={userPartyStatus?.status || null}
                        />
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* User Info Modal */}
        <UserInfoModal
          user={selectedUser}
          open={!!selectedUser}
          onOpenChange={() => setSelectedUser(null)}
          onRegenerateParty={handleRegenerateParty}
          onUserUpdate={(updatedUser) => {
            setSelectedUser(updatedUser);
            // Also trigger a refetch to update the main list and party status
            refetch();
            refetchPartyStatus();
          }}
        />

        {/* Add User Modal */}
        <AddUserModal
          open={showAddUserModal}
          onOpenChange={setShowAddUserModal}
          onSuccess={handleAddUserSuccess}
        />

        {/* Generate Parties Modal */}
        <GeneratePartiesModal
          open={showGenerateModal}
          onOpenChange={setShowGenerateModal}
          users={usersToRegenerate}
          onComplete={handleGenerationComplete}
          title={
            usersToRegenerate.length === users.length
              ? "Bulk Regenerate All Parties"
              : "Bulk Regenerate Selected Parties"
          }
          partyStatusData={partyStatusData?.partyStatus}
        />

        {/* Delete Users Modal */}
        <DeleteUsersModal
          open={showDeleteModal}
          onOpenChange={(open) => {
            setShowDeleteModal(open);
            if (!open) {
              setIsIndividualDelete(false);
            }
          }}
          selectedUsers={filteredUsers.filter((user) =>
            selectedUsers.includes(user.damlParty || user.id?.toString() || "")
          )}
          currentUser={currentUser}
          skipTypeSelection={isIndividualDelete}
          onUsersDeleted={() => {
            setSelectedUsers([]);
            setShowDeleteModal(false);
            setIsIndividualDelete(false);
            refetch();
            refetchPartyStatus();
          }}
        />

        {/* Edit User Info Modal */}
        <EditUserInfoModal
          open={showEditUserModal}
          onOpenChange={setShowEditUserModal}
          user={userToEdit}
          onSuccess={handleEditUserSuccess}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
