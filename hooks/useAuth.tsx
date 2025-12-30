"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  useMemo,
  useCallback,
} from "react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: "borrower" | "lender" | "admin";
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
}

interface AuthContextType {
  auth: AuthState;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name: string,
    image?: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const fetchUserProfile = async (
  userId: string
): Promise<UserProfile | null> => {
  try {
    const fetchPromise = supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Profile fetch timeout")), 5000)
    );

    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    if (error instanceof Error && error.message === "Profile fetch timeout") {
      console.error("Profile fetch timeout");
    } else {
      console.error("Error fetching user profile:", error);
    }
    return null;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    let profileCache: UserProfile | null = null;

    // Get initial session with timeout
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          // Set session immediately, fetch profile in background
          setAuth((prev) => ({
            ...prev,
            session,
            loading: false,
          }));

          // Fetch profile with timeout
          const profile = await Promise.race([
            fetchUserProfile(session.user.id),
            new Promise<null>((_, reject) =>
              setTimeout(() => reject(new Error("Profile fetch timeout")), 3000)
            ),
          ]).catch(() => null);

          profileCache = profile;
          setAuth({
            user: profile,
            session,
            loading: false,
          });
        } else {
          setAuth({
            user: null,
            session: null,
            loading: false,
          });
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setAuth({
          user: null,
          session: null,
          loading: false,
        });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Use cached profile if same user, otherwise fetch new
        if (profileCache?.id === session.user.id) {
          setAuth({
            user: profileCache,
            session,
            loading: false,
          });
        } else {
          // Set session immediately, fetch profile in background
          setAuth((prev) => ({
            ...prev,
            session,
            loading: false,
          }));

          const profile = await fetchUserProfile(session.user.id).catch(
            () => null
          );
          profileCache = profile;
          setAuth({
            user: profile,
            session,
            loading: false,
          });
        }
      } else {
        profileCache = null;
        setAuth({
          user: null,
          session: null,
          loading: false,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, name: string, image?: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            image,
          },
        },
      });

      if (error) {
        throw error;
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    // Redirect to home page after signout
    window.location.href = "/";
  }, []);

  const updateProfile = useCallback(
    async (data: Partial<UserProfile>) => {
      if (!auth.user) {
        throw new Error("No user logged in");
      }

      const { error } = await supabase
        .from("users")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", auth.user.id);

      if (error) {
        throw error;
      }

      // Refresh user profile
      const updatedProfile = await fetchUserProfile(auth.user.id);
      if (updatedProfile) {
        setAuth((prev) => ({
          ...prev,
          user: updatedProfile,
        }));
      }
    },
    [auth.user]
  );

  const contextValue = useMemo(
    () => ({
      auth,
      signIn,
      signUp,
      signOut,
      updateProfile,
    }),
    [auth, signIn, signUp, signOut, updateProfile]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
