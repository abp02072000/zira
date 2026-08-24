import { useState } from "react";
import { useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  ShieldCheck,
  ShieldAlert,
  Clock,
  LogOut,
  Languages,
  Sun,
  Moon,
  Laptop,
  Check,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useAuth, type Universe } from "@/contexts/auth-context";
import { useAppData } from "@/contexts/app-data-context";
import { useLang } from "@/lib/i18n";
import { useTheme } from "./theme-provider";
import { UserAvatar } from "./user-avatar";
import { getProfileExtras } from "@/lib/profile-completion";
import { cn } from "@/lib/utils";

interface UserProfileMenuProps {
  universe: Universe;
  className?: string;
  showNameOnDesktop?: boolean;
}

export function UserProfileMenu({
  universe,
  className,
  showNameOnDesktop = true,
}: UserProfileMenuProps) {
  const { profile, logout } = useAuth();
  const { getUser, currentPorteurId, currentInvestorId, currentModeratorId } = useAppData();
  const { lang, setLang, t } = useLang();
  const { theme, setTheme } = useTheme();
  const [, navigate] = useLocation();

  const activeUserId =
    profile?.id ||
    (universe === "porteur"
      ? currentPorteurId
      : universe === "investisseur"
      ? currentInvestorId
      : currentModeratorId);

  const rawUser = getUser(activeUserId) ?? profile;
  const userName = rawUser?.name || profile?.name || (universe === "moderation" ? "Modérateur ZIRA" : "Utilisateur");
  const userEmail = rawUser?.email || profile?.email || "compte@zira-invest.com";
  const userPhoto = rawUser?.photo || profile?.photo;
  const userRole = rawUser?.role || profile?.role || (universe === "moderation" ? "moderateur" : universe);

  const profileExtras = getProfileExtras(activeUserId);
  const isKycApproved = profileExtras.idVerified || rawUser?.status === "active";
  const isKycPending = !isKycApproved && !!profileExtras.idDocumentUrl;

  const roleLabel =
    universe === "porteur"
      ? "Porteur de Projet"
      : universe === "investisseur"
      ? "Investisseur"
      : "Modérateur & Admin";

  const profilePath =
    universe === "moderation"
      ? "/moderateur/profil"
      : universe === "investisseur"
      ? "/investisseur/profil"
      : "/porteur/profil";

  function handleLogout() {
    logout();
    navigate(`/${universe}/login`);
  }

  function handleGoToProfile() {
    navigate(profilePath);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-2 p-1 pl-1.5 pr-2 h-9 rounded-full hover:bg-muted/80 border border-transparent hover:border-border/60 transition-all",
            className
          )}
          id="btn-header-profile"
          aria-label="Menu du profil"
        >
          <div className="relative">
            <UserAvatar
              name={userName}
              photo={userPhoto}
              size="sm"
              className="h-7 w-7 ring-2 ring-background"
            />
            <span
              className={cn(
                "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-background",
                isKycApproved
                  ? "bg-emerald-500"
                  : isKycPending
                  ? "bg-amber-500"
                  : "bg-muted-foreground"
              )}
            />
          </div>

          {showNameOnDesktop && (
            <div className="hidden lg:flex flex-col text-left text-xs leading-tight max-w-[110px]">
              <span className="font-semibold text-foreground truncate">{userName}</span>
              <span className="text-[10px] text-muted-foreground truncate capitalize">
                {userRole}
              </span>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72 p-2 rounded-xl shadow-lg border bg-popover text-popover-foreground">
        {/* User Summary Header */}
        <div className="flex items-center gap-3 p-2 bg-muted/40 rounded-lg mb-1">
          <UserAvatar name={userName} photo={userPhoto} size="md" className="h-10 w-10 ring-1 ring-border" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold text-foreground truncate">{userName}</p>
              {isKycApproved && (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            <Badge variant="secondary" className="mt-1 text-[10px] px-1.5 py-0 h-4 font-normal">
              {roleLabel}
            </Badge>
          </div>
        </div>

        {/* KYC Status Row */}
        {universe !== "moderation" && (
          <div
            onClick={handleGoToProfile}
            className="flex items-center justify-between p-2 rounded-lg text-xs bg-card hover:bg-muted/60 border border-border/60 cursor-pointer transition-colors mb-1"
          >
            <div className="flex items-center gap-2">
              {isKycApproved ? (
                <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-600">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              ) : isKycPending ? (
                <div className="p-1 rounded-md bg-amber-500/10 text-amber-600">
                  <Clock className="w-3.5 h-3.5" />
                </div>
              ) : (
                <div className="p-1 rounded-md bg-rose-500/10 text-rose-600">
                  <ShieldAlert className="w-3.5 h-3.5" />
                </div>
              )}
              <div>
                <p className="font-semibold leading-tight text-foreground">
                  {t.profileMenuKycStatus || "Vérification KYC"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {isKycApproved
                    ? t.profileMenuKycVerified || "Compte certifié"
                    : isKycPending
                    ? t.profileMenuKycPending || "En cours de validation"
                    : t.profileMenuKycUnverified || "Pièces requises"}
                </p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
        )}

        <DropdownMenuSeparator className="my-1" />

        {/* Language Selection */}
        <div className="px-2 py-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-1.5">
            <span className="flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-primary" />
              {t.profileMenuLanguage || "Langue"}
            </span>
            <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-1 rounded">
              {lang}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1 bg-muted/60 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setLang("fr")}
              className={cn(
                "flex items-center justify-center gap-1.5 py-1 text-xs rounded-md transition-all font-medium",
                lang === "fr"
                  ? "bg-card text-foreground font-bold shadow-xs border border-border/40"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>🇫🇷</span>
              <span>Français</span>
              {lang === "fr" && <Check className="w-3 h-3 text-primary ml-0.5" />}
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={cn(
                "flex items-center justify-center gap-1.5 py-1 text-xs rounded-md transition-all font-medium",
                lang === "en"
                  ? "bg-card text-foreground font-bold shadow-xs border border-border/40"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>🇬🇧</span>
              <span>English</span>
              {lang === "en" && <Check className="w-3 h-3 text-primary ml-0.5" />}
            </button>
          </div>
        </div>

        {/* Theme Selection */}
        <div className="px-2 py-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-1.5">
            <span className="flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              {t.profileMenuTheme || "Thème"}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1 bg-muted/60 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={cn(
                "flex items-center justify-center gap-1 py-1 text-xs rounded-md transition-all font-medium",
                theme === "light"
                  ? "bg-card text-foreground font-bold shadow-xs border border-border/40"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title={t.profileThemeLight || "Clair"}
            >
              <Sun className="w-3 h-3 text-amber-500" />
              <span className="text-[11px]">{t.profileThemeLight || "Clair"}</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={cn(
                "flex items-center justify-center gap-1 py-1 text-xs rounded-md transition-all font-medium",
                theme === "dark"
                  ? "bg-card text-foreground font-bold shadow-xs border border-border/40"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title={t.profileThemeDark || "Sombre"}
            >
              <Moon className="w-3 h-3 text-blue-400" />
              <span className="text-[11px]">{t.profileThemeDark || "Sombre"}</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme("system")}
              className={cn(
                "flex items-center justify-center gap-1 py-1 text-xs rounded-md transition-all font-medium",
                theme === "system"
                  ? "bg-card text-foreground font-bold shadow-xs border border-border/40"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title={t.profileThemeSystem || "Système"}
            >
              <Laptop className="w-3 h-3 text-purple-400" />
              <span className="text-[11px]">{t.profileThemeSystem || "Auto"}</span>
            </button>
          </div>
        </div>

        <DropdownMenuSeparator className="my-1" />

        {/* View Profile Action */}
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={handleGoToProfile}
            className="flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs font-medium"
            id="menu-item-view-profile"
          >
            <span className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-primary" />
              {t.profileMenuViewProfile || "Gérer mon profil"}
            </span>
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1" />

        {/* Logout Action */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs font-medium text-destructive focus:text-destructive focus:bg-destructive/10"
          id="menu-item-logout"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t.authLogout || "Se déconnecter"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
