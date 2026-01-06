"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { ComponentType } from "react";



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
}: {
  items: {
    title?: string;
    url?: string;
    icon?: ComponentType<{ className?: string; size?: number }>;
    separator?: boolean;
    isSubItem?: boolean;
  }[];
}) {
  const pathname = usePathname();

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






        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
