import React, { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from "@zira/ui";
import { useAuth, useLang } from "@zira/shared";
import { LogIn, UserPlus } from "lucide-react";
import { AuthHeader } from "../../components/auth/auth-header";
import { LoginForm } from "../../components/auth/login-form";
import { RegisterForm } from "../../components/auth/register-form";
import { SocialAuth } from "../../components/auth/social-auth";

/**
 * Page d'authentification complète du porteur de projet (Connexion / Inscription).
 */
export default function PorteurLogin() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [, navigate] = useLocation();
  const { t, lang } = useLang();

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithGoogle();
      navigate("/porteur/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible via Google");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent, email: string, pass: string) => {
    if (!email.trim() || !pass) {
      setError(lang === "fr" ? "Veuillez renseigner votre e-mail et mot de passe" : "Email and password required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await signInWithEmail(email.trim());
      navigate("/porteur/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Identifiants incorrects ou connexion impossible");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent, data: { name: string; company: string; email: string; pass: string }) => {
    if (!data.email.trim() || !data.pass) {
      setError(lang === "fr" ? "Veuillez renseigner votre e-mail et mot de passe" : "Email and password required");
      return;
    }
    if (data.pass.length < 8) {
      setError(lang === "fr" ? "Le mot de passe doit comporter au moins 8 caractères" : "Password must be at least 8 chars");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const name = data.name.trim() || data.email.split("@")[0];
      await signUpWithEmail(data.email.trim(), name);
      navigate("/porteur/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inscription impossible");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative">
      <div className="w-full max-w-md space-y-6">
        <AuthHeader />
        <Card className="border-border shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">{t("authLoginPorteurTitle", "Espace Porteur")}</CardTitle>
            <CardDescription>
              {lang === "fr" ? "Levez des fonds et gérez vos campagnes en sécurité" : "Raise funds and manage campaigns"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={tab} onValueChange={(v) => { setTab(v as "login" | "register"); setError(""); }}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login" className="flex items-center gap-1.5"><LogIn className="w-4 h-4" />{lang === "fr" ? "Connexion" : "Sign In"}</TabsTrigger>
                <TabsTrigger value="register" className="flex items-center gap-1.5"><UserPlus className="w-4 h-4" />{lang === "fr" ? "Créer un compte" : "Register"}</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm loading={loading} onSubmit={handleLogin} />
              </TabsContent>
              <TabsContent value="register">
                <RegisterForm loading={loading} onSubmit={handleRegister} />
              </TabsContent>
            </Tabs>
            {error && <p className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20 text-center">{error}</p>}
            <SocialAuth loading={loading} onGoogleLogin={handleGoogle} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
