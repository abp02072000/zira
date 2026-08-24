import React from "react";
import { Link } from "wouter";
import { useAppData, formatUSD } from "@shared/index";
import { Header } from "../../components/layout/header";
import { Footer } from "../../components/layout/footer";
import { PlusCircle, ArrowRight, TrendingUp } from "lucide-react";

export function PorteurProjectsPage() {
  const { myProjects } = useAppData();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header currentUniverse="porteur" />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h1 className="text-2xl font-black text-foreground">Gestion de Mes Projets</h1>
            <p className="text-xs text-muted-foreground">Consultez l'avancement de vos levées et l'état de validation.</p>
          </div>
          <Link
            href="/porteur/projet/nouveau"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nouveau Projet</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myProjects.map((p) => {
            const percent = Math.min(
              100,
              Math.round((p.fundraising.raisedAmount / (p.fundraising.targetAmountUSD || 1)) * 100)
            );
            return (
              <div key={p.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                    {p.sector}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
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

                <div>
                  <h3 className="font-bold text-base text-foreground">{p.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{p.shortDescription}</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>{formatUSD(p.fundraising.raisedAmount)}</span>
                    <span className="text-muted-foreground">{percent}% de {formatUSD(p.fundraising.targetAmountUSD)}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${percent}%` }} />
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <Link
                    href={`/projets/${p.id}`}
                    className="flex-1 py-2 rounded-lg border border-border text-center text-xs font-semibold hover:bg-muted"
                  >
                    Page Publique
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
