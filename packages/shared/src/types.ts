export type Universe = "porteur" | "investisseur" | "moderation";

export type UserRole = "porteur" | "investisseur" | "moderateur";
export type UserStatus = "active" | "pending_kyc" | "suspended";
export type UserType = "physique" | "morale";

export interface Education {
  degree: string;
  institution: string;
  year: string;
}

export interface Experience {
  role: string;
  company: string;
  period: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photo?: string;
  role: UserRole;
  title?: string;
  bio?: string;
  skills?: string[];
  education?: Education[];
  experience?: Experience[];
  type?: UserType;
  companyName?: string;
  description?: string;
  status: UserStatus;
  joinedAt?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  photo?: string;
}

export interface EquityBreakdown {
  porteur: number;
  investors: number;
  available: number;
}

export interface Fundraising {
  targetAmountUSD: number;
  equityPercent: number;
  minInvestment: number;
  maxInvestment: number;
  raisedAmount: number;
}

export type ProjectSector =
  | "Tech"
  | "AgriTech"
  | "FinTech"
  | "HealthTech"
  | "EdTech"
  | "GreenTech"
  | "Logistics"
  | "Real Estate";

export type ProjectStatus = "draft" | "pending" | "active" | "funded" | "suspended";

export interface Project {
  id: string;
  porteurId: string;
  name: string;
  logo: string;
  poster: string;
  shortDescription: string;
  sector: ProjectSector;
  targetMarket: string;
  videoUrl: string;
  team: TeamMember[];
  equityBreakdown: EquityBreakdown;
  fundraising: Fundraising;
  status: ProjectStatus;
  createdAt: string;
}

export type InvestmentStatus = "completed" | "pending" | "refunded";

export interface Investment {
  id: string;
  projectId: string;
  investorId: string;
  amountUSD: number;
  equityReceived: number;
  date: string;
  status: InvestmentStatus;
  investorName?: string;
  investorEmail?: string;
}

export type KycStatus = "pending" | "approved" | "rejected";
export type KycDocumentType = "PASSPORT" | "ID_CARD" | "RCCM" | "PROOF_OF_ADDRESS" | "STATUTS";

export interface KycDocument {
  document_type: KycDocumentType | string;
  document_url: string;
}

export interface KycRequest {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  submittedAt: string;
  type: "porteur" | "investisseur";
  documents: KycDocument[] | string[];
  status: KycStatus;
  rejectionReason?: string;
}

export interface ModerationAction {
  id: string;
  date: string;
  action: "kyc_approved" | "kyc_rejected" | "project_validated" | "project_suspended" | "user_suspended";
  target: string;
  targetName?: string;
  by: string;
  byEmail?: string;
  details?: string;
}

export type NotificationType = "info" | "success" | "warning" | "kyc" | "investment" | "project" | "system";

export interface AppNotification {
  id: string;
  userId?: string;
  universe: Universe;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  type: NotificationType;
  link?: string;
  actionUrl?: string;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}
