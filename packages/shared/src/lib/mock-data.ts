import { Project, UserProfile, Investment, KycRequest, AppNotification, ProjectSector } from "../types";

export type Sector = ProjectSector;

export const SECTOR_COLORS: Record<ProjectSector, { bg: string; text: string; border: string }> = {
  Tech: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20" },
  Fintech: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20" },
  Agritech: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20" },
  Santé: { bg: "bg-rose-500/10", text: "text-rose-500", border: "border-rose-500/20" },
  Énergie: { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/20" },
  Éducation: { bg: "bg-indigo-500/10", text: "text-indigo-500", border: "border-indigo-500/20" },
  Logistique: { bg: "bg-cyan-500/10", text: "text-cyan-500", border: "border-cyan-500/20" },
  Autre: { bg: "bg-gray-500/10", text: "text-gray-500", border: "border-gray-500/20" },
};

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

export const INITIAL_USERS: UserProfile[] = [
  {
    id: "dev-user-1",
    name: "Cédric Mpolo",
    email: "cedric.mpolo@zira-invest.cd",
    role: "porteur",
    companyName: "KaziPay Technologies",
    title: "Fondateur & CEO",
    bio: "Entrepreneur passionné par les solutions fintech innovantes en Afrique subsaharienne.",
    status: "active",
    joinedAt: "2025-01-15T09:00:00.000Z",
  },
  {
    id: "inv-user-1",
    name: "Amina Diallo",
    email: "amina.diallo@invest-capital.com",
    role: "investisseur",
    companyName: "Diaspora Impact Ventures",
    title: "Managing Partner",
    bio: "Investisseuse providentielle orientée sur l'agritech et l'inclusion financière.",
    status: "active",
    joinedAt: "2025-02-01T14:30:00.000Z",
  },
  {
    id: "mod-1",
    name: "Jean-Pierre Kabamba",
    email: "moderation@zira-invest.cd",
    role: "moderateur",
    title: "Responsable Conformité & KYC",
    bio: "Auditeur juridique et conformité réglementaire OHADA.",
    status: "active",
    joinedAt: "2024-11-10T10:00:00.000Z",
  },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj_1",
    porteurId: "dev-user-1",
    name: "KaziPay RDC",
    shortDescription: "Plateforme de paiement instantané mobile money unifiée pour les PME en RDC.",
    fullDescription: "KaziPay interconnecte M-Pesa, Airtel Money et Orange Money à une passerelle marchande simple et transparente.",
    sector: "Fintech",
    targetMarket: "RDC & Afrique Centrale",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    team: [
      { name: "Cédric Mpolo", role: "CEO", bio: "Ex-Orange Money RDC" },
      { name: "Sarah Kalume", role: "CTO", bio: "Architecte logiciel senior" },
    ],
    equityBreakdown: { porteur: 85, investors: 15, available: 0 },
    fundraising: {
      targetAmountUSD: 250000,
      equityPercent: 15,
      minInvestment: 1000,
      maxInvestment: 50000,
      raisedAmount: 185000,
    },
    status: "active",
    createdAt: "2025-02-10T10:00:00.000Z",
  },
  {
    id: "proj_2",
    porteurId: "dev-user-2",
    name: "AgriCongo Bio",
    shortDescription: "Chaîne logistique réfrigérée solaire pour les coopératives maraîchères de Kinshasa.",
    fullDescription: "Réduction des pertes post-récolte de 40% grâce à des conteneurs frigorifiques autonomes à énergie solaire.",
    sector: "Agritech",
    targetMarket: "Kinshasa et Kongo-Central",
    team: [
      { name: "Aimé Tshisekedi", role: "Co-fondateur", bio: "Ingénieur agronome" },
    ],
    equityBreakdown: { porteur: 80, investors: 20, available: 0 },
    fundraising: {
      targetAmountUSD: 120000,
      equityPercent: 20,
      minInvestment: 500,
      maxInvestment: 30000,
      raisedAmount: 96000,
    },
    status: "active",
    createdAt: "2025-02-15T12:00:00.000Z",
  },
  {
    id: "proj_3",
    porteurId: "dev-user-3",
    name: "SolAfrica Microgrid",
    shortDescription: "Système de mini-réseaux solaires pay-as-you-go pour villages isolés.",
    fullDescription: "Accès à une électricité propre, durable et abordable via paiement mobile quotidien.",
    sector: "Énergie",
    targetMarket: "Afrique subsaharienne rurale",
    team: [
      { name: "Pauline Ntumba", role: "Fondatrice", bio: "Experte énergies renouvelables" },
    ],
    equityBreakdown: { porteur: 90, investors: 10, available: 0 },
    fundraising: {
      targetAmountUSD: 400000,
      equityPercent: 10,
      minInvestment: 2000,
      maxInvestment: 80000,
      raisedAmount: 310000,
    },
    status: "active",
    createdAt: "2025-01-20T08:00:00.000Z",
  },
];

export const INITIAL_INVESTMENTS: Investment[] = [
  {
    id: "inv_1",
    projectId: "proj_1",
    investorId: "inv-user-1",
    amountUSD: 25000,
    equityReceived: 1.5,
    date: "2025-02-18T16:00:00.000Z",
    status: "completed",
  },
  {
    id: "inv_2",
    projectId: "proj_2",
    investorId: "inv-user-1",
    amountUSD: 10000,
    equityReceived: 1.67,
    date: "2025-02-20T11:00:00.000Z",
    status: "completed",
  },
];

export const INITIAL_KYC: KycRequest[] = [
  {
    id: "kyc_1",
    userId: "dev-user-1",
    userName: "Cédric Mpolo",
    userEmail: "cedric.mpolo@zira-invest.cd",
    submittedAt: "2025-01-16T10:00:00.000Z",
    type: "porteur",
    documents: [
      { type: "ID_CARD", url: "/documents/passeport-cedric.pdf", name: "Passeport RDC" },
      { type: "RCCM", url: "/documents/rccm-kazipay.pdf", name: "Registre du Commerce" },
    ],
    status: "approved",
  },
  {
    id: "kyc_2",
    userId: "inv-user-1",
    userName: "Amina Diallo",
    userEmail: "amina.diallo@invest-capital.com",
    submittedAt: "2025-02-02T09:30:00.000Z",
    type: "investisseur",
    documents: [
      { type: "PASSPORT", url: "/documents/passport-amina.pdf", name: "Passeport International" },
    ],
    status: "approved",
  },
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif_1",
    universe: "porteur",
    userId: "dev-user-1",
    title: "Investissement reçu",
    message: "Amina Diallo a investi 25 000 $ dans votre projet KaziPay RDC.",
    type: "investment",
    actionUrl: "/porteur/projets",
    read: false,
    createdAt: "2025-02-18T16:05:00.000Z",
  },
  {
    id: "notif_2",
    universe: "investisseur",
    userId: "inv-user-1",
    title: "Souscription confirmée",
    message: "Votre investissement de 25 000 $ dans KaziPay RDC est validé par contrat.",
    type: "investment",
    actionUrl: "/investisseur/portefeuille",
    read: false,
    createdAt: "2025-02-18T16:01:00.000Z",
  },
];
