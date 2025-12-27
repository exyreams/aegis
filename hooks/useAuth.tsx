"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  const fetchUserProfile = async (
    userId: string
  ): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
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
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
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
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    image?: string
  ) => {
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
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
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
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
