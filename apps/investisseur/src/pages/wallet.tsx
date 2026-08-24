import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAppData } from "@/contexts/app-data-context";
import { RedirectIfNotOnboarded } from "@/components/redirect-if-not-onboarded";
import { isOnboarded } from "@/components/onboarding-carousel";
import { useLang } from "@/lib/i18n";
import { SectorImage } from "@/components/sector-image";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";

type DialogMode = "deposit" | "withdraw" | null;

export default function InvestisseurWallet() {
  const { toast } = useToast();
  const { t } = useLang();
  const { currentInvestorId, getInvestmentsByInvestor, getProject, formatUSD, formatDate } = useAppData();
  const [mode, setMode] = useState<DialogMode>(null);
  const [amount, setAmount] = useState("");

  if (!isOnboarded("investisseur")) {
    return <RedirectIfNotOnboarded universe="investisseur" to="/investisseur/onboarding" />;
  }

  const investments = getInvestmentsByInvestor(currentInvestorId);
  const totalInvested = investments.reduce((s, i) => s + i.amountUSD, 0);

  const chartData = investments.length > 0 ? [
    { mois: "Aujourd'hui", val: totalInvested },
  ] : [];

  function handleConfirm() {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    toast({ title: mode === "deposit" ? t.walletDepositSuccess : t.walletWithdrawSuccess });
    setMode(null);
    setAmount("");
  }

  return (
    <div className="py-6 px-4 md:px-6 space-y-5">
      <div className="bg-card border rounded-3xl p-6 text-center shadow-sm">
        <p className="text-sm text-muted-foreground mb-1">Portefeuille total</p>
        <h2 className="text-4xl font-black">{formatUSD(totalInvested)}</h2>
        <div className="flex gap-3 mt-4 justify-center">
          <Button size="sm" onClick={() => setMode("deposit")}>+ Déposer</Button>
          <Button size="sm" variant="outline" onClick={() => setMode("withdraw")}>Retirer</Button>
        </div>
      </div>

      <div className="bg-card border rounded-2xl p-5">
        <h2 className="text-base font-semibold mb-4">Évolution du portefeuille</h2>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4A843" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#D4A843" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="mois" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip formatter={(v: number) => formatUSD(v)} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="val" stroke="#D4A843" strokeWidth={2} fill="url(#colorVal)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold mb-3">Mes positions</h2>
        <div className="flex flex-col gap-3">
          {investments.length === 0 ? (
            <div className="border border-dashed rounded-2xl p-8 text-center text-muted-foreground text-sm">
              {t.walletNoTransactions}
            </div>
          ) : (
            investments.map((inv) => {
              const project = getProject(inv.projectId);
              if (!project) return null;
              return (
                <div key={inv.id} className="bg-card border rounded-2xl p-3.5 sm:p-4 hover:border-primary/40 hover:shadow-xs transition-all">
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
                        {inv.equityReceived.toFixed(2)}% equity · {formatDate(inv.date)}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-sm sm:text-base">{formatUSD(inv.amountUSD)}</div>
                      <div className="text-xs text-green-600 font-medium">Actif</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Dialog open={!!mode} onOpenChange={(o) => !o && setMode(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{mode === "deposit" ? t.walletDeposit : t.walletWithdrawAction}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>{t.walletAmount}</Label>
              <Input type="number" min={1} placeholder={t.walletAmountPlaceholder} value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMode(null)}>{t.cancel}</Button>
            <Button onClick={handleConfirm} disabled={!amount}>
              {mode === "deposit" ? t.walletConfirmDeposit : t.walletConfirmWithdraw}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
