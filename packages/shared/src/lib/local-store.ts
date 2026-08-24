import type {
  UserProfile,
  Project,
  Investment,
  KycRequest,
  ModerationAction,
  AppNotification,
  Universe,
} from "../types";
import type { BlogPost } from "./blog-data";
import initialData from "../data.json";

export interface ZiraDataStore {
  users: UserProfile[];
  projects: Project[];
  investments: Investment[];
  kycRequests: KycRequest[];
  moderationActivity: ModerationAction[];
  blogPosts: BlogPost[];
  notifications: AppNotification[];
}

const STORAGE_KEY = "zira_data_v2";

type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notify() {
  console.log(`[ZIRA Store] 📢 Notifying ${listeners.size} store subscriber(s)...`);
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error("[ZIRA Store] ❌ Store listener error:", e);
    }
  });
}

function loadInitialStore(): ZiraDataStore {
  if (typeof window === "undefined") {
    return initialData as unknown as ZiraDataStore;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.projects) && Array.isArray(parsed.users)) {
        console.log("[ZIRA Store] 📂 Loaded store from localStorage:", {
          projectsCount: parsed.projects.length,
          investmentsCount: (parsed.investments || []).length,
          usersCount: parsed.users.length,
          kycCount: (parsed.kycRequests || []).length,
          notificationsCount: (parsed.notifications || []).length,
        });
        return {
          users: parsed.users || initialData.users,
          projects: parsed.projects || initialData.projects,
          investments: parsed.investments || initialData.investments,
          kycRequests: parsed.kycRequests || initialData.kycRequests,
          moderationActivity: parsed.moderationActivity || initialData.moderationActivity,
          blogPosts: parsed.blogPosts || initialData.blogPosts,
          notifications: parsed.notifications || (initialData as any).notifications || [],
        };
      }
    }
  } catch (e) {
    console.warn("[ZIRA Store] ⚠️ Failed to load store from localStorage, using data.json fallback:", e);
  }

  console.log("[ZIRA Store] 📂 Initialized store with default data.json dataset");
  return {
    ...initialData,
    notifications: (initialData as any).notifications || [],
  } as unknown as ZiraDataStore;
}

let currentStore: ZiraDataStore = loadInitialStore();

// Listen to storage events from other tabs / windows
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        if (parsed && Array.isArray(parsed.projects)) {
          console.log("[ZIRA Store] 📡 Synced store from storage event across windows:", {
            projectsCount: parsed.projects.length,
            investmentsCount: (parsed.investments || []).length,
          });
          currentStore = {
            users: parsed.users || currentStore.users,
            projects: parsed.projects || currentStore.projects,
            investments: parsed.investments || currentStore.investments,
            kycRequests: parsed.kycRequests || currentStore.kycRequests,
            moderationActivity: parsed.moderationActivity || currentStore.moderationActivity,
            blogPosts: parsed.blogPosts || currentStore.blogPosts,
            notifications: parsed.notifications || currentStore.notifications,
          };
          notify();
        }
      } catch (err) {
        console.error("[ZIRA Store] ❌ Failed to parse storage event payload:", err);
      }
    }
  });
}

function saveStore() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentStore));
      console.log("[ZIRA Store] 💾 Saved store state to localStorage:", {
        projectsCount: currentStore.projects.length,
        investmentsCount: currentStore.investments.length,
        usersCount: currentStore.users.length,
      });
    } catch (e) {
      console.warn("[ZIRA Store] ⚠️ Could not save to localStorage:", e);
    }
  }
  notify();
}

export const localStore = {
  getSnapshot(): ZiraDataStore {
    return currentStore;
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  resetToDefault(): void {
    console.log("[ZIRA Store] 🔄 Resetting store to default dataset");
    currentStore = JSON.parse(JSON.stringify(initialData)) as ZiraDataStore;
    saveStore();
  },

  // ─── Users ──────────────────────────────────────────────────────────
  getUsers(): UserProfile[] {
    return currentStore.users;
  },

  getUserById(id: string): UserProfile | undefined {
    return currentStore.users.find((u) => u.id === id);
  },

  getUserByEmail(email: string): UserProfile | undefined {
    return currentStore.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
  },

  saveUser(profile: UserProfile): UserProfile {
    const idx = currentStore.users.findIndex((u) => u.id === profile.id);
    if (idx >= 0) {
      const nextUsers = [...currentStore.users];
      nextUsers[idx] = { ...nextUsers[idx], ...profile };
      currentStore.users = nextUsers;
    } else {
      currentStore.users = [profile, ...currentStore.users];
    }
    console.log("[ZIRA Store] 👤 saveUser:", profile.id, profile.name);
    saveStore();
    return profile;
  },

  updateUserStatus(userId: string, status: UserProfile["status"]): void {
    const userIdx = currentStore.users.findIndex((u) => u.id === userId);
    if (userIdx >= 0) {
      const nextUsers = [...currentStore.users];
      nextUsers[userIdx] = { ...nextUsers[userIdx], status };
      currentStore.users = nextUsers;
      console.log("[ZIRA Store] 👤 updateUserStatus:", userId, status);
      saveStore();
    }
  },

  // ─── Projects ───────────────────────────────────────────────────────
  getProjects(): Project[] {
    return currentStore.projects;
  },

  getProjectById(id: string): Project | undefined {
    return currentStore.projects.find((p) => p.id === id);
  },

  saveProject(project: Project): Project {
    const idx = currentStore.projects.findIndex((p) => p.id === project.id);
    if (idx >= 0) {
      const nextProjects = [...currentStore.projects];
      nextProjects[idx] = { ...nextProjects[idx], ...project };
      currentStore.projects = nextProjects;
      console.log("[ZIRA Store] 📦 saveProject (updated existing):", {
        id: project.id,
        name: project.name,
        status: project.status,
        porteurId: project.porteurId,
      });
    } else {
      currentStore.projects = [project, ...currentStore.projects];
      console.log("[ZIRA Store] 📦 saveProject (created new):", {
        id: project.id,
        name: project.name,
        status: project.status,
        porteurId: project.porteurId,
        totalProjects: currentStore.projects.length,
      });
    }
    saveStore();
    return project;
  },

  updateProjectStatus(projectId: string, status: Project["status"]): void {
    const idx = currentStore.projects.findIndex((proj) => proj.id === projectId);
    if (idx >= 0) {
      const nextProjects = [...currentStore.projects];
      nextProjects[idx] = { ...nextProjects[idx], status };
      currentStore.projects = nextProjects;
      console.log("[ZIRA Store] 🔄 updateProjectStatus:", projectId, status);
      saveStore();
    }
  },

  // ─── Investments ────────────────────────────────────────────────────
  getInvestments(): Investment[] {
    return currentStore.investments;
  },

  addInvestment(investment: Investment): Investment {
    currentStore.investments = [investment, ...currentStore.investments];

    // Automatically update project raisedAmount with immutable object updates
    const projectIdx = currentStore.projects.findIndex((p) => p.id === investment.projectId);
    if (projectIdx >= 0) {
      const p = currentStore.projects[projectIdx];
      const prevFundraising = p.fundraising || {
        targetAmountUSD: 100000,
        equityPercent: 10,
        minInvestment: 500,
        maxInvestment: 20000,
        raisedAmount: 0,
      };
      const newRaised = (prevFundraising.raisedAmount || 0) + investment.amountUSD;
      const newStatus = newRaised >= prevFundraising.targetAmountUSD ? "funded" : p.status;
      
      const nextProjects = [...currentStore.projects];
      nextProjects[projectIdx] = {
        ...p,
        status: newStatus,
        fundraising: {
          ...prevFundraising,
          raisedAmount: newRaised,
        },
      };
      currentStore.projects = nextProjects;

      console.log("[ZIRA Store] 💰 addInvestment processed:", {
        investmentId: investment.id,
        projectId: investment.projectId,
        projectName: p.name,
        amountUSD: investment.amountUSD,
        previousRaised: prevFundraising.raisedAmount,
        newRaised,
        targetAmount: prevFundraising.targetAmountUSD,
        newStatus,
        totalInvestments: currentStore.investments.length,
      });
    } else {
      console.warn("[ZIRA Store] ⚠️ Investment added for unknown project ID:", investment.projectId);
    }

    saveStore();
    return investment;
  },

  // ─── KYC ────────────────────────────────────────────────────────────
  getKycRequests(): KycRequest[] {
    return currentStore.kycRequests;
  },

  saveKycRequest(request: KycRequest): KycRequest {
    const idx = currentStore.kycRequests.findIndex((k) => k.id === request.id);
    if (idx >= 0) {
      const nextKyc = [...currentStore.kycRequests];
      nextKyc[idx] = { ...nextKyc[idx], ...request };
      currentStore.kycRequests = nextKyc;
    } else {
      currentStore.kycRequests = [request, ...currentStore.kycRequests];
    }
    console.log("[ZIRA Store] 📋 saveKycRequest:", request.id, request.userName, request.status);
    saveStore();
    return request;
  },

  updateKycStatus(kycId: string, status: KycRequest["status"], reason?: string): void {
    const idx = currentStore.kycRequests.findIndex((k) => k.id === kycId);
    if (idx >= 0) {
      const nextKyc = [...currentStore.kycRequests];
      nextKyc[idx] = { ...nextKyc[idx], status, rejectionReason: reason };
      currentStore.kycRequests = nextKyc;
      
      // Also update matching user's status
      const userIdx = currentStore.users.findIndex((u) => u.id === nextKyc[idx].userId);
      if (userIdx >= 0) {
        const nextUsers = [...currentStore.users];
        nextUsers[userIdx] = {
          ...nextUsers[userIdx],
          status: status === "approved" ? "active" : "pending_kyc",
        };
        currentStore.users = nextUsers;
      }
      console.log("[ZIRA Store] 📋 updateKycStatus:", kycId, status);
      saveStore();
    }
  },

  // ─── Moderation Activity ────────────────────────────────────────────
  getModerationActivity(): ModerationAction[] {
    return currentStore.moderationActivity;
  },

  addModerationAction(action: ModerationAction): ModerationAction {
    currentStore.moderationActivity = [action, ...currentStore.moderationActivity];
    console.log("[ZIRA Store] 🛡️ addModerationAction:", action.action, action.targetName);
    saveStore();
    return action;
  },

  // ─── Blog ───────────────────────────────────────────────────────────
  getBlogPosts(): BlogPost[] {
    return currentStore.blogPosts || (initialData.blogPosts as BlogPost[]);
  },

  // ─── Notifications ──────────────────────────────────────────────────
  getNotifications(universe?: Universe, userId?: string): AppNotification[] {
    const notifs = currentStore.notifications || [];
    return notifs.filter((n) => {
      if (universe && n.universe !== universe) return false;
      if (userId && n.userId && n.userId !== userId) return false;
      return true;
    });
  },

  addNotification(notif: AppNotification): AppNotification {
    const nextNotifs = [notif, ...(currentStore.notifications || [])];
    currentStore.notifications = nextNotifs;
    console.log("[ZIRA Store] 🔔 addNotification:", notif.title, notif.universe);
    saveStore();
    return notif;
  },

  markNotificationAsRead(id: string): void {
    const notifs = currentStore.notifications || [];
    const idx = notifs.findIndex((n) => n.id === id);
    if (idx >= 0) {
      const next = [...notifs];
      next[idx] = { ...next[idx], read: true };
      currentStore.notifications = next;
      console.log("[ZIRA Store] 🔔 markNotificationAsRead:", id);
      saveStore();
    }
  },

  markAllNotificationsAsRead(universe?: Universe, userId?: string): void {
    const notifs = currentStore.notifications || [];
    const next = notifs.map((n) => {
      if (universe && n.universe !== universe) return n;
      if (userId && n.userId && n.userId !== userId) return n;
      return { ...n, read: true };
    });
    currentStore.notifications = next;
    console.log("[ZIRA Store] 🔔 markAllNotificationsAsRead for", universe, userId);
    saveStore();
  },

  deleteNotification(id: string): void {
    const notifs = currentStore.notifications || [];
    currentStore.notifications = notifs.filter((n) => n.id !== id);
    console.log("[ZIRA Store] 🗑️ deleteNotification:", id);
    saveStore();
  },

  clearAllNotifications(universe?: Universe, userId?: string): void {
    const notifs = currentStore.notifications || [];
    currentStore.notifications = notifs.filter((n) => {
      if (universe && n.universe === universe) {
        if (!userId || n.userId === userId) return false;
      }
      return true;
    });
    console.log("[ZIRA Store] 🗑️ clearAllNotifications for", universe, userId);
    saveStore();
  },
};
