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

// Define role hierarchy and permissions (matches backend)
export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  admin: {
    name: "Administrator",
    description: "Full system access and user management",
    hierarchy: 100,
    color: "destructive",
    icon: "Shield",
    permissions: [{ resource: "*", actions: ["*"] }],
  },
  compliance_officer: {
    name: "Compliance Officer",
    description: "Regulatory oversight and audit access",
    hierarchy: 80,
    color: "default",
    icon: "FileCheck",
    permissions: [
      { resource: "audit", actions: ["read", "export"] },
      { resource: "users", actions: ["read", "suspend"] },
      { resource: "loans", actions: ["read", "flag"] },
      { resource: "rfqs", actions: ["read", "flag"] },
      { resource: "reports", actions: ["read", "generate"] },
    ],
  },
  risk_analyst: {
    name: "Risk Analyst",
    description: "Risk assessment and credit analysis",
    hierarchy: 70,
    color: "default",
    icon: "TrendingUp",
    permissions: [
      { resource: "credit", actions: ["read", "write", "assess"] },
      { resource: "collateral", actions: ["read", "write", "evaluate"] },
      { resource: "loans", actions: ["read", "assess"] },
      { resource: "rfqs", actions: ["read", "assess"] },
      { resource: "analytics", actions: ["read", "generate"] },
    ],
  },
  market_maker: {
    name: "Market Maker",
    description: "Secondary market operations and liquidity provision",
    hierarchy: 60,
    color: "default",
    icon: "ShoppingCart",
    permissions: [
      { resource: "secondary_market", actions: ["read", "write", "trade"] },
      { resource: "yield", actions: ["read", "write", "manage"] },
      { resource: "liquidity", actions: ["read", "write", "provide"] },
      { resource: "loans", actions: ["read", "trade"] },
      { resource: "pricing", actions: ["read", "write"] },
    ],
  },
  auditor: {
    name: "Auditor",
    description: "Read-only access for audit and compliance review",
    hierarchy: 50,
    color: "outline",
    icon: "Eye",
    permissions: [
      { resource: "audit", actions: ["read"] },
      { resource: "loans", actions: ["read"] },
      { resource: "rfqs", actions: ["read"] },
      { resource: "users", actions: ["read"] },
      { resource: "transactions", actions: ["read"] },
      { resource: "reports", actions: ["read"] },
    ],
  },
  lender: {
    name: "Lender",
    description: "Loan provision and portfolio management",
    hierarchy: 30,
    color: "default",
    icon: "Building",
    permissions: [
      { resource: "rfqs", actions: ["read", "bid"] },
      { resource: "bidding", actions: ["read", "write"] },
      { resource: "loans", actions: ["read", "manage_own"] },
      { resource: "syndication", actions: ["read", "write", "participate"] },
      { resource: "secondary_market", actions: ["read", "sell"] },
      { resource: "portfolio", actions: ["read", "write"] },
    ],
  },
  borrower: {
    name: "Borrower",
    description: "Loan requests and management",
    hierarchy: 20,
    color: "secondary",
    icon: "User",
    permissions: [
      { resource: "rfqs", actions: ["read", "write", "manage_own"] },
      { resource: "loans", actions: ["read", "manage_own"] },
      { resource: "collateral", actions: ["read", "write", "manage_own"] },
      { resource: "credit", actions: ["read", "manage_own"] },
    ],
  },
};

// Navigation items based on roles
export const ROLE_NAVIGATION: Record<UserRole, string[]> = {
  admin: [
    "/dashboard",
    "/dashboard/rfqs",
    "/dashboard/bidding",
    "/dashboard/loans",
    "/dashboard/credit",
    "/dashboard/collateral",
    "/dashboard/syndication",
    "/dashboard/yield",
    "/dashboard/secondary-market",
    "/dashboard/users",
    "/dashboard/admin/platform",
    "/dashboard/admin/treasury",
    "/dashboard/admin/assets",
    "/dashboard/admin/lenders",
    "/dashboard/admin/fees",
    "/dashboard/admin/liquidity",
    "/dashboard/admin/emergency",
    "/dashboard/audit",
    "/dashboard/settings",
  ],
  compliance_officer: [
    "/dashboard",
    "/dashboard/rfqs",
    "/dashboard/loans",
    "/dashboard/users",
    "/dashboard/audit",
    "/dashboard/settings",
  ],
  risk_analyst: [
    "/dashboard",
    "/dashboard/rfqs",
    "/dashboard/loans",
    "/dashboard/credit",
    "/dashboard/collateral",

    "/dashboard/settings",
  ],
  market_maker: [
    "/dashboard",
    "/dashboard/loans",
    "/dashboard/yield",
    "/dashboard/secondary-market",
    "/dashboard/settings",
  ],
  auditor: [
    "/dashboard",
    "/dashboard/rfqs",
    "/dashboard/loans",
    "/dashboard/audit",
    "/dashboard/settings",
  ],
  lender: [
    "/dashboard",
    "/dashboard/rfqs",
    "/dashboard/bidding",
    "/dashboard/loans",
    "/dashboard/syndication",
    "/dashboard/secondary-market",
    "/dashboard/settings",
  ],
  borrower: [
    "/dashboard",
    "/dashboard/rfqs",
    "/dashboard/loans",
    "/dashboard/credit",
    "/dashboard/collateral",
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

// Route access control
export const ROUTE_PERMISSIONS: Record<
  string,
  { resource: string; action: string }
> = {
  "/dashboard": { resource: "dashboard", action: "read" },
  "/dashboard/rfqs": { resource: "rfqs", action: "read" },
  "/dashboard/loans": { resource: "loans", action: "read" },
  "/dashboard/credit": { resource: "credit", action: "read" },
  "/dashboard/collateral": { resource: "collateral", action: "read" },
  "/dashboard/syndication": { resource: "syndication", action: "read" },
  "/dashboard/yield": { resource: "yield", action: "read" },
  "/dashboard/secondary-market": {
    resource: "secondary_market",
    action: "read",
  },
  "/dashboard/users": { resource: "users", action: "read" },
  "/dashboard/admin": { resource: "admin", action: "read" },

  "/dashboard/audit": { resource: "audit", action: "read" },
  "/dashboard/bidding": { resource: "bidding", action: "read" },
};
