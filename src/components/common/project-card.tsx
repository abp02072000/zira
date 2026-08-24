import React from "react";
import { Link } from "wouter";
import { Project, formatUSD } from "@shared/index";
import { TrendingUp, Users, Target, ArrowRight, ShieldCheck } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  onInvest?: (project: Project) => void;
  showInvestButton?: boolean;
}

export function ProjectCard({ project, onInvest, showInvestButton = true }: ProjectCardProps) {
  const percentRaised = Math.min(
    100,
    Math.round((project.fundraising.raisedAmount / (project.fundraising.targetAmountUSD || 1)) * 100)
  );

  return (
    <div className="group rounded-2xl border border-border/80 bg-card p-5 shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between">
      <div>
        {/* Header with Sector & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            {project.sector}
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
              project.status === "active"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                : project.status === "pending"
                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                : project.status === "funded"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            {project.status === "active"
              ? "En Levée"
              : project.status === "pending"
              ? "En Audit"
              : project.status === "funded"
              ? "Financé"
              : project.status}
          </span>
        </div>

        {/* Project Name & Description */}
        <Link href={`/projets/${project.id}`} className="block group-hover:text-primary transition-colors">
          <h3 className="text-lg font-bold text-foreground mb-1.5 line-clamp-1">{project.name}</h3>
        </Link>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
          {project.shortDescription}
        </p>

        {/* Fundraising Progress Bar */}
        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-foreground">{formatUSD(project.fundraising.raisedAmount)}</span>
            <span className="text-muted-foreground">{percentRaised}% levés</span>
          </div>
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${percentRaised}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>Obj : {formatUSD(project.fundraising.targetAmountUSD)}</span>
            <span>Équité : {project.fundraising.equityPercent}%</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-muted/40 text-xs mb-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Ticket Min</span>
            <span className="font-semibold text-foreground">{formatUSD(project.fundraising.minInvestment)}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Marché Cible</span>
            <span className="font-semibold text-foreground truncate block">{project.targetMarket || "Afrique"}</span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
        <Link
          href={`/projets/${project.id}`}
          className="flex-1 py-2 px-3 rounded-xl border border-border text-center text-xs font-semibold text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1"
        >
          Détails <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        {showInvestButton && (
          <button
            onClick={() => onInvest && onInvest(project)}
            className="flex-1 py-2 px-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-sm transition-all text-center"
          >
            Investir
          </button>
        )}
      </div>
    </div>
  );
}
