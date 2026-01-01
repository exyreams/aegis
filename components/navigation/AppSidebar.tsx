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
import {
  Search,
  MessageSquare,
  Lightbulb,
  GitBranch,
  Target,
  Award,
  Shield,
  FileText,
  BarChart3,
  Scale,
  Settings,
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
    {
      title: "Compliance",
      url: "/dashboard/compliance",
      icon: Compliance,
    },
  ];

  // ESG section as a separate collapsible group
  const esgItems = [
    {
      title: "Overview",
      url: "/dashboard/esg",
      icon: ESG,
    },
    {
      title: "Performance Benchmarks",
      url: "/dashboard/esg/benchmarks",
      icon: Target,
    },
    {
      title: "Green Certifications",
      url: "/dashboard/esg/certifications",
      icon: Award,
    },
    {
      title: "Regulatory Compliance",
      url: "/dashboard/esg/compliance",
      icon: Shield,
    },
    {
      title: "Sustainability Reports",
      url: "/dashboard/esg/reports",
      icon: FileText,
    },
  ];

  // Documents section as a separate collapsible group
  const documentsItems = [
    {
      title: "Overview",
      url: "/dashboard/documents",
      icon: Documents,
    },
    {
      title: "Document Analysis",
      url: "/dashboard/documents/analyze",
      icon: Search,
    },
    {
      title: "Contract Negotiation",
      url: "/dashboard/documents/negotiate",
      icon: MessageSquare,
    },
    {
      title: "AI Suggestions",
      url: "/dashboard/documents/suggestions",
      icon: Lightbulb,
    },
    {
      title: "Version Control",
      url: "/dashboard/documents/versions",
      icon: GitBranch,
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
