import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserProfile, UserRole } from "../types";
import { localStore } from "../lib/local-store";
import {
  getAuthToken,
  setAuthToken,
  loginUser as apiLogin,
  registerUser as apiRegister,
  logoutUser as apiLogout,
  fetchMe,
  updateUserProfile as apiUpdateProfile,
} from "../lib/api-client";

interface AuthContextValue {
  user: UserProfile | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email?: string, password?: string, role?: UserRole) => Promise<void>;
  register: (data: { name: string; email: string; role: UserRole; companyName?: string }) => Promise<void>;
  logout: () => Promise<void>;
  switchUser: (role: UserRole) => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedUid = localStorage.getItem("zira-current-user-id") || "dev-user-1";
        const local = localStore.getUserById(savedUid) || localStore.getUsers()[0];
        setUser(local || null);
        try {
          const remote = await fetchMe();
          if (remote.user) setUser(remote.user);
        } catch {
          // fallback to local
        }
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email?: string, password?: string, role?: UserRole) => {
    setIsLoading(true);
    try {
      const res = await apiLogin({ email, password, role });
      setUser(res.user);
      if (res.user?.id) localStorage.setItem("zira-current-user-id", res.user.id);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; role: UserRole; companyName?: string }) => {
    setIsLoading(true);
    try {
      const u = await apiRegister(data);
      setUser(u);
      if (u?.id) localStorage.setItem("zira-current-user-id", u.id);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  const switchUser = (role: UserRole) => {
    const target = localStore.getUsers().find((u) => u.role === role);
    if (target) {
      setUser(target);
      localStorage.setItem("zira-current-user-id", target.id);
      setAuthToken(`test-user-${target.id}:${target.email}:${target.role}`);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = await apiUpdateProfile(user.id, data);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile: user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        switchUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
