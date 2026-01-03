"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import type { ComponentType } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    documents: pathname.startsWith("/dashboard/documents"),
    esg: pathname.startsWith("/dashboard/esg"),
    loans: pathname.startsWith("/dashboard/loans"),
    secondaryMarket: pathname.startsWith("/dashboard/secondary-market"),
  };
}

export function NavMain({
  items,
  esgItems,
  documentsItems,
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

    if (
      pathname.startsWith("/dashboard/documents") &&
      !expandedSections.documents
    ) {
      setExpandedSections((prev) => ({ ...prev, documents: true }));
    }
    if (pathname.startsWith("/dashboard/esg") && !expandedSections.esg) {
      setExpandedSections((prev) => ({ ...prev, esg: true }));
    }
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

  const isDocumentsExpanded = expandedSections.documents;
  const isESGExpanded = expandedSections.esg;
  const isLoansExpanded = expandedSections.loans;
  const isSecondaryMarketExpanded = expandedSections.secondaryMarket;

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const isDocumentsActive = pathname.startsWith("/dashboard/documents");
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

            // Compliance gets amber color theme
            const isCompliance = item.url === "/dashboard/compliance";
            const complianceClasses = isCompliance
              ? cn(
                  "group/compliance transition-all duration-300",
                  "hover:bg-amber-50 dark:hover:bg-amber-950/30",
                  isActive
                    ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400"
                    : "hover:text-amber-600 dark:hover:text-amber-400"
                )
              : "";

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
                    {item.icon && (
                      <item.icon
                        className={cn(
                          isCompliance && "transition-colors",
                          isCompliance && isActive && "text-amber-500",
                          isCompliance &&
                            !isActive &&
                            "text-muted-foreground group-hover/compliance:text-amber-500"
                        )}
                      />
                    )}
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
                    onClick={() => toggleSection("documents")}
                    className={cn(
                      "group/docs w-full justify-between transition-all duration-300 cursor-pointer",
                      "hover:bg-blue-50 dark:hover:bg-blue-950/30",
                      isDocumentsActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "hover:text-blue-600 dark:hover:text-blue-400"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Documents
                        className={cn(
                          "h-4 w-4 transition-colors",
                          isDocumentsActive
                            ? "text-blue-500"
                            : "text-muted-foreground group-hover/docs:text-blue-500"
                        )}
                      />
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
              <AnimatePresence initial={false}>
                {isDocumentsExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="relative overflow-hidden ml-2 pl-2 group-data-[collapsible=icon]:hidden"
                  >
                    {/* Vine connector line */}
                    <div className="absolute left-2 top-2 bottom-0 w-px bg-linear-to-b from-blue-500/30 via-blue-500/10 to-transparent" />

                    <div className="space-y-1">
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
                            className="relative pl-4"
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
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {/* ESG Collapsible Section */}
          {esgItems && esgItems.length > 0 && (
            <>
              {/* --- ESG Header --- */}
              <SidebarMenuItem>
                <div className="relative">
                  <SidebarMenuButton
                    onClick={() => toggleSection("esg")}
                    className={cn(
                      "group/esg w-full justify-between transition-all duration-300 cursor-pointer",
                      "hover:bg-emerald-50 dark:hover:bg-emerald-950/30",
                      "hover:text-emerald-600 dark:hover:text-emerald-400"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <ESG className="h-4 w-4 transition-colors text-muted-foreground group-hover/esg:text-emerald-500" />
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
              <AnimatePresence initial={false}>
                {isESGExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="relative overflow-hidden ml-2 pl-2 group-data-[collapsible=icon]:hidden"
                  >
                    {/* Vine connector line */}
                    <div className="absolute left-2 top-2 bottom-0 w-px bg-linear-to-b from-emerald-500/80 via-emerald-500/20 to-transparent" />

                    <div className="space-y-1">
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
                            className="relative pl-4"
                          >
                            <SidebarMenuButton
                              asChild
                              tooltip={item.title}
                              isActive={isActive}
                              className={cn(
                                "h-8 text-sm transition-all duration-300",
                                isActive
                                  ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-medium"
                                  : "hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-600 dark:hover:text-emerald-400"
                              )}
                            >
                              <Link href={item.url || "#"}>
                                {item.icon && (
                                  <item.icon
                                    className={cn(
                                      "h-4 w-4 mr-2 transition-colors",
                                      isActive
                                        ? "text-emerald-500"
                                        : "text-muted-foreground group-hover:text-emerald-500"
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
