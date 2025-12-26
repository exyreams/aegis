import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type {
  User,
  UserRole,
  LoginRequest,
  RegisterRequest,
} from "@/types/api";

interface AuthState {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Auth Context
export const AuthContext = createContext<{
  auth: AuthState;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<User>;
  logout: () => Promise<void>;
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
    supabaseUser: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check for existing session on mount
  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setAuth({
            user: null,
            supabaseUser: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
        setAuth({
          user: null,
          supabaseUser: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        await fetchUserProfile(session.user);
      } else if (event === "SIGNED_OUT") {
        setAuth({
          user: null,
          supabaseUser: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      // First check if user exists in our user table
      const { data: userData, error } = await supabase
        .from("user")
        .select("*")
        .eq("id", supabaseUser.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        console.error("Error fetching user:", error);
        throw error;
      }

      let user: User;

      if (!userData) {
        // Create user profile if it doesn't exist
        const newUser = {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name:
            supabaseUser.user_metadata?.name ||
            supabaseUser.email!.split("@")[0],
          role: (supabaseUser.user_metadata?.role as UserRole) || "borrower",
          image: supabaseUser.user_metadata?.image || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: createdUser, error: createError } = await supabase
          .from("user")
          .insert([newUser])
          .select()
          .single();

        if (createError) {
          console.error("Error creating user:", createError);
          throw createError;
        }
        user = mapDbUserToUser(createdUser);
      } else {
        user = mapDbUserToUser(userData);
      }

      setAuth({
        user,
        supabaseUser,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setAuth({
        user: null,
        supabaseUser,
        isAuthenticated: true, // Still authenticated with Supabase, just no profile
        isLoading: false,
      });
    }
  };

  // Map database snake_case to camelCase User type
  const mapDbUserToUser = (dbUser: Record<string, unknown>): User => ({
    id: dbUser.id as string,
    email: dbUser.email as string,
    name: dbUser.name as string,
    role: (dbUser.role as UserRole) || "borrower",
    image: dbUser.image as string | undefined,
    createdAt: dbUser.created_at as string,
    updatedAt: dbUser.updated_at as string,
  });

  const login = async (credentials: LoginRequest) => {
    setAuth((prev) => ({ ...prev, isLoading: true }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      if (data.user) {
        await fetchUserProfile(data.user);
      }
    } catch (error) {
      setAuth((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const register = async (registerData: RegisterRequest): Promise<User> => {
    setAuth((prev) => ({ ...prev, isLoading: true }));

    try {
      const { data, error } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          data: {
            name: registerData.name,
            role: registerData.role,
            image: registerData.image,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        await fetchUserProfile(data.user);
        if (!auth.user) throw new Error("Failed to create user profile");
        return auth.user;
      }

      throw new Error("Registration failed");
    } catch (error) {
      setAuth((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setAuth({
        user: null,
        supabaseUser: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const refreshToken = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;

      if (data.user) {
        await fetchUserProfile(data.user);
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      await logout();
      throw new Error("Session expired. Please log in again.");
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!auth.user) throw new Error("No user logged in");

    try {
      const { data, error } = await supabase
        .from("user")
        .update({
          name: updates.name,
          image: updates.image,
          role: updates.role,
          updated_at: new Date().toISOString(),
        })
        .eq("id", auth.user.id)
        .select()
        .single();

      if (error) throw error;

      setAuth((prev) => ({
        ...prev,
        user: mapDbUserToUser(data),
      }));
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    }
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
