import { AppShell } from "@zira/ui";
import { LayoutDashboard, User, Search, Wallet } from "lucide-react";
import { ReactNode } from "react";
import { useLang } from "@zira/shared";

export function InvestisseurLayout({ children }: { children: ReactNode }) {
  const { t } = useLang();
  const investisseurNav = [
    { label: t.navDashboard, href: "/investisseur/dashboard", icon: LayoutDashboard },
    { label: t.navExplorer, href: "/investisseur/explorer", icon: Search },
    { label: t.navWallet, href: "/investisseur/wallet", icon: Wallet },
    { label: t.navProfile, href: "/investisseur/profil", icon: User },
  ];
  return <AppShell navItems={investisseurNav} universe="investisseur">{children}</AppShell>;
}
