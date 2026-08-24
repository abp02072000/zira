import React, { Suspense } from "react";
import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster, TooltipProvider, ThemeProvider, AuthGuard } from "@zira/ui";
import { LangProvider, AuthProvider, AppDataProvider, type Universe } from "@zira/shared";
import { Loader2 } from "lucide-react";

import { ModerateurLayout, ModerationLayout } from "./layouts/moderateur-layout";
import ModerationOnboarding from "./pages/onboarding";
import ModerationDashboard from "./pages/dashboard";
import ModerationProfil from "./pages/profil";
import ModerationNotifications from "./pages/notifications";
import ModerationKYC from "./pages/kyc";
import ModerationProjets from "./pages/projets";
import ModerationUtilisateurs from "./pages/utilisateurs";
import ModerationFlux from "./pages/flux";
import ModerateurLogin from "./pages/auth/moderateur-login";

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
      <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-4" />
      <span className="text-sm font-medium text-muted-foreground">Chargement du Portail Modération & Admin...</span>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Switch>
        <Route path="/moderateur/login" component={ModerateurLogin} />
        <Route path="/moderation/login" component={ModerateurLogin} />
        <Route path="/login" component={ModerateurLogin} />

        <Route path="/moderateur/onboarding">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModerationOnboarding />
          </AuthGuard>
        </Route>
        <Route path="/moderation/onboarding">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModerationOnboarding />
          </AuthGuard>
        </Route>
        <Route path="/onboarding">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModerationOnboarding />
          </AuthGuard>
        </Route>

        <Route path="/moderateur/dashboard">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModerationLayout><ModerationDashboard /></ModerationLayout>
          </AuthGuard>
        </Route>
        <Route path="/moderation/dashboard">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModerationLayout><ModerationDashboard /></ModerationLayout>
          </AuthGuard>
        </Route>
        <Route path="/dashboard">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModerationLayout><ModerationDashboard /></ModerationLayout>
          </AuthGuard>
        </Route>

        <Route path="/moderateur/profil">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModerationLayout><ModerationProfil /></ModerationLayout>
          </AuthGuard>
        </Route>
        <Route path="/moderation/profil">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModerationLayout><ModerationProfil /></ModerationLayout>
          </AuthGuard>
        </Route>
        <Route path="/profil">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModerationLayout><ModerationProfil /></ModerationLayout>
          </AuthGuard>
        </Route>

        <Route path="/moderateur/notifications">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModerationLayout><ModerationNotifications /></ModerationLayout>
          </AuthGuard>
        </Route>
        <Route path="/moderation/notifications">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModerationLayout><ModerationNotifications /></ModerationLayout>
          </AuthGuard>
        </Route>
        <Route path="/notifications">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModerationLayout><ModerationNotifications /></ModerationLayout>
          </AuthGuard>
        </Route>

        <Route path="/moderateur/kyc">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModerationLayout><ModerationKYC /></ModerationLayout>
          </AuthGuard>
        </Route>
        <Route path="/moderation/kyc">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModerationLayout><ModerationKYC /></ModerationLayout>
          </AuthGuard>
        </Route>
        <Route path="/kyc">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModerationLayout><ModerationKYC /></ModerationLayout>
          </AuthGuard>
        </Route>

        <Route path="/moderateur/projets">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModerationLayout><ModerationProjets /></ModerationLayout>
          </AuthGuard>
        </Route>
        <Route path="/moderation/projets">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModerationLayout><ModerationProjets /></ModerationLayout>
          </AuthGuard>
        </Route>
        <Route path="/projets">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModerationLayout><ModerationProjets /></ModerationLayout>
          </AuthGuard>
        </Route>

        <Route path="/moderateur/utilisateurs">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModerationLayout><ModerationUtilisateurs /></ModerationLayout>
          </AuthGuard>
        </Route>
        <Route path="/moderation/utilisateurs">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModerationLayout><ModerationUtilisateurs /></ModerationLayout>
          </AuthGuard>
        </Route>
        <Route path="/utilisateurs">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModerationLayout><ModerationUtilisateurs /></ModerationLayout>
          </AuthGuard>
        </Route>

        <Route path="/moderateur/flux">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModerationLayout><ModerationFlux /></ModerationLayout>
          </AuthGuard>
        </Route>
        <Route path="/moderation/flux">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModerationLayout><ModerationFlux /></ModerationLayout>
          </AuthGuard>
        </Route>
        <Route path="/flux">
          <AuthGuard universe="moderation" loginPath="/moderateur/login">
            <ModerationLayout><ModerationFlux /></ModerationLayout>
          </AuthGuard>
        </Route>

        <Route path="/moderateur">
          <Redirect to="/moderateur/dashboard" />
        </Route>
        <Route path="/moderateur/">
          <Redirect to="/moderateur/dashboard" />
        </Route>
        <Route path="/moderation">
          <Redirect to="/moderateur/dashboard" />
        </Route>
        <Route path="/moderation/">
          <Redirect to="/moderateur/dashboard" />
        </Route>
        <Route path="/">
          <Redirect to="/moderateur/dashboard" />
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
