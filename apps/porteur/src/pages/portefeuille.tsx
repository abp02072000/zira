import React, { useState } from "react";
import { useAppData, useLang } from "@zira/shared";
import { RedirectIfNotOnboarded, isOnboarded, useToast } from "@zira/ui";
import { WalletHeader } from "../components/portefeuille/wallet-header";
import { WalletBalanceCard } from "../components/portefeuille/wallet-balance-card";
import { WalletBreakdownChart } from "../components/portefeuille/wallet-breakdown-chart";
import { WalletTransactionsList } from "../components/portefeuille/wallet-transactions-list";
import { WalletActionDialog } from "../components/portefeuille/wallet-action-dialog";

/**
 * Page Portefeuille du porteur de projet.
 * Affiche la balance globale, la ventilation par projet et l'historique des souscriptions.
 */
export default function PorteurPortefeuille() {
  const { currentPorteurId, getProjectsByPorteur, getUser, getProject, investments, formatUSD, formatDate } = useAppData();
  const { t } = useLang();
  const { toast } = useToast();
  const [dialog, setDialog] = useState<{ open: boolean; action: "deposit" | "withdraw" } | null>(null);

  if (!isOnboarded("porteur")) {
    return <RedirectIfNotOnboarded universe="porteur" to="/porteur/onboarding" />;
  }

  const myProjects = getProjectsByPorteur(currentPorteurId);
  const myProjectIds = myProjects.map((p) => p.id);
  const allIncoming = investments.filter((i) => myProjectIds.includes(i.projectId));
  const totalRaised = allIncoming.filter((i) => i.status === "completed").reduce((s, i) => s + i.amountUSD, 0);

  const pieData = myProjects.map((p) => ({
    name: p.name,
    value: allIncoming.filter((i) => i.projectId === p.id && i.status === "completed").reduce((s, i) => s + i.amountUSD, 0),
  }));

  const transactionsData = allIncoming.slice(0, 8).map((inv) => ({
    id: inv.id,
    amountUSD: inv.amountUSD,
    date: inv.date,
    investorName: getUser(inv.investorId)?.name || "Investisseur",
    projectName: getProject(inv.projectId)?.name || "Projet",
  }));

  const handleActionConfirm = (action: "deposit" | "withdraw") => {
    toast({ title: action === "deposit" ? t.walletDepositSuccess : t.walletWithdrawSuccess });
    setDialog(null);
  };

  return (
    <div className="py-6 px-4 md:px-6 space-y-5">
      <WalletHeader
        onDeposit={() => setDialog({ open: true, action: "deposit" })}
        onWithdraw={() => setDialog({ open: true, action: "withdraw" })}
      />
      <WalletBalanceCard totalRaisedFormatted={formatUSD(totalRaised)} />
      <WalletBreakdownChart data={pieData} formatUSD={formatUSD} />
      <WalletTransactionsList
        investments={transactionsData}
        formatUSD={formatUSD}
        formatDate={formatDate}
      />
      <WalletActionDialog
        dialog={dialog}
        onClose={() => setDialog(null)}
        onConfirm={handleActionConfirm}
      />
    </div>
  );
}
