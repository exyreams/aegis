"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ComponentType } from "react";
import { ChevronDown } from "lucide-react";
import { ESG, Documents, DigitalLoans, SecondaryMarket } from "../icons";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/Sidebar";
import { cn } from "@/lib/utils";

export function NavMain({
  items,
  esgItems,
  documentsItems,
  loansItems,
}: {
  items: {
    title?: string;
    url?: string;
    icon?: ComponentType<{ className?: string; size?: number }>;
    separator?: boolean;
    isSubItem?: boolean;
  }[];
  esgItems?: {
    title?: string;
    url?: string;
    icon?: ComponentType<{ className?: string; size?: number }>;
  }[];
  documentsItems?: {
    title?: string;
    url?: string;
    icon?: ComponentType<{ className?: string; size?: number }>;
  }[];
  loansItems?: {
    title?: string;
    url?: string;
    icon?: ComponentType<{ className?: string; size?: number }>;
  }[];
}) {
  const pathname = usePathname();
  const [isESGExpanded, setIsESGExpanded] = useState(
    pathname.startsWith("/dashboard/esg")
  );
  const [isDocumentsExpanded, setIsDocumentsExpanded] = useState(
    pathname.startsWith("/dashboard/documents")
  );
  const [isLoansExpanded, setIsLoansExpanded] = useState(
    pathname.startsWith("/dashboard/loans")
  );

  const isESGActive = pathname.startsWith("/dashboard/esg");
  const isDocumentsActive = pathname.startsWith("/dashboard/documents");
  const isLoansActive = pathname.startsWith("/dashboard/loans");

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item, index) => {
            if (item.separator) {
              return (
                <div
                  key={`separator-${index}`}
                  className="my-2 border-t border-sidebar-border"
                />
              );
            }

            let isActive = false;
            if (item.url === "/dashboard") {
              isActive = pathname === "/dashboard";
            } else if (item.url) {
              isActive = pathname.startsWith(item.url);
            }

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                  className={item.isSubItem ? "ml-6 text-sm" : ""}
                >
                  <Link href={item.url || "#"}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}

          {/* Documents Collapsible Section */}
          {documentsItems && documentsItems.length > 0 && (
            <>
              {/* --- Documents Header --- */}
              <SidebarMenuItem>
                <div className="relative">
                  <SidebarMenuButton
                    onClick={() => setIsDocumentsExpanded(!isDocumentsExpanded)}
                    className={cn(
                      "w-full justify-between transition-all duration-300 cursor-pointer",
                      "hover:bg-blue-50 dark:hover:bg-blue-950/30",
                      isDocumentsActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "hover:text-blue-600 dark:hover:text-blue-400"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Documents className="h-3.5 w-3.5" />
                      <span className="font-semibold tracking-wide">
                        Documents
                      </span>
                    </div>
                    <div
                      className={cn(
                        "transition-transform duration-300 ease-in-out",
                        isDocumentsExpanded ? "rotate-180" : "rotate-0"
                      )}
                    >
                      <ChevronDown className="h-4 w-4 opacity-70" />
                    </div>
                  </SidebarMenuButton>
                </div>
              </SidebarMenuItem>

              {/* --- Documents Sub-Items --- */}
              {isDocumentsExpanded && (
                <div className="relative overflow-hidden ml-2 pl-2">
                  {/* Vine connector line */}
                  <div className="absolute left-2 top-2 bottom-0 w-px bg-linear-to-b from-blue-500/30 via-blue-500/10 to-transparent animate-in fade-in" />

                  {documentsItems.map((item) => {
                    let isActive = false;
                    if (item.url === "/dashboard/documents") {
                      isActive = pathname === "/dashboard/documents";
                    } else if (item.url) {
                      isActive = pathname.startsWith(item.url);
                    }

                    return (
                      <SidebarMenuItem
                        key={item.title}
                        className="relative animate-in slide-in-from-left-2 duration-300 pl-4"
                      >
                        <SidebarMenuButton
                          asChild
                          tooltip={item.title}
                          isActive={isActive}
                          className={cn(
                            "h-8 text-sm transition-all duration-300",
                            isActive
                              ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-medium"
                              : "hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:text-blue-600 dark:hover:text-blue-400"
                          )}
                        >
                          <Link href={item.url || "#"}>
                            {item.icon && (
                              <item.icon
                                className={cn(
                                  "h-4 w-4 mr-2 transition-colors",
                                  isActive
                                    ? "text-blue-500"
                                    : "text-muted-foreground group-hover:text-blue-500"
                                )}
                              />
                            )}
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ESG Collapsible Section */}
          {esgItems && esgItems.length > 0 && (
            <>
              {/* --- ESG Header --- */}
              <SidebarMenuItem>
                <div className="relative">
                  <SidebarMenuButton
                    onClick={() => setIsESGExpanded(!isESGExpanded)}
                    className={cn(
                      "w-full justify-between transition-all duration-300 cursor-pointer",
                      "bg-emerald-50 dark:bg-emerald-950/50",
                      "hover:bg-emerald-200/60 dark:hover:bg-emerald-900/50",
                      isESGActive
                        ? "text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                        : "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <ESG className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-semibold tracking-wide">ESG</span>
                    </div>
                    <div
                      className={cn(
                        "transition-transform duration-300 ease-in-out",
                        isESGExpanded ? "rotate-180" : "rotate-0"
                      )}
                    >
                      <ChevronDown className="h-4 w-4 opacity-70" />
                    </div>
                  </SidebarMenuButton>
                </div>
              </SidebarMenuItem>

              {/* --- ESG Sub-Items --- */}
              {isESGExpanded && (
                <div className="relative overflow-hidden ml-2 pl-2">
                  {/* Vine connector line */}
                  <div className="absolute left-2 top-2 bottom-0 w-px bg-linear-to-b from-emerald-500/80 via-emerald-500/20 to-transparent animate-in fade-in" />

                  {esgItems.map((item) => {
                    let isActive = false;
                    if (item.url === "/dashboard/esg") {
                      isActive = pathname === "/dashboard/esg";
                    } else if (item.url) {
                      isActive = pathname.startsWith(item.url);
                    }

                    return (
                      <SidebarMenuItem
                        key={item.title}
                        className="relative animate-in slide-in-from-left-2 duration-300 pl-4"
                      >
                        <SidebarMenuButton
                          asChild
                          tooltip={item.title}
                          isActive={isActive}
                          className={cn(
                            "h-8 text-sm transition-all duration-300",
                            isActive
                              ? "bg-emerald-100! dark:bg-emerald-900/60! text-emerald-800 dark:text-emerald-200 font-medium border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-200/70 dark:hover:bg-emerald-800/60"
                              : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200/50 dark:hover:bg-emerald-900/40 hover:text-emerald-800 dark:hover:text-emerald-200"
                          )}
                        >
                          <Link href={item.url || "#"}>
                            {item.icon && (
                              <item.icon
                                className={cn(
                                  "h-4 w-4 mr-2 transition-colors",
                                  isActive
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-emerald-500/70 dark:text-emerald-500/60"
                                )}
                              />
                            )}
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Loans Collapsible Section */}
          {loansItems && loansItems.length > 0 && (
            <>
              {/* --- Loans Header --- */}
              <SidebarMenuItem>
                <div className="relative">
                  <SidebarMenuButton
                    onClick={() => setIsLoansExpanded(!isLoansExpanded)}
                    className={cn(
                      "w-full justify-between transition-all duration-300 cursor-pointer",
                      "hover:bg-purple-50 dark:hover:bg-purple-950/30",
                      isLoansActive
                        ? "text-purple-600 dark:text-purple-400"
                        : "hover:text-purple-600 dark:hover:text-purple-400"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <DigitalLoans className="h-3.5 w-3.5" />
                      <span className="font-semibold tracking-wide">Loans</span>
                    </div>
                    <div
                      className={cn(
                        "transition-transform duration-300 ease-in-out",
                        isLoansExpanded ? "rotate-180" : "rotate-0"
                      )}
                    >
                      <ChevronDown className="h-4 w-4 opacity-70" />
                    </div>
                  </SidebarMenuButton>
                </div>
              </SidebarMenuItem>

              {/* --- Loans Sub-Items --- */}
              {isLoansExpanded && (
                <div className="relative overflow-hidden ml-2 pl-2">
                  {/* Vine connector line */}
                  <div className="absolute left-2 top-2 bottom-0 w-px bg-linear-to-b from-purple-500/30 via-purple-500/10 to-transparent animate-in fade-in" />

                  {loansItems.map((item) => {
                    let isActive = false;
                    if (item.url === "/dashboard/loans") {
                      isActive = pathname === "/dashboard/loans";
                    } else if (item.url) {
                      isActive = pathname.startsWith(item.url);
                    }

                    return (
                      <SidebarMenuItem
                        key={item.title}
                        className="relative animate-in slide-in-from-left-2 duration-300 pl-4"
                      >
                        <SidebarMenuButton
                          asChild
                          tooltip={item.title}
                          isActive={isActive}
                          className={cn(
                            "h-8 text-sm transition-all duration-300",
                            isActive
                              ? "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 font-medium"
                              : "hover:bg-purple-50 dark:hover:bg-purple-950/20 hover:text-purple-600 dark:hover:text-purple-400"
                          )}
                        >
                          <Link href={item.url || "#"}>
                            {item.icon && (
                              <item.icon
                                className={cn(
                                  "h-4 w-4 mr-2 transition-colors",
                                  isActive
                                    ? "text-purple-500"
                                    : "text-muted-foreground group-hover:text-purple-500"
                                )}
                              />
                            )}
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Secondary Market - at the end */}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Secondary Market"
              isActive={pathname.startsWith("/dashboard/secondary-market")}
            >
              <Link href="/dashboard/secondary-market">
                <SecondaryMarket />
                <span>Secondary Market</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
