"use client";

import { useRouter } from "next/navigation";
import {
  IconDotsVertical,
  IconLogout,
  IconUserCircle,
  IconShield,
} from "@tabler/icons-react";
import { Settings } from "@/components/icons";
import { RolePermissions } from "@/lib/rolePermissions";
import type { UserRole } from "@/types/api";

import { Badge } from "@/components/ui/Badge";
import { GlassAvatar } from "@/components/ui/GlassAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/Sidebar";
import { useAuth } from "@/hooks/useAuth";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
    role?: UserRole;
  };
}) {
  const { isMobile } = useSidebar();
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleAccountClick = () => {
    router.push("/dashboard/settings");
  };

  const handlePreferencesClick = () => {
    router.push("/dashboard/settings");
  };

  const getRoleBadgeColor = (role?: UserRole) => {
    if (!role) return "outline";
    const config = RolePermissions.getRoleConfig(role);
    return config.color as "destructive" | "default" | "secondary" | "outline";
  };

  // Render avatar component based on type
  const renderAvatar = (size: number, className?: string) => {
    if (!user.avatar || user.avatar.trim() === "") {
      // Generate a default avatar based on user name if no avatar is provided
      const defaultSeed = user.name || user.email || "default";
      return (
        <GlassAvatar seed={defaultSeed} size={size} className={className} />
      );
    }

    // Use GlassAvatar - it handles JSON, data URLs, and seeds
    return <GlassAvatar seed={user.avatar} size={size} className={className} />;
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {renderAvatar(40, "h-10 w-10 rounded-lg")}
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                {renderAvatar(32, "h-8 w-8 rounded-lg")}
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{user.name}</span>
                    {user.role && (
                      <Badge
                        variant={getRoleBadgeColor(user.role)}
                        className="text-xs"
                      >
                        {RolePermissions.getRoleConfig(user.role).name}
                      </Badge>
                    )}
                  </div>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleAccountClick}>
                <IconUserCircle />
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePreferencesClick}>
                <Settings size={16} />
                Preferences
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 focus:text-red-600"
            >
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
