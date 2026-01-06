"use client";

import * as React from "react";
import Link from "next/link";
import {
  Dashboard,
  DigitalLoans,
} from "@/components/icons";
import {
  BarChart3,
  Scale,
  Settings,
  ShoppingCart,
  Briefcase,
  PieChart,
} from "lucide-react";

import { NavMain } from "@/components/navigation/NavMain";
import { NavUser } from "@/components/navigation/NavUser";
import { NavUserSkeleton } from "@/components/navigation/NavUserSkeleton";
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { auth } = useAuth();

  // Navigation items aligned with hackathon categories
  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Dashboard,
    },
  ];


  // Loans section as a separate collapsible group
  const loansItems = [
    {
      title: "Overview",
      url: "/dashboard/loans",
      icon: DigitalLoans,
    },
    {
      title: "Loan Analytics",
      url: "/dashboard/loans/analytics",
      icon: BarChart3,
    },
    {
      title: "Rate Comparison",
      url: "/dashboard/loans/compare",
      icon: Scale,
    },
    {
      title: "Loan Standards",
      url: "/dashboard/loans/standard",
      icon: Settings,
    },
  ];

  // Secondary Market section as a separate collapsible group
  const secondaryMarketItems = [
    {
      title: "Marketplace",
      url: "/dashboard/secondary-market",
      icon: ShoppingCart,
    },
    {
      title: "Portfolio",
      url: "/dashboard/secondary-market/portfolio",
      icon: Briefcase,
    },
    {
      title: "Analytics",
      url: "/dashboard/secondary-market/analytics",
      icon: PieChart,
    },
  ];

  // User data from authenticated user (only when available)
  const userData = auth.user
    ? {
        name: auth.user.name,
        email: auth.user.email,
        avatar: auth.user.image || auth.user.name || auth.user.email,
      }
    : null;

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
                <Logo width={28} height={28} className="object-contain" />
                <span className="text-base font-semibold">Aegis</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={navMain}
          loansItems={loansItems}
          secondaryMarketItems={secondaryMarketItems}
        />
      </SidebarContent>
      <SidebarFooter>
        {auth.loading || !userData ? (
          <NavUserSkeleton />
        ) : (
          <NavUser user={userData} />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
