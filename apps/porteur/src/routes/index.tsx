import React, { Suspense } from "react";
import { Switch, Route, Redirect } from "wouter";
import { Loader2 } from "lucide-react";
import { ProtectedRoute } from "./protected-route";

// Pages
import PorteurLogin from "../pages/auth/porteur-login";
import PorteurOnboarding from "../pages/onboarding";
import PorteurDashboard from "../pages/dashboard";
import PorteurProfil from "../pages/profil";
import PorteurNotifications from "../pages/notifications";
import PorteurPortefeuille from "../pages/portefeuille";
import PorteurProjets from "../pages/projets";
import PorteurProjetNouveau from "../pages/projet-nouveau";
import PorteurProjetDetail from "../pages/projet-detail";

/**
 * Composant de chargement pendant la navigation.
 */
function PageFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
      <span className="text-sm font-medium text-muted-foreground">
        Chargement du Portail Porteur...
      </span>
    </div>
  );
}

/**
 * Routeur principal de l'application Porteur.
 * Gère les routes publiques et sécurisées avec alias de compatibilité.
 */
export function AppRouter() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Switch>
        {/* Auth & Onboarding */}
        <Route path="/porteur/login" component={PorteurLogin} />
        <Route path="/login" component={PorteurLogin} />
        <Route path="/porteur/onboarding">
          <ProtectedRoute withLayout={false}><PorteurOnboarding /></ProtectedRoute>
        </Route>
        <Route path="/onboarding">
          <ProtectedRoute withLayout={false}><PorteurOnboarding /></ProtectedRoute>
        </Route>

        {/* Dashboard & Profile */}
        <Route path="/porteur/dashboard"><ProtectedRoute><PorteurDashboard /></ProtectedRoute></Route>
        <Route path="/dashboard"><ProtectedRoute><PorteurDashboard /></ProtectedRoute></Route>
        <Route path="/porteur/profil"><ProtectedRoute><PorteurProfil /></ProtectedRoute></Route>
        <Route path="/profil"><ProtectedRoute><PorteurProfil /></ProtectedRoute></Route>

        {/* Notifications & Wallet */}
        <Route path="/porteur/notifications"><ProtectedRoute><PorteurNotifications /></ProtectedRoute></Route>
        <Route path="/notifications"><ProtectedRoute><PorteurNotifications /></ProtectedRoute></Route>
        <Route path="/porteur/portefeuille"><ProtectedRoute><PorteurPortefeuille /></ProtectedRoute></Route>
        <Route path="/portefeuille"><ProtectedRoute><PorteurPortefeuille /></ProtectedRoute></Route>

        {/* Projects Management */}
        <Route path="/porteur/projets/nouveau"><ProtectedRoute><PorteurProjetNouveau /></ProtectedRoute></Route>
        <Route path="/projets/nouveau"><ProtectedRoute><PorteurProjetNouveau /></ProtectedRoute></Route>
        <Route path="/porteur/projets/:id">
          {(params = { id: "" }) => (
            <ProtectedRoute><PorteurProjetDetail id={params.id} /></ProtectedRoute>
          )}
        </Route>
        <Route path="/projets/:id">
          {(params = { id: "" }) => (
            <ProtectedRoute><PorteurProjetDetail id={params.id} /></ProtectedRoute>
          )}
        </Route>
        <Route path="/porteur/projets"><ProtectedRoute><PorteurProjets /></ProtectedRoute></Route>
        <Route path="/projets"><ProtectedRoute><PorteurProjets /></ProtectedRoute></Route>

        {/* Redirections racine */}
        <Route path="/porteur"><Redirect to="/porteur/dashboard" /></Route>
        <Route path="/porteur/"><Redirect to="/porteur/dashboard" /></Route>
        <Route path="/"><Redirect to="/porteur/dashboard" /></Route>
      </Switch>
    </Suspense>
  );
}
