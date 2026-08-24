import type { UserProfile } from "../types";

export type ProfileUniverse = "porteur" | "investisseur";

export type IdDocumentType = "passport" | "national_id" | "driver_license";

export type ProfileFieldId =
  | "photo"
  | "title"
  | "bio"
  | "skills"
  | "description"
  | "type"
  | "address"
  | "phone"
  | "email"
  | "idDocument"
  | "paymentReceive"
  | "paymentSend";

export type ProfileAction = "create_project" | "invest";

export interface ProfileExtras {
  address?: string;
  phone?: string;
  phoneCountryCode?: string;
  phoneVerified?: boolean;
  phoneVerifiedAt?: string;
  emailVerified?: boolean;
  emailVerifiedAt?: string;
  idDocumentType?: IdDocumentType;
  idDocumentNumber?: string;
  idDocumentCountry?: string;
  idDocumentUrl?: string; // Document principal / Face avant (ou Passeport)
  idDocumentBackUrl?: string; // Face arrière (pour CNI ou Permis de conduire)
  selfieUrl?: string;
  /** Validé par OCR (âge ≥ 18, document lisible) */
  idVerified?: boolean;
  idVerifiedAt?: string;
  ocrAge?: number;
  ocrFullName?: string;
  idExpiryDate?: string;
  faceMatch?: boolean;
  livenessPassed?: boolean;
  requiresManualReview?: boolean;
  verificationWarnings?: string[];
  /** Moyen de paiement pour investir */
  paymentSend?: string;
  /** Moyen de réception pour les porteurs */
  paymentReceive?: string;
  /** Informations entreprise si personne morale */
  companyName?: string;
  companyRegistrationNumber?: string;
  companyRole?: string;
}

const EXTRAS_KEY = (userId: string) => `zira-profile-extras-${userId}`;

export function getProfileExtras(userId: string): ProfileExtras {
  try {
    const raw = localStorage.getItem(EXTRAS_KEY(userId));
    return raw ? (JSON.parse(raw) as ProfileExtras) : {};
  } catch {
    return {};
  }
}

export function setProfileExtras(userId: string, extras: ProfileExtras) {
  localStorage.setItem(EXTRAS_KEY(userId), JSON.stringify(extras));
}

const FIELD_LABELS_FR: Record<ProfileFieldId, string> = {
  photo: "Photo de profil",
  title: "Titre / fonction",
  bio: "Biographie",
  skills: "Compétences",
  description: "Description",
  type: "Type de profil (physique ou morale)",
  address: "Adresse physique",
  phone: "Numéro de téléphone vérifié",
  email: "Adresse e-mail vérifiée",
  idDocument: "Pièce d'identité officielle",
  paymentReceive: "Moyen de réception des fonds",
  paymentSend: "Moyen de paiement",
};

export function getFieldLabel(field: ProfileFieldId, lang: "fr" | "en" = "fr"): string {
  if (lang === "en") {
    const en: Record<ProfileFieldId, string> = {
      photo: "Profile photo",
      title: "Job title",
      bio: "Bio",
      skills: "Skills",
      description: "Description",
      type: "Profile type",
      address: "Physical address",
      phone: "Verified phone number",
      email: "Verified email address",
      idDocument: "Official ID document",
      paymentReceive: "Payout method",
      paymentSend: "Payment method",
    };
    return en[field];
  }
  return FIELD_LABELS_FR[field];
}

function hasText(value?: string | null): boolean {
  return Boolean(value?.trim());
}

function isFieldComplete(
  user: UserProfile | null | undefined,
  extras: ProfileExtras,
  field: ProfileFieldId,
): boolean {
  if (!user) return false;
  switch (field) {
    case "photo":
      return hasText(user.photo);
    case "title":
      return hasText(user.title);
    case "bio":
      return hasText(user.bio);
    case "skills":
      return Array.isArray(user.skills) && user.skills.length > 0;
    case "description":
      return hasText(user.description);
    case "type":
      return user.type === "physique" || user.type === "morale";
    case "address":
      return hasText(extras.address);
    case "phone":
      return Boolean(extras.phoneVerified || hasText(extras.phone));
    case "email":
      return Boolean(extras.emailVerified || hasText(user.email));
    case "idDocument":
      return Boolean(extras.idVerified && extras.idDocumentUrl?.trim());
    case "paymentReceive":
      return hasText(extras.paymentReceive);
    case "paymentSend":
      return hasText(extras.paymentSend);
    default:
      return false;
  }
}

/** Calcule le statut et le pourcentage de complétion KYC */
export function getKycScore(
  user: UserProfile | null | undefined,
  extras: ProfileExtras,
): {
  score: number;
  emailOk: boolean;
  phoneOk: boolean;
  idOk: boolean;
  statusLabel: string;
  statusColor: string;
} {
  const emailOk = Boolean(extras.emailVerified || (user?.email && user.email.includes("@")));
  const phoneOk = Boolean(extras.phoneVerified && extras.phone);
  const idOk = Boolean(extras.idVerified && extras.idDocumentUrl);

  let points = 0;
  if (emailOk) points += 25;
  if (phoneOk) points += 25;
  if (idOk) points += 50;

  let statusLabel = "Non vérifié";
  let statusColor = "text-muted-foreground";

  if (points === 100) {
    statusLabel = "KYC Complet (Niveau 2)";
    statusColor = "text-green-600 dark:text-green-400";
  } else if (points >= 50) {
    statusLabel = "Vérification partielle (Niveau 1)";
    statusColor = "text-amber-600 dark:text-amber-400";
  }

  return {
    score: points,
    emailOk,
    phoneOk,
    idOk,
    statusLabel,
    statusColor,
  };
}

/** Champs affichés dans la bannière « complétez votre profil » */
export function getProfileBannerFields(universe: ProfileUniverse): ProfileFieldId[] {
  if (universe === "porteur") {
    return ["photo", "title", "bio", "skills", "address", "idDocument", "paymentReceive"];
  }
  return ["photo", "type", "description", "address", "idDocument", "paymentSend"];
}

/** Champs obligatoires pour une action donnée */
export function getRequiredFieldsForAction(
  universe: ProfileUniverse,
  action: ProfileAction,
): ProfileFieldId[] {
  if (universe === "porteur" && action === "create_project") {
    return ["title", "skills", "address", "idDocument", "paymentReceive"];
  }
  if (universe === "investisseur" && action === "invest") {
    return ["type", "description", "address", "idDocument", "paymentSend"];
  }
  return [];
}

export function getMissingFields(
  user: UserProfile | null | undefined,
  universe: ProfileUniverse,
  options?: { action?: ProfileAction; fields?: ProfileFieldId[] },
): ProfileFieldId[] {
  if (!user) return getProfileBannerFields(universe);
  const extras = getProfileExtras(user.id);
  const fields = options?.fields ?? getProfileBannerFields(universe);
  const missing = fields.filter((f) => !isFieldComplete(user, extras, f));
  if (options?.action) {
    const required = getRequiredFieldsForAction(universe, options.action);
    for (const f of required) {
      if (!missing.includes(f) && !isFieldComplete(user, extras, f)) {
        missing.push(f);
      }
    }
  }
  return missing;
}

export function isProfileCompleteForAction(
  user: UserProfile | null | undefined,
  universe: ProfileUniverse,
  action: ProfileAction,
): boolean {
  // Allow action to proceed if user profile exists; specific checks are advisory
  if (!user) return false;
  return true;
}

const BANNER_DISMISS_KEY = (userId: string) => `zira-profile-banner-dismiss-${userId}`;

export function isProfileBannerDismissed(userId: string): boolean {
  return localStorage.getItem(BANNER_DISMISS_KEY(userId)) === "1";
}

export function dismissProfileBanner(userId: string) {
  localStorage.setItem(BANNER_DISMISS_KEY(userId), "1");
}

/** Réaffiche la bannière à chaque nouvelle connexion */
export function clearProfileBannerDismiss(userId: string) {
  localStorage.removeItem(BANNER_DISMISS_KEY(userId));
}
