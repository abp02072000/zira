import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { useLang } from "@/lib/i18n";
import { Shield, ArrowRight, Eye, EyeOff, Lock } from "lucide-react";

export default function ModerateurLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { signInAsModerator } = useAuth();
  const [, navigate] = useLocation();
  const { t, lang } = useLang();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError(lang === "fr" ? "Veuillez renseigner votre e-mail et votre mot de passe" : "Email and password are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await signInAsModerator(email.trim(), password);
      navigate("/moderateur/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Accès refusé ou identifiants invalides");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground text-2xl font-black mb-2 shadow-sm">
            Z
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            ZIRA INVEST
          </h1>
          <p className="text-muted-foreground text-sm">
            {lang === "fr" ? "Portail Conformité et Modération" : "Compliance and Moderation Portal"}
          </p>
        </div>

        <Card className="border-border shadow-md">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle className="text-xl">
                {t.authLoginModTitle}
              </CardTitle>
            </div>
            <CardDescription className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-destructive animate-pulse" />
              {t.authLoginModSubtitle}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="mod-email">{t.authLoginEmail}</Label>
                <Input
                  id="mod-email"
                  type="email"
                  placeholder="admin@zira-invest.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mod-password">{t.authLoginPassword}</Label>
                <div className="relative">
                  <Input
                    id="mod-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20 text-center">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full font-semibold"
                disabled={loading}
              >
                {loading ? "Vérification..." : t.authLoginBtn}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 pt-2 border-t">
            <p className="text-[11px] text-muted-foreground text-center">
              Accès strictement réservé aux agents de conformité accrédités ZIRA.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
