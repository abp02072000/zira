import React from "react";
import { Link } from "wouter";
import { useAppData, formatUSD, formatDate } from "@shared/index";
import { Header } from "../../components/layout/header";
import { Footer } from "../../components/layout/footer";
import { Briefcase, ArrowRight, ShieldCheck, Download, TrendingUp } from "lucide-react";

export function InvestisseurPortfolioPage() {
  const { myInvestments, projects, totalInvested } = useAppData();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header currentUniverse="investisseur" />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground">Mon Portefeuille d'Investissement</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Suivi de vos prises de participation, certificats de souscription et valorisation estimée.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-card border border-border flex items-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Actif Total Déployé</span>
              <span className="text-xl font-black text-foreground">{formatUSD(totalInvested)}</span>
            </div>
          </div>
        </div>

        {myInvestments.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-2xl space-y-3">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-base font-bold text-foreground">Aucune participation active</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Vous n'avez pas encore souscrit à une levée de fonds. Consultez notre catalogue pour placer vos premiers capitaux.
            </p>
            <Link
              href="/investisseur/opportunites"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow transition-all"
            >
              Explorer les Pépites
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground">Lignes d'actions en portefeuille</h3>
              <span className="text-xs text-muted-foreground">{myInvestments.length} participations</span>
            </div>

            <div className="divide-y divide-border">
              {myInvestments.map((inv) => {
                const project = projects.find((p) => p.id === inv.projectId);
                return (
                  <div key={inv.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-foreground">{project?.name || "Startup"}</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                          {inv.status === "completed" ? "Actions Émises" : "En Séquestre"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Souscription effectuée le {formatDate(inv.date)} • Secteur : {project?.sector || "Tech"}
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground block">Montant Souscrit</span>
                        <span className="text-base font-black text-foreground">{formatUSD(inv.amountUSD)}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-muted-foreground block">Part de Capital</span>
                        <span className="text-base font-black text-emerald-600">{inv.equityReceived}%</span>
                      </div>

                      <Link
                        href={`/projets/${inv.projectId}`}
                        className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
