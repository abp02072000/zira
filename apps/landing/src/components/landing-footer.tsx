import React from "react";
import { Link } from "wouter";
import { useLang, type LandingData } from "@zira/shared";
import { ThemeSelector } from "@zira/ui";

interface LandingFooterProps {
  footer: LandingData["footer"];
  porteurUrl: string;
  investisseurUrl: string;
  moderateurUrl: string;
}

export function LandingFooter({ footer, porteurUrl, investisseurUrl, moderateurUrl }: LandingFooterProps) {
  const { lang, setLang } = useLang();

  return (
    <footer className="border-t bg-card py-10 text-xs text-muted-foreground mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center space-x-2 font-bold text-foreground text-base">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground text-xs font-black">Z</div>
            <span>{footer.brand || "ZIRA INVEST"}</span>
          </div>
          <p className="text-muted-foreground">
            {footer.tagline || "Plateforme panafricaine d'equity crowdfunding pour startups et PME."}
          </p>
        </div>

        <div>
          <h4 className="font-bold text-foreground mb-3 uppercase tracking-wider text-[11px]">Plateforme</h4>
          <ul className="space-y-2">
            <li><Link href="/" className="hover:text-foreground transition-colors">Accueil</Link></li>
            <li><Link href="/a-propos" className="hover:text-foreground transition-colors">À Propos</Link></li>
            <li><Link href="/blog" className="hover:text-foreground transition-colors">Blog et Actualités</Link></li>
            <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
            <li><Link href="/faq" className="hover:text-foreground transition-colors">Foire Aux Questions (FAQ)</Link></li>
            <li><Link href="/choisir" className="hover:text-foreground transition-colors font-medium text-primary">Sélection des portails</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-foreground mb-3 uppercase tracking-wider text-[11px]">Espaces Dédiés</h4>
          <ul className="space-y-2">
            <li><Link href={porteurUrl} className="hover:text-foreground transition-colors">Portail Porteur de Projet</Link></li>
            <li><Link href={investisseurUrl} className="hover:text-foreground transition-colors">Portail Investisseur</Link></li>
            <li><Link href={moderateurUrl} className="hover:text-foreground transition-colors">Portail Modérateur et Admin</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-foreground mb-3 uppercase tracking-wider text-[11px]">Contact et Légal</h4>
          <p>{footer.locations}</p>
          <p className="mt-1">contact@zira-invest.com</p>
        </div>
      </div>

      {/* ── Footer Bottom Bar avec Sélecteur de Thème et de Langue ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px]">
        <div className="text-center md:text-left">
          © 2026 ZIRA Invest. Tous droits réservés.
        </div>

        {/* Contrôles de Langue et de Thème dans le Footer */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground font-medium">Langue :</span>
            <div className="flex items-center border rounded-lg p-0.5 bg-muted/50 text-xs">
              <button
                type="button"
                onClick={() => setLang("fr")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  lang === "fr"
                    ? "bg-card text-foreground font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="Français"
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  lang === "en"
                    ? "bg-card text-foreground font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="English"
              >
                EN
              </button>
            </div>
          </div>

          <div className="h-4 w-px bg-border hidden sm:block" />

          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground font-medium">Thème :</span>
            <ThemeSelector variant="segmented" />
          </div>

          <div className="h-4 w-px bg-border hidden sm:block" />

          <div className="flex items-center space-x-4">
            <Link href="/a-propos" className="hover:text-foreground transition-colors">À Propos</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            <Link href="/faq" className="hover:text-foreground transition-colors">Support & FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

