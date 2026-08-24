import React from "react";
import { Link } from "wouter";
import { ShieldCheck, Globe, Zap, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/60 text-muted-foreground text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                Z
              </div>
              <span className="font-bold text-lg text-foreground tracking-tight">ZIRA INVEST</span>
            </div>
            <p className="text-xs leading-relaxed">
              La passerelle d'investissement direct reliant les capitaux de la diaspora et institutionnels aux startups à fort potentiel en RDC et Afrique francophone.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Conforme Réglementation OHADA & KYC Bancaire</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-3">
              Pour les Porteurs
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/porteur/projet/nouveau" className="hover:text-foreground transition-colors flex items-center gap-1">
                  Déposer un projet <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link href="/porteur/projets" className="hover:text-foreground transition-colors">
                  Suivi des levées de fonds
                </Link>
              </li>
              <li>
                <Link href="/porteur/kyc" className="hover:text-foreground transition-colors">
                  Validation & Conformité
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-3">
              Pour les Investisseurs
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/investisseur/opportunites" className="hover:text-foreground transition-colors">
                  Catalogue des Startups
                </Link>
              </li>
              <li>
                <Link href="/investisseur/portefeuille" className="hover:text-foreground transition-colors">
                  Gestion du Portefeuille
                </Link>
              </li>
              <li>
                <Link href="/investisseur/kyc" className="hover:text-foreground transition-colors">
                  Passeport Investisseur
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-3">
              Univers ZIRA
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Portail Grand Public
                </Link>
              </li>
              <li>
                <Link href="/porteur" className="hover:text-foreground transition-colors text-emerald-600 font-medium">
                  Espace Porteur
                </Link>
              </li>
              <li>
                <Link href="/investisseur" className="hover:text-foreground transition-colors text-amber-600 font-medium">
                  Espace Investisseur
                </Link>
              </li>
              <li>
                <Link href="/moderateur" className="hover:text-foreground transition-colors text-purple-600 font-medium">
                  Console Modérateur
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} ZIRA INVEST. Tous droits réservés. Kinshasa • Paris • Abidjan.</p>
          <div className="flex items-center gap-4">
            <span className="hover:underline cursor-pointer">Conditions Générales</span>
            <span className="hover:underline cursor-pointer">Politique de Confidentialité</span>
            <span className="hover:underline cursor-pointer">Avertissement sur les risques</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
