import React, { useState } from "react";
import { useRoute, Link } from "wouter";
import { useAppData, formatUSD, formatDate, Project } from "@shared/index";
import { Header } from "../components/layout/header";
import { Footer } from "../components/layout/footer";
import { InvestModal } from "../components/common/invest-modal";
import {
  ArrowLeft,
  ShieldCheck,
  TrendingUp,
  Users,
  Target,
  Globe,
  Share2,
  Lock,
  Building2,
  Calendar,
  CheckCircle2,
} from "lucide-react";

export function ProjectDetailPage() {
  const [, params] = useRoute("/projets/:id");
  const { projects, investments } = useAppData();
  const [isInvestOpen, setIsInvestOpen] = useState(false);

  const project = projects.find((p) => p.id === params?.id) || projects[0];

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold">Projet introuvable</h2>
          <Link href="/projets" className="text-primary mt-4 inline-block font-semibold">
            ← Retour aux projets
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const percentRaised = Math.min(
    100,
    Math.round((project.fundraising.raisedAmount / (project.fundraising.targetAmountUSD || 1)) * 100)
  );

  const projectInvestments = investments.filter((i) => i.projectId === project.id);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header currentUniverse="landing" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/projets"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour aux opportunités</span>
          </Link>
        </div>

        {/* Hero Banner for Project */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          {/* Main Info */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
                {project.sector}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Audité & Certifié ZIRA
              </span>
              <span className="text-xs text-muted-foreground ml-auto">
                Créé le {formatDate(project.createdAt)}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-foreground">{project.name}</h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              {project.shortDescription}
            </p>

            {/* Video or poster visual */}
            <div className="rounded-2xl border border-border bg-slate-950 p-6 text-white aspect-video flex flex-col items-center justify-center relative overflow-hidden shadow-lg">
              <div className="w-16 h-16 rounded-full bg-primary/80 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-xl">
                <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1" />
              </div>
              <p className="mt-4 text-xs font-semibold text-slate-300">Vidéo de Pitch Fondateur (1m45s)</p>
            </div>

            {/* Description Tab */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm">
              <h3 className="text-lg font-bold text-foreground">À propos du Projet & Modèle Économique</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {project.fullDescription || project.shortDescription}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                <div className="p-3.5 rounded-xl bg-muted/40">
                  <span className="text-xs text-muted-foreground font-medium block">Marché Cible</span>
                  <span className="text-sm font-bold text-foreground">{project.targetMarket || "Afrique francophone"}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-muted/40">
                  <span className="text-xs text-muted-foreground font-medium block">Modèle de Monétisation</span>
                  <span className="text-sm font-bold text-foreground">B2B SaaS / Commissions de transaction</span>
                </div>
              </div>
            </div>

            {/* Team Section */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-foreground">Équipe Dirigeante</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.team && project.team.length > 0 ? (
                  project.team.map((m, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-border/80 bg-muted/30 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{m.name}</p>
                        <p className="text-xs text-primary font-medium">{m.role}</p>
                        {m.bio && <p className="text-[11px] text-muted-foreground mt-0.5">{m.bio}</p>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">Fondateur principal enregistré et validé KYC.</p>
                )}
              </div>
            </div>
          </div>

          {/* Investment Sidebar Card */}
          <div className="lg:col-span-4 sticky top-24 space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-xl space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">État de la Levée</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-foreground">
                    {formatUSD(project.fundraising.raisedAmount)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    / {formatUSD(project.fundraising.targetAmountUSD)}
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all"
                    style={{ width: `${percentRaised}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs font-semibold pt-1">
                  <span className="text-primary">{percentRaised}% de l'objectif</span>
                  <span className="text-muted-foreground">{projectInvestments.length} investisseurs</span>
                </div>
              </div>

              {/* Terms list */}
              <div className="divide-y divide-border text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-muted-foreground">Capital cédé :</span>
                  <span className="font-bold text-foreground">{project.fundraising.equityPercent}%</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-muted-foreground">Ticket minimum :</span>
                  <span className="font-bold text-foreground">{formatUSD(project.fundraising.minInvestment)}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-muted-foreground">Ticket maximum :</span>
                  <span className="font-bold text-foreground">{formatUSD(project.fundraising.maxInvestment)}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-muted-foreground">Juridiction :</span>
                  <span className="font-bold text-foreground">OHADA (RDC)</span>
                </div>
              </div>

              <button
                onClick={() => setIsInvestOpen(true)}
                className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md transition-all text-center"
              >
                Investir dans ce Projet
              </button>

              <div className="p-3 rounded-xl bg-muted/50 border border-border text-[11px] text-muted-foreground space-y-1.5">
                <div className="flex items-center gap-1.5 text-foreground font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Séquestre Bancaire Garanti</span>
                </div>
                <p>Vos fonds ne sont libérés qu'après atteinte de l'objectif minimal et validation juridique de l'augmentation de capital.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <InvestModal
        project={project}
        isOpen={isInvestOpen}
        onClose={() => setIsInvestOpen(false)}
      />
    </div>
  );
}
