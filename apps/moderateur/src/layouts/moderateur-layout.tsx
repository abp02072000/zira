import { AppShell } from "@zira/ui";
import { LayoutDashboard, FileCheck, FolderCheck, Users, DollarSign } from "lucide-react";
import { ReactNode } from "react";
import { useLang } from "@zira/shared";

export function ModerateurLayout({ children }: { children: ReactNode }) {
  const { t } = useLang();
  const moderationNav = [
    { label: t.navDashboard, href: "/moderateur/dashboard", icon: LayoutDashboard },
    { label: t.navKYC, href: "/moderateur/kyc", icon: FileCheck },
    { label: t.navProjects, href: "/moderateur/projets", icon: FolderCheck },
    { label: t.navUsers, href: "/moderateur/utilisateurs", icon: Users },
    { label: t.navFlows, href: "/moderateur/flux", icon: DollarSign },
  ];
  return <AppShell navItems={moderationNav} universe="moderation">{children}</AppShell>;
}

export const ModerationLayout = ModerateurLayout;
