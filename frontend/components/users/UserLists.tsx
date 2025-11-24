"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, IdCard, X, Edit } from "lucide-react";
import { Trash } from "@/components/icons/Trash";
import { GlassAvatar } from "@/components/ui/GlassAvatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import type { UserData } from "@/types/api";

interface UserListItemProps {
  user: UserData;
  index: number;
  isSelected: boolean;
  onToggleSelect: (userId: string) => void;
  onViewDetails: (user: UserData) => void;
  onEditUser?: (user: UserData) => void;
  onDeleteUser?: (user: UserData) => void;
  currentUser?: UserData | null;
  showPrivacyMode?: boolean;
  partyStatus?: "valid" | "invalid" | "no_party" | null;
}

export function UserLists({
  user,
  index,
  isSelected,
  onToggleSelect,
  onViewDetails,
  onEditUser,
  onDeleteUser,
  currentUser,
  partyStatus,
}: UserListItemProps) {
  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "destructive" as const;
      case "lender":
        return "default" as const;
      case "borrower":
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  };

  const getInstitutionalUserName = (index: number, role: string) => {
    const instNumber = String(index + 1).padStart(3, "0");
    const rolePrefix = role.toUpperCase().substring(0, 3);
    return `AEGIS-${rolePrefix}-${instNumber}`;
  };

  const userId = user.damlParty || user.id?.toString() || "";
  const truncatedParty =
    user.damlParty && user.damlParty.length > 24
      ? `${user.damlParty.slice(0, 34)}....${user.damlParty.slice(-34)}`
      : user.damlParty || "No party ID";

  // Check if this user can be deleted (not the current user)
  const canDelete = currentUser && user.id !== currentUser.id && onDeleteUser;

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-lg transition-colors cursor-pointer ${
        isSelected
          ? "bg-primary/10 border border-primary/30"
          : "hover:bg-muted/50 border border-transparent"
      }`}
      onClick={() => onViewDetails(user)}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex-shrink-0">
          <GlassAvatar
            seed={user.image || user.name || user.email}
            size={40}
            className={`${isSelected ? "ring-2 ring-primary/30" : ""}`}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">
              {user.name || getInstitutionalUserName(index, user.role)}
            </span>
            <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
              {user.role}
            </Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    {partyStatus === "valid" ? (
                      <Badge
                        variant="default"
                        className="text-xs bg-green-100 text-green-800 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800"
                      >
                        <IdCard className="h-3 w-3 mr-1" />
                        Synced
                      </Badge>
                    ) : partyStatus === "invalid" ? (
                      <Badge variant="destructive" className="text-xs">
                        <IdCard className="h-3 w-3 mr-1" />
                        Invalid
                      </Badge>
                    ) : partyStatus === "no_party" ? (
                      <Badge
                        variant="outline"
                        className="text-xs text-orange-600 border-orange-200 dark:text-orange-400 dark:border-orange-800"
                      >
                        <IdCard className="h-3 w-3 mr-1" />
                        Missing
                      </Badge>
                    ) : user.damlParty ? (
                      <IdCard className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <IdCard className="h-4 w-4 text-muted-foreground/50" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {partyStatus === "valid"
                      ? "Party synced with DAML ledger"
                      : partyStatus === "invalid"
                      ? "Party exists in database but not in DAML ledger"
                      : partyStatus === "no_party"
                      ? "No DAML party assigned"
                      : user.damlParty
                      ? "DAML party status unknown"
                      : "No DAML party"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p
            className="text-xs text-muted-foreground font-mono truncate"
            title={user.damlParty || "No party ID"}
          >
            {truncatedParty}
          </p>
        </div>
      </div>
      <div className="flex-shrink-0 flex items-center gap-2">
        {onEditUser && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditUser(user);
                  }}
                >
                  <Edit size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit user</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {canDelete && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteUser!(user);
                  }}
                >
                  <Trash size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete user</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <div className="flex items-center gap-1">
          {isSelected && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSelect(userId);
                    }}
                  >
                    <X size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cancel selection</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <div
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(userId);
            }}
          >
            {isSelected ? (
              <CheckCircle2 className="h-5 w-5 text-primary" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
