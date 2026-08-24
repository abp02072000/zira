import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, PauseCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ProjectStatus, Project } from "@/lib/mock-data";
import { useAppData } from "@/contexts/app-data-context";
import { approveProject, suspendProject } from "@/lib/api-client";
import { RedirectIfNotOnboarded } from "@/components/redirect-if-not-onboarded";
import { isOnboarded } from "@/components/onboarding-carousel";
import { SectorImage } from "@/components/sector-image";
import { useLang } from "@/lib/i18n";
import { FilterPills } from "@/components/filter-pills";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { PROJECT_STATUS_LABEL, PROJECT_STATUS_STYLE } from "@/lib/status";

type FilterValue = ProjectStatus | "all";

export default function ModerationProjets() {
  const { toast } = useToast();
  const { t } = useLang();
  const { projects, setProjects, getUser, formatUSD, formatDate, refreshData } = useAppData();
  const [tab, setTab] = useState<FilterValue>("all");

  if (!isOnboarded("moderation")) {
    return <RedirectIfNotOnboarded universe="moderation" to="/moderation/onboarding" />;
  }

  const TABS = [
    { value: "all", label: "Tous" },
    { value: "pending", label: "En review" },
    { value: "active", label: "Actifs" },
    { value: "suspended", label: "Suspendus" },
  ];

  const filtered = projects.filter((p) => tab === "all" || p.status === tab);

  const validate = async (p: Project) => {
    try {
      await approveProject(p.id);
      setProjects((prev) => prev.map((x) => (x.id === p.id ? { ...x, status: "active" as ProjectStatus } : x)));
      await refreshData("moderation");
      toast({ title: t.modProjValidated, description: t.modProjValidatedDesc(p.name) });
    } catch (e) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Échec", variant: "destructive" });
    }
  };

  const suspend = async (p: Project) => {
    try {
      await suspendProject(p.id);
      setProjects((prev) => prev.map((x) => (x.id === p.id ? { ...x, status: "suspended" as ProjectStatus } : x)));
      await refreshData("moderation");
      toast({ title: t.modProjSuspended, description: t.modProjSuspendedDesc(p.name), variant: "destructive" });
    } catch (e) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Échec", variant: "destructive" });
    }
  };

  return (
    <div className="py-6 px-4 md:px-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Modération des Projets</h1>
        <p className="text-sm text-muted-foreground">Validez, suspendez ou rejetez les projets</p>
      </div>

      <FilterPills options={TABS} value={tab} onChange={(v) => setTab(v as FilterValue)} />

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground text-sm">{t.modProjNone}</div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((project) => {
            const porteur = getUser(project.porteurId);
            const percent = project.fundraising.targetAmountUSD
              ? Math.round((project.fundraising.raisedAmount / project.fundraising.targetAmountUSD) * 100)
              : 0;
            return (
              <div key={project.id} className="bg-card border rounded-2xl p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-muted">
                    <SectorImage
                      src={project.logo ?? project.poster}
                      alt={project.name}
                      sector={project.sector}
                      variant="logo"
                      initial={project.name.slice(0, 1)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-bold text-sm truncate">{project.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {project.sector} · {porteur?.name} · {formatDate(project.createdAt)}
                        </div>
                      </div>
                      <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full shrink-0", PROJECT_STATUS_STYLE[project.status])}>
                        {PROJECT_STATUS_LABEL[project.status]}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <Progress value={percent} className="h-1.5" />
                  <div className="flex justify-between text-xs mt-1.5 text-muted-foreground">
                    <span>{formatUSD(project.fundraising.raisedAmount)} / {formatUSD(project.fundraising.targetAmountUSD)}</span>
                    <span>{percent}%</span>
                  </div>
                </div>

                <div className={cn("grid gap-3", project.status === "pending" ? "grid-cols-2" : "grid-cols-1")}>
                  <Button
                    variant="outline"
                    className="gap-2 text-orange-600 border-orange-200"
                    onClick={() => suspend(project)}
                  >
                    <PauseCircle className="w-4 h-4" /> Suspendre
                  </Button>
                  {project.status === "pending" && (
                    <Button
                      className="gap-2 bg-green-50 text-green-700 border border-green-200"
                      variant="ghost"
                      onClick={() => validate(project)}
                    >
                      <Check className="w-4 h-4" /> Valider
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
