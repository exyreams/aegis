/**
 * User Management Service
 *
 * Privacy-preserving user profile management with DAML party integration including
 * lender profile anonymization, tier-based categorization, and secure credential
 * management for institutional lending platform participants.
 */

import { db } from "../db";
import { user } from "../db/schema";
import { eq, sql } from "drizzle-orm";
import { ConsoleLogger } from "../utils/logger";
import { generateSequentialAnonymousId } from "../utils/anonymous-id";

export interface LenderProfile {
  categoryTier:
    | "Tier1Bank"
    | "RegionalBank"
    | "InvestmentFund"
    | "PrivateEquity"
    | "InsuranceCompany"
    | "PensionFund"
    | "SpecialtyLender";
  ratingTier: "Premium" | "Standard" | "Basic";
  capacityTier: "Large" | "Medium" | "Small";
  geographicScope: "Global" | "Regional" | "Local";
  anonymousId: string;

  internalCategory?: string;
  internalRating?: string;
  internalCapacity?: string;
  internalAvailableCapacity?: string;
  activeLoans?: number;
  defaultRate?: string;
  averageInterestRate?: string;
}

export class UserService {
  private static instance: UserService;

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async getLenderProfile(damlParty: string): Promise<LenderProfile | null> {
    try {
      const result = await db
        .select({
          lenderCategoryTier: user.lenderCategoryTier,
          lenderRatingTier: user.lenderRatingTier,
          lenderCapacityTier: user.lenderCapacityTier,
          lenderGeographicScope: user.lenderGeographicScope,
          lenderAnonymousId: user.lenderAnonymousId,

          lenderInternalCategory: user.lenderInternalCategory,
          lenderInternalRating: user.lenderInternalRating,
          lenderInternalCapacity: user.lenderInternalCapacity,
          lenderInternalAvailableCapacity: user.lenderInternalAvailableCapacity,
          activeLoans: user.activeLoans,
          defaultRate: user.defaultRate,
          averageInterestRate: user.averageInterestRate,
        })
        .from(user)
        .where(eq(user.damlParty, damlParty))
        .limit(1);

      if (result.length === 0) {
        ConsoleLogger.warning(`No user found for DAML party: ${damlParty}`);
        return null;
      }

      const userData = result[0];

      // Return null if required fields are missing
      if (!userData.lenderCategoryTier || !userData.lenderAnonymousId) {
        return null;
      }

      return {
        categoryTier: userData.lenderCategoryTier as
          | "Tier1Bank"
          | "RegionalBank"
          | "InvestmentFund"
          | "PrivateEquity"
          | "InsuranceCompany"
          | "PensionFund"
          | "SpecialtyLender",
        ratingTier: userData.lenderRatingTier as
          | "Premium"
          | "Standard"
          | "Basic",
        capacityTier: userData.lenderCapacityTier as
          | "Large"
          | "Medium"
          | "Small",
        geographicScope: userData.lenderGeographicScope as
          | "Global"
          | "Regional"
          | "Local",
        anonymousId: userData.lenderAnonymousId,

        internalCategory: userData.lenderInternalCategory ?? undefined,
        internalRating: userData.lenderInternalRating ?? undefined,
        internalCapacity:
          userData.lenderInternalCapacity?.toString() ?? undefined,
        internalAvailableCapacity:
          userData.lenderInternalAvailableCapacity?.toString() ?? undefined,
        activeLoans: userData.activeLoans ?? undefined,
        defaultRate: userData.defaultRate?.toString() ?? undefined,
        averageInterestRate:
          userData.averageInterestRate?.toString() ?? undefined,
      };
    } catch (error) {
      ConsoleLogger.error("Failed to get lender profile", error);
      return null;
    }
  }

  async updateLenderProfile(
    damlParty: string,
    profile: Partial<LenderProfile>
  ): Promise<boolean> {
    try {
      const updateData: any = {};

      // Update display tier (for UI)
      if (profile.categoryTier)
        updateData.lenderCategoryTier = profile.categoryTier;
      if (profile.ratingTier) updateData.lenderRatingTier = profile.ratingTier;
      if (profile.capacityTier)
        updateData.lenderCapacityTier = profile.capacityTier;
      if (profile.geographicScope)
        updateData.lenderGeographicScope = profile.geographicScope;

      // Store DAML enum value in internal category (for DAML contracts)
      if (profile.categoryTier) {
        updateData.lenderInternalCategory = profile.categoryTier; // This is already the DAML enum value
      }

      if (profile.categoryTier) {
        const existingUser = await this.getUserByDamlParty(damlParty);
        if (existingUser && !existingUser.lenderAnonymousId) {
          const anonymousId = await generateSequentialAnonymousId(
            profile.categoryTier
          );
          updateData.lenderAnonymousId = anonymousId;
          ConsoleLogger.info(
            `Generated anonymous ID: ${anonymousId} for ${damlParty}`
          );
        }
      }

      if (profile.internalCategory)
        updateData.lenderInternalCategory = profile.internalCategory;
      if (profile.internalRating)
        updateData.lenderInternalRating = profile.internalRating;
      if (profile.internalCapacity)
        updateData.lenderInternalCapacity = parseFloat(
          profile.internalCapacity
        );
      if (profile.internalAvailableCapacity)
        updateData.lenderInternalAvailableCapacity = parseFloat(
          profile.internalAvailableCapacity
        );
      if (profile.activeLoans !== undefined)
        updateData.activeLoans = profile.activeLoans;
      if (profile.defaultRate)
        updateData.defaultRate = parseFloat(profile.defaultRate);
      if (profile.averageInterestRate)
        updateData.averageInterestRate = parseFloat(
          profile.averageInterestRate
        );

      await db
        .update(user)
        .set(updateData)
        .where(eq(user.damlParty, damlParty));

      ConsoleLogger.success(`Updated lender profile for ${damlParty}`);
      return true;
    } catch (error) {
      ConsoleLogger.error("Failed to update lender profile", error);
      return false;
    }
  }

  async getUserByDamlParty(damlParty: string) {
    try {
      const result = await db
        .select()
        .from(user)
        .where(eq(user.damlParty, damlParty))
        .limit(1);

      return result.length > 0 ? result[0] : null;
    } catch (error) {
      ConsoleLogger.error("Failed to get user by DAML party", error);
      return null;
    }
  }

  async listUsers(options?: {
    role?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      const baseQuery = db.select().from(user);

      if (options?.role) {
        const result = await baseQuery
          .where(eq(user.role, options.role))
          .limit(options?.limit ?? 1000)
          .offset(options?.offset ?? 0);
        return result;
      } else {
        const result = await baseQuery
          .limit(options?.limit ?? 1000)
          .offset(options?.offset ?? 0);
        return result;
      }
    } catch (error) {
      ConsoleLogger.error("Failed to list users", error);
      return [];
    }
  }

  async ensureLenderAnonymousId(
    damlParty: string,
    categoryTier:
      | "Tier1Bank"
      | "RegionalBank"
      | "InvestmentFund"
      | "PrivateEquity"
      | "InsuranceCompany"
      | "PensionFund"
      | "SpecialtyLender"
      | "undefined" = "undefined"
  ) {
    try {
      const existingUser = await this.getUserByDamlParty(damlParty);

      if (
        existingUser &&
        existingUser.role === "lender" &&
        !existingUser.lenderAnonymousId
      ) {
        const anonymousId = await generateSequentialAnonymousId(categoryTier);

        await db
          .update(user)
          .set({
            lenderAnonymousId: anonymousId,
            lenderCategoryTier: categoryTier, // Display value
            lenderInternalCategory: categoryTier, // DAML enum value
            lenderRatingTier: "Standard",
            lenderCapacityTier: "Medium",
            lenderGeographicScope: "Regional",
          })
          .where(eq(user.damlParty, damlParty));

        ConsoleLogger.success(
          `Auto-generated anonymous ID: ${anonymousId} for new lender ${damlParty}`
        );
        return anonymousId;
      }

      return existingUser?.lenderAnonymousId ?? null;
    } catch (error) {
      ConsoleLogger.error("Failed to ensure lender anonymous ID", error);
      return null;
    }
  }

  async getUserById(id: string) {
    try {
      const result = await db
        .select()
        .from(user)
        .where(eq(user.id, id))
        .limit(1);

      return result.length > 0 ? result[0] : null;
    } catch (error) {
      ConsoleLogger.error("Failed to get user by ID", error);
      return null;
    }
  }

  async getUserStats() {
    try {
      const allUsers = await db.select().from(user);

      const stats = {
        totalUsers: allUsers.length,
        borrowers: allUsers.filter((u) => u.role === "borrower").length,
        lenders: allUsers.filter((u) => u.role === "lender").length,
        admins: allUsers.filter((u) => u.role === "admin").length,
        withDamlParty: allUsers.filter((u) => u.damlParty).length,
        lendersWithAnonymousId: allUsers.filter(
          (u) => u.role === "lender" && u.lenderAnonymousId
        ).length,
      };

      return stats;
    } catch (error) {
      ConsoleLogger.error("Failed to get user stats", error);
      return null;
    }
  }

  async updateUserParty(userId: string, newPartyId: string) {
    try {
      await db
        .update(user)
        .set({ damlParty: newPartyId })
        .where(eq(user.id, userId));

      ConsoleLogger.success(
        `Updated user ${userId} with new party: ${newPartyId}`
      );
      return true;
    } catch (error) {
      ConsoleLogger.error("Failed to update user party", error);
      return false;
    }
  }
  /**
   * Migration function to populate lender_internal_category for existing users
   * This should be called once to migrate existing data
   */
  async migrateLenderCategories() {
    try {
      const lenders = await db
        .select()
        .from(user)
        .where(eq(user.role, "lender"));

      let migratedCount = 0;

      for (const lender of lenders) {
        if (lender.lenderCategoryTier && !lender.lenderInternalCategory) {
          // Map old display values to DAML enum values
          let damlCategory: string;
          switch (lender.lenderCategoryTier) {
            case "Institutional":
              damlCategory = "Tier1Bank";
              break;
            case "Private":
              damlCategory = "InvestmentFund";
              break;
            case "Specialty":
              damlCategory = "SpecialtyLender";
              break;
            default:
              // If it's already a DAML enum value, use it as is
              damlCategory = lender.lenderCategoryTier;
          }

          await db
            .update(user)
            .set({ lenderInternalCategory: damlCategory })
            .where(eq(user.id, lender.id));

          migratedCount++;
          ConsoleLogger.info(
            `Migrated lender ${lender.damlParty}: ${lender.lenderCategoryTier} -> ${damlCategory}`
          );
        }
      }

      ConsoleLogger.success(
        `Migration completed: ${migratedCount} lenders migrated`
      );
      return migratedCount;
    } catch (error) {
      ConsoleLogger.error("Failed to migrate lender categories", error);
      return 0;
    }
  }

  /**
   * Delete a user by ID (admin only)
   * Removes all user data and related information
   */
  async deleteUser(userId: string): Promise<boolean> {
    try {
      // Get user info before deletion for logging
      const userToDelete = await this.getUserById(userId);
      if (!userToDelete) {
        ConsoleLogger.warning(`User not found for deletion: ${userId}`);
        return false;
      }

      // Delete the user (this will cascade delete related data due to foreign keys)
      await db.delete(user).where(eq(user.id, userId));

      ConsoleLogger.success(`Deleted user: ${userId} (${userToDelete.email})`);
      return true;
    } catch (error) {
      ConsoleLogger.error("Failed to delete user", error);
      return false;
    }
  }

  /**
   * Delete a user by DAML party (admin only)
   * Removes all user data and related information
   */
  async deleteUserByDamlParty(damlParty: string): Promise<boolean> {
    try {
      // Get user info before deletion for logging
      const userToDelete = await this.getUserByDamlParty(damlParty);
      if (!userToDelete) {
        ConsoleLogger.warning(`User not found for deletion: ${damlParty}`);
        return false;
      }

      // Delete the user
      await db.delete(user).where(eq(user.damlParty, damlParty));

      ConsoleLogger.success(
        `Deleted user with DAML party: ${damlParty} (${userToDelete.email})`
      );
      return true;
    } catch (error) {
      ConsoleLogger.error("Failed to delete user by DAML party", error);
      return false;
    }
  }

  /**
   * Delete all users except admins (admin only - for user management)
   * Removes all non-admin user data and related information
   */
  async deleteAllNonAdminUsers(): Promise<number> {
    try {
      // Get list of users to delete for logging
      const usersToDelete = await db
        .select()
        .from(user)
        .where(sql`${user.role} != 'admin'`);

      const deleteCount = usersToDelete.length;

      if (deleteCount === 0) {
        ConsoleLogger.info("No non-admin users to delete");
        return 0;
      }

      // Delete all non-admin users
      await db.delete(user).where(sql`${user.role} != 'admin'`);

      ConsoleLogger.success(`Deleted ${deleteCount} non-admin users`);
      return deleteCount;
    } catch (error) {
      ConsoleLogger.error("Failed to delete non-admin users", error);
      return 0;
    }
  }

  /**
   * Delete all users (admin only - use with extreme caution)
   * WARNING: This removes ALL users including admins!
   */
  async deleteAllUsers(): Promise<number> {
    try {
      const allUsers = await db.select().from(user);
      const deleteCount = allUsers.length;

      if (deleteCount === 0) {
        ConsoleLogger.info("No users to delete");
        return 0;
      }

      // Delete ALL users (including admins)
      await db.delete(user);

      ConsoleLogger.success(
        `Deleted all ${deleteCount} users (INCLUDING ADMINS!)`
      );
      return deleteCount;
    } catch (error) {
      ConsoleLogger.error("Failed to delete all users", error);
      return 0;
    }
  }

  /**
   * Update user information (admin only)
   */
  async updateUser(
    userId: string,
    updateData: {
      name?: string;
      email?: string;
      role?: string;
      lenderProfile?: {
        categoryTier?: string;
        ratingTier?: string;
        internalRating?: string;
        capacityTier?: string;
        geographicScope?: string;
      };
    }
  ): Promise<any> {
    try {
      // Prepare update object for main user fields
      const userUpdate: any = {};
      if (updateData.name) userUpdate.name = updateData.name;
      if (updateData.email) userUpdate.email = updateData.email;
      if (updateData.role) userUpdate.role = updateData.role;

      // Prepare lender profile updates
      if (updateData.lenderProfile && updateData.role === "lender") {
        const profile = updateData.lenderProfile;
        if (profile.categoryTier)
          userUpdate.lenderCategoryTier = profile.categoryTier;
        if (profile.ratingTier)
          userUpdate.lenderRatingTier = profile.ratingTier;
        if (profile.internalRating)
          userUpdate.lenderInternalRating = profile.internalRating;
        if (profile.capacityTier)
          userUpdate.lenderCapacityTier = profile.capacityTier;
        if (profile.geographicScope)
          userUpdate.lenderGeographicScope = profile.geographicScope;
      }

      // Update user in database
      await db.update(user).set(userUpdate).where(eq(user.id, userId));

      // Fetch and return updated user
      const updatedUser = await this.getUserById(userId);
      ConsoleLogger.success(`Updated user: ${userId}`);
      return updatedUser;
    } catch (error) {
      ConsoleLogger.error("Failed to update user", error);
      throw error;
    }
  }
}

export const userService = UserService.getInstance();
