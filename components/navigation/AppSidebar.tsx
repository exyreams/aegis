"use client";

import * as React from "react";
import Link from "next/link";
import {
  Compliance,
  Dashboard,
  Documents,
  ESG,
  DigitalLoans,
} from "@/components/icons";

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
    {
      title: "Compliance",
      url: "/dashboard/compliance",
      icon: Compliance,
    },
  ];

  // ESG section as a separate collapsible group
  const esgItems = [
    {
      title: "Dashboard",
      url: "/dashboard/esg",
      icon: ESG,
    },
    {
      title: "Benchmarks",
      url: "/dashboard/esg/benchmarks",
      icon: ESG,
    },
    {
      title: "Certifications",
      url: "/dashboard/esg/certifications",
      icon: ESG,
    },
    {
      title: "Compliance",
      url: "/dashboard/esg/compliance",
      icon: Compliance,
    },
    {
      title: "Reports",
      url: "/dashboard/esg/reports",
      icon: Documents,
    },
  ];

  // Documents section as a separate collapsible group
  const documentsItems = [
    {
      title: "Dashboard",
      url: "/dashboard/documents",
      icon: Documents,
    },
    {
      title: "Analyze",
      url: "/dashboard/documents/analyze",
      icon: Documents,
    },
    {
      title: "Negotiate",
      url: "/dashboard/documents/negotiate",
      icon: Documents,
    },
    {
      title: "Suggestions",
      url: "/dashboard/documents/suggestions",
      icon: Documents,
    },
    {
      title: "Version Control",
      url: "/dashboard/documents/versions",
      icon: Documents,
    },
  ];

  // Loans section as a separate collapsible group
  const loansItems = [
    {
      title: "Dashboard",
      url: "/dashboard/loans",
      icon: DigitalLoans,
    },
    {
      title: "Analytics",
      url: "/dashboard/loans/analytics",
      icon: DigitalLoans,
    },
    {
      title: "Compare",
      url: "/dashboard/loans/compare",
      icon: DigitalLoans,
    },
    {
      title: "Standard",
      url: "/dashboard/loans/standard",
      icon: DigitalLoans,
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
                <Logo width={24} height={24} className="object-contain" />
                <span className="text-base font-semibold">Aegis</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={navMain}
          esgItems={esgItems}
          documentsItems={documentsItems}
          loansItems={loansItems}
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
