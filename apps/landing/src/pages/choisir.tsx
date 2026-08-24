import React from "react";
import { Link } from "wouter";
import {
  BriefcaseIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/solid";
import { Button, Card, CardContent, Badge, ThemeSelector } from "@zira/ui";
import { useLang } from "@zira/shared";

export default function Choisir() {
  const { lang, setLang } = useLang();
  const porteurUrl = "/porteur/dashboard";
  const investisseurUrl = "/investisseur/dashboard";
  const moderateurUrl = "/moderateur/dashboard";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative selection:bg-primary/20 font-sans">
      {/* Top bar with back to home */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between pt-2">
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ArrowLeftIcon className="w-4 h-4 mr-1.5" />
            {lang === "fr" ? "Retour à l'accueil" : "Back to home"}
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-5xl mx-auto space-y-8 my-auto py-8">
        <div className="text-center space-y-3">
          <Link href="/">
            <div className="inline-flex items-center space-x-3 cursor-pointer group mb-1">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-black text-primary-foreground text-xl shadow-xs group-hover:scale-105 transition-transform">
                Z
              </div>
              <span className="text-2xl font-bold tracking-tight text-foreground">
                ZIRA <span className="text-primary font-medium">INVEST</span>
              </span>
            </div>
          </Link>
          <div>
            <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-semibold text-xs">
              {lang === "fr" ? "Sélection du Portail Dédié" : "Dedicated Portal Selection"}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
            {lang === "fr" ? "Choisissez votre univers" : "Choose your portal"}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            {lang === "fr"
              ? "Sélectionnez le rôle adapté à votre profil pour accéder directement à votre espace de travail dédié."
              : "Select the role tailored to your profile to access your dedicated workspace."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Porteur de Projet */}
          <Link href={porteurUrl}>
            <Card className="bg-card text-card-foreground border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 group cursor-pointer h-full flex flex-col justify-between rounded-2xl">
              <CardContent className="p-6 sm:p-8 space-y-6 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <LightBulbIcon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {lang === "fr" ? "Porteur de projet" : "Project Founder"}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {lang === "fr"
                      ? "Vous dirigez une startup ou une PME en pleine croissance en RDC. Lancez votre levée de fonds et suivez vos souscriptions."
                      : "You run a Congolese startup or SME in RDC. Launch your fundraising campaign and manage incoming investor commitments."}
                  </p>
                </div>
                <div className="pt-4 border-t flex items-center justify-between text-xs font-bold text-primary">
                  <span>{lang === "fr" ? "Accéder au Portail Porteur" : "Enter Founder Portal"}</span>
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Investisseur */}
          <Link href={investisseurUrl}>
            <Card className="bg-card text-card-foreground border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 group cursor-pointer h-full flex flex-col justify-between rounded-2xl">
              <CardContent className="p-6 sm:p-8 space-y-6 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <BriefcaseIcon className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {lang === "fr" ? "Investisseur" : "Investor"}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {lang === "fr"
                      ? "Explorez les entreprises vérifiées à Kinshasa en AgriTech, FinTech et Énergie. Prenez des participations en equity et suivez vos dividendes."
                      : "Discover vetted startups in Kinshasa across AgriTech, FinTech, and CleanTech. Take equity stakes and monitor your dividends."}
                  </p>
                </div>
                <div className="pt-4 border-t flex items-center justify-between text-xs font-bold text-primary">
                  <span>{lang === "fr" ? "Accéder au Portail Investisseur" : "Enter Investor Portal"}</span>
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Modérateur */}
          <Link href={moderateurUrl}>
            <Card className="bg-card text-card-foreground border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 group cursor-pointer h-full flex flex-col justify-between rounded-2xl">
              <CardContent className="p-6 sm:p-8 space-y-6 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <ShieldCheckIcon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {lang === "fr" ? "Modération et Audit" : "Moderator and Audit"}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {lang === "fr"
                      ? "Espace de supervision dédié en RDC. Validation des dossiers KYC, audits de conformité RCCM et modération des projets."
                      : "Dedicated administrative workspace in RDC. KYC identity validation, project auditing, and platform governance."}
                  </p>
                </div>
                <div className="pt-4 border-t flex items-center justify-between text-xs font-bold text-primary">
                  <span>{lang === "fr" ? "Accéder au Portail Admin" : "Enter Admin Portal"}</span>
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* ── Footer avec Contrôles de Langue et Thème ── */}
      <footer className="w-full max-w-5xl mx-auto border-t pt-4 pb-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <div>
          © 2026 ZIRA Invest. Tous droits réservés.
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-1.5">
            <span className="font-medium text-muted-foreground text-[11px]">Langue :</span>
            <div className="flex items-center border rounded-lg p-0.5 bg-muted/40 text-xs">
              <button
                type="button"
                onClick={() => setLang("fr")}
                className={`px-2 py-0.5 rounded-md transition-colors ${
                  lang === "fr" ? "bg-card text-foreground font-bold shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="Français"
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-2 py-0.5 rounded-md transition-colors ${
                  lang === "en" ? "bg-card text-foreground font-bold shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="English"
              >
                EN
              </button>
            </div>
          </div>

          <div className="h-3.5 w-px bg-border" />

          <div className="flex items-center space-x-1.5">
            <span className="font-medium text-muted-foreground text-[11px]">Thème :</span>
            <ThemeSelector variant="segmented" />
          </div>
        </div>
      </footer>
    </div>
  );
}
