import React from "react";
import { Link } from "wouter";
import { Badge, Button } from "@zira/ui";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/solid";
import type { Project } from "@zira/shared";

interface LandingProjectsProps {
  projects: Project[];
  investisseurUrl: string;
}

export function LandingProjects({ projects, investisseurUrl }: LandingProjectsProps) {
  // Show up to 3 featured or active projects
  const displayProjects = projects.slice(0, 3);

  return (
    <section id="projets" className="py-16 bg-muted/30 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Badge variant="outline" className="text-primary border-primary/30 mb-2">Campagnes Actives</Badge>
            <h2 className="text-3xl font-bold tracking-tight">Opportunités à la une</h2>
          </div>
          <Link href={investisseurUrl}>
            <Button variant="outline" size="sm" className="font-semibold gap-1.5 border-primary/30 hover:bg-primary/5">
              Voir tous les projets <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1 text-primary" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProjects.map((p) => {
            const raised = p.fundraising?.raisedAmount || 0;
            const target = p.fundraising?.targetAmountUSD || 100000;
            const progress = Math.min(100, Math.round((raised / target) * 100));
            const minInv = p.fundraising?.minInvestment || 500;
            const imageSrc = p.poster || p.logo || "/images/poster-1.png";

            return (
              <div key={p.id} className="bg-card border rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between">
                <div>
                  <div className="h-44 relative overflow-hidden bg-muted">
                    <img src={imageSrc} alt={p.name} className="w-full h-full object-cover" />
                    <Badge className="absolute top-3 right-3 bg-amber-500 text-slate-900 font-bold text-xs shadow-xs">
                      {p.status === "active" ? "En cours" : "Vérifié"}
                    </Badge>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between text-xs text-muted-foreground font-semibold">
                      <span className="text-primary">{p.sector}</span>
                      <span>{p.targetMarket || "RDC (Kinshasa)"}</span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{p.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {p.shortDescription}
                    </p>
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-muted-foreground">
                          Objectif: ${target.toLocaleString()} USD
                        </span>
                        <span className="text-amber-600 dark:text-amber-400 font-bold">{progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-5 pt-0 border-t mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Min. : <strong className="text-foreground">${minInv} USD</strong>
                  </span>
                  <Link href={investisseurUrl}>
                    <Button size="sm" className="font-semibold text-xs bg-primary text-primary-foreground hover:bg-primary/90">Investir</Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
