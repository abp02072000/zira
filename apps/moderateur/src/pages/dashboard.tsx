import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { TriangleAlert, ArrowRight, Clock, CheckCircle2, Users, BarChart2, ShieldCheck, FolderKanban, Activity } from "lucide-react";
import { useAppData } from "@/contexts/app-data-context";
import { RedirectIfNotOnboarded } from "@/components/redirect-if-not-onboarded";
import { isOnboarded } from "@/components/onboarding-carousel";
import { useLang } from "@/lib/i18n";
import { StatCard } from "@/components/stat-card";

export default function ModerationDashboard() {
  const { users, projects, kycRequests, investments, formatUSD } = useAppData();
  const { t } = useLang();

  if (!isOnboarded("moderation")) {
    return <RedirectIfNotOnboarded universe="moderation" to="/moderation/onboarding" />;
  }

  const activeProjects = projects.filter((p) => p.status === "active").length;
  const pendingProjects = projects.filter((p) => p.status === "pending").length;
  const totalFlux = investments.filter((i) => i.status === "completed").reduce((s, i) => s + i.amountUSD, 0);
  const flaggedUsers = users.filter((u) => u.status === "suspended").length;

  return (
    <div className="py-6 px-4 md:px-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t.modDashTitle}</h1>
        <p className="text-sm text-muted-foreground">{t.modDashSubtitle}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={<Clock className="w-5 h-5 text-orange-600" />}
          iconBg="bg-orange-100 dark:bg-orange-950/40"
          value={String(kycRequests.length)}
          label={t.modKYCPending}
          sub="à traiter"
          subClass="text-orange-600"
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
          iconBg="bg-green-100 dark:bg-green-950/40"
          value={String(activeProjects)}
          label="Projets actifs"
          sub={`${pendingProjects} en attente`}
          subClass="text-primary"
        />
        <StatCard
          icon={<Users className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-100 dark:bg-blue-950/40"
          value={users.length.toLocaleString()}
          label={t.modTotalUsers}
          sub={`${flaggedUsers} suspendus`}
          subClass="text-primary"
        />
        <StatCard
          icon={<BarChart2 className="w-5 h-5 text-purple-600" />}
          iconBg="bg-purple-100 dark:bg-purple-950/40"
          value={totalFlux > 0 ? `$${Math.round(totalFlux / 1000)}K` : "$0"}
          label="Flux total"
          sub={`${investments.length} transactions`}
          subClass="text-primary"
        />
      </div>

      <div>
        <h2 className="text-base font-semibold mb-3">Alertes actives</h2>
        <div className="flex flex-col gap-2">
          {[
            { msg: `${kycRequests.length} demandes KYC en attente`, href: "/moderation/kyc", show: kycRequests.length > 0 },
            { msg: `${pendingProjects} projets soumis pour validation`, href: "/moderation/projets", show: pendingProjects > 0 },
            { msg: `${flaggedUsers} utilisateur signalé`, href: "/moderation/utilisateurs", show: flaggedUsers > 0 },
          ].filter(a => a.show).map((alert, i) => (
            <Link key={i} href={alert.href}>
              <div className="bg-card border rounded-xl p-4 flex items-center justify-between hover:border-primary/40 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 min-w-0 mr-2">
                  <TriangleAlert className="w-4 h-4 text-orange-500 shrink-0" />
                  <span className="text-sm truncate">{alert.msg}</span>
                </div>
                <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0 font-medium">
                  Voir <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
          {kycRequests.length === 0 && pendingProjects === 0 && flaggedUsers === 0 && (
            <div className="py-8 text-center border border-dashed rounded-xl text-sm text-muted-foreground">
              Aucune alerte active pour le moment.
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold mb-3">Accès rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link href="/moderation/kyc">
            <Button variant="outline" className="w-full justify-start gap-2 h-11">
              <ShieldCheck className="w-4 h-4 text-primary" /> KYC ({kycRequests.length})
            </Button>
          </Link>
          <Link href="/moderation/projets">
            <Button variant="outline" className="w-full justify-start gap-2 h-11">
              <FolderKanban className="w-4 h-4 text-primary" /> Projets ({pendingProjects})
            </Button>
          </Link>
          <Link href="/moderation/utilisateurs">
            <Button variant="outline" className="w-full justify-start gap-2 h-11">
              <Users className="w-4 h-4 text-primary" /> Utilisateurs ({users.length})
            </Button>
          </Link>
          <Link href="/moderation/flux">
            <Button variant="outline" className="w-full justify-start gap-2 h-11">
              <Activity className="w-4 h-4 text-primary" /> Flux ({investments.length} tx)
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
