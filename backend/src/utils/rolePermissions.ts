/**
 * Role-Based Access Control (RBAC)
 *
 * Comprehensive permission management system with hierarchical roles,
 * resource-based access control, and fine-grained action permissions
 * for secure multi-tenant institutional lending platform operations.
 */

export type UserRole =
  | "admin"
  | "compliance_officer"
  | "risk_analyst"
  | "market_maker"
  | "auditor"
  | "lender"
  | "borrower";

export interface Permission {
  resource: string;
  actions: string[];
}

export interface RoleConfig {
  name: string;
  description: string;
  permissions: Permission[];
  hierarchy: number; // Higher number = more permissions
}

// Define role hierarchy and permissions
export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  admin: {
    name: "Administrator",
    description: "Full system access and user management",
    hierarchy: 100,
    permissions: [
      { resource: "*", actions: ["*"] }, // Full access to everything
      { resource: "aegis_platform", actions: ["*"] }, // Explicit platform management
    ],
  },
  compliance_officer: {
    name: "Compliance Officer",
    description: "Regulatory oversight and audit access",
    hierarchy: 80,
    permissions: [
      { resource: "audit", actions: ["read", "export"] },
      { resource: "users", actions: ["read", "suspend"] },
      { resource: "loans", actions: ["read", "flag"] },
      { resource: "rfqs", actions: ["read", "flag"] },
      { resource: "reports", actions: ["read", "generate"] },
      {
        resource: "aegis_platform",
        actions: ["read", "approve_assets", "approve_fees"],
      },
    ],
  },
  risk_analyst: {
    name: "Risk Analyst",
    description: "Risk assessment and credit analysis",
    hierarchy: 70,
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
    permissions: [
      { resource: "rfqs", actions: ["read", "bid"] },
      { resource: "bidding", actions: ["read", "write"] },
      { resource: "loans", actions: ["read", "manage_own"] },
      { resource: "syndication", actions: ["read", "write", "participate"] },
      { resource: "secondary_market", actions: ["read", "sell"] },
      { resource: "portfolio", actions: ["read", "write"] },
      { resource: "aegis_platform", actions: ["read"] }, // Can view platform status
      { resource: "asset_balance", actions: ["read", "manage_own"] }, // Can manage own balance
    ],
  },
  borrower: {
    name: "Borrower",
    description: "Loan requests and management",
    hierarchy: 20,
    permissions: [
      { resource: "rfqs", actions: ["read", "write", "manage_own"] },
      { resource: "loans", actions: ["read", "manage_own"] },
      { resource: "collateral", actions: ["read", "write", "manage_own"] },
      { resource: "credit", actions: ["read", "manage_own"] },
    ],
  },
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

  static canAccessResource(userRole: UserRole, resource: string): boolean {
    return this.hasPermission(userRole, resource, "read");
  }

  static canModifyResource(userRole: UserRole, resource: string): boolean {
    return this.hasPermission(userRole, resource, "write");
  }

  static getRoleHierarchy(userRole: UserRole): number {
    return ROLE_CONFIGS[userRole].hierarchy;
  }

  static canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
    // Admin can manage anyone
    if (managerRole === "admin") {
      return true;
    }

    // Can only manage roles with lower hierarchy
    return (
      this.getRoleHierarchy(managerRole) > this.getRoleHierarchy(targetRole)
    );
  }

  static getAccessibleRoles(userRole: UserRole): UserRole[] {
    const userHierarchy = this.getRoleHierarchy(userRole);

    return Object.entries(ROLE_CONFIGS)
      .filter(([_, config]) => config.hierarchy <= userHierarchy)
      .map(([role, _]) => role as UserRole);
  }

  static getRoleDisplayName(role: UserRole): string {
    return ROLE_CONFIGS[role].name;
  }

  static getRoleDescription(role: UserRole): string {
    return ROLE_CONFIGS[role].description;
  }
}

// Middleware helper for checking permissions
export function requirePermission(resource: string, action: string) {
  return (userRole: UserRole): boolean => {
    return RolePermissions.hasPermission(userRole, resource, action);
  };
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
  "/dashboard/aegis": { resource: "aegis_platform", action: "read" },
};
