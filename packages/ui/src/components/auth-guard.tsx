import React from "react";
import { Redirect, useLocation } from "wouter";
import { useAuth, type Universe } from "@zira/shared";
import { Loader2 } from "lucide-react";

export interface AuthGuardProps {
  universe: Universe;
  loginPath: string;
  children: React.ReactNode;
  fallbackText?: string;
  spinnerColor?: string;
}

export function AuthGuard({
  loginPath,
  children,
  fallbackText = "Vérification de l'authentification...",
  spinnerColor = "text-primary",
}: AuthGuardProps) {
  const { isAuthenticated, authLoading } = useAuth();
  const [location] = useLocation();

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <Loader2 className={`w-8 h-8 animate-spin mb-4 ${spinnerColor}`} />
        <span className="text-sm font-medium text-muted-foreground">{fallbackText}</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to={`${loginPath}?next=${encodeURIComponent(location)}`} />;
  }

  return <>{children}</>;
}
