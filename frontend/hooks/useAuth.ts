import { useState, useEffect, createContext, useContext } from "react";
import { authApi } from "@/lib/api";
import type { UserRole } from "@/types/api";

interface User {
  id: string;
  email: string;
  name: string;
  damlParty: string;
  role: UserRole;
  emailVerified: boolean;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
  lenderProfile?: {
    anonymousId: string;
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
  } | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  damlParty: string;
  role: UserRole;
  image?: string;
}

// Auth Context
export const AuthContext = createContext<{
  auth: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
} | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useAuthState() {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check for existing session on mount ONLY
  useEffect(() => {
    fetchProfile();
    // Don't add any auto-refresh or focus listeners - they spam the backend
  }, []);

  const fetchProfile = async () => {
    try {
      const result = await authApi.getCurrentUser();

      if (result.status === 200 && result.data) {
        setAuth({
          user: {
            id: result.data.id,
            email: result.data.email,
            name: result.data.name,
            damlParty: result.data.damlParty || result.data.damlParty,
            role: result.data.role,
            emailVerified: result.data.emailVerified || false,
            image: result.data.image,
            createdAt: result.data.createdAt,
            updatedAt: result.data.updatedAt,
            lenderProfile: result.data.lenderProfile,
          },
          token: null,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        console.error("Failed to fetch profile:", result.error);
        setAuth({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setAuth({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const login = async (credentials: LoginCredentials) => {
    setAuth((prev) => ({ ...prev, isLoading: true }));

    try {
      const result = await authApi.login(
        credentials.email,
        credentials.password
      );

      if (result.status === 200 && result.data) {
        const { user } = result.data;

        setAuth({
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            damlParty: user.damlParty,
            role: user.role,
            emailVerified: user.emailVerified || false,
            image: user.image,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            lenderProfile: user.lenderProfile,
          },
          token: null,
          isAuthenticated: true,
          isLoading: false,
        });

        // Refresh profile data to ensure we have the latest information
        setTimeout(() => {
          fetchProfile();
        }, 100);
      } else {
        throw new Error(result.error || "Login failed");
      }
    } catch (error) {
      setAuth((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const register = async (registerData: RegisterData) => {
    setAuth((prev) => ({ ...prev, isLoading: true }));

    try {
      const result = await authApi.register(
        registerData.email,
        registerData.password,
        registerData.name,
        registerData.damlParty,
        registerData.role,
        registerData.image
      );

      if (result.status === 201 && result.data) {
        const { user } = result.data;

        setAuth({
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            damlParty: user.damlParty || registerData.damlParty,
            role: user.role || registerData.role,
            emailVerified: user.emailVerified || false,
            image: user.image || registerData.image,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            lenderProfile: user.lenderProfile,
          },
          token: null,
          isAuthenticated: true,
          isLoading: false,
        });

        return user;
      } else {
        throw new Error(result.error || "Registration failed");
      }
    } catch (error) {
      setAuth((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Handle logout error silently
    } finally {
      setAuth({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const refreshToken = async () => {
    try {
      // Better-Auth handles token refresh automatically
      await fetchProfile();
    } catch (error) {
      // If refresh fails, logout the user
      logout();
      throw new Error("Session expired. Please log in again.");
    }
  };

  const updateProfile = async (_updates: Partial<User>) => {
    // This would need to be implemented in the backend
    throw new Error("Profile updates not implemented yet");
  };

  return {
    auth,
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
  };
}
