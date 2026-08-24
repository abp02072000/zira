import React from "react";
import { Link } from "wouter";
import { Button, SectorImage } from "@zira/ui";
import { ArrowLeft, Edit } from "lucide-react";
import { useLang, PROJECT_STATUS_LABEL, PROJECT_STATUS_STYLE } from "@zira/shared";

interface ProjectDetailHeaderProps {
  project: {
    id: string;
    name: string;
    sector: string;
    status: any;
    shortDescription: string;
    poster?: string;
  };
  onEditClick: () => void;
}

/**
 * En-tête de la page détail projet avec bannière, statut et bouton de modification.
 */
export function ProjectDetailHeader({ project, onEditClick }: ProjectDetailHeaderProps) {
  const { t } = useLang();

  return (
    <div className="space-y-4">
      <Link href="/porteur/projets">
        <Button variant="ghost" size="sm" className="gap-2 -ml-2">
          <ArrowLeft className="w-4 h-4" /> {t.back}
        </Button>
      </Link>

      <div className="rounded-2xl overflow-hidden bg-muted aspect-[21/9]">
        <SectorImage
          src={project.poster}
          alt={project.name}
          sector={project.sector}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-border text-muted-foreground">
              {project.sector}
            </span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PROJECT_STATUS_STYLE[project.status as keyof typeof PROJECT_STATUS_STYLE] || ""}`}>
              {PROJECT_STATUS_LABEL[project.status as keyof typeof PROJECT_STATUS_LABEL] || project.status}
            </span>
          </div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground text-sm mt-1">{project.shortDescription}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" className="gap-2" onClick={onEditClick}>
            <Edit className="w-4 h-4" /> {t.porteurModify}
          </Button>
        </div>
      </div>
    </div>
  );
}
