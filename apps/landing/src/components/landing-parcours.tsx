import React from "react";
import { Link } from "wouter";
import { Button, Badge } from "@zira/ui";
import { 
  RocketLaunchIcon, 
  ArrowTrendingUpIcon, 
  CheckCircleIcon, 
  ArrowRightIcon 
} from "@heroicons/react/24/solid";
import type { LandingFeature } from "@zira/shared";

interface LandingParcoursProps {
  features?: LandingFeature[];
  porteurUrl: string;
  investisseurUrl: string;
}

export function LandingParcours({ porteurUrl, investisseurUrl }: LandingParcoursProps) {
  const porteurPoints = [
    "Dossier de candidature guidé pour entreprises en RDC",
    "Audit de conformité RCCM et valorisation équitable",
    "Levée de fonds sécurisée en USD, Franc Congolais CDF et Mobile Money"
  ];

  const investisseurPoints = [
    "Catalogue d'entreprises congolaises auditées à Kinshasa",
    "Pacte d'actionnaires numérique OHADA et gouvernance claire",
    "Tableau de bord de suivi du portefeuille et dividendes"
  ];

  return (
    <section id="parcours" className="py-16 bg-muted/30 border-y">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge variant="outline" className="text-primary border-primary/30">Deux Parcours Dédiés</Badge>
          <h2 className="text-3xl font-bold tracking-tight">Une solution pensée pour chacun en RDC</h2>
          <p className="text-muted-foreground text-sm">
            Que vous cherchiez du capital pour grandir en RDC ou des opportunités de rendement à fort impact, ZIRA simplifie chaque étape.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Carte Porteur */}
          <div className="bg-card border rounded-2xl p-8 space-y-6 flex flex-col justify-between shadow-xs hover:border-primary/40 transition">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <RocketLaunchIcon className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Vous êtes Porteur de Projet</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Accélérez la croissance de votre PME à Kinshasa grâce à un financement participatif structuré et accédez à un réseau d'investisseurs congolais et de la diaspora.
              </p>
              <ul className="space-y-2.5 pt-2 text-sm text-foreground">
                {porteurPoints.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2.5">
                    <CheckCircleIcon className="w-5 h-5 text-primary shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-4 border-t">
              <Link href={porteurUrl}>
                <Button className="w-full font-semibold gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  Accéder à l'espace Porteur <ArrowRightIcon className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Carte Investisseur */}
          <div className="bg-card border rounded-2xl p-8 space-y-6 flex flex-col justify-between shadow-xs hover:border-amber-500/40 transition">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <ArrowTrendingUpIcon className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Vous êtes Investisseur</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Diversifiez votre portefeuille dans l'économie réelle en RDC avec des tickets d'entrée accessibles dès $50 USD.
              </p>
              <ul className="space-y-2.5 pt-2 text-sm text-foreground">
                {investisseurPoints.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2.5">
                    <CheckCircleIcon className="w-5 h-5 text-amber-500 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-4 border-t">
              <Link href={investisseurUrl}>
                <Button variant="outline" className="w-full font-semibold gap-2 border-amber-500/40 text-foreground hover:bg-amber-500/10">
                  Accéder à l'espace Investisseur <ArrowRightIcon className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
