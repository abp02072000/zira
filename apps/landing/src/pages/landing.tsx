import React from "react";
import { Link } from "wouter";
import { useAppData, landingContent } from "@zira/shared";
import { Button } from "@zira/ui";
import {
  QuestionMarkCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/solid";
import { LandingHeader } from "../components/landing-header";
import { LandingHero } from "../components/landing-hero";
import { LandingParcours } from "../components/landing-parcours";
import { LandingProjects } from "../components/landing-projects";
import { LandingGuarantees } from "../components/landing-guarantees";
import { LandingFooter } from "../components/landing-footer";

export default function LandingPage() {
  const { projects } = useAppData();

  const getPorteurUrl = () => {
    return window.location.hostname === "localhost"
      ? "http://localhost:3000/porteur"
      : "/porteur";
  };

  const getInvestisseurUrl = () => {
    return window.location.hostname === "localhost"
      ? "http://localhost:3000/investisseur"
      : "/investisseur";
  };

  const getModerateurUrl = () => {
    return window.location.hostname === "localhost"
      ? "http://localhost:3000/moderation"
      : "/moderation";
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">
      {/* ── En-tête Navigation Complète ── */}
      <LandingHeader currentPage="accueil" />

      {/* ── Section Hero Directe & Épurée ── */}
      <LandingHero
        hero={landingContent.hero}
        stats={landingContent.stats}
        porteurUrl={getPorteurUrl()}
        investisseurUrl={getInvestisseurUrl()}
      />

      {/* ── Deux Parcours Clairs (Porteurs et Investisseurs) ── */}
      <LandingParcours
        features={landingContent.features}
        porteurUrl={getPorteurUrl()}
        investisseurUrl={getInvestisseurUrl()}
      />

      {/* ── Opportunités Réelles en cours à Kinshasa ── */}
      <LandingProjects
        projects={projects}
        investisseurUrl={getInvestisseurUrl()}
      />

      {/* ── Sécurité et Garanties ── */}
      <LandingGuarantees
        guarantees={landingContent.guarantees}
      />

      {/* ── CTA Final Épuré ── */}
      <section className="py-16 border-t bg-muted/20">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Prêt à participer à la croissance en RDC ?
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Rejoignez notre écosystème sécurisé d'entrepreneurs à Kinshasa et d'investisseurs engagés dans l'économie réelle en RDC.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/choisir">
              <Button size="lg" className="font-semibold shadow-xs gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                Accéder aux portails ZIRA <ArrowRightIcon className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/faq">
              <Button size="lg" variant="outline" className="font-semibold gap-2">
                <QuestionMarkCircleIcon className="w-4 h-4 text-amber-500" /> Consulter la FAQ complète
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <LandingFooter
        footer={landingContent.footer}
        porteurUrl={getPorteurUrl()}
        investisseurUrl={getInvestisseurUrl()}
        moderateurUrl={getModerateurUrl()}
      />
    </div>
  );
}

