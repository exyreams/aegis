"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import type { ComponentType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { DigitalLoans, SecondaryMarket } from "../icons";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/Sidebar";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "nav-expanded-sections";

function getInitialExpanded(pathname: string): Record<string, boolean> {
  if (typeof window !== "undefined") {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
  }
  // Default: expand based on current route
  return {
    loans: pathname.startsWith("/dashboard/loans"),
    secondaryMarket: pathname.startsWith("/dashboard/secondary-market"),
  };
}

export function NavMain({
  items,
  loansItems,
  secondaryMarketItems,
}: {
  items: {
    title?: string;
    url?: string;
    icon?: ComponentType<{ className?: string; size?: number }>;
    separator?: boolean;
    isSubItem?: boolean;
  }[];
  loansItems?: {
    title?: string;
    url?: string;
    icon?: ComponentType<{ className?: string; size?: number }>;
  }[];
  secondaryMarketItems?: {
    title?: string;
    url?: string;
    icon?: ComponentType<{ className?: string; size?: number }>;
  }[];
}) {
  const pathname = usePathname();

  // Track expanded sections - persisted in sessionStorage
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >(() => getInitialExpanded(pathname));

  // Persist to sessionStorage when expanded sections change
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(expandedSections));
    } catch {}
  }, [expandedSections]);

  // Auto-expand section when navigating into it (but don't collapse others)
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);

    if (pathname.startsWith("/dashboard/loans") && !expandedSections.loans) {
      setExpandedSections((prev) => ({ ...prev, loans: true }));
    }
    if (
      pathname.startsWith("/dashboard/secondary-market") &&
      !expandedSections.secondaryMarket
    ) {
      setExpandedSections((prev) => ({ ...prev, secondaryMarket: true }));
    }
  }

  const isLoansExpanded = expandedSections.loans;
  const isSecondaryMarketExpanded = expandedSections.secondaryMarket;

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const isLoansActive = pathname.startsWith("/dashboard/loans");
  const isSecondaryMarketActive = pathname.startsWith(
    "/dashboard/secondary-market"
  );

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu className="space-y-2">
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

            const complianceClasses = "";

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                  className={cn(
                    item.isSubItem ? "ml-6 text-sm" : "",
                    complianceClasses
                  )}
                >
                  <Link href={item.url || "#"}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}



          {/* Loans Collapsible Section */}
          {loansItems && loansItems.length > 0 && (
            <>
              {/* --- Loans Header --- */}
              <SidebarMenuItem>
                <div className="relative">
                  <SidebarMenuButton
                    onClick={() => toggleSection("loans")}
                    className={cn(
                      "group/loans w-full justify-between transition-all duration-300 cursor-pointer",
                      "hover:bg-purple-50 dark:hover:bg-purple-950/30",
                      isLoansActive
                        ? "text-purple-600 dark:text-purple-400"
                        : "hover:text-purple-600 dark:hover:text-purple-400"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <DigitalLoans
                        className={cn(
                          "h-4 w-4 transition-colors",
                          isLoansActive
                            ? "text-purple-500"
                            : "text-muted-foreground group-hover/loans:text-purple-500"
                        )}
                      />
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
              <AnimatePresence initial={false}>
                {isLoansExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="relative overflow-hidden ml-2 pl-2 group-data-[collapsible=icon]:hidden"
                  >
                    {/* Vine connector line */}
                    <div className="absolute left-2 top-2 bottom-0 w-px bg-linear-to-b from-purple-500/30 via-purple-500/10 to-transparent" />

                    <div className="space-y-1">
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
                            className="relative pl-4"
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
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {/* Secondary Market Collapsible Section */}
          {secondaryMarketItems && secondaryMarketItems.length > 0 && (
            <>
              {/* --- Secondary Market Header --- */}
              <SidebarMenuItem>
                <div className="relative">
                  <SidebarMenuButton
                    onClick={() => toggleSection("secondaryMarket")}
                    className={cn(
                      "group/market w-full justify-between transition-all duration-300 cursor-pointer",
                      "hover:bg-cyan-50 dark:hover:bg-cyan-950/30",
                      isSecondaryMarketActive
                        ? "text-cyan-600 dark:text-cyan-400"
                        : "hover:text-cyan-600 dark:hover:text-cyan-400"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <SecondaryMarket
                        className={cn(
                          "h-4 w-4 transition-colors",
                          isSecondaryMarketActive
                            ? "text-cyan-500"
                            : "text-muted-foreground group-hover/market:text-cyan-500"
                        )}
                      />
                      <span className="font-semibold tracking-wide">
                        Secondary Market
                      </span>
                    </div>
                    <div
                      className={cn(
                        "transition-transform duration-300 ease-in-out",
                        isSecondaryMarketExpanded ? "rotate-180" : "rotate-0"
                      )}
                    >
                      <ChevronDown className="h-4 w-4 opacity-70" />
                    </div>
                  </SidebarMenuButton>
                </div>
              </SidebarMenuItem>

              {/* --- Secondary Market Sub-Items --- */}
              <AnimatePresence initial={false}>
                {isSecondaryMarketExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="relative overflow-hidden ml-2 pl-2 group-data-[collapsible=icon]:hidden"
                  >
                    {/* Vine connector line */}
                    <div className="absolute left-2 top-2 bottom-0 w-px bg-linear-to-b from-cyan-500/30 via-cyan-500/10 to-transparent" />

                    <div className="space-y-1">
                      {secondaryMarketItems.map((item) => {
                        let isActive = false;
                        if (item.url === "/dashboard/secondary-market") {
                          isActive = pathname === "/dashboard/secondary-market";
                        } else if (item.url) {
                          isActive = pathname.startsWith(item.url);
                        }

                        return (
                          <SidebarMenuItem
                            key={item.title}
                            className="relative pl-4"
                          >
                            <SidebarMenuButton
                              asChild
                              tooltip={item.title}
                              isActive={isActive}
                              className={cn(
                                "h-8 text-sm transition-all duration-300",
                                isActive
                                  ? "bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 font-medium"
                                  : "hover:bg-cyan-50 dark:hover:bg-cyan-950/20 hover:text-cyan-600 dark:hover:text-cyan-400"
                              )}
                            >
                              <Link href={item.url || "#"}>
                                {item.icon && (
                                  <item.icon
                                    className={cn(
                                      "h-4 w-4 mr-2 transition-colors",
                                      isActive
                                        ? "text-cyan-500"
                                        : "text-muted-foreground group-hover:text-cyan-500"
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
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
