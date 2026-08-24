import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAppData } from "@/contexts/app-data-context";
import { RedirectIfNotOnboarded } from "@/components/redirect-if-not-onboarded";
import { isOnboarded } from "@/components/onboarding-carousel";
import { useLang } from "@/lib/i18n";
import { FilterPills } from "@/components/filter-pills";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";

type FilterValue = "all" | "completed" | "pending";

export default function ModerationFlux() {
  const { investments, getProject, getUser, formatUSD, formatDate } = useAppData();
  const { t } = useLang();
  const [tab, setTab] = useState<FilterValue>("all");

  if (!isOnboarded("moderation")) {
    return <RedirectIfNotOnboarded universe="moderation" to="/moderation/onboarding" />;
  }

  const totalCompleted = investments.filter((i) => i.status === "completed").reduce((s, i) => s + i.amountUSD, 0);
  const totalMonth = Math.round(totalCompleted * 0.72);
  const txCount = investments.length;

  const chartData = [
    { mois: "Jan", val: Math.round(totalCompleted * 0.04) },
    { mois: "Fév", val: Math.round(totalCompleted * 0.06) },
    { mois: "Mar", val: Math.round(totalCompleted * 0.08) },
    { mois: "Avr", val: Math.round(totalCompleted * 0.12) },
    { mois: "Mai", val: Math.round(totalCompleted * 0.72) },
  ];

  const TABS = [
    { value: "all", label: "Tous" },
    { value: "completed", label: "Complétés" },
    { value: "pending", label: "En attente" },
  ];

  const filtered = investments.filter((i) => tab === "all" || i.status === tab);

  return (
    <div className="py-6 px-4 md:px-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Flux d'Investissements</h1>
        <p className="text-sm text-muted-foreground">Supervision globale des transactions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Total flux", value: `$${Math.round(totalCompleted / 1000)}K` },
          { label: "Ce mois", value: `$${Math.round(totalMonth / 1000)}K` },
          { label: "Transactions", value: String(txCount) },
        ].map((s) => (
          <div key={s.label} className="bg-card border rounded-2xl p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-primary">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border rounded-2xl p-5">
        <h2 className="text-base font-semibold mb-4">Flux mensuels (USD)</h2>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="mois" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis hide />
              <Tooltip formatter={(v: number) => formatUSD(v)} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="val" fill="#D4A843" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Dernières transactions</h2>
          <FilterPills options={TABS} value={tab} onChange={(v) => setTab(v as FilterValue)} />
        </div>
        <div className="flex flex-col gap-2">
          {filtered.slice(0, 10).map((tx) => {
            const project = getProject(tx.projectId);
            const investor = getUser(tx.investorId);
            return (
              <div key={tx.id} className="bg-card border rounded-2xl p-4 flex items-center gap-3">
                <Avatar className="w-10 h-10 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {investor?.name.split(" ").map((n) => n[0]).join("") ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{investor?.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{project?.name} · {formatDate(tx.date)}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-sm text-green-600">+{formatUSD(tx.amountUSD)}</div>
                  <div className={cn(
                    "text-xs font-medium",
                    tx.status === "completed" ? "text-green-600" : "text-orange-500"
                  )}>
                    {tx.status === "completed" ? "Complété" : "En attente"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
