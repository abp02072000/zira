import {
  Project,
  UserProfile,
  Investment,
  KycRequest,
  ModerationAction,
  AppNotification,
  Universe,
  ProjectStatus,
  KycStatus,
} from "../types";
import {
  INITIAL_USERS,
  INITIAL_PROJECTS,
  INITIAL_INVESTMENTS,
  INITIAL_KYC,
  INITIAL_NOTIFICATIONS,
} from "./mock-data";
import type { ProfileExtras } from "./profile-completion";

class LocalStore {
  private users: UserProfile[] = [];
  private projects: Project[] = [];
  private investments: Investment[] = [];
  private kycRequests: KycRequest[] = [];
  private moderationActivity: ModerationAction[] = [];
  private notifications: AppNotification[] = [];
  private profileExtras: ProfileExtras = {};
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === "undefined") {
      this.users = [...INITIAL_USERS];
      this.projects = [...INITIAL_PROJECTS];
      this.investments = [...INITIAL_INVESTMENTS];
      this.kycRequests = [...INITIAL_KYC];
      this.notifications = [...INITIAL_NOTIFICATIONS];
      return;
    }

    try {
      const u = localStorage.getItem("zira_users");
      this.users = u ? JSON.parse(u) : [...INITIAL_USERS];

      const p = localStorage.getItem("zira_projects");
      this.projects = p ? JSON.parse(p) : [...INITIAL_PROJECTS];

      const i = localStorage.getItem("zira_investments");
      this.investments = i ? JSON.parse(i) : [...INITIAL_INVESTMENTS];

      const k = localStorage.getItem("zira_kyc");
      this.kycRequests = k ? JSON.parse(k) : [...INITIAL_KYC];

      const m = localStorage.getItem("zira_moderation");
      this.moderationActivity = m ? JSON.parse(m) : [];

      const n = localStorage.getItem("zira_notifications");
      this.notifications = n ? JSON.parse(n) : [...INITIAL_NOTIFICATIONS];

      const e = localStorage.getItem("zira_extras");
      this.profileExtras = e ? JSON.parse(e) : {};
    } catch {
      this.users = [...INITIAL_USERS];
      this.projects = [...INITIAL_PROJECTS];
      this.investments = [...INITIAL_INVESTMENTS];
      this.kycRequests = [...INITIAL_KYC];
      this.notifications = [...INITIAL_NOTIFICATIONS];
    }
  }

  private persist() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("zira_users", JSON.stringify(this.users));
      localStorage.setItem("zira_projects", JSON.stringify(this.projects));
      localStorage.setItem("zira_investments", JSON.stringify(this.investments));
      localStorage.setItem("zira_kyc", JSON.stringify(this.kycRequests));
      localStorage.setItem("zira_moderation", JSON.stringify(this.moderationActivity));
      localStorage.setItem("zira_notifications", JSON.stringify(this.notifications));
      localStorage.setItem("zira_extras", JSON.stringify(this.profileExtras));
    } catch (e) {
      console.warn("Storage save warning:", e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  // Reset
  public resetToDefault(): void {
    this.users = [...INITIAL_USERS];
    this.projects = [...INITIAL_PROJECTS];
    this.investments = [...INITIAL_INVESTMENTS];
    this.kycRequests = [...INITIAL_KYC];
    this.notifications = [...INITIAL_NOTIFICATIONS];
    this.moderationActivity = [];
    this.profileExtras = {};
    this.persist();
  }

  // Users
  getUsers(): UserProfile[] { return [...this.users]; }
  getUserById(id: string): UserProfile | undefined { return this.users.find((u) => u.id === id); }
  saveUser(user: UserProfile): UserProfile {
    const idx = this.users.findIndex((u) => u.id === user.id);
    if (idx >= 0) this.users[idx] = user;
    else this.users.push(user);
    this.persist();
    return user;
  }

  // Projects
  getProjects(): Project[] { return [...this.projects]; }
  getProjectById(id: string): Project | undefined { return this.projects.find((p) => p.id === id); }
  saveProject(project: Project): Project {
    const idx = this.projects.findIndex((p) => p.id === project.id);
    if (idx >= 0) this.projects[idx] = project;
    else this.projects.unshift(project);
    this.persist();
    return project;
  }
  moderateProject(id: string, status: ProjectStatus): void {
    const p = this.getProjectById(id);
    if (p) {
      p.status = status;
      this.saveProject(p);
    }
  }
  updateProjectStatus(id: string, status: ProjectStatus): void {
    this.moderateProject(id, status);
  }

  // Investments
  getInvestments(): Investment[] { return [...this.investments]; }
  addInvestment(inv: Investment): Investment {
    this.investments.unshift(inv);
    const p = this.getProjectById(inv.projectId);
    if (p) {
      p.fundraising.raisedAmount += inv.amountUSD;
      this.saveProject(p);
    }
    this.persist();
    return inv;
  }

  // KYC
  getKycRequests(): KycRequest[] { return [...this.kycRequests]; }
  getKycRequestByUserId(uid: string): KycRequest | undefined {
    return this.kycRequests.find((k) => k.userId === uid);
  }
  saveKycRequest(req: KycRequest): KycRequest {
    const idx = this.kycRequests.findIndex((k) => k.id === req.id);
    if (idx >= 0) this.kycRequests[idx] = req;
    else this.kycRequests.unshift(req);
    this.persist();
    return req;
  }
  submitKyc(userId: string, documents: any): KycRequest {
    const req: KycRequest = {
      id: `kyc_${Date.now()}`,
      userId,
      userName: this.getUserById(userId)?.name || "Utilisateur",
      userEmail: this.getUserById(userId)?.email || "user@zira.cd",
      submittedAt: new Date().toISOString(),
      type: "porteur",
      documents: Array.isArray(documents) ? documents : [],
      status: "pending",
    };
    return this.saveKycRequest(req);
  }
  updateKycStatus(kycId: string, status: KycStatus, reason?: string): void {
    const k = this.kycRequests.find((x) => x.id === kycId);
    if (k) {
      k.status = status;
      if (reason) k.rejectionReason = reason;
      this.persist();
    }
  }
  moderateKyc(kycId: string, moderatorId: string, approve: boolean, reason?: string): void {
    const status: KycStatus = approve ? "approved" : "rejected";
    this.updateKycStatus(kycId, status, reason);
    this.addModerationAction({
      id: `mod_act_${Date.now()}`,
      moderatorId,
      targetType: "kyc",
      targetId: kycId,
      action: approve ? "APPROVE_KYC" : "REJECT_KYC",
      reason,
      timestamp: new Date().toISOString(),
    });
  }

  // Moderation
  getModerationActivity(): ModerationAction[] { return [...this.moderationActivity]; }
  addModerationAction(action: ModerationAction): void {
    this.moderationActivity.unshift(action);
    this.persist();
  }

  // Notifications
  getNotifications(universe?: Universe): AppNotification[] {
    if (!universe) return [...this.notifications];
    return this.notifications.filter((n) => n.universe === universe);
  }
  addNotification(n: AppNotification): void {
    this.notifications.unshift(n);
    this.persist();
  }
  markNotificationAsRead(id: string): void {
    const n = this.notifications.find((x) => x.id === id);
    if (n) {
      n.read = true;
      this.persist();
    }
  }
  markAllNotificationsAsRead(universe?: Universe): void {
    this.notifications.forEach((n) => {
      if (!universe || n.universe === universe) n.read = true;
    });
    this.persist();
  }
  deleteNotification(id: string): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.persist();
  }
  clearAllNotifications(universe?: Universe, userId?: string): void {
    this.notifications = this.notifications.filter((n) => {
      if (universe && n.universe !== universe) return true;
      if (userId && n.userId && n.userId !== userId) return true;
      return false;
    });
    this.persist();
  }

  // Extras
  getProfileExtras(): ProfileExtras { return { ...this.profileExtras }; }
  saveProfileExtras(extras: ProfileExtras): ProfileExtras {
    this.profileExtras = { ...this.profileExtras, ...extras };
    this.persist();
    return this.profileExtras;
  }
}

export const localStore = new LocalStore();
