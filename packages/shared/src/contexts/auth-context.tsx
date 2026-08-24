import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import type { UserProfile, Universe, UserRole } from "../types";
import { localStore } from "../lib/local-store";
import { clearProfileBannerDismiss } from "../lib/profile-completion";

export type { Universe };

const UNIVERSE_ROLE: Record<Universe, UserProfile["role"]> = {
  porteur: "porteur",
  investisseur: "investisseur",
  moderation: "moderateur",
};

const AUTH_KEY = (u: Universe) => `zira-auth-${u}`;
const CURRENT_USER_KEY = "zira-current-user-id";

function readActiveUniverses(): Record<Universe, boolean> {
  if (typeof window === "undefined") {
    return { porteur: false, investisseur: false, moderation: false };
  }
  return {
    porteur: localStorage.getItem(AUTH_KEY("porteur")) === "1",
    investisseur: localStorage.getItem(AUTH_KEY("investisseur")) === "1",
    moderation: localStorage.getItem(AUTH_KEY("moderation")) === "1",
  };
}

export interface AuthContextValue {
  profile: UserProfile | null;
  authLoading: boolean;
  isAuthenticated: (universe: Universe) => boolean;
  signInWithGoogle: (universe: Universe) => Promise<void>;
  signInWithEmail: (universe: Universe, email: string, password: string) => Promise<void>;
  signInAsModerator: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (universe: Universe, email: string, password: string, name: string) => Promise<void>;
  logout: (universe: Universe) => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateCurrentProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeUniverses, setActiveUniverses] = useState<Record<Universe, boolean>>({
    porteur: false,
    investisseur: false,
    moderation: false,
  });

  const activateUniverse = useCallback((universe: Universe) => {
    localStorage.setItem(AUTH_KEY(universe), "1");
    setActiveUniverses((prev) => ({ ...prev, [universe]: true }));
  }, []);

  const refreshProfile = useCallback(async () => {
    if (profile?.id) {
      const fresh = localStore.getUserById(profile.id);
      if (fresh) setProfile(fresh);
    }
  }, [profile?.id]);

  const updateCurrentProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    const updated: UserProfile = {
      ...profile,
      ...updates,
    };
    localStore.saveUser(updated);
    setProfile(updated);
  }, [profile]);

  // Initialize session from localStorage or default user for the active universe
  useEffect(() => {
    const universes = readActiveUniverses();
    setActiveUniverses(universes);

    const savedUid = localStorage.getItem(CURRENT_USER_KEY);
    let initialUser: UserProfile | undefined;

    if (savedUid) {
      initialUser = localStore.getUserById(savedUid);
    }

    if (!initialUser) {
      if (universes.moderation) {
        initialUser = localStore.getUserById("mod-1") || localStore.getUsers().find((u) => u.role === "moderateur");
      } else if (universes.investisseur) {
        initialUser = localStore.getUserById("inv-user-1") || localStore.getUsers().find((u) => u.role === "investisseur");
      } else if (universes.porteur) {
        initialUser = localStore.getUserById("dev-user-1") || localStore.getUsers().find((u) => u.role === "porteur");
      } else {
        // Default to porteur for exploration
        initialUser = localStore.getUserById("dev-user-1");
      }
    }

    if (initialUser) {
      setProfile(initialUser);
      localStorage.setItem(CURRENT_USER_KEY, initialUser.id);
    }

    setAuthLoading(false);
  }, []);

  const signInWithGoogle = useCallback(async (universe: Universe) => {
    setAuthLoading(true);
    const expectedRole = UNIVERSE_ROLE[universe];
    let user = localStore.getUsers().find((u) => u.role === expectedRole);

    if (!user) {
      user = {
        id: `google_${Date.now()}`,
        name: universe === "moderation" ? "Modérateur ZIRA" : universe === "investisseur" ? "Amina Ndour (Google)" : "Moussa Diakité (Google)",
        email: `google.${universe}@zira-invest.com`,
        role: expectedRole,
        status: "active",
        joinedAt: new Date().toISOString(),
      };
      localStore.saveUser(user);
    }

    setProfile(user);
    localStorage.setItem(CURRENT_USER_KEY, user.id);
    activateUniverse(universe);
    clearProfileBannerDismiss(user.id);
    setAuthLoading(false);
  }, [activateUniverse]);

  const signInWithEmail = useCallback(async (universe: Universe, email: string, _password: string) => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      throw new Error("Veuillez saisir votre adresse e-mail.");
    }

    setAuthLoading(true);
    const expectedRole = UNIVERSE_ROLE[universe];
    let user = localStore.getUserByEmail(trimmedEmail);

    if (!user) {
      // Auto register for seamless access
      user = {
        id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name: trimmedEmail.split("@")[0] || "Utilisateur ZIRA",
        email: trimmedEmail,
        role: expectedRole,
        status: "active",
        joinedAt: new Date().toISOString(),
      };
      localStore.saveUser(user);
    } else if (user.role !== expectedRole) {
      user = {
        ...user,
        role: expectedRole,
      };
      localStore.saveUser(user);
    }

    setProfile(user);
    localStorage.setItem(CURRENT_USER_KEY, user.id);
    activateUniverse(universe);
    clearProfileBannerDismiss(user.id);
    setAuthLoading(false);
  }, [activateUniverse]);

  const signInAsModerator = useCallback(async (email: string, _password: string) => {
    const trimmedEmail = email.trim() || "moderateur@zira-invest.com";
    setAuthLoading(true);

    let modUser = localStore.getUserByEmail(trimmedEmail) || localStore.getUserById("mod-1");
    if (!modUser) {
      modUser = {
        id: "mod-1",
        name: "Modérateur ZIRA",
        email: trimmedEmail,
        role: "moderateur",
        status: "active",
        title: "Responsable Conformité et Risques",
        joinedAt: new Date().toISOString(),
      };
      localStore.saveUser(modUser);
    }

    setProfile(modUser);
    localStorage.setItem(CURRENT_USER_KEY, modUser.id);
    activateUniverse("moderation");
    clearProfileBannerDismiss(modUser.id);
    setAuthLoading(false);
  }, [activateUniverse]);

  const signUpWithEmail = useCallback(async (
    universe: Universe,
    email: string,
    _password: string,
    name: string,
  ) => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      throw new Error("Adresse e-mail requise.");
    }

    setAuthLoading(true);
    const expectedRole = UNIVERSE_ROLE[universe];

    const newUser: UserProfile = {
      id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim() || trimmedEmail.split("@")[0],
      email: trimmedEmail,
      role: expectedRole,
      status: "active",
      joinedAt: new Date().toISOString(),
    };

    localStore.saveUser(newUser);
    setProfile(newUser);
    localStorage.setItem(CURRENT_USER_KEY, newUser.id);
    activateUniverse(universe);
    clearProfileBannerDismiss(newUser.id);
    setAuthLoading(false);
  }, [activateUniverse]);

  const logout = useCallback(async (universe: Universe) => {
    localStorage.removeItem(AUTH_KEY(universe));
    setActiveUniverses((prev) => ({ ...prev, [universe]: false }));

    const anyActive = (["porteur", "investisseur", "moderation"] as Universe[]).some(
      (u) => u !== universe && localStorage.getItem(AUTH_KEY(u)) === "1",
    );

    if (!anyActive) {
      localStorage.removeItem(CURRENT_USER_KEY);
      setProfile(null);
    }
  }, []);

  const isAuthenticated = useCallback((universe: Universe) => {
    if (!activeUniverses[universe]) return false;
    if (!profile) return false;
    return profile.role === UNIVERSE_ROLE[universe];
  }, [activeUniverses, profile]);

  const authValue = useMemo<AuthContextValue>(
    () => ({
      profile,
      authLoading,
      isAuthenticated,
      signInWithGoogle,
      signInWithEmail,
      signInAsModerator,
      signUpWithEmail,
      logout,
      refreshProfile,
      updateCurrentProfile,
    }),
    [
      profile,
      authLoading,
      isAuthenticated,
      signInWithGoogle,
      signInWithEmail,
      signInAsModerator,
      signUpWithEmail,
      logout,
      refreshProfile,
      updateCurrentProfile,
    ],
  );

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
