import type { ProjectSector, ProjectStatus } from "@zira/shared";

export interface FormTeamMember {
  name: string;
  role: string;
  photo?: string;
}

export interface NewProjectFormData {
  name: string;
  logo: string;
  poster: string;
  shortDescription: string;
  sector: ProjectSector;
  targetMarket: string;
  videoUrl: string;
  team: FormTeamMember[];
  porteurEquity: number;
  targetAmount: number;
  equityPercent: number;
  minInvestment: number;
  maxInvestment: number;
  projectStatusToCreate: ProjectStatus;
}

export const PRESET_BANNERS = [
  { label: "Tech / Énergie", url: "/images/poster-1.png" },
  { label: "AgriTech", url: "/images/poster-2.png" },
  { label: "FinTech / Mobile", url: "/images/poster-3.png" },
];

export const PRESET_LOGOS = [
  { label: "Logo Vert", url: "/images/poster-1.png" },
  { label: "Logo Bleu", url: "/images/poster-2.png" },
  { label: "Logo Doré", url: "/images/poster-3.png" },
];

export const SUGGESTED_MARKETS = [
  "Côte d'Ivoire & UEMOA",
  "Sénégal & Afrique de l'Ouest",
  "RDC & Afrique Centrale (CEMAC)",
  "Cameroun & Nigéria",
  "Diaspora Africaine & Europe",
  "Panafricain B2B",
];

export const USD_TO_XOF = 600;
