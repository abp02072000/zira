import type {
  UserProfile,
  Project,
  Investment,
  KycRequest,
  ModerationAction,
  PaginatedResponse,
} from "../types";
import { localStore } from "./local-store";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function setAuthTokenGetter(_fn: () => Promise<string | null>) {
  // No-op in client-only data.json mode
}

// ─── Public ───────────────────────────────────────────────────────────

export async function fetchActiveProjects(
  page = 1,
  limit = 50,
): Promise<Project[]> {
  const all = localStore.getProjects().filter((p) => p.status === "active" || p.status === "funded");
  const start = (page - 1) * limit;
  return all.slice(start, start + limit);
}

export async function fetchProjectById(id: string): Promise<Project> {
  const p = localStore.getProjectById(id);
  if (!p) {
    throw new ApiError(`Projet ${id} introuvable`, 404);
  }
  return p;
}

// ─── Users ────────────────────────────────────────────────────────────

export async function fetchMe(): Promise<UserProfile> {
  const users = localStore.getUsers();
  return users[0] || {
    id: "dev-user-1",
    name: "Moussa Diakité",
    email: "moussa.diakite@agrisahel.com",
    role: "porteur",
    status: "active",
  };
}

export async function registerUser(payload: {
  name: string;
  email: string;
  role: UserProfile["role"];
  type?: string;
  companyName?: string;
}): Promise<UserProfile> {
  const newUser: UserProfile = {
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: payload.name,
    email: payload.email,
    role: payload.role,
    type: payload.type as UserProfile["type"],
    companyName: payload.companyName,
    status: "active",
    joinedAt: new Date().toISOString(),
  };
  return localStore.saveUser(newUser);
}

export async function updateUserProfile(
  id: string,
  data: Partial<UserProfile>,
): Promise<UserProfile> {
  const existing = localStore.getUserById(id);
  if (!existing) {
    throw new ApiError("Utilisateur introuvable", 404);
  }
  const updated: UserProfile = {
    ...existing,
    ...data,
  };
  return localStore.saveUser(updated);
}

// ─── Projects (porteur) ───────────────────────────────────────────────

export async function fetchMyProjects(): Promise<Project[]> {
  return localStore.getProjects();
}

export async function createProject(
  payload: Record<string, unknown>,
): Promise<Project> {
  const id = `proj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const newProj: Project = {
    id,
    porteurId: (payload.porteurId as string) || "dev-user-1",
    name: (payload.name as string) || "Nouveau Projet",
    logo: (payload.logo as string) || "",
    poster: (payload.poster as string) || "",
    shortDescription: (payload.shortDescription as string) || "",
    sector: (payload.sector as Project["sector"]) || "Tech",
    targetMarket: (payload.targetMarket as string) || "",
    videoUrl: (payload.videoUrl as string) || "",
    team: (payload.team as Project["team"]) || [],
    equityBreakdown: (payload.equityBreakdown as Project["equityBreakdown"]) || {
      porteur: 80,
      investors: 10,
      available: 10,
    },
    fundraising: (payload.fundraising as Project["fundraising"]) || {
      targetAmountUSD: 50000,
      equityPercent: 10,
      minInvestment: 500,
      maxInvestment: 10000,
      raisedAmount: 0,
    },
    status: "active",
    createdAt: new Date().toISOString(),
  };

  return localStore.saveProject(newProj);
}

// ─── Investments ──────────────────────────────────────────────────────

export async function fetchMyInvestments(): Promise<Investment[]> {
  return localStore.getInvestments();
}

export async function createInvestment(
  projectId: string,
  amountUSD: number,
  investorInfo?: { id?: string; name?: string; email?: string },
): Promise<Investment> {
  const project = localStore.getProjectById(projectId);
  const target = project?.fundraising?.targetAmountUSD || 1;
  const equityTotal = project?.fundraising?.equityPercent || 10;
  const equityReceived = Number(((amountUSD / target) * equityTotal).toFixed(2));

  const newInv: Investment = {
    id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    projectId,
    investorId: investorInfo?.id || "inv-user-1",
    investorName: investorInfo?.name || "Investisseur ZIRA",
    investorEmail: investorInfo?.email || "investisseur@zira-invest.com",
    amountUSD,
    equityReceived,
    date: new Date().toISOString(),
    status: "completed",
  };

  return localStore.addInvestment(newInv);
}

// ─── KYC ──────────────────────────────────────────────────────────────

export async function submitKyc(
  documents: { document_type: string; document_url: string }[],
): Promise<void> {
  const id = `kyc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  localStore.saveKycRequest({
    id,
    userId: "dev-user-1",
    userName: "Utilisateur ZIRA",
    userEmail: "utilisateur@zira-invest.com",
    submittedAt: new Date().toISOString(),
    type: "porteur",
    documents,
    status: "pending",
  });
}

export async function fetchPendingKyc(): Promise<KycRequest[]> {
  return localStore.getKycRequests().filter((k) => k.status === "pending");
}

export async function approveKyc(id: string): Promise<void> {
  localStore.updateKycStatus(id, "approved");
  localStore.addModerationAction({
    id: `act_${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    action: "kyc_approved",
    target: id,
    targetName: "Dossier KYC",
    by: "mod-1",
    byEmail: "moderateur@zira-invest.com",
    details: "Dossier KYC vérifié et validé",
  });
}

export async function rejectKyc(id: string, reason: string): Promise<void> {
  localStore.updateKycStatus(id, "rejected", reason);
  localStore.addModerationAction({
    id: `act_${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    action: "kyc_rejected",
    target: id,
    targetName: "Dossier KYC",
    by: "mod-1",
    byEmail: "moderateur@zira-invest.com",
    details: reason || "Dossier non conforme",
  });
}

// ─── Modération ───────────────────────────────────────────────────────

export async function fetchModerationUsers(
  role?: string,
): Promise<UserProfile[]> {
  const users = localStore.getUsers();
  if (role) return users.filter((u) => u.role === role);
  return users;
}

export async function fetchModerationProjects(
  status = "pending",
): Promise<Project[]> {
  const projects = localStore.getProjects();
  if (status === "all") return projects;
  return projects.filter((p) => p.status === status);
}

export async function approveProject(id: string): Promise<void> {
  localStore.updateProjectStatus(id, "active");
  const p = localStore.getProjectById(id);
  localStore.addModerationAction({
    id: `act_${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    action: "project_validated",
    target: id,
    targetName: p?.name || id,
    by: "mod-1",
    byEmail: "moderateur@zira-invest.com",
    details: "Campagne validée et mise en ligne",
  });
}

export async function suspendProject(id: string): Promise<void> {
  localStore.updateProjectStatus(id, "suspended");
  const p = localStore.getProjectById(id);
  localStore.addModerationAction({
    id: `act_${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    action: "project_suspended",
    target: id,
    targetName: p?.name || id,
    by: "mod-1",
    byEmail: "moderateur@zira-invest.com",
    details: "Campagne suspendue par la modération",
  });
}

export async function suspendUser(id: string): Promise<void> {
  localStore.updateUserStatus(id, "suspended");
  const u = localStore.getUserById(id);
  localStore.addModerationAction({
    id: `act_${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    action: "user_suspended",
    target: id,
    targetName: u?.name || id,
    by: "mod-1",
    byEmail: "moderateur@zira-invest.com",
    details: "Compte utilisateur suspendu",
  });
}

export async function activateUser(id: string): Promise<void> {
  localStore.updateUserStatus(id, "active");
}

export async function fetchAllInvestments(): Promise<Investment[]> {
  return localStore.getInvestments();
}

export async function fetchModerationActivity(): Promise<ModerationAction[]> {
  return localStore.getModerationActivity();
}

export interface ModeratorLoginResponse {
  custom_token: string;
  uid: string;
  email: string;
  name: string;
}

export async function loginModerator(
  email: string,
  _password: string,
): Promise<ModeratorLoginResponse> {
  return {
    custom_token: "local-mod-token",
    uid: "mod-1",
    email: email || "moderateur@zira-invest.com",
    name: "Modérateur ZIRA",
  };
}

export interface IdentityVerifyResponse {
  valid: boolean;
  message: string;
  age?: number;
  is_adult?: boolean;
  requires_manual_review?: boolean;
  verified_at?: string;
  ocr_result?: {
    full_name?: string;
    date_of_birth?: string;
    age?: number;
    is_adult?: boolean;
    expiry_date?: string;
    is_expired?: boolean;
    mrz_valid?: boolean;
    face_match?: boolean;
    face_similarity?: number;
    liveness_passed?: boolean;
    liveness_score?: number;
    forgery_score?: number;
    requires_manual_review?: boolean;
    sanctions_checked?: boolean;
    warnings?: string[];
  };
}

export async function verifyIdentityDocument(
  _documentUrl: string,
  _documentType = "ID_CARD",
  _selfieUrl?: string,
): Promise<IdentityVerifyResponse> {
  // Instant automated validation in client mode
  return {
    valid: true,
    message: "Document authentifié avec succès (contrôle de conformité réussi)",
    age: 32,
    is_adult: true,
    requires_manual_review: false,
    verified_at: new Date().toISOString(),
    ocr_result: {
      full_name: "Utilisateur Vérifié",
      date_of_birth: "1992-04-14",
      age: 32,
      is_adult: true,
      expiry_date: "2030-04-14",
      is_expired: false,
      mrz_valid: true,
      face_match: true,
      face_similarity: 98.5,
      liveness_passed: true,
      liveness_score: 99.1,
      forgery_score: 0.02,
      requires_manual_review: false,
      sanctions_checked: true,
      warnings: [],
    },
  };
}

export async function uploadFile(file: File, _type: string): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => {
      // Fallback placeholder
      resolve("https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80");
    };
    reader.readAsDataURL(file);
  });
}
