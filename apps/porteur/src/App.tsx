import React from "react";
import { Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster, TooltipProvider, ThemeProvider } from "@zira/ui";
import { LangProvider, AuthProvider, AppDataProvider } from "@zira/shared";
import { AppRouter } from "./routes";

/**
 * Client TanStack Query configuré pour la gestion du cache et des requêtes.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Point d'entrée de l'application Porteur de Projet.
 * Fournit les contextes d'infrastructure (Thème, I18n, Auth, Data, QueryClient).
 */
export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <LangProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <AppDataProvider>
              <TooltipProvider>
                <WouterRouter>
                  <AppRouter />
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
