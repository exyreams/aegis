import type { UserRole } from "@/types/api";

export interface Permission {
  resource: string;
  actions: string[];
}

export interface RoleConfig {
  name: string;
  description: string;
  permissions: Permission[];
  hierarchy: number;
  color: string;
  icon: string;
}

// Define role hierarchy and permissions (simplified for hackathon)
export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  admin: {
    name: "Platform Administrator",
    description:
      "Complete platform oversight, user management, and system configuration",
    hierarchy: 100,
    color: "destructive",
    icon: "Shield",
    permissions: [{ resource: "*", actions: ["*"] }],
  },
  lender: {
    name: "Lender",
    description:
      "Evaluate opportunities, provide funding, trade loans, and manage portfolios",
    hierarchy: 50,
    color: "default",
    icon: "Building",
    permissions: [
      { resource: "rfqs", actions: ["read", "bid"] },
      { resource: "bidding", actions: ["read", "write"] },
      { resource: "loans", actions: ["read", "manage_own", "trade"] },
      { resource: "syndication", actions: ["read", "write", "participate"] },
      { resource: "secondary_market", actions: ["read", "write", "trade"] },
      { resource: "portfolio", actions: ["read", "write"] },
      { resource: "credit", actions: ["read", "assess"] },
      { resource: "collateral", actions: ["read", "evaluate"] },
      { resource: "compliance", actions: ["read", "monitor"] },
      { resource: "esg", actions: ["read", "write", "report"] },
      { resource: "analytics", actions: ["read", "generate"] },
      { resource: "documents", actions: ["read", "write"] },
    ],
  },
  borrower: {
    name: "Borrower",
    description:
      "Create loan requests, manage documents, track compliance, and report ESG metrics",
    hierarchy: 30,
    color: "secondary",
    icon: "User",
    permissions: [
      { resource: "rfqs", actions: ["read", "write", "manage_own"] },
      { resource: "loans", actions: ["read", "manage_own"] },
      { resource: "collateral", actions: ["read", "write", "manage_own"] },
      { resource: "credit", actions: ["read", "manage_own"] },
      { resource: "compliance", actions: ["read", "write", "manage_own"] },
      { resource: "esg", actions: ["read", "write", "manage_own", "report"] },
      { resource: "documents", actions: ["read", "write", "manage_own"] },
    ],
  },
};

// Navigation items based on roles (simplified)
export const ROLE_NAVIGATION: Record<UserRole, string[]> = {
  admin: [
    "/dashboard",
    "/dashboard/documents",
    "/dashboard/loans",
    "/dashboard/trading",
    "/dashboard/compliance",
    "/dashboard/esg",
    "/dashboard/users",
    "/dashboard/analytics",
    "/dashboard/settings",
  ],
  lender: [
    "/dashboard",
    "/dashboard/documents",
    "/dashboard/loans",
    "/dashboard/trading",
    "/dashboard/compliance",
    "/dashboard/esg",
    "/dashboard/analytics",
    "/dashboard/settings",
  ],
  borrower: [
    "/dashboard",
    "/dashboard/documents",
    "/dashboard/loans",
    "/dashboard/compliance",
    "/dashboard/esg",
    "/dashboard/settings",
  ],
};

// Permission checking utilities
export class RolePermissions {
  static hasPermission(
    userRole: UserRole,
    resource: string,
    action: string
  ): boolean {
    const roleConfig = ROLE_CONFIGS[userRole];

    // Admin has access to everything
    if (userRole === "admin") {
      return true;
    }

    // Check specific permissions
    for (const permission of roleConfig.permissions) {
      if (permission.resource === "*" || permission.resource === resource) {
        if (
          permission.actions.includes("*") ||
          permission.actions.includes(action)
        ) {
          return true;
        }
      }
    }

    return false;
  }

  static canAccessRoute(userRole: UserRole, route: string): boolean {
    const roleRoutes = ROLE_NAVIGATION[userRole];
    if (!roleRoutes) {
      console.warn(`No navigation routes found for role: ${userRole}`);
      return false;
    }
    return roleRoutes.includes(route);
  }

  static getAccessibleRoutes(userRole: UserRole): string[] {
    const roleRoutes = ROLE_NAVIGATION[userRole];
    if (!roleRoutes) {
      console.warn(`No navigation routes found for role: ${userRole}`);
      return [];
    }
    return roleRoutes;
  }

  static getRoleConfig(role: UserRole): RoleConfig {
    return ROLE_CONFIGS[role];
  }

  static getRoleHierarchy(userRole: UserRole): number {
    return ROLE_CONFIGS[userRole].hierarchy;
  }

  static canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
    if (managerRole === "admin") {
      return true;
    }
    return (
      this.getRoleHierarchy(managerRole) > this.getRoleHierarchy(targetRole)
    );
  }

  static getManageableRoles(userRole: UserRole): UserRole[] {
    const userHierarchy = this.getRoleHierarchy(userRole);

    return Object.entries(ROLE_CONFIGS)
      .filter(([_, config]) => config.hierarchy < userHierarchy)
      .map(([role, _]) => role as UserRole);
  }

  static getAllRoles(): UserRole[] {
    return Object.keys(ROLE_CONFIGS) as UserRole[];
  }
}

// Route access control (simplified)
export const ROUTE_PERMISSIONS: Record<
  string,
  { resource: string; action: string }
> = {
  "/dashboard": { resource: "dashboard", action: "read" },
  "/dashboard/documents": { resource: "documents", action: "read" },
  "/dashboard/loans": { resource: "loans", action: "read" },
  "/dashboard/trading": { resource: "secondary_market", action: "read" },
  "/dashboard/compliance": { resource: "compliance", action: "read" },
  "/dashboard/esg": { resource: "esg", action: "read" },
  "/dashboard/users": { resource: "users", action: "read" },
  "/dashboard/analytics": { resource: "analytics", action: "read" },
};
