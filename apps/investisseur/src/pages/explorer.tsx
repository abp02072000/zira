import { useState } from "react";
import { Link } from "wouter";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { SECTORS, type Sector } from "@zira/shared";
import { useAppData } from "@/contexts/app-data-context";
import { RedirectIfNotOnboarded } from "@/components/redirect-if-not-onboarded";
import { isOnboarded } from "@/components/onboarding-carousel";
import { SectorImage } from "@/components/sector-image";
import { useLang } from "@/lib/i18n";
import { FilterPills } from "@/components/filter-pills";

type FilterValue = Sector | "all";

export default function InvestisseurExplorer() {
  const { projects, formatUSD } = useAppData();
  const { t } = useLang();
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState<FilterValue>("all");

  if (!isOnboarded("investisseur")) {
    return <RedirectIfNotOnboarded universe="investisseur" to="/investisseur/onboarding" />;
  }

  const activeProjects = projects.filter((p) => p.status === "active" || p.status === "funded" || !p.status);

  const filtered = activeProjects.filter((p) => {
    if (sector !== "all" && p.sector !== sector) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const sectorOptions = [
    { value: "all", label: "Tous" },
    ...SECTORS.slice(0, 5).map((s) => ({ value: s, label: s })),
  ];

  return (
    <div className="py-6 px-4 md:px-6 space-y-5">
      <h1 className="text-2xl font-bold">{t("explorerTitle", "Explorer les opportunités")}</h1>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
        <Input
          placeholder="Rechercher un projet..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-muted/50 border-border"
        />
      </div>

      <FilterPills options={sectorOptions} value={sector} onChange={(v) => setSector(v as FilterValue)} />

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground text-sm">{t("explorerNoResults", "Aucun projet trouvé")}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {filtered.map((project) => {
            const percent = project.fundraising.targetAmountUSD
              ? Math.round((project.fundraising.raisedAmount / project.fundraising.targetAmountUSD) * 100)
              : 0;
            return (
              <Link key={project.id} href={`/investisseur/projets/${project.id}`}>
                <div className="bg-card border rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between h-full">
                  <div>
                    <div className="relative h-36 sm:h-40 w-full bg-muted overflow-hidden">
                      <SectorImage
                        src={project.poster}
                        alt={project.name}
                        sector={project.sector}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-3 left-3 w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden border-2 border-background bg-background shadow-xs">
                        <SectorImage
                          src={project.logo}
                          alt={project.name}
                          sector={project.sector}
                          variant="logo"
                          initial={project.name.slice(0, 1)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm sm:text-base leading-tight truncate" title={project.name}>
                            {project.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate mt-0.5" title={project.sector}>
                            {project.sector} · {project.targetMarket || "Afrique"}
                          </p>
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-primary shrink-0 bg-primary/10 px-2 py-0.5 rounded-md">
                          {project.fundraising.equityPercent}%
                        </span>
                      </div>
                      <div className="mt-3">
                        <Progress value={percent} className="h-1.5" />
                        <div className="flex justify-between text-xs mt-1.5 text-muted-foreground font-medium">
                          <span>{formatUSD(project.fundraising.raisedAmount)}</span>
                          <span>Min: {formatUSD(project.fundraising.minInvestment)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
