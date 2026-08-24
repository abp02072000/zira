import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, X, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { KycRequest } from "@/lib/mock-data";
import { useAppData } from "@/contexts/app-data-context";
import { approveKyc, rejectKyc } from "@/lib/api-client";
import { RedirectIfNotOnboarded } from "@/components/redirect-if-not-onboarded";
import { isOnboarded } from "@/components/onboarding-carousel";
import { useLang } from "@/lib/i18n";
import { FilterPills } from "@/components/filter-pills";

type FilterValue = "pending" | "approved" | "rejected" | "all";

export default function ModerationKYC() {
  const { toast } = useToast();
  const { t } = useLang();
  const { kycRequests, setKycRequests, getUser, formatDate, refreshData } = useAppData();
  const [filter, setFilter] = useState<FilterValue>("pending");

  if (!isOnboarded("moderation")) {
    return <RedirectIfNotOnboarded universe="moderation" to="/moderation/onboarding" />;
  }

  const approve = async (req: KycRequest) => {
    const user = getUser(req.userId);
    try {
      await approveKyc(req.id);
      setKycRequests((prev) => prev.filter((r) => r.id !== req.id));
      await refreshData("moderation");
      toast({ title: t.modKYCApproved, description: t.modKYCApprovedDesc(user?.name ?? "") });
    } catch (e) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Échec", variant: "destructive" });
    }
  };

  const reject = async (req: KycRequest) => {
    const user = getUser(req.userId);
    try {
      await rejectKyc(req.id, "Documents non conformes");
      setKycRequests((prev) => prev.filter((r) => r.id !== req.id));
      await refreshData("moderation");
      toast({ title: t.modKYCRejected, description: t.modKYCRejectedDesc(user?.name ?? ""), variant: "destructive" });
    } catch (e) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Échec", variant: "destructive" });
    }
  };

  const TABS = [
    { value: "pending", label: "En attente" },
    { value: "approved", label: "Approuvés" },
    { value: "rejected", label: "Rejetés" },
    { value: "all", label: "Tous" },
  ];

  const displayed = filter === "all" || filter === "pending" ? kycRequests : [];

  return (
    <div className="py-6 px-4 md:px-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Validation KYC</h1>
        <p className="text-sm text-muted-foreground">Vérifiez et validez les identités des utilisateurs</p>
      </div>

      <FilterPills options={TABS} value={filter} onChange={(v) => setFilter(v as FilterValue)} />

      {displayed.length === 0 ? (
        <div className="py-16 flex flex-col items-center gap-3 text-center">
          <ShieldCheck className="w-12 h-12 text-green-500" />
          <p className="text-muted-foreground">{t.modKYCNone}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {displayed.map((req) => {
            const user = getUser(req.userId);
            return (
              <div key={req.id} className="bg-card border rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-11 h-11 shrink-0">
                    {user?.photo ? (
                      <img src={user.photo} alt={user.name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {user?.name.split(" ").map((n) => n[0]).join("") ?? "?"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{user?.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {req.type === "porteur" ? "Porteur" : "Investisseur"} · {user?.email} · {formatDate(req.submittedAt)}
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 shrink-0">
                    En attente
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="gap-2 text-red-600 border-red-200"
                    onClick={() => reject(req)}
                  >
                    <X className="w-4 h-4" /> Rejeter
                  </Button>
                  <Button
                    className="gap-2 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                    variant="ghost"
                    onClick={() => approve(req)}
                  >
                    <Check className="w-4 h-4" /> Approuver
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
