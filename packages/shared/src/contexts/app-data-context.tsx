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
  myProjects: Project[];
  myInvestments: Investment[];
  totalInvested: number;
  totalRaisedPorteur: number;
  totalRaisedOverall: number;
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
  addInvestment: (projectId: string, amountUSD: number, equityPercent: number) => Promise<Investment>;
  submitKyc: (documents: any) => Promise<KycRequest>;
  moderateKyc: (kycId: string, userId: string, approved: boolean, reason?: string) => Promise<void>;
  moderateProject: (projectId: string, status: Project["status"]) => Promise<void>;
  approveProject: (projectId: string) => Promise<void>;
  suspendProject: (projectId: string) => Promise<void>;
  approveKyc: (kycId: string, userId: string) => Promise<void>;
  rejectKyc: (kycId: string, userId: string, reason?: string) => Promise<void>;
  suspendUser: (userId: string) => Promise<void>;
  activateUser: (userId: string) => Promise<void>;
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
    const syncState = () => {
      setUsers([...localStore.getUsers()]);
      setProjects([...localStore.getProjects()]);
      setInvestments([...localStore.getInvestments()]);
      setKycRequests([...localStore.getKycRequests()]);
      setModerationActivity([...localStore.getModerationActivity()]);
      setNotifications([...localStore.getNotifications()]);
      setLoading(false);
    };

    syncState();
    const unsubscribe = localStore.subscribe(syncState);

    fetchMyProjects()
      .then((liveProjects) => {
        if (liveProjects && liveProjects.length > 0) {
          syncState();
        }
      })
      .catch((err) => {
        console.warn("[AppDataContext] Go backend fetch fallback:", err);
      });

    return () => {
      unsubscribe();
    };
  }, []);

  const refreshData = useCallback(async () => {
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

    let saved: Project;
    try {
      saved = await apiCreateProject(newProject);
    } catch (err) {
      saved = localStore.saveProject(newProject);
    }

    localStore.addNotification({
      id: `notif_${Date.now()}_p`,
      universe: "porteur",
      userId: porteurId,
      title: "Projet créé avec succès",
      message: `Votre projet "${saved.name}" est désormais enregistré.`,
      type: "project",
      actionUrl: "/porteur/projets",
      read: false,
      createdAt: new Date().toISOString(),
    });

    setNotifications([...localStore.getNotifications()]);
    return saved;
  }, [profile?.id]);

  const updateProject = useCallback(async (projectData: Partial<Project> & { id: string }): Promise<Project> => {
    let saved: Project;
    try {
      saved = await apiUpdateProject(projectData.id, projectData);
    } catch (err) {
      const existing = localStore.getProjectById(projectData.id);
      if (!existing) throw new Error("Projet introuvable");
      const merged: Project = { ...existing, ...projectData };
      saved = localStore.saveProject(merged);
    }
    return saved;
  }, []);

  const resetToDefaultData = useCallback(() => {
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

    const result = localStore.addInvestment(inv);
    const p = localStore.getProjectById(projectId);

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

    setNotifications([...localStore.getNotifications()]);
    return result;
  }, [profile, currentInvestorId]);

  const submitKyc = useCallback(async (
    documents: any
  ): Promise<KycRequest> => {
    const userId = profile?.id || "dev-user-1";
    const userName = profile?.name || "Utilisateur ZIRA";
    const userEmail = profile?.email || "utilisateur@zira-invest.com";
    const type = profile?.role === "investisseur" ? "investisseur" : "porteur";

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
        documents: Array.isArray(documents) ? documents : [],
        status: "pending",
      };
      saved = localStore.saveKycRequest(kycReq);
    }

    localStore.addNotification({
      id: `notif_${Date.now()}_kyc_user`,
      universe: type,
      userId,
      title: "Dossier KYC transmis 📄",
      message: "Vos documents d'identité ont été transmis avec succès.",
      type: "kyc",
      actionUrl: `/${type}/profil`,
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
      details: reason ? `Motif: ${reason}` : (approved ? "Validation" : "Refus"),
    });

    const targetUser = localStore.getUsers().find((u) => u.id === userId);
    const targetUniverse: Universe = targetUser?.role === "investisseur" ? "investisseur" : "porteur";

    localStore.addNotification({
      id: `notif_${Date.now()}_mod_kyc_res`,
      universe: targetUniverse,
      userId,
      title: approved ? "Compte certifié KYC ✅" : "Dossier KYC refusé ⚠️",
      message: approved
        ? "Félicitations ! Vos pièces justificatives ont été validées."
        : `Votre dossier n'a pas été validé. ${reason ? `Motif : ${reason}` : "Veuillez vérifier vos documents."}`,
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
        title: status === "active" ? "Campagne validée & en ligne ! 🚀" : "Statut mis à jour",
        message: `Le statut de votre projet "${p.name}" a été mis à jour : ${status}.`,
        type: status === "active" ? "project" : "warning",
        actionUrl: "/porteur/projets",
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    setNotifications([...localStore.getNotifications()]);
  }, [profile]);

  const getUser = useCallback((id: string) => users.find((u) => u.id === id), [users]);
  const getProject = useCallback((id: string) => projects.find((proj) => proj.id === id), [projects]);

  const getInvestmentsByInvestor = useCallback(
    (investorId: string) => {
      const targetId = investorId || profile?.id || currentInvestorId || "inv-user-1";
      return investments.filter((i) => i.investorId === targetId || (profile?.id && i.investorId === profile.id));
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
      const direct = projects.filter((p) => p.porteurId === targetId || (profile?.id && p.porteurId === profile.id));
      if (direct.length > 0) return direct;
      return projects.filter((p) => p.porteurId === "dev-user-1" || !p.porteurId);
    },
    [projects, profile, currentPorteurId],
  );

  const myProjects = useMemo(() => getProjectsByPorteur(currentPorteurId), [getProjectsByPorteur, currentPorteurId]);
  const myInvestments = useMemo(() => getInvestmentsByInvestor(currentInvestorId), [getInvestmentsByInvestor, currentInvestorId]);
  const totalInvested = useMemo(() => myInvestments.reduce((acc, i) => acc + i.amountUSD, 0), [myInvestments]);
  const totalRaisedPorteur = useMemo(() => myProjects.reduce((acc, p) => acc + (p.fundraising?.raisedAmount || 0), 0), [myProjects]);
  const totalRaisedOverall = useMemo(() => projects.reduce((acc, p) => acc + (p.fundraising?.raisedAmount || 0), 0), [projects]);

  const approveProject = useCallback((projectId: string) => moderateProject(projectId, "active"), [moderateProject]);
  const suspendProject = useCallback((projectId: string) => moderateProject(projectId, "suspended"), [moderateProject]);
  const approveKyc = useCallback((kycId: string, userId: string) => moderateKyc(kycId, userId, true), [moderateKyc]);
  const rejectKyc = useCallback((kycId: string, userId: string, reason?: string) => moderateKyc(kycId, userId, false, reason), [moderateKyc]);

  const suspendUser = useCallback(async (userId: string) => {
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status: "suspended" as const } : u));
  }, []);

  const activateUser = useCallback(async (userId: string) => {
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status: "active" as const } : u));
  }, []);

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
    localStore.markAllNotificationsAsRead(universe);
    setNotifications([...localStore.getNotifications()]);
  }, []);

  const deleteNotification = useCallback((id: string) => {
    localStore.deleteNotification(id);
    setNotifications([...localStore.getNotifications()]);
  }, []);

  const clearAllNotifications = useCallback((universe?: Universe, userId?: string) => {
    localStore.clearAllNotifications(universe, userId);
    setNotifications([...localStore.getNotifications()]);
  }, []);

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
      myProjects,
      myInvestments,
      totalInvested,
      totalRaisedPorteur,
      totalRaisedOverall,
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
      addInvestment: investInProject,
      submitKyc,
      moderateKyc,
      moderateProject,
      approveProject,
      suspendProject,
      approveKyc,
      rejectKyc,
      suspendUser,
      activateUser,
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
      myProjects,
      myInvestments,
      totalInvested,
      totalRaisedPorteur,
      totalRaisedOverall,
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
      approveProject,
      suspendProject,
      approveKyc,
      rejectKyc,
      suspendUser,
      activateUser,
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
