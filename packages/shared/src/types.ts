export type Universe = "porteur" | "investisseur" | "moderation" | "landing";

export type UserRole = "porteur" | "investisseur" | "moderateur" | "admin";

export type ProjectSector =
  | "Tech"
  | "Fintech"
  | "Agritech"
  | "Santé"
  | "Énergie"
  | "Éducation"
  | "Logistique"
  | "Autre";

export type ProjectStatus = "draft" | "pending" | "active" | "funded" | "suspended";

export type KycStatus = "not_submitted" | "pending" | "approved" | "rejected";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  type?: "physique" | "morale";
  companyName?: string;
  title?: string;
  bio?: string;
  photo?: string;
  phone?: string;
  country?: string;
  status: "active" | "suspended" | "pending";
  joinedAt?: string;
}

export interface TeamMember {
  name: string;
  role: string;
  bio?: string;
  photo?: string;
  linkedin?: string;
}

export interface Project {
  id: string;
  porteurId: string;
  name: string;
  logo?: string;
  poster?: string;
  shortDescription: string;
  fullDescription?: string;
  sector: ProjectSector;
  targetMarket?: string;
  videoUrl?: string;
  team: TeamMember[];
  equityBreakdown?: {
    porteur: number;
    investors: number;
    available: number;
  };
  fundraising: {
    targetAmountUSD: number;
    equityPercent: number;
    minInvestment: number;
    maxInvestment: number;
    raisedAmount: number;
  };
  status: ProjectStatus;
  createdAt: string;
}

export interface Investment {
  id: string;
  projectId: string;
  investorId: string;
  amountUSD: number;
  equityReceived: number;
  date: string;
  status: "completed" | "pending" | "refunded";
}

export interface KycDocument {
  type: string;
  url: string;
  name?: string;
}

export interface KycRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  submittedAt: string;
  type: "investisseur" | "porteur";
  documents: KycDocument[] | { document_type: string; document_url: string }[];
  status: KycStatus;
  rejectionReason?: string;
}

export interface ModerationAction {
  id: string;
  moderatorId: string;
  targetType: "project" | "user" | "kyc";
  targetId: string;
  action: string;
  reason?: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  userId?: string;
  universe: Universe;
  title: string;
  message: string;
  type: "project" | "investment" | "kyc" | "system";
  actionUrl?: string;
  read: boolean;
  createdAt: string;
}
