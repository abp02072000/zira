import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Pause, RotateCcw, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from "@zira/shared";
import { useAppData } from "@/contexts/app-data-context";
import { suspendUser, activateUser } from "@/lib/api-client";
import { RedirectIfNotOnboarded } from "@/components/redirect-if-not-onboarded";
import { isOnboarded } from "@/components/onboarding-carousel";
import { useLang } from "@/lib/i18n";
import { FilterPills } from "@/components/filter-pills";
import { cn } from "@/lib/utils";
import { USER_STATUS_LABEL, USER_STATUS_STYLE } from "@zira/shared";

type FilterValue = "all" | "active" | "suspended" | "pending_kyc" | "porteur" | "investisseur";

export default function ModerationUtilisateurs() {
  const { toast } = useToast();
  const { t } = useLang();
  const { users, setUsers, refreshData } = useAppData();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");

  if (!isOnboarded("moderation")) {
    return <RedirectIfNotOnboarded universe="moderation" to="/moderation/onboarding" />;
  }

  const TABS = [
    { value: "all", label: "Tous" },
    { value: "active", label: "Actifs" },
    { value: "suspended", label: "Suspendus" },
    { value: "pending_kyc", label: "KYC att." },
    { value: "porteur", label: "Porteurs" },
    { value: "investisseur", label: "Investisseurs" },
  ];

  const filtered = users
    .filter((u) => {
      if (filter === "all") return true;
      if (filter === "porteur") return u.role === "porteur";
      if (filter === "investisseur") return u.role === "investisseur";
      return u.status === filter;
    })
    .filter((u) => {
      if (!search) return true;
      return u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    });

  const suspend = async (u: UserProfile) => {
    try {
      await suspendUser(u.id);
      setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, status: "suspended" as const } : x));
      await refreshData("moderation");
      toast({ title: t("modUsersSuspended", "Utilisateur suspendu"), description: u.name, variant: "destructive" });
    } catch (e) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Échec", variant: "destructive" });
    }
  };

  const activate = async (u: UserProfile) => {
    try {
      await activateUser(u.id);
      setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, status: "active" as const } : x));
      await refreshData("moderation");
      toast({ title: t("modUsersActivated", "Utilisateur réactivé"), description: u.name });
    } catch (e) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Échec", variant: "destructive" });
    }
  };

  return (
    <div className="py-6 px-4 md:px-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Gestion des Utilisateurs</h1>
        <p className="text-sm text-muted-foreground">Modérez porteurs et investisseurs</p>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
        <Input
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-muted/50"
        />
      </div>

      <FilterPills options={TABS} value={filter} onChange={(v) => setFilter(v as FilterValue)} />

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground text-sm">{t("modUsersNone", "Aucun utilisateur trouvé")}</div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((u) => (
            <div key={u.id} className="bg-card border rounded-2xl p-4 flex items-center gap-3">
              <Avatar className="w-11 h-11 shrink-0">
                {u.photo ? (
                  <img src={u.photo} alt={u.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                    {u.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{u.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {u.role === "porteur" ? "Porteur" : u.role === "investisseur" ? "Investisseur" : "Modérateur"} · {u.email}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", USER_STATUS_STYLE[u.status] ?? "bg-gray-100 text-gray-600")}>
                  {USER_STATUS_LABEL[u.status] ?? u.status}
                </span>
                {u.status === "suspended" ? (
                  <button
                    onClick={() => activate(u)}
                    className="w-8 h-8 rounded-full border border-green-200 bg-green-50 flex items-center justify-center text-green-600"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => suspend(u)}
                    className="w-8 h-8 rounded-full border border-red-200 bg-red-50 flex items-center justify-center text-red-500"
                  >
                    <Pause className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
