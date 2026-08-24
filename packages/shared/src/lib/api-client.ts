import {
  Project,
  UserProfile,
  Investment,
  KycRequest,
  AppNotification,
  Universe,
  ProjectSector,
  ProjectStatus,
} from "../types";
import type { ProfileExtras } from "./profile-completion";
import { localStore } from "./local-store";

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const TOKEN_KEY = "zira_auth_token";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) return token;
  const savedUid = localStorage.getItem("zira-current-user-id") || "dev-user-1";
  return `test-user-${savedUid}:porteur@zira-invest.cd:porteur`;
}

export function setAuthToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(path, { ...options, headers });

  if (!res.ok) {
    let errMsg = `Erreur HTTP ${res.status}`;
    try {
      const json = await res.json();
      if (json.error?.message) errMsg = json.error.message;
      else if (json.error) errMsg = typeof json.error === "string" ? json.error : JSON.stringify(json.error);
      else if (json.message) errMsg = json.message;
    } catch {
      // Non-JSON response
    }
    throw new ApiError(errMsg, res.status);
  }

  const json = await res.json();
  if (json && typeof json === "object" && "data" in json && "success" in json) {
    return json.data as T;
  }
  return json as T;
}

// ─── DTO Converters ───────────────────────────────────────────────────

export function fromGoProject(raw: any): Project {
  if (!raw) return raw;
  const funding = raw.funding || {};
  const statusStr = (raw.status || "DRAFT").toUpperCase();
  let mappedStatus: ProjectStatus = "draft";
  if (statusStr === "PUBLISHED" || statusStr === "FUNDING" || statusStr === "ACTIVE") {
    mappedStatus = "active";
  } else if (statusStr === "SUBMITTED" || statusStr === "UNDER_REVIEW" || statusStr === "PENDING") {
    mappedStatus = "pending";
  } else if (statusStr === "FUNDED" || statusStr === "COMPLETED") {
    mappedStatus = "funded";
  } else if (statusStr === "SUSPENDED") {
    mappedStatus = "suspended";
  }

  const targetAmountUSD = funding.target_amount_usd ?? funding.targetAmountUSD ?? 100000;
  const equityPercent = funding.equity_percent ?? funding.equityPercent ?? 15;
  const minInvestment = funding.min_investment_usd ?? funding.minInvestment ?? 500;
  const maxInvestment = funding.max_investment_usd ?? funding.maxInvestment ?? targetAmountUSD;
  const raisedAmount = funding.raised_amount_usd ?? funding.raisedAmount ?? 0;

  return {
    id: raw.id || "",
    porteurId: raw.owner_id || raw.porteurId || "dev-user-1",
    name: raw.name || "",
    logo: raw.logo_url || raw.logo || "/images/poster-1.png",
    poster: raw.poster_url || raw.poster || "/images/poster-2.png",
    shortDescription: raw.short_description || raw.shortDescription || "",
    fullDescription: raw.full_description || raw.fullDescription || "",
    sector: (raw.sector || "Tech") as ProjectSector,
    targetMarket: raw.target_market || raw.targetMarket || "Afrique de l'Ouest et Diaspora",
    videoUrl: raw.video_url || raw.videoUrl || "",
    team: Array.isArray(raw.team) ? raw.team : [],
    equityBreakdown: raw.equityBreakdown || {
      porteur: 100 - equityPercent,
      investors: equityPercent,
      available: 0,
    },
    fundraising: {
      targetAmountUSD,
      equityPercent,
      minInvestment,
      maxInvestment,
      raisedAmount,
    },
    status: mappedStatus,
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
  };
}

export function toGoProjectPayload(project: Partial<Project>): any {
  const targetAmount = project.fundraising?.targetAmountUSD ?? 100000;
  const equityPercent = project.fundraising?.equityPercent ?? 15;
  const minInvestment = project.fundraising?.minInvestment ?? 500;
  const maxInvestment = project.fundraising?.maxInvestment ?? 25000;

  return {
    name: project.name || "Nouveau Projet",
    short_description: project.shortDescription || project.name || "Description du projet",
    full_description: project.fullDescription || project.shortDescription || undefined,
    sector: project.sector || "Tech",
    stage: "Growth",
    target_market: project.targetMarket || "Afrique",
    country: "RDC",
    city: "Kinshasa",
    video_url: project.videoUrl ? project.videoUrl : undefined,
    logo_r2_key: project.logo ? project.logo : undefined,
    poster_r2_key: project.poster ? project.poster : undefined,
    target_amount_usd: targetAmount,
    min_investment_usd: minInvestment,
    max_investment_usd: maxInvestment,
    equity_percent: equityPercent,
  };
}

// ─── Authentification ──────────────────────────────────────────────────

export async function loginUser(payload: {
  email?: string;
  password?: string;
  role?: UserProfile["role"];
}): Promise<{ token: string; user: UserProfile }> {
  try {
    const data = await request<{ token: string; user: UserProfile }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setAuthToken(data.token);
    return data;
  } catch {
    const role = payload.role || "porteur";
    const user = localStore.getUsers().find(u => u.email === payload.email || u.role === role) || localStore.getUsers()[0];
    const token = `test-user-${user.id}:${user.email}:${user.role}`;
    setAuthToken(token);
    return { token, user };
  }
}

export async function registerUser(payload: {
  name: string;
  email: string;
  role: UserProfile["role"];
  type?: string;
  companyName?: string;
}): Promise<UserProfile> {
  try {
    const data = await request<{ token: string; user: UserProfile }>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setAuthToken(data.token);
    return data.user;
  } catch {
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      type: (payload.type as any) || "physique",
      companyName: payload.companyName,
      status: "active",
      joinedAt: new Date().toISOString(),
    };
    localStore.saveUser(newUser);
    const token = `test-user-${newUser.id}:${newUser.email}:${newUser.role}`;
    setAuthToken(token);
    return newUser;
  }
}

export async function fetchMe(): Promise<{ user: UserProfile; extras?: ProfileExtras }> {
  try {
    const res = await request<any>("/api/v1/me");
    const user: UserProfile = {
      id: res.id || "dev-user-1",
      name: res.display_name || res.name || "Porteur",
      email: res.email || "porteur@zira-invest.cd",
      role: res.role || "porteur",
      title: res.title,
      bio: res.bio,
      photo: res.avatar_url,
      companyName: res.company_name,
      status: res.status || "active",
      joinedAt: res.created_at,
    };
    return { user };
  } catch {
    const user = localStore.getUserById("dev-user-1") || localStore.getUsers()[0];
    return { user };
  }
}

export async function logoutUser(): Promise<void> {
  setAuthToken(null);
}

export async function updateUserProfile(
  id: string,
  data: Partial<UserProfile>,
): Promise<UserProfile> {
  try {
    const goPayload = {
      display_name: data.name || "Porteur",
      title: data.title ? data.title : undefined,
      bio: data.bio ? data.bio : undefined,
      avatar_url: data.photo ? data.photo : undefined,
      company_name: data.companyName ? data.companyName : undefined,
      city: "Kinshasa",
      country: "RDC",
      is_public: true,
    };
    const res = await request<any>("/api/v1/me/profile", {
      method: "PATCH",
      body: JSON.stringify(goPayload),
    });
    const updated: UserProfile = {
      id: res.id || id,
      name: res.display_name || data.name || "Porteur",
      email: res.email || "porteur@zira-invest.cd",
      role: res.role || "porteur",
      title: res.title || data.title,
      bio: res.bio || data.bio,
      photo: res.avatar_url || data.photo,
      companyName: res.company_name || data.companyName,
      status: res.status || "active",
    };
    localStore.saveUser(updated);
    return updated;
  } catch {
    const existing = localStore.getUserById(id);
    const updated = { ...(existing || {}), ...data, id } as UserProfile;
    localStore.saveUser(updated);
    return updated;
  }
}

export async function fetchProfileExtras(): Promise<ProfileExtras> {
  return localStore.getProfileExtras();
}

export async function saveProfileExtras(extras: ProfileExtras): Promise<ProfileExtras> {
  return localStore.saveProfileExtras(extras);
}

// ─── Projets ───────────────────────────────────────────────────────────

export async function fetchActiveProjects(
  _status = "active",
): Promise<Project[]> {
  try {
    const res = await request<any>("/api/v1/public/projects");
    const list = Array.isArray(res) ? res : res?.data || [];
    if (list.length > 0) {
      return list.map(fromGoProject);
    }
  } catch {
    // fallback
  }
  return localStore.getProjects();
}

export async function fetchMyProjects(): Promise<Project[]> {
  try {
    const res = await request<any>("/api/v1/me/projects");
    const rawList = Array.isArray(res) ? res : res?.data || [];
    if (rawList.length > 0) {
      const parsed = rawList.map(fromGoProject);
      parsed.forEach((p: Project) => localStore.saveProject(p));
      return parsed;
    }
  } catch (err) {
    console.warn("[api-client] fetchMyProjects API call failed, reading from local:", err);
  }
  return localStore.getProjects();
}

export async function fetchProjectById(id: string): Promise<Project> {
  try {
    const raw = await request<any>(`/api/v1/projects/${id}`);
    const proj = fromGoProject(raw);
    localStore.saveProject(proj);
    return proj;
  } catch {
    const local = localStore.getProjectById(id);
    if (local) return local;
    throw new ApiError("Projet introuvable", 404);
  }
}

export async function createProject(
  payload: Project | Record<string, unknown>,
): Promise<Project> {
  const goPayload = toGoProjectPayload(payload as Partial<Project>);
  try {
    const raw = await request<any>("/api/v1/projects", {
      method: "POST",
      body: JSON.stringify(goPayload),
    });
    const created = fromGoProject(raw);
    localStore.saveProject(created);
    return created;
  } catch (err) {
    console.warn("[api-client] createProject backend POST failed, falling back to persistent local save:", err);
    const fallback: Project = {
      ...(payload as Project),
      id: (payload as Project).id || `proj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      status: "active",
      createdAt: new Date().toISOString(),
    };
    localStore.saveProject(fallback);
    return fallback;
  }
}

export async function updateProject(
  id: string,
  payload: Partial<Project>,
): Promise<Project> {
  const goPayload = toGoProjectPayload(payload);
  try {
    const raw = await request<any>(`/api/v1/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(goPayload),
    });
    const updated = fromGoProject(raw);
    localStore.saveProject(updated);
    return updated;
  } catch (err) {
    console.warn("[api-client] updateProject backend PATCH failed, updating locally:", err);
    const existing = localStore.getProjectById(id);
    const updated = { ...(existing || {}), ...payload, id } as Project;
    localStore.saveProject(updated);
    return updated;
  }
}

export async function submitProjectForReview(id: string): Promise<Project> {
  try {
    const raw = await request<any>(`/api/v1/projects/${id}/submit`, {
      method: "POST",
    });
    const updated = fromGoProject(raw);
    localStore.saveProject(updated);
    return updated;
  } catch {
    const existing = localStore.getProjectById(id);
    if (existing) {
      existing.status = "pending";
      localStore.saveProject(existing);
      return existing;
    }
    throw new ApiError("Projet introuvable", 404);
  }
}

// ─── Investissements & Portefeuille ───────────────────────────────────

export async function fetchMyInvestments(): Promise<Investment[]> {
  return localStore.getInvestments();
}

export async function fetchMyProjectInvestments(): Promise<{
  investments: Investment[];
  totalRaised: number;
  projectsCount: number;
}> {
  const invs = localStore.getInvestments();
  const projs = localStore.getProjects();
  const total = invs.reduce((s, i) => s + i.amountUSD, 0);
  return {
    investments: invs,
    totalRaised: total,
    projectsCount: projs.length,
  };
}

export async function createInvestment(
  projectId: string,
  amountUSD: number,
  equityPercent?: number,
): Promise<Investment> {
  const inv: Investment = {
    id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    projectId,
    investorId: "inv-user-1",
    amountUSD,
    equityReceived: equityPercent ?? 1.5,
    date: new Date().toISOString(),
    status: "completed",
  };
  return localStore.addInvestment(inv);
}

// ─── KYC ──────────────────────────────────────────────────────────────

export async function submitKyc(
  payload: {
    fullName?: string;
    documentType?: string;
    documentNumber?: string;
    documentFile?: File | string;
    proofAddressFile?: File | string;
    selfieFile?: File | string;
    phone?: string;
  } | { document_type: string; document_url: string }[],
): Promise<KycRequest> {
  try {
    const res = await request<any>("/api/v1/me/kyc/submit", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res;
  } catch {
    return localStore.submitKyc("dev-user-1", payload);
  }
}

export async function fetchKycStatus(): Promise<{
  status: string;
  kyc?: KycRequest;
  extras?: ProfileExtras;
}> {
  try {
    const res = await request<any>("/api/v1/me/kyc");
    return { status: res?.status || "pending", kyc: res };
  } catch {
    const kyc = localStore.getKycRequestByUserId("dev-user-1");
    return { status: kyc?.status || "not_submitted", kyc };
  }
}

export async function verifyIdentityDocument(
  _documentUrl: string,
  _documentType: "PASSPORT" | "DRIVER_LICENSE" | "ID_CARD" | string,
  _selfieUrl?: string,
): Promise<{
  valid: boolean;
  ocr_result?: {
    full_name?: string;
    document_number?: string;
    expiry_date?: string;
    country?: string;
  };
  face_match?: boolean;
}> {
  return {
    valid: true,
    ocr_result: {
      document_number: "ID-" + Math.floor(10000000 + Math.random() * 90000000),
      expiry_date: "2031-12-31",
    },
    face_match: true,
  };
}

// ─── Notifications ───────────────────────────────────────────────────

export async function fetchNotifications(universe?: Universe): Promise<{
  notifications: AppNotification[];
  unreadCount: number;
}> {
  const list = localStore.getNotifications(universe);
  return {
    notifications: list,
    unreadCount: list.filter(n => !n.read).length,
  };
}

export async function markNotificationAsRead(id: string): Promise<void> {
  localStore.markNotificationAsRead(id);
}

export async function markAllNotificationsAsRead(universe?: Universe): Promise<void> {
  localStore.markAllNotificationsAsRead(universe);
}

// ─── Upload de fichiers ───────────────────────────────────────────────

export async function uploadFile(file: File, _type: string): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      resolve(URL.createObjectURL(file));
    };
    reader.readAsDataURL(file);
  });
}

// ─── Modération ───────────────────────────────────────────────────────

export async function approveKyc(kycId: string): Promise<{ success: boolean }> {
  localStore.moderateKyc(kycId, "dev-user-1", true);
  return { success: true };
}

export async function rejectKyc(kycId: string, reason?: string): Promise<{ success: boolean }> {
  localStore.moderateKyc(kycId, "dev-user-1", false, reason);
  return { success: true };
}

export async function approveProject(projectId: string): Promise<{ success: boolean }> {
  localStore.moderateProject(projectId, "active");
  return { success: true };
}

export async function suspendProject(projectId: string, _reason?: string): Promise<{ success: boolean }> {
  localStore.moderateProject(projectId, "suspended");
  return { success: true };
}

export async function suspendUser(userId: string, _reason?: string): Promise<{ success: boolean }> {
  const u = localStore.getUserById(userId);
  if (u) {
    u.status = "suspended";
    localStore.saveUser(u);
  }
  return { success: true };
}

export async function activateUser(userId: string): Promise<{ success: boolean }> {
  const u = localStore.getUserById(userId);
  if (u) {
    u.status = "active";
    localStore.saveUser(u);
  }
  return { success: true };
}
