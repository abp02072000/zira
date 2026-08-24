import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import type {
  UserProfile,
  Project,
  Investment,
  KycRequest,
  ModerationAction,
  AppNotification,
  Universe,
} from "../types";
import { formatUSD, formatDate } from "../lib/mock-data";
import { localStore } from "../lib/local-store";
import {
  fetchMyProjects,
  createProject as apiCreateProject,
  updateProject as apiUpdateProject,
  submitKyc as apiSubmitKyc,
} from "../lib/api-client";
import { useAuth } from "./auth-context";

interface AppDataContextValue {
  users: UserProfile[];
  projects: Project[];
  investments: Investment[];
  kycRequests: KycRequest[];
  moderationActivity: ModerationAction[];
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  loading: boolean;
  currentPorteurId: string;
  currentInvestorId: string;
  currentModeratorId: string;
  getUser: (id: string) => UserProfile | undefined;
  getProject: (id: string) => Project | undefined;
  getInvestmentsByInvestor: (investorId: string) => Investment[];
  getInvestmentsByProject: (projectId: string) => Investment[];
  getProjectsByPorteur: (porteurId: string) => Project[];
  getNotificationsForUser: (universe?: Universe, userId?: string) => AppNotification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: (universe?: Universe, userId?: string) => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: (universe?: Universe, userId?: string) => void;
  addNotification: (notif: Omit<AppNotification, "id" | "createdAt"> & { id?: string; createdAt?: string }) => AppNotification;
  formatUSD: (n: number) => string;
  formatDate: (iso: string) => string;
  setUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;
  setKycRequests: React.Dispatch<React.SetStateAction<KycRequest[]>>;
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  addProject: (project: Project) => Promise<Project>;
  updateProject: (project: Partial<Project> & { id: string }) => Promise<Project>;
  investInProject: (projectId: string, amountUSD: number, equityPercent: number) => Promise<Investment>;
  submitKyc: (documents: { document_type: string; document_url: string }[] | string[]) => Promise<KycRequest>;
  moderateKyc: (kycId: string, userId: string, approved: boolean, reason?: string) => Promise<void>;
  moderateProject: (projectId: string, status: Project["status"]) => Promise<void>;
  refreshData: (universe?: Universe) => Promise<void>;
  resetToDefaultData: () => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>(() => localStore.getUsers());
  const [projects, setProjects] = useState<Project[]>(() => localStore.getProjects());
  const [investments, setInvestments] = useState<Investment[]>(() => localStore.getInvestments());
  const [kycRequests, setKycRequests] = useState<KycRequest[]>(() => localStore.getKycRequests());
  const [moderationActivity, setModerationActivity] = useState<ModerationAction[]>(() => localStore.getModerationActivity());
  const [notifications, setNotifications] = useState<AppNotification[]>(() => localStore.getNotifications());
  const [loading, setLoading] = useState(false);

  const currentPorteurId = profile?.id || (profile?.role === "porteur" ? profile.id : "dev-user-1");
  const currentInvestorId = profile?.id || (profile?.role === "investisseur" ? profile.id : "inv-user-1");
  const currentModeratorId = profile?.id || (profile?.role === "moderateur" ? profile.id : "mod-1");

  // Subscribe to local store changes and fetch real projects from Go backend
  useEffect(() => {
    console.log("[AppDataContext] 🚀 AppDataProvider mounted, registering store subscriber & fetching backend data...");
    const syncState = () => {
      const u = localStore.getUsers();
      const p = localStore.getProjects();
      const i = localStore.getInvestments();
      const k = localStore.getKycRequests();
      const m = localStore.getModerationActivity();
      const n = localStore.getNotifications();

      setUsers([...u]);
      setProjects([...p]);
      setInvestments([...i]);
      setKycRequests([...k]);
      setModerationActivity([...m]);
      setNotifications([...n]);
      setLoading(false);
    };

    syncState();
    const unsubscribe = localStore.subscribe(syncState);

    // Initial fetch from real Go backend
    fetchMyProjects()
      .then((liveProjects) => {
        if (liveProjects && liveProjects.length > 0) {
          console.log("[AppDataContext] 📡 Live projects fetched from Go Backend:", liveProjects.length);
          syncState();
        }
      })
      .catch((err) => {
        console.warn("[AppDataContext] Initial fetch from Go backend (using local fallback):", err);
      });

    return () => {
      console.log("[AppDataContext] 🛑 AppDataProvider unmounting, unsubscribing from store...");
      unsubscribe();
    };
  }, []);

  const refreshData = useCallback(async () => {
    console.log("[AppDataContext] 🔄 Manual refreshData() triggered");
    try {
      await fetchMyProjects();
    } catch {
      // ignore
    }
    setUsers([...localStore.getUsers()]);
    setProjects([...localStore.getProjects()]);
    setInvestments([...localStore.getInvestments()]);
    setKycRequests([...localStore.getKycRequests()]);
    setModerationActivity([...localStore.getModerationActivity()]);
    setNotifications([...localStore.getNotifications()]);
  }, []);

  const addProject = useCallback(async (projectData: Project): Promise<Project> => {
    const id = projectData.id || `proj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const porteurId = projectData.porteurId || profile?.id || "dev-user-1";
    const newProject: Project = {
      ...projectData,
      id,
      porteurId,
      createdAt: projectData.createdAt || new Date().toISOString(),
      status: projectData.status || "active",
    };

    console.log("[AppDataContext] ➕ addProject called, submitting to Go backend:", newProject);

    let saved: Project;
    try {
      saved = await apiCreateProject(newProject);
    } catch (err) {
      console.warn("[AppDataContext] Go API createProject fallback to localStore:", err);
      saved = localStore.saveProject(newProject);
    }

    // Auto-generate notifications
    localStore.addNotification({
      id: `notif_${Date.now()}_p`,
      universe: "porteur",
      userId: porteurId,
      title: "Projet créé avec succès",
      message: `Votre projet "${saved.name}" est désormais enregistré et soumis pour revue.`,
      type: "project",
      actionUrl: "/porteur/projets",
      read: false,
      createdAt: new Date().toISOString(),
    });

    localStore.addNotification({
      id: `notif_${Date.now()}_m`,
      universe: "moderation",
      title: "Nouveau projet soumis",
      message: `Le projet "${saved.name}" a été créé et requiert un audit de conformité.`,
      type: "project",
      actionUrl: "/moderateur/projets",
      read: false,
      createdAt: new Date().toISOString(),
    });

    setNotifications([...localStore.getNotifications()]);
    return saved;
  }, [profile?.id]);

  const updateProject = useCallback(async (projectData: Partial<Project> & { id: string }): Promise<Project> => {
    console.log("[AppDataContext] ✏️ updateProject called for Go backend:", projectData);
    let saved: Project;
    try {
      saved = await apiUpdateProject(projectData.id, projectData);
    } catch (err) {
      console.warn("[AppDataContext] Go API updateProject fallback to localStore:", err);
      const existing = localStore.getProjectById(projectData.id);
      if (!existing) {
        throw new Error("Projet introuvable");
      }
      const merged: Project = { ...existing, ...projectData };
      saved = localStore.saveProject(merged);
    }
    return saved;
  }, []);

  const resetToDefaultData = useCallback(() => {
    console.log("[AppDataContext] 🔄 resetToDefaultData called");
    localStore.resetToDefault();
  }, []);

  const investInProject = useCallback(async (
    projectId: string,
    amountUSD: number,
    equityPercent: number,
  ): Promise<Investment> => {
    const investorId = profile?.id || currentInvestorId || "inv-user-1";
    const investorName = profile?.name || "Investisseur ZIRA";
    const investorEmail = profile?.email || "investisseur@zira-invest.com";

    const inv: Investment = {
      id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      projectId,
      investorId,
      amountUSD,
      equityReceived: equityPercent,
      date: new Date().toISOString(),
      status: "completed",
      investorName,
      investorEmail,
    };

    console.log("[AppDataContext] 💳 investInProject called:", {
      projectId,
      amountUSD,
      equityPercent,
      investorId,
      investorName,
      createdInvestment: inv,
    });

    const result = localStore.addInvestment(inv);
    const p = localStore.getProjectById(projectId);

    // Auto-generate notifications
    localStore.addNotification({
      id: `notif_${Date.now()}_inv`,
      universe: "investisseur",
      userId: investorId,
      title: "Investissement confirmé ! 🎉",
      message: `Vous avez investi ${formatUSD(amountUSD)} (${equityPercent.toFixed(1)}% d'equity) dans le projet "${p?.name || "Startup"}".`,
      type: "investment",
      actionUrl: "/investisseur/wallet",
      read: false,
      createdAt: new Date().toISOString(),
    });

    if (p?.porteurId) {
      localStore.addNotification({
        id: `notif_${Date.now()}_port`,
        universe: "porteur",
        userId: p.porteurId,
        title: "Nouvel investissement reçu ! 💰",
        message: `${investorName} a injecté ${formatUSD(amountUSD)} dans votre campagne "${p.name}".`,
        type: "investment",
        actionUrl: "/porteur/portefeuille",
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    localStore.addNotification({
      id: `notif_${Date.now()}_mod`,
      universe: "moderation",
      title: "Flux financier enregistré",
      message: `Transaction de ${formatUSD(amountUSD)} effectuée par ${investorName} sur le projet "${p?.name || projectId}".`,
      type: "investment",
      actionUrl: "/moderateur/flux",
      read: false,
      createdAt: new Date().toISOString(),
    });

    setNotifications([...localStore.getNotifications()]);
    console.log("[AppDataContext] ✅ investInProject completed successfully:", result);
    return result;
  }, [profile, currentInvestorId]);

  const submitKyc = useCallback(async (
    documents: { document_type: string; document_url: string }[] | string[]
  ): Promise<KycRequest> => {
    const userId = profile?.id || "dev-user-1";
    const userName = profile?.name || "Utilisateur ZIRA";
    const userEmail = profile?.email || "utilisateur@zira-invest.com";
    const type = profile?.role === "investisseur" ? "investisseur" : "porteur";

    console.log("[AppDataContext] 📋 submitKyc called, transmitting to Go backend:", documents);
    let saved: KycRequest;
    try {
      saved = await apiSubmitKyc(documents);
    } catch {
      const kycReq: KycRequest = {
        id: `kyc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        userId,
        userName,
        userEmail,
        submittedAt: new Date().toISOString(),
        type,
        documents,
        status: "pending",
      };
      saved = localStore.saveKycRequest(kycReq);
    }

    // Auto-generate notifications
    localStore.addNotification({
      id: `notif_${Date.now()}_kyc_user`,
      universe: type,
      userId,
      title: "Dossier KYC transmis 📄",
      message: "Vos documents d'identité ont été transmis avec succès et sont en cours d'analyse par l'équipe de conformité.",
      type: "kyc",
      actionUrl: `/${type}/profil`,
      read: false,
      createdAt: new Date().toISOString(),
    });

    localStore.addNotification({
      id: `notif_${Date.now()}_kyc_mod`,
      universe: "moderation",
      title: "Nouveau dossier KYC à auditer",
      message: `Dossier de conformité soumis par ${userName} (${userEmail}).`,
      type: "kyc",
      actionUrl: "/moderateur/kyc",
      read: false,
      createdAt: new Date().toISOString(),
    });

    setNotifications([...localStore.getNotifications()]);
    return saved;
  }, [profile]);

  const moderateKyc = useCallback(async (
    kycId: string,
    userId: string,
    approved: boolean,
    reason?: string
  ): Promise<void> => {
    console.log("[AppDataContext] 🛡️ moderateKyc called:", { kycId, userId, approved, reason });
    const status = approved ? "approved" : "rejected";
    localStore.updateKycStatus(kycId, status, reason);
    localStore.addModerationAction({
      id: `act_${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      action: approved ? "kyc_approved" : "kyc_rejected",
      target: userId,
      targetName: `Dossier KYC (${userId})`,
      by: profile?.id || "mod-1",
      byEmail: profile?.email || "moderateur@zira-invest.com",
      details: reason ? `Motif: ${reason}` : (approved ? "Validation des pièces justificatives" : "Refus du dossier"),
    });

    // Notify the target user
    const targetUser = localStore.getUsers().find((u) => u.id === userId);
    const targetUniverse: Universe = targetUser?.role === "investisseur" ? "investisseur" : "porteur";

    localStore.addNotification({
      id: `notif_${Date.now()}_mod_kyc_res`,
      universe: targetUniverse,
      userId,
      title: approved ? "Compte certifié KYC ✅" : "Dossier KYC refusé ⚠️",
      message: approved
        ? "Félicitations ! Vos pièces justificatives ont été validées par l'équipe de modération."
        : `Votre dossier n'a pas été validé. ${reason ? `Motif : ${reason}` : "Veuillez vérifier et renvoyer vos documents."}`,
      type: approved ? "kyc" : "warning",
      actionUrl: `/${targetUniverse}/profil`,
      read: false,
      createdAt: new Date().toISOString(),
    });

    setNotifications([...localStore.getNotifications()]);
  }, [profile]);

  const moderateProject = useCallback(async (
    projectId: string,
    status: Project["status"]
  ): Promise<void> => {
    console.log("[AppDataContext] 🛡️ moderateProject called:", { projectId, status });
    localStore.updateProjectStatus(projectId, status);
    const p = localStore.getProjectById(projectId);
    const actionName = status === "active" ? "project_validated" : "project_suspended";
    localStore.addModerationAction({
      id: `act_${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      action: actionName,
      target: projectId,
      targetName: p?.name || projectId,
      by: profile?.id || "mod-1",
      byEmail: profile?.email || "moderateur@zira-invest.com",
      details: `Statut mis à jour vers: ${status}`,
    });

    if (p?.porteurId) {
      localStore.addNotification({
        id: `notif_${Date.now()}_mod_proj_res`,
        universe: "porteur",
        userId: p.porteurId,
        title: status === "active" ? "Campagne validée & en ligne ! 🚀" : status === "suspended" ? "Campagne suspendue ⚠️" : "Statut du projet mis à jour",
        message: status === "active"
          ? `Votre projet "${p.name}" a été approuvé par la modération et est désormais accessible aux investisseurs.`
          : `Le statut de votre projet "${p.name}" a été mis à jour : ${status}.`,
        type: status === "active" ? "project" : "warning",
        actionUrl: "/porteur/projets",
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    setNotifications([...localStore.getNotifications()]);
  }, [profile]);

  const getUser = useCallback((id: string) => users.find((u) => u.id === id), [users]);
  const getProject = useCallback((id: string) => {
    const p = projects.find((proj) => proj.id === id);
    if (!p) {
      console.warn("[AppDataContext] ⚠️ getProject: No project found with id", id, "in", projects.length, "projects");
    }
    return p;
  }, [projects]);

  const getInvestmentsByInvestor = useCallback(
    (investorId: string) => {
      const targetId = investorId || profile?.id || currentInvestorId || "inv-user-1";
      const userInvs = investments.filter(
        (i) => i.investorId === targetId || (profile?.id && i.investorId === profile.id)
      );
      console.log("[AppDataContext] 🔍 getInvestmentsByInvestor:", {
        investorId,
        targetId,
        profileId: profile?.id,
        matchedCount: userInvs.length,
        totalInvestmentsInState: investments.length,
      });
      return userInvs;
    },
    [investments, profile, currentInvestorId],
  );

  const getInvestmentsByProject = useCallback(
    (projectId: string) => investments.filter((i) => i.projectId === projectId),
    [investments],
  );

  const getProjectsByPorteur = useCallback(
    (porteurId: string) => {
      const targetId = porteurId || profile?.id || currentPorteurId || "dev-user-1";
      const direct = projects.filter(
        (p) => p.porteurId === targetId || (profile?.id && p.porteurId === profile.id)
      );
      console.log("[AppDataContext] 🔍 getProjectsByPorteur:", {
        porteurId,
        targetId,
        profileId: profile?.id,
        currentPorteurId,
        matchedDirectCount: direct.length,
        totalProjectsInState: projects.length,
      });
      if (direct.length > 0) return direct;
      const fallback = projects.filter((p) => p.porteurId === "dev-user-1" || !p.porteurId);
      console.log("[AppDataContext] 🔍 getProjectsByPorteur: Using fallback (dev-user-1 projects):", fallback.length);
      return fallback;
    },
    [projects, profile, currentPorteurId],
  );

  const getNotificationsForUser = useCallback(
    (universe?: Universe, userId?: string) => {
      const activeUniverse = universe || (profile?.role === "moderateur" ? "moderation" : profile?.role === "investisseur" ? "investisseur" : "porteur");
      const activeUserId = userId || profile?.id;
      return notifications.filter((n) => {
        if (activeUniverse && n.universe !== activeUniverse) return false;
        if (activeUserId && n.userId && n.userId !== activeUserId) return false;
        return true;
      });
    },
    [notifications, profile],
  );

  const activeUserNotifications = useMemo(() => {
    const activeUniverse: Universe = profile?.role === "moderateur" ? "moderation" : profile?.role === "investisseur" ? "investisseur" : "porteur";
    const activeUserId = profile?.id;
    return notifications.filter((n) => {
      if (n.universe !== activeUniverse) return false;
      if (activeUserId && n.userId && n.userId !== activeUserId) return false;
      return true;
    });
  }, [notifications, profile]);

  const unreadNotificationsCount = useMemo(() => {
    return activeUserNotifications.filter((n) => !n.read).length;
  }, [activeUserNotifications]);

  const markNotificationAsRead = useCallback((id: string) => {
    localStore.markNotificationAsRead(id);
    setNotifications([...localStore.getNotifications()]);
  }, []);

  const markAllNotificationsAsRead = useCallback((universe?: Universe, userId?: string) => {
    const targetUniverse = universe || (profile?.role === "moderateur" ? "moderation" : profile?.role === "investisseur" ? "investisseur" : "porteur");
    const targetUserId = userId || profile?.id;
    localStore.markAllNotificationsAsRead(targetUniverse, targetUserId);
    setNotifications([...localStore.getNotifications()]);
  }, [profile]);

  const deleteNotification = useCallback((id: string) => {
    localStore.deleteNotification(id);
    setNotifications([...localStore.getNotifications()]);
  }, []);

  const clearAllNotifications = useCallback((universe?: Universe, userId?: string) => {
    const targetUniverse = universe || (profile?.role === "moderateur" ? "moderation" : profile?.role === "investisseur" ? "investisseur" : "porteur");
    const targetUserId = userId || profile?.id;
    localStore.clearAllNotifications(targetUniverse, targetUserId);
    setNotifications([...localStore.getNotifications()]);
  }, [profile]);

  const addNotification = useCallback((notif: Omit<AppNotification, "id" | "createdAt"> & { id?: string; createdAt?: string }): AppNotification => {
    const fullNotification: AppNotification = {
      ...notif,
      id: notif.id || `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: notif.createdAt || new Date().toISOString(),
    };
    localStore.addNotification(fullNotification);
    setNotifications([...localStore.getNotifications()]);
    return fullNotification;
  }, []);

  const value = useMemo(
    () => ({
      users,
      projects,
      investments,
      kycRequests,
      moderationActivity,
      notifications,
      unreadNotificationsCount,
      loading,
      currentPorteurId,
      currentInvestorId,
      currentModeratorId,
      getUser,
      getProject,
      getInvestmentsByInvestor,
      getInvestmentsByProject,
      getProjectsByPorteur,
      getNotificationsForUser,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      deleteNotification,
      clearAllNotifications,
      addNotification,
      formatUSD,
      formatDate,
      setUsers,
      setKycRequests,
      setProjects,
      addProject,
      updateProject,
      investInProject,
      submitKyc,
      moderateKyc,
      moderateProject,
      refreshData,
      resetToDefaultData,
    }),
    [
      users,
      projects,
      investments,
      kycRequests,
      moderationActivity,
      notifications,
      unreadNotificationsCount,
      loading,
      currentPorteurId,
      currentInvestorId,
      currentModeratorId,
      getUser,
      getProject,
      getInvestmentsByInvestor,
      getInvestmentsByProject,
      getProjectsByPorteur,
      getNotificationsForUser,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      deleteNotification,
      clearAllNotifications,
      addNotification,
      addProject,
      updateProject,
      investInProject,
      submitKyc,
      moderateKyc,
      moderateProject,
      refreshData,
      resetToDefaultData,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used inside AppDataProvider");
  return ctx;
}
