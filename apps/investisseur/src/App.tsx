import React, { Suspense } from "react";
import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster, TooltipProvider, ThemeProvider, AuthGuard } from "@zira/ui";
import { LangProvider, AuthProvider, AppDataProvider, type Universe } from "@zira/shared";
import { Loader2 } from "lucide-react";

import { InvestisseurLayout } from "./layouts/investisseur-layout";
import InvestisseurOnboarding from "./pages/onboarding";
import InvestisseurDashboard from "./pages/dashboard";
import InvestisseurProfil from "./pages/profil";
import InvestisseurNotifications from "./pages/notifications";
import InvestisseurExplorer from "./pages/explorer";
import InvestisseurProjetDetail from "./pages/projet-detail";
import InvestisseurWallet from "./pages/wallet";
import InvestisseurLogin from "./pages/auth/investisseur-login";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function PageFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-4" />
      <span className="text-sm font-medium text-muted-foreground">Chargement du Portail Investisseur...</span>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Switch>
        <Route path="/investisseur/login" component={InvestisseurLogin} />
        <Route path="/login" component={InvestisseurLogin} />

        <Route path="/investisseur/onboarding">
          <AuthGuard universe="investisseur" loginPath="/investisseur/login">
            <InvestisseurOnboarding />
          </AuthGuard>
        </Route>
        <Route path="/onboarding">
          <AuthGuard universe="investisseur" loginPath="/investisseur/login">
            <InvestisseurOnboarding />
          </AuthGuard>
        </Route>

        <Route path="/investisseur/dashboard">
          <AuthGuard universe="investisseur" loginPath="/investisseur/login">
            <InvestisseurLayout><InvestisseurDashboard /></InvestisseurLayout>
          </AuthGuard>
        </Route>
        <Route path="/dashboard">
          <AuthGuard universe="investisseur" loginPath="/investisseur/login">
            <InvestisseurLayout><InvestisseurDashboard /></InvestisseurLayout>
          </AuthGuard>
        </Route>

        <Route path="/investisseur/profil">
          <AuthGuard universe="investisseur" loginPath="/investisseur/login">
            <InvestisseurLayout><InvestisseurProfil /></InvestisseurLayout>
          </AuthGuard>
        </Route>
        <Route path="/profil">
          <AuthGuard universe="investisseur" loginPath="/investisseur/login">
            <InvestisseurLayout><InvestisseurProfil /></InvestisseurLayout>
          </AuthGuard>
        </Route>

        <Route path="/investisseur/notifications">
          <AuthGuard universe="investisseur" loginPath="/investisseur/login">
            <InvestisseurLayout><InvestisseurNotifications /></InvestisseurLayout>
          </AuthGuard>
        </Route>
        <Route path="/notifications">
          <AuthGuard universe="investisseur" loginPath="/investisseur/login">
            <InvestisseurLayout><InvestisseurNotifications /></InvestisseurLayout>
          </AuthGuard>
        </Route>

        <Route path="/investisseur/explorer">
          <AuthGuard universe="investisseur" loginPath="/investisseur/login">
            <InvestisseurLayout><InvestisseurExplorer /></InvestisseurLayout>
          </AuthGuard>
        </Route>
        <Route path="/explorer">
          <AuthGuard universe="investisseur" loginPath="/investisseur/login">
            <InvestisseurLayout><InvestisseurExplorer /></InvestisseurLayout>
          </AuthGuard>
        </Route>

        <Route path="/investisseur/projets/:id">
          {(params: { id: string } = { id: "" }) => (
            <AuthGuard universe="investisseur" loginPath="/investisseur/login">
              <InvestisseurLayout><InvestisseurProjetDetail id={params.id} /></InvestisseurLayout>
            </AuthGuard>
          )}
        </Route>
        <Route path="/projets/:id">
          {(params: { id: string } = { id: "" }) => (
            <AuthGuard universe="investisseur" loginPath="/investisseur/login">
              <InvestisseurLayout><InvestisseurProjetDetail id={params.id} /></InvestisseurLayout>
            </AuthGuard>
          )}
        </Route>

        <Route path="/investisseur/wallet">
          <AuthGuard universe="investisseur" loginPath="/investisseur/login">
            <InvestisseurLayout><InvestisseurWallet /></InvestisseurLayout>
          </AuthGuard>
        </Route>
        <Route path="/wallet">
          <AuthGuard universe="investisseur" loginPath="/investisseur/login">
            <InvestisseurLayout><InvestisseurWallet /></InvestisseurLayout>
          </AuthGuard>
        </Route>

        <Route path="/investisseur">
          <Redirect to="/investisseur/dashboard" />
        </Route>
        <Route path="/investisseur/">
          <Redirect to="/investisseur/dashboard" />
        </Route>
        <Route path="/">
          <Redirect to="/investisseur/dashboard" />
        </Route>
      </Switch>
    </Suspense>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <LangProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <AppDataProvider>
              <TooltipProvider>
                <WouterRouter>
                  <Router />
                </WouterRouter>
                <Toaster />
              </TooltipProvider>
            </AppDataProvider>
          </QueryClientProvider>
        </AuthProvider>
      </LangProvider>
    </ThemeProvider>
  );
}
