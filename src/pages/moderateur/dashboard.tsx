import React from "react";
import { Link } from "wouter";
import { useAppData, formatUSD } from "@shared/index";
import { Header } from "../../components/layout/header";
import { Footer } from "../../components/layout/footer";
import {
  ShieldCheck,
  FileCheck,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Clock,
} from "lucide-react";

export function ModerateurDashboard() {
  const { projects, kycRequests, users, approveProject, suspendProject, approveKyc, rejectKyc } = useAppData();

  const pendingProjects = projects.filter((p) => p.status === "pending");
  const pendingKyc = kycRequests.filter((k) => k.status === "pending");

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header currentUniverse="moderation" />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Console d'Administration & Audit</span>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground mt-0.5">
              Supervision & Modération ZIRA 🛡️
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Validation des conformités RCCM, examen des dossiers d'identité KYC et gestion des campagnes de levée.
            </p>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Projets en Attente</span>
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-black text-foreground">{pendingProjects.length}</p>
            <p className="text-[11px] text-purple-600 font-semibold">Nécessite validation</p>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Dossiers KYC en Revue</span>
              <FileCheck className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-foreground">{pendingKyc.length}</p>
            <p className="text-[11px] text-muted-foreground">Identités à vérifier</p>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Campagnes Actives</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-foreground">
              {projects.filter((p) => p.status === "active").length}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold">En cours de collecte</p>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">Comptes Inscrits</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-foreground">{users.length}</p>
            <p className="text-[11px] text-muted-foreground">Porteurs & Investisseurs</p>
          </div>
        </div>

        {/* Project Queue Section */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">File d'Attente des Projets à Auditer</h2>
              <p className="text-xs text-muted-foreground">Vérifiez les pièces justificatives avant publication.</p>
            </div>
            <Link href="/moderateur/projets" className="text-xs font-semibold text-primary hover:underline">
              Gérer la file
            </Link>
          </div>

          {projects.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">Aucun projet enregistré.</p>
          ) : (
            <div className="divide-y divide-border">
              {projects.map((p) => (
                <div key={p.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{p.name}</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                        {p.sector}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          p.status === "active"
                            ? "bg-emerald-100 text-emerald-800"
                            : p.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{p.shortDescription}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {p.status !== "active" && (
                      <button
                        onClick={() => approveProject(p.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm"
                      >
                        Approuver
                      </button>
                    )}
                    {p.status !== "suspended" && (
                      <button
                        onClick={() => suspendProject(p.id, "Audit complémentaire")}
                        className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold"
                      >
                        Suspendre
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
