import React from "react";
import { Link } from "wouter";
import { useAppData, useAuth, formatUSD, formatDate } from "@shared/index";
import { Header } from "../../components/layout/header";
import { Footer } from "../../components/layout/footer";
import {
  TrendingUp,
  PlusCircle,
  Users,
  ShieldCheck,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
} from "lucide-react";

export function PorteurDashboard() {
  const { user } = useAuth();
  const { myProjects, myInvestments, totalRaisedPorteur } = useAppData();

  const activeProjectsCount = myProjects.filter((p) => p.status === "active").length;
  const pendingProjectsCount = myProjects.filter((p) => p.status === "pending").length;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header currentUniverse="porteur" />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Espace Porteur de Projet</span>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground mt-0.5">
              Bonjour, {user?.name || "Fondateur"} 👋
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Pilotez vos levées de fonds, vos investisseurs et le statut de vos audits de conformité.
            </p>
          </div>

          <Link
            href="/porteur/projet/nouveau"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Déposer un Nouveau Projet</span>
          </Link>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Total Fonds Collectés</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-foreground">{formatUSD(totalRaisedPorteur)}</p>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Séquestre garanti
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Projets en Levée</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-foreground">{activeProjectsCount}</p>
            <p className="text-[11px] text-muted-foreground">Visibles par les investisseurs</p>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">En Audit / Revue</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-foreground">{pendingProjectsCount}</p>
            <p className="text-[11px] text-amber-600 font-semibold">Examen conformité en cours</p>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Statut KYC Porteur</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-600">Certifié</p>
            <p className="text-[11px] text-muted-foreground">Passeport d'émission actif</p>
          </div>
        </div>

        {/* My Projects Table / List */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Mes Campagnes de Financement</h2>
              <p className="text-xs text-muted-foreground">Vos projets soumis sur la plateforme ZIRA.</p>
            </div>
            <Link href="/porteur/projets" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              Voir tout <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {myProjects.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-xl space-y-3">
              <FileText className="w-10 h-10 text-muted-foreground mx-auto" />
              <p className="text-sm font-semibold text-foreground">Aucun projet enregistré</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Commencez par déposer votre pitch deck et vos informations d'immatriculation.
              </p>
              <Link
                href="/porteur/projet/nouveau"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold"
              >
                Créer mon premier projet
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {myProjects.map((p) => {
                const percent = Math.min(
                  100,
                  Math.round((p.fundraising.raisedAmount / (p.fundraising.targetAmountUSD || 1)) * 100)
                );
                return (
                  <div key={p.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{p.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                          {p.sector}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            p.status === "active"
                              ? "bg-emerald-100 text-emerald-800"
                              : p.status === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{p.shortDescription}</p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right min-w-[120px]">
                        <p className="text-xs font-bold text-foreground">
                          {formatUSD(p.fundraising.raisedAmount)} / {formatUSD(p.fundraising.targetAmountUSD)}
                        </p>
                        <div className="w-28 h-1.5 rounded-full bg-muted overflow-hidden mt-1 ml-auto">
                          <div
                            className="h-full bg-emerald-600 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      <Link
                        href={`/projets/${p.id}`}
                        className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted"
                      >
                        Consulter
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
