import React, { useState } from "react";
import { Link } from "wouter";
import { useAppData, useAuth, formatUSD, Project } from "@shared/index";
import { Header } from "../../components/layout/header";
import { Footer } from "../../components/layout/footer";
import { ProjectCard } from "../../components/common/project-card";
import { InvestModal } from "../../components/common/invest-modal";
import {
  TrendingUp,
  Briefcase,
  ShieldCheck,
  ArrowRight,
  PieChart,
  DollarSign,
  Award,
} from "lucide-react";

export function InvestisseurDashboard() {
  const { user } = useAuth();
  const { projects, myInvestments, totalInvested } = useAppData();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isInvestOpen, setIsInvestOpen] = useState(false);

  const handleInvest = (p: Project) => {
    setSelectedProject(p);
    setIsInvestOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header currentUniverse="investisseur" />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Espace Investisseur Accrédité</span>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground mt-0.5">
              Bienvenue, {user?.name || "Investisseur"} 🌟
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Gérez vos participations, suivez la performance de votre portefeuille et accédez aux nouveaux tours de table.
            </p>
          </div>

          <Link
            href="/investisseur/opportunites"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-all"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Explorer le Catalogue</span>
          </Link>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Total Investi</span>
              <DollarSign className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-foreground">{formatUSD(totalInvested)}</p>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> En actions directes
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Participations Actives</span>
              <Briefcase className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-foreground">{myInvestments.length}</p>
            <p className="text-[11px] text-muted-foreground">Startups en portefeuille</p>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Opportunités Ouvertes</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-foreground">{projects.length}</p>
            <p className="text-[11px] text-muted-foreground">Campagnes en cours</p>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Passeport KYC</span>
              <Award className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-amber-600">Accrédité</p>
            <p className="text-[11px] text-muted-foreground">Souscription instantanée</p>
          </div>
        </div>

        {/* Featured Deals Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Dernières Opportunités en Levée</h2>
              <p className="text-xs text-muted-foreground">Sélectionnées pour leur modèle économique et leur traction.</p>
            </div>
            <Link href="/investisseur/opportunites" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              Voir tout le catalogue <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.slice(0, 3).map((p) => (
              <ProjectCard key={p.id} project={p} onInvest={handleInvest} />
            ))}
          </div>
        </div>
      </main>

      <Footer />

      <InvestModal
        project={selectedProject}
        isOpen={isInvestOpen}
        onClose={() => setIsInvestOpen(false)}
      />
    </div>
  );
}
