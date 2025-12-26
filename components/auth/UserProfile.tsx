"use client";

import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { RolePermissions } from "@/lib/rolePermissions";

export function UserProfile() {
  const { auth, logout } = useAuth();

  if (!auth.user) return null;

  const initials = auth.user.name
    ? auth.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : auth.user.damlParty.slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {auth.user.name || auth.user.damlParty}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {auth.user.email || `${auth.user.damlParty}@example.com`}
            </p>
            <Badge variant="secondary" className="w-fit mt-1">
              {RolePermissions.getRoleConfig(auth.user.role).name}
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-xs text-muted-foreground">
          <User className="mr-2 h-3 w-3" />
          Party: {auth.user.damlParty}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
