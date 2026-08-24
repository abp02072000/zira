import type {
  UserProfile,
  Project,
  TeamMember,
  EquityBreakdown,
  Fundraising,
  Investment,
  KycRequest,
  ModerationAction,
  ProjectSector as Sector,
  ProjectStatus,
} from "../types";
import initialData from "../data.json";

export type {
  UserProfile,
  Project,
  TeamMember,
  EquityBreakdown,
  Fundraising,
  Investment,
  KycRequest,
  ModerationAction,
  Sector,
  ProjectStatus,
};

export const SECTORS: Sector[] = [
  "Tech",
  "AgriTech",
  "FinTech",
  "HealthTech",
  "EdTech",
  "GreenTech",
  "Logistics",
  "Real Estate",
];

export const SECTOR_COLORS: Record<Sector, string> = {
  Tech: "hsl(225 73% 57%)",
  AgriTech: "hsl(142 71% 45%)",
  FinTech: "hsl(199 89% 48%)",
  HealthTech: "hsl(0 72% 51%)",
  EdTech: "hsl(262 83% 58%)",
  GreenTech: "hsl(160 84% 39%)",
  Logistics: "hsl(20 90% 50%)",
  "Real Estate": "hsl(195 82% 42%)",
};

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export const INITIAL_PROJECTS: Project[] = initialData.projects as unknown as Project[];
export const INITIAL_USERS: UserProfile[] = initialData.users as unknown as UserProfile[];
export const INITIAL_KYC_REQUESTS: KycRequest[] = initialData.kycRequests as unknown as KycRequest[];
export const INITIAL_INVESTMENTS: Investment[] = initialData.investments as unknown as Investment[];
export const INITIAL_MODERATION_ACTIVITY: ModerationAction[] = initialData.moderationActivity as unknown as ModerationAction[];
