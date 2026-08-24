import React, { Suspense, lazy } from "react";
import { Switch, Route, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster, TooltipProvider, ThemeProvider } from "@zira/ui";
import { LangProvider, AuthProvider, AppDataProvider } from "@zira/shared";

const Landing = lazy(() => import("./pages/landing"));
const AProposPage = lazy(() => import("./pages/a-propos"));
const ContactPage = lazy(() => import("./pages/contact"));
const BlogList = lazy(() => import("./pages/blog/blog-list"));
const BlogDetail = lazy(() => import("./pages/blog/blog-detail"));
const Choisir = lazy(() => import("./pages/choisir"));
const FAQPage = lazy(() => import("./pages/faq"));

const PorteurApp = lazy(() => import("../../porteur/src/App"));
const InvestisseurApp = lazy(() => import("../../investisseur/src/App"));
const ModerateurApp = lazy(() => import("../../moderateur/src/App"));

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
      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-4" />
      <span className="text-sm font-medium text-muted-foreground">Chargement de ZIRA Invest...</span>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="zira-landing-theme">
      <LangProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <AppDataProvider>
              <TooltipProvider>
                <Suspense fallback={<PageFallback />}>
                  <Switch>
                    <Route path="/" component={Landing} />
                    <Route path="/a-propos" component={AProposPage} />
                    <Route path="/apropos" component={AProposPage} />
                    <Route path="/blog" component={BlogList} />
                    <Route path="/blog/:slug" component={BlogDetail} />
                    <Route path="/contact" component={ContactPage} />
                    <Route path="/choisir" component={Choisir} />
                    <Route path="/faq" component={FAQPage} />

                    {/* Sub-portals unified routing */}
                    <Route path="/porteur">
                      <PorteurApp />
                    </Route>
                    <Route path="/porteur/:rest*">
                      <PorteurApp />
                    </Route>

                    <Route path="/investisseur">
                      <InvestisseurApp />
                    </Route>
                    <Route path="/investisseur/:rest*">
                      <InvestisseurApp />
                    </Route>

                    <Route path="/moderateur">
                      <ModerateurApp />
                    </Route>
                    <Route path="/moderateur/:rest*">
                      <ModerateurApp />
                    </Route>
                    <Route path="/moderation">
                      <ModerateurApp />
                    </Route>
                    <Route path="/moderation/:rest*">
                      <ModerateurApp />
                    </Route>

                    <Route component={Landing} />
                  </Switch>
                </Suspense>
                <Toaster />
              </TooltipProvider>
            </AppDataProvider>
          </QueryClientProvider>
        </AuthProvider>
      </LangProvider>
    </ThemeProvider>
  );
}
