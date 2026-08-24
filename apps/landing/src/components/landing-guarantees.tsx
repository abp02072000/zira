import React from "react";
import { 
  ShieldCheckIcon, 
  LockClosedIcon, 
  CheckCircleIcon, 
  AcademicCapIcon 
} from "@heroicons/react/24/solid";
import type { LandingGuarantee } from "@zira/shared";

interface LandingGuaranteesProps {
  guarantees: {
    badge: string;
    title: string;
    subtitle: string;
    items: LandingGuarantee[];
  };
}

const TRUST_ELEMENTS = [
  {
    icon: AcademicCapIcon,
    title: "100% Projets Vérifiés",
    desc: "Chaque opportunité fait l'objet d'un audit approfondi RCCM, comptable et d'équipe à Kinshasa avant d'être publiée."
  },
  {
    icon: LockClosedIcon,
    title: "Fonds Sécurisés sur Séquestre",
    desc: "Vos capitaux restent bloqués sur compte bancaire séquestre partenaire en RDC et sont intégralement remboursés si la campagne n'atteint pas son objectif."
  },
  {
    icon: ShieldCheckIcon,
    title: "Actionnariat et Dividendes Réels",
    desc: "Vous recevez un certificat d'actionnaire officiel OHADA avec un droit direct aux dividendes et un suivi des performances en temps réel."
  }
];

export function LandingGuarantees({ guarantees }: LandingGuaranteesProps) {
  return (
    <section id="securite" className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="bg-card border rounded-2xl p-8 sm:p-12 space-y-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold">
              <CheckCircleIcon className="w-4 h-4 text-amber-500" />
              <span>Garanties et Confiance</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Investissez et Levez des Fonds en Toute Sérénité en RDC</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Une infrastructure financière transparente pensée pour maximiser la sécurité de vos investissements et accélérer la croissance des PME congolaises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {TRUST_ELEMENTS.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div key={idx} className="p-6 rounded-xl border bg-muted/20 space-y-3 hover:border-primary/40 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-base text-foreground">{item.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

