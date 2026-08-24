import React from "react";
import { Route, Switch } from "wouter";
import { AuthProvider, AppDataProvider } from "@shared/index";
import { ThemeProvider } from "@ui/components/theme-provider";

// Pages
import { LandingPage } from "./pages/landing-page";
import { ProjectDetailPage } from "./pages/project-detail-page";

// Porteur Pages
import { PorteurDashboard } from "./pages/porteur/dashboard";
import { NewProjectPage } from "./pages/porteur/new-project";
import { PorteurProjectsPage } from "./pages/porteur/my-projects";
import { PorteurProfilePage } from "./pages/porteur/profile";
import { PorteurKycPage } from "./pages/porteur/kyc";

// Investisseur Pages
import { InvestisseurDashboard } from "./pages/investisseur/dashboard";
import { InvestisseurOpportunitiesPage } from "./pages/investisseur/opportunities";
import { InvestisseurPortfolioPage } from "./pages/investisseur/portfolio";
import { InvestisseurKycPage } from "./pages/investisseur/kyc";

// Modérateur Pages
import { ModerateurDashboard } from "./pages/moderateur/dashboard";
import { ModerateurProjectsQueuePage } from "./pages/moderateur/projects-queue";
import { ModerateurKycQueuePage } from "./pages/moderateur/kyc-queue";
import { ModerateurUsersPage } from "./pages/moderateur/users";

export function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <AppDataProvider>
          <Switch>
            {/* Public / Landing Routes */}
            <Route path="/" component={LandingPage} />
            <Route path="/projets" component={LandingPage} />
            <Route path="/projets/:id" component={ProjectDetailPage} />

            {/* Porteur Universe */}
            <Route path="/porteur" component={PorteurDashboard} />
            <Route path="/porteur/projet/nouveau" component={NewProjectPage} />
            <Route path="/porteur/projets" component={PorteurProjectsPage} />
            <Route path="/porteur/profil" component={PorteurProfilePage} />
            <Route path="/porteur/kyc" component={PorteurKycPage} />

            {/* Investisseur Universe */}
            <Route path="/investisseur" component={InvestisseurDashboard} />
            <Route path="/investisseur/opportunites" component={InvestisseurOpportunitiesPage} />
            <Route path="/investisseur/portefeuille" component={InvestisseurPortfolioPage} />
            <Route path="/investisseur/kyc" component={InvestisseurKycPage} />

            {/* Modérateur Universe */}
            <Route path="/moderateur" component={ModerateurDashboard} />
            <Route path="/moderateur/projets" component={ModerateurProjectsQueuePage} />
            <Route path="/moderateur/kyc" component={ModerateurKycQueuePage} />
            <Route path="/moderateur/utilisateurs" component={ModerateurUsersPage} />

            {/* Fallback */}
            <Route component={LandingPage} />
          </Switch>
        </AppDataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
