import React, { useState } from "react";
import { Link } from "wouter";
import { useAppData, Project, formatUSD } from "@shared/index";
import { Header } from "../components/layout/header";
import { Footer } from "../components/layout/footer";
import { ProjectCard } from "../components/common/project-card";
import { InvestModal } from "../components/common/invest-modal";
import {
  TrendingUp,
  ShieldCheck,
  Globe,
  Zap,
  ArrowRight,
  CheckCircle2,
  Lock,
  Building2,
  Users,
  Sparkles,
} from "lucide-react";

export function LandingPage() {
  const { projects, totalRaisedOverall } = useAppData();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isInvestOpen, setIsInvestOpen] = useState(false);
  const [activeSector, setActiveSector] = useState<string>("Tous");

  const sectors = ["Tous", "Fintech", "Agritech", "Énergie", "Santé", "Tech"];

  const filteredProjects = projects.filter((p) => {
    if (activeSector === "Tous") return true;
    return p.sector.toLowerCase() === activeSector.toLowerCase();
  });

  const handleInvest = (p: Project) => {
    setSelectedProject(p);
    setIsInvestOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header currentUniverse="landing" />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-border/60 bg-gradient-to-b from-blue-50/50 via-background to-background dark:from-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Plateforme d'Investissement Tech & PME en Afrique</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
                Investissez dans la nouvelle vague de <span className="text-primary">champions africains</span>.
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                ZIRA INVEST connecte directement les porteurs de projets à fort impact et les investisseurs (diaspora, business angels, fonds). Investissez en capital en toute transparence et sécurité juridique.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/investisseur/opportunites"
                  className="px-6 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  Découvrir les Projets <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/porteur/projet/nouveau"
                  className="px-6 py-3.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-bold text-sm shadow-sm transition-all flex items-center gap-2"
                >
                  Lever des Fonds <TrendingUp className="w-4 h-4 text-emerald-600" />
                </Link>
              </div>

              {/* Proof badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-border/60">
                <div>
                  <p className="text-2xl font-black text-foreground">{formatUSD(totalRaisedOverall)}</p>
                  <p className="text-xs text-muted-foreground font-medium">Capitaux Mobilisés</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-foreground">{projects.length}+</p>
                  <p className="text-xs text-muted-foreground font-medium">Projets Accompagnés</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-emerald-600">100%</p>
                  <p className="text-xs text-muted-foreground font-medium">Conformité OHADA & KYC</p>
                </div>
              </div>
            </div>

            {/* Right Card / Visual */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl border border-border/80 bg-gradient-to-br from-card to-muted/50 p-6 shadow-xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div>
                    <span className="text-[11px] uppercase font-bold text-primary tracking-wider">Projet Vedette</span>
                    <h3 className="text-lg font-bold text-foreground">KaziPay RDC</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Fintech • 74% Financié
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>185 000 $ levés</span>
                    <span className="text-muted-foreground">Objectif : 250 000 $</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full w-[74%]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-background/80 border border-border/60">
                    <p className="text-muted-foreground text-[10px] uppercase font-bold">Ticket Minimum</p>
                    <p className="text-sm font-bold text-foreground">1 000 $ USD</p>
                  </div>
                  <div className="p-3 rounded-xl bg-background/80 border border-border/60">
                    <p className="text-muted-foreground text-[10px] uppercase font-bold">Valorisation Négociée</p>
                    <p className="text-sm font-bold text-foreground">1,6M $ USD</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const feat = projects.find((p) => p.name.includes("KaziPay")) || projects[0];
                    if (feat) handleInvest(feat);
                  }}
                  className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow transition-all flex items-center justify-center gap-2"
                >
                  Souscrire Immédiatement <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Grid */}
      <section className="py-16 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Opportunités d'Investissement</span>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground mt-1">
                Startups sélectionnées & auditées
              </h2>
            </div>

            {/* Sector filters */}
            <div className="flex flex-wrap gap-1.5">
              {sectors.map((s) => (
                <button
                  key={s}
                  onClick={() => setActiveSector(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeSector === s
                      ? "bg-primary text-white shadow-sm"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} onInvest={handleInvest} />
            ))}
          </div>
        </div>
      </section>

      {/* Why ZIRA section */}
      <section className="py-16 border-t border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Sécurité & Confiance</span>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">
              Un cadre d'investissement institutionnel accessible à tous
            </h2>
            <p className="text-sm text-muted-foreground">
              ZIRA opère selon les standards de modération et d'audit les plus exigeants du continent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-foreground">Audit Rigoureux & Modération</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Chaque projet fait l'objet d'une vérification d'immatriculation RCCM, d'un audit de gouvernance et d'une validation d'identité KYC des fondateurs.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-foreground">Séquestre Bancaire Sécurisé</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Les fonds souscrits sont conservés sur un compte séquestre dédié auprès de banques partenaires agréées jusqu'au débouclage complet de la levée.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 flex items-center justify-center">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-foreground">Pacte d'Actionnaires Standardisé</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Contrats juridiques clairs sous droit OHADA protégeant les minoritaires et encadrant les droits de vote, d'information et de liquidité.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <InvestModal
        project={selectedProject}
        isOpen={isInvestOpen}
        onClose={() => setIsInvestOpen(false)}
      />
    </div>
  );
}
