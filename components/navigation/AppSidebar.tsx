"use client";

import * as React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  ArrowLeftRight,
  Settings,
  Shield,
  Leaf,
} from "lucide-react";

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
  SidebarRail,
} from "@/components/ui/Sidebar";
import { useAuth } from "@/hooks/useAuth";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { auth } = useAuth();

  // Don't render sidebar if user is not authenticated
  if (!auth.user) {
    return null;
  }

  // Navigation items aligned with hackathon categories
  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Digital Loans",
      url: "/dashboard/loans",
      icon: FileText,
    },
    {
      title: "Document Creation",
      url: "/dashboard/documents",
      icon: FileText,
    },
    {
      title: "Secondary Market",
      url: "/dashboard/secondary-market",
      icon: ArrowLeftRight,
    },
    {
      title: "Compliance",
      url: "/dashboard/compliance",
      icon: Shield,
    },
    {
      title: "ESG Reporting",
      url: "/dashboard/esg",
      icon: Leaf,
    },
  ];

  const navSecondary = [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ];

  // User data from authenticated user
  const userData = {
    name: auth.user.name,
    email: auth.user.email,
    avatar: auth.user.image || auth.user.name || auth.user.email,
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                <Logo width={24} height={24} className="object-contain" />
                <span className="text-base font-semibold">Aegis</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
