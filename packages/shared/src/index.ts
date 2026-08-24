export * from "./types";
export type { Universe } from "./types";
export * from "./lib/mock-data";
export * from "./lib/local-store";
export * from "./lib/api-client";
export type {
  ProfileExtras,
  ProfileUniverse,
  IdDocumentType,
} from "./lib/profile-completion";
export {
  getProfileExtras,
  saveProfileExtras,
  saveProfileExtras as setProfileExtras,
  dismissProfileBanner,
  isProfileBannerDismissed,
  getProfileBannerFields,
  getMissingFields,
  getFieldLabel,
  calculateProfileScore,
} from "./lib/profile-completion";
export * from "./lib/identity-name";
export * from "./lib/i18n";
export { I18nProvider as LangProvider } from "./lib/i18n";
export * from "./lib/status";
export * from "./lib/project-validation";
export * from "./lib/blog-data";
export * from "./lib/content-loader";
export * from "./contexts/auth-context";
export * from "./contexts/app-data-context";
