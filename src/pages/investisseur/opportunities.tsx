import React, { useState } from "react";
import { useAppData, Project } from "@shared/index";
import { Header } from "../../components/layout/header";
import { Footer } from "../../components/layout/footer";
import { ProjectCard } from "../../components/common/project-card";
import { InvestModal } from "../../components/common/invest-modal";
import { Search } from "lucide-react";

export function InvestisseurOpportunitiesPage() {
  const { projects } = useAppData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("Tous");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isInvestOpen, setIsInvestOpen] = useState(false);

  const sectors = ["Tous", "Fintech", "Agritech", "Énergie", "Santé", "Tech"];

  const filtered = projects.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSector = selectedSector === "Tous" || p.sector.toLowerCase() === selectedSector.toLowerCase();
    return matchSearch && matchSector;
  });

  const handleInvest = (p: Project) => {
    setSelectedProject(p);
    setIsInvestOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header currentUniverse="investisseur" />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground">Catalogue des Opportunités</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Explorez les pépites technologiques et entreprises à forte croissance prêtes pour l'investissement.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Rechercher par nom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl border border-border bg-card text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none w-60"
              />
            </div>
          </div>
        </div>

        {/* Sector filters */}
        <div className="flex flex-wrap gap-2">
          {sectors.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSector(s)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedSector === s
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} onInvest={handleInvest} />
          ))}
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
