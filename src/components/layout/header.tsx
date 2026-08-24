import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth, useAppData, Universe, UserRole, formatUSD } from "@shared/index";
import {
  TrendingUp,
  Briefcase,
  ShieldCheck,
  Globe,
  Bell,
  User,
  PlusCircle,
  LogOut,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
} from "lucide-react";

interface HeaderProps {
  currentUniverse?: Universe;
}

export function Header({ currentUniverse = "landing" }: HeaderProps) {
  const [location, setLocation] = useLocation();
  const { user, profile, switchUser, logout } = useAuth();
  const { notifications, markNotificationAsRead } = useAppData();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.read);

  const handleRoleSwitch = (role: UserRole) => {
    switchUser(role);
    if (role === "porteur") setLocation("/porteur");
    else if (role === "investisseur") setLocation("/investisseur");
    else if (role === "moderateur") setLocation("/moderateur");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Univers Selector Banner */}
      <div className="bg-slate-900 text-slate-200 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2 font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Environnement Multi-Univers ZIRA :</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setLocation("/")}
            className={`px-2.5 py-1 rounded transition-all flex items-center gap-1 text-xs ${
              currentUniverse === "landing"
                ? "bg-blue-600 text-white font-semibold shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Public / Vitrine</span>
          </button>
          <button
            onClick={() => handleRoleSwitch("porteur")}
            className={`px-2.5 py-1 rounded transition-all flex items-center gap-1 text-xs ${
              currentUniverse === "porteur"
                ? "bg-emerald-600 text-white font-semibold shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Porteur</span>
          </button>
          <button
            onClick={() => handleRoleSwitch("investisseur")}
            className={`px-2.5 py-1 rounded transition-all flex items-center gap-1 text-xs ${
              currentUniverse === "investisseur"
                ? "bg-amber-600 text-white font-semibold shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Investisseur</span>
          </button>
          <button
            onClick={() => handleRoleSwitch("moderateur")}
            className={`px-2.5 py-1 rounded transition-all flex items-center gap-1 text-xs ${
              currentUniverse === "moderation"
                ? "bg-purple-600 text-white font-semibold shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Modération</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md group-hover:scale-105 transition-transform">
              Z
            </div>
            <div>
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-700 to-indigo-800 bg-clip-text text-transparent">
                ZIRA INVEST
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-muted-foreground -mt-1">
                {currentUniverse === "porteur"
                  ? "Espace Porteur de Projet"
                  : currentUniverse === "investisseur"
                  ? "Espace Investisseur"
                  : currentUniverse === "moderation"
                  ? "Console de Modération & Audit"
                  : "Financement Tech Afrique"}
              </span>
            </div>
          </Link>

          {/* Navigation Links based on Universe */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-muted-foreground">
            {currentUniverse === "landing" && (
              <>
                <Link
                  href="/"
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    location === "/" ? "text-primary font-semibold bg-primary/10" : "hover:text-foreground"
                  }`}
                >
                  Accueil
                </Link>
                <Link
                  href="/projets"
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    location.startsWith("/projets") ? "text-primary font-semibold bg-primary/10" : "hover:text-foreground"
                  }`}
                >
                  Opportunités
                </Link>
                <Link
                  href="/porteur"
                  className="px-3 py-1.5 rounded-lg transition-colors hover:text-foreground"
                >
                  Pour les Fondateurs
                </Link>
                <Link
                  href="/investisseur"
                  className="px-3 py-1.5 rounded-lg transition-colors hover:text-foreground"
                >
                  Pour les Investisseurs
                </Link>
              </>
            )}

            {currentUniverse === "porteur" && (
              <>
                <Link
                  href="/porteur"
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    location === "/porteur" ? "text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/30" : "hover:text-foreground"
                  }`}
                >
                  Tableau de bord
                </Link>
                <Link
                  href="/porteur/projets"
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    location === "/porteur/projets" ? "text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/30" : "hover:text-foreground"
                  }`}
                >
                  Mes Projets
                </Link>
                <Link
                  href="/porteur/kyc"
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    location === "/porteur/kyc" ? "text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/30" : "hover:text-foreground"
                  }`}
                >
                  Conformité & KYC
                </Link>
                <Link
                  href="/porteur/profil"
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    location === "/porteur/profil" ? "text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/30" : "hover:text-foreground"
                  }`}
                >
                  Profil Entreprise
                </Link>
              </>
            )}

            {currentUniverse === "investisseur" && (
              <>
                <Link
                  href="/investisseur"
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    location === "/investisseur" ? "text-amber-600 font-semibold bg-amber-50 dark:bg-amber-950/30" : "hover:text-foreground"
                  }`}
                >
                  Vue d'ensemble
                </Link>
                <Link
                  href="/investisseur/opportunites"
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    location === "/investisseur/opportunites" ? "text-amber-600 font-semibold bg-amber-50 dark:bg-amber-950/30" : "hover:text-foreground"
                  }`}
                >
                  Catalogue Pépites
                </Link>
                <Link
                  href="/investisseur/portefeuille"
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    location === "/investisseur/portefeuille" ? "text-amber-600 font-semibold bg-amber-50 dark:bg-amber-950/30" : "hover:text-foreground"
                  }`}
                >
                  Mon Portefeuille
                </Link>
                <Link
                  href="/investisseur/kyc"
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    location === "/investisseur/kyc" ? "text-amber-600 font-semibold bg-amber-50 dark:bg-amber-950/30" : "hover:text-foreground"
                  }`}
                >
                  Vérification KYC
                </Link>
              </>
            )}

            {currentUniverse === "moderation" && (
              <>
                <Link
                  href="/moderateur"
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    location === "/moderateur" ? "text-purple-600 font-semibold bg-purple-50 dark:bg-purple-950/30" : "hover:text-foreground"
                  }`}
                >
                  Tableau de Modération
                </Link>
                <Link
                  href="/moderateur/projets"
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    location === "/moderateur/projets" ? "text-purple-600 font-semibold bg-purple-50 dark:bg-purple-950/30" : "hover:text-foreground"
                  }`}
                >
                  File Projets
                </Link>
                <Link
                  href="/moderateur/kyc"
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    location === "/moderateur/kyc" ? "text-purple-600 font-semibold bg-purple-50 dark:bg-purple-950/30" : "hover:text-foreground"
                  }`}
                >
                  Dossiers KYC
                </Link>
                <Link
                  href="/moderateur/utilisateurs"
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    location === "/moderateur/utilisateurs" ? "text-purple-600 font-semibold bg-purple-50 dark:bg-purple-950/30" : "hover:text-foreground"
                  }`}
                >
                  Comptes
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Actions & Profile */}
        <div className="flex items-center gap-3">
          {currentUniverse === "porteur" && (
            <Link
              href="/porteur/projet/nouveau"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all hover:shadow"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nouveau Projet</span>
            </Link>
          )}

          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-background" />
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-card p-3 shadow-xl z-50 text-card-foreground">
                <div className="flex items-center justify-between pb-2 border-b border-border mb-2">
                  <h4 className="font-semibold text-sm">Notifications ({unreadNotifs.length})</h4>
                  <span className="text-xs text-muted-foreground">Temps réel</span>
                </div>
                <div className="max-h-72 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">Aucune notification.</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationAsRead(n.id);
                          if (n.actionUrl) setLocation(n.actionUrl);
                          setIsNotifOpen(false);
                        }}
                        className={`p-2.5 rounded-lg cursor-pointer transition-colors text-xs ${
                          n.read ? "bg-muted/30 text-muted-foreground" : "bg-primary/10 text-foreground font-medium"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-semibold">{n.title}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Badge */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 pl-2.5 pr-2 rounded-full border border-border bg-muted/30 hover:bg-muted/80 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold leading-tight">{user.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">{user.role}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-xl z-50">
                  <div className="px-3 py-2 border-b border-border mb-1">
                    <p className="text-xs font-bold text-foreground">{user.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold uppercase">
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      if (user.role === "porteur") setLocation("/porteur/profil");
                      else if (user.role === "investisseur") setLocation("/investisseur/portefeuille");
                      else setLocation("/moderateur");
                    }}
                    className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Mon Profil</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 text-xs rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => handleRoleSwitch("porteur")}
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-sm transition-all"
            >
              Connexion
            </button>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card p-4 space-y-2">
          {currentUniverse === "porteur" && (
            <>
              <Link href="/porteur" className="block px-3 py-2 text-sm rounded-lg hover:bg-muted">
                Tableau de bord
              </Link>
              <Link href="/porteur/projets" className="block px-3 py-2 text-sm rounded-lg hover:bg-muted">
                Mes Projets
              </Link>
              <Link href="/porteur/projet/nouveau" className="block px-3 py-2 text-sm rounded-lg text-emerald-600 font-semibold bg-emerald-50">
                + Nouveau Projet
              </Link>
              <Link href="/porteur/kyc" className="block px-3 py-2 text-sm rounded-lg hover:bg-muted">
                Conformité & KYC
              </Link>
              <Link href="/porteur/profil" className="block px-3 py-2 text-sm rounded-lg hover:bg-muted">
                Profil Entreprise
              </Link>
            </>
          )}
          {currentUniverse === "investisseur" && (
            <>
              <Link href="/investisseur" className="block px-3 py-2 text-sm rounded-lg hover:bg-muted">
                Vue d'ensemble
              </Link>
              <Link href="/investisseur/opportunites" className="block px-3 py-2 text-sm rounded-lg hover:bg-muted">
                Catalogue Pépites
              </Link>
              <Link href="/investisseur/portefeuille" className="block px-3 py-2 text-sm rounded-lg hover:bg-muted">
                Mon Portefeuille
              </Link>
              <Link href="/investisseur/kyc" className="block px-3 py-2 text-sm rounded-lg hover:bg-muted">
                Vérification KYC
              </Link>
            </>
          )}
          {currentUniverse === "moderation" && (
            <>
              <Link href="/moderateur" className="block px-3 py-2 text-sm rounded-lg hover:bg-muted">
                Tableau de Modération
              </Link>
              <Link href="/moderateur/projets" className="block px-3 py-2 text-sm rounded-lg hover:bg-muted">
                File Projets
              </Link>
              <Link href="/moderateur/kyc" className="block px-3 py-2 text-sm rounded-lg hover:bg-muted">
                Dossiers KYC
              </Link>
              <Link href="/moderateur/utilisateurs" className="block px-3 py-2 text-sm rounded-lg hover:bg-muted">
                Comptes Utilisateurs
              </Link>
            </>
          )}
          {currentUniverse === "landing" && (
            <>
              <Link href="/" className="block px-3 py-2 text-sm rounded-lg hover:bg-muted">
                Accueil
              </Link>
              <Link href="/projets" className="block px-3 py-2 text-sm rounded-lg hover:bg-muted">
                Opportunités de Financement
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
