import React from "react";
import { Button, Separator, GoogleIcon } from "@zira/ui";
import { useLang } from "@zira/shared";

interface SocialAuthProps {
  loading: boolean;
  onGoogleLogin: () => void;
}

/**
 * Composant de connexion sociale (Google SSO) et séparateur.
 */
export function SocialAuth({ loading, onGoogleLogin }: SocialAuthProps) {
  const { t } = useLang();

  return (
    <>
      <div className="relative my-4">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
          {t.authLoginOr}
        </span>
      </div>

      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={onGoogleLogin}
        type="button"
        disabled={loading}
      >
        <GoogleIcon />
        {t.authLoginWithGoogle}
      </Button>
    </>
  );
}
