"use client";

import * as React from "react";
import type { ComponentType } from "react";
import Link from "next/link";
import {
  Dashboard,
  FileDescription,
  Users,
  Settings,
  Loan,
  Shield,
  CreditCard,
  Coins,
  ShoppingCart,
  UsersGroup,
  Bidding,
  Platform,
} from "@/components/icons";
import {
  Settings as SettingsIcon,
  DollarSign,
  Droplets,
  ShieldAlert,
  Wallet,
  FileText,
} from "lucide-react";

import { NavDocuments } from "@/components/navigation/NavDocuments";
import { NavMain } from "@/components/navigation/NavMain";
import { NavSecondary } from "@/components/navigation/NavSecondary";
import { NavUser } from "@/components/navigation/NavUser";
import { Logo } from "@/components/ui/Logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { RolePermissions } from "@/lib/rolePermissions";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { auth } = useAuth();

  // Don't render sidebar if user is not authenticated
  if (!auth.user) {
    return null;
  }

  const isAdmin = auth.user.role === "admin";

  // Admin-specific navigation items (shown at top for admins)
  const adminNavItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Dashboard,
    },
    {
      title: "Platform",
      url: "/dashboard/admin/platform",
      icon: Platform,
    },
    {
      title: "Treasury",
      url: "/dashboard/admin/treasury",
      icon: Coins,
    },
    {
      title: "Assets",
      url: "/dashboard/admin/assets",
      icon: FileDescription,
    },
    {
      title: "Lenders",
      url: "/dashboard/admin/lenders",
      icon: Wallet,
    },
    {
      title: "Fees",
      url: "/dashboard/admin/fees",
      icon: DollarSign,
    },
    {
      title: "Liquidity",
      url: "/dashboard/admin/liquidity",
      icon: Droplets,
    },
    {
      title: "Emergency",
      url: "/dashboard/admin/emergency",
      icon: ShieldAlert,
    },
    {
      title: "User Management",
      url: "/dashboard/users",
      icon: UsersGroup,
    },
    {
      title: "Audit & Compliance",
      url: "/dashboard/audit",
      icon: Shield,
    },
  ];

  // Regular navigation items (for all users)
  const regularNavItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Dashboard,
    },
    {
      title: auth.user.role === "lender" ? "Available RFQs" : "My RFQs",
      url: "/dashboard/rfqs",
      icon: FileDescription,
    },
    {
      title: "Bidding",
      url: "/dashboard/bidding",
      icon: Bidding,
    },
    {
      title: "Active Loans",
      url: "/dashboard/loans",
      icon: Loan,
    },
    {
      title: "Credit Management",
      url: "/dashboard/credit",
      icon: CreditCard,
    },
    {
      title: "Collateral Pools",
      url: "/dashboard/collateral",
      icon: Shield,
    },
    {
      title: "Syndication",
      url: "/dashboard/syndication",
      icon: Users,
    },
    {
      title: "Yield Generation",
      url: "/dashboard/yield",
      icon: Coins,
    },
    {
      title: "Secondary Market",
      url: "/dashboard/secondary-market",
      icon: ShoppingCart,
    },
  ];

  // Combine navigation based on role
  // For admins: show admin items + separator + regular items (excluding duplicate Dashboard)
  // For others: show regular items as-is
  const allNavItems = isAdmin
    ? [
        ...adminNavItems,
        { separator: true },
        ...regularNavItems.filter((item) => item.url !== "/dashboard"),
      ]
    : regularNavItems;

  // Filter navigation items based on user role
  const navMain = allNavItems.filter((item: any) => {
    // Keep separators
    if (item.separator) return true;

    try {
      return RolePermissions.canAccessRoute(auth.user!.role, item.url);
    } catch (error) {
      console.error(
        `Error checking route access for role ${auth.user!.role} and route ${
          item.url
        }:`,
        error
      );
      return false;
    }
  });

  const navSecondary = [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ];

  const documents: {
    name: string;
    url: string;
    icon: ComponentType<{ className?: string; size?: number }>;
  }[] = [];

  // User data from authenticated user
  const userData = {
    name: auth.user.name,
    email: auth.user.email,
    avatar: auth.user.image || auth.user.name || auth.user.email,
    damlParty: auth.user.damlParty,
    role: auth.user.role,
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                <Logo width={24} height={24} className="object-contain" />
                <span className="text-base font-semibold">Aegis RFQ</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        {documents.length > 0 && <NavDocuments items={documents} />}
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
