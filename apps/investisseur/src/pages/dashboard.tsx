import { Link } from "wouter";
import { useAppData } from "@/contexts/app-data-context";
import { RedirectIfNotOnboarded } from "@/components/redirect-if-not-onboarded";
import { isOnboarded } from "@/components/onboarding-carousel";
import { SectorImage } from "@/components/sector-image";
import { StatCard } from "@/components/stat-card";
import { useLang } from "@/lib/i18n";
import { UserAvatar } from "@/components/user-avatar";

export default function InvestisseurDashboard() {
  const { currentInvestorId, getInvestmentsByInvestor, getProject, getUser, formatUSD } = useAppData();
  const { t } = useLang();

  if (!isOnboarded("investisseur")) {
    return <RedirectIfNotOnboarded universe="investisseur" to="/investisseur/onboarding" />;
  }

  const currentUser = getUser(currentInvestorId);
  const investments = getInvestmentsByInvestor(currentInvestorId);
  const totalInvested = investments.reduce((s, i) => s + i.amountUSD, 0);
  const projectCount = new Set(investments.map((i) => i.projectId)).size;
  const totalEquity = investments.reduce((s, i) => s + i.equityReceived, 0);
  const estimatedGains = totalInvested > 0 ? Math.round(totalInvested * 0.073) : 0;

  const displayName = currentUser?.name || (currentUser?.email ? currentUser.email.split('@')[0].replace(/[\._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : "Investisseur");

  return (
    <div className="py-6 px-4 md:px-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Bonjour,</p>
          <h1 className="text-2xl font-bold">{displayName}</h1>
        </div>
        <UserAvatar name={displayName} photo={currentUser?.photo} size="md" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Portefeuille total" value={formatUSD(totalInvested)} sub="montant total" />
        <StatCard label="Projets investis" value={String(projectCount)} sub="tous actifs" />
        <StatCard label="Équité totale" value={`${totalEquity.toFixed(2)}%`} sub={`sur ${projectCount} projet${projectCount !== 1 ? "s" : ""}`} />
        <StatCard label="Gains estimés" value={estimatedGains > 0 ? `$+${estimatedGains.toLocaleString()}` : "$0"} sub="valeur actuelle" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Mes investissements</h2>
          <Link href="/investisseur/explorer">
            <span className="text-sm text-primary font-medium cursor-pointer hover:underline">Explorer +</span>
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          {investments.length === 0 ? (
            <div className="border border-dashed rounded-2xl p-8 text-center text-muted-foreground text-sm">
              {t.invNoInvestments}
            </div>
          ) : (
            investments.map((inv) => {
              const project = getProject(inv.projectId);
              if (!project) return null;
              return (
                <Link key={inv.id} href={`/investisseur/projets/${inv.projectId}`}>
                  <div className="bg-card border rounded-2xl p-3.5 sm:p-4 hover:border-primary/40 hover:shadow-xs transition-all cursor-pointer">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 bg-muted">
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
                        <div className="font-bold text-sm sm:text-base truncate">{project.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {project.sector} · {inv.equityReceived.toFixed(2)}% equity
                        </div>
                      </div>
                      <span className="font-bold text-green-600 text-sm sm:text-base shrink-0">
                        {formatUSD(inv.amountUSD)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
