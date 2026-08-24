import React, { ReactNode } from "react";
import { AuthGuard } from "@zira/ui";
import { PorteurLayout } from "../layouts/porteur-layout";

interface ProtectedRouteProps {
  children: ReactNode;
  withLayout?: boolean;
}

/**
 * Route protégée spécifique à l'univers Porteur de Projet.
 * Enveloppe le composant enfant avec l'AuthGuard et optionnellement le PorteurLayout.
 */
export function ProtectedRoute({ children, withLayout = true }: ProtectedRouteProps) {
  const content = withLayout ? <PorteurLayout>{children}</PorteurLayout> : children;

  return (
    <AuthGuard universe="porteur" loginPath="/porteur/login">
      {content}
    </AuthGuard>
  );
}
