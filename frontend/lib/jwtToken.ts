/**
 * JWT Token utilities for DAML authentication
 *
 * In development, you can generate tokens using:
 * cd backend && bun run generate-token <PartyName>
 */

// Default development token for Alice party
// In production, tokens should be obtained from the backend API
export const ALICE_TOKEN = process.env.NEXT_PUBLIC_ALICE_TOKEN || "";

// Token storage keys
const TOKEN_STORAGE_KEY = "daml_token";
const PARTY_STORAGE_KEY = "daml_party";

/**
 * Store JWT token in localStorage
 */
export function setToken(token: string, party: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(PARTY_STORAGE_KEY, party);
  }
}

/**
 * Retrieve JWT token from localStorage
 */
export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }
  return null;
}

/**
 * Retrieve party name from localStorage
 */
export function getParty(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(PARTY_STORAGE_KEY);
  }
  return null;
}

/**
 * Clear stored token and party
 */
export function clearToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(PARTY_STORAGE_KEY);
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}
