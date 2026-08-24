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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import { useLang } from "@/lib/i18n";
import { GoogleIcon } from "@/components/google-icon";
import { ArrowRight, Eye, EyeOff, UserPlus, LogIn } from "lucide-react";

export default function InvestisseurLogin() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [investorType, setInvestorType] = useState<"individual" | "institutional">("individual");

  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [, navigate] = useLocation();
  const { t, lang } = useLang();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogle() {
    setLoading(true);
    setError("");
    try {
      await signInWithGoogle("investisseur");
      navigate("/investisseur/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion Google impossible");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError(lang === "fr" ? "Veuillez renseigner votre e-mail et votre mot de passe" : "Email and password are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await signInWithEmail("investisseur", email.trim(), password);
      navigate("/investisseur/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError(lang === "fr" ? "Veuillez renseigner votre e-mail et mot de passe" : "Email and password are required");
      return;
    }
    if (password.length < 8) {
      setError(lang === "fr" ? "Le mot de passe doit comporter au moins 8 caractères" : "Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const name = fullName.trim() || email.split("@")[0];
      await signUpWithEmail("investisseur", email.trim(), password, name);
      navigate("/investisseur/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inscription impossible");
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
            {lang === "fr" ? "Portail Investisseurs et Bailleurs" : "Investor Portal and Capital Management"}
          </p>
        </div>

        <Card className="border-border shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">
              {t.authLoginInvTitle}
            </CardTitle>
            <CardDescription>
              {lang === "fr"
                ? "Investissez dans des pépites à fort impact et suivez votre portefeuille"
                : "Invest in high-impact ventures and manage your portfolio"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Tabs value={tab} onValueChange={(v) => { setTab(v as "login" | "register"); setError(""); }}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login" className="flex items-center gap-1.5">
                  <LogIn className="w-4 h-4" />
                  {lang === "fr" ? "Connexion" : "Sign In"}
                </TabsTrigger>
                <TabsTrigger value="register" className="flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4" />
                  {lang === "fr" ? "Créer un compte" : "Register"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="inv-login-email">{t.authLoginEmail}</Label>
                    <Input
                      id="inv-login-email"
                      type="email"
                      placeholder="investisseur@domaine.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="inv-login-password">{t.authLoginPassword}</Label>
                    <div className="relative">
                      <Input
                        id="inv-login-password"
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
                    {loading ? "Connexion..." : t.authLoginBtn}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="inv-reg-name">{lang === "fr" ? "Nom complet / Raison sociale" : "Full Name / Entity"}</Label>
                    <Input
                      id="inv-reg-name"
                      type="text"
                      placeholder="ex: Awa Touré ou Fonds Sahel"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>{lang === "fr" ? "Type d'investisseur" : "Investor Type"}</Label>
                    <Select value={investorType} onValueChange={(v) => setInvestorType(v as "individual" | "institutional")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">{lang === "fr" ? "Particulier / Business Angel" : "Individual / Angel"}</SelectItem>
                        <SelectItem value="institutional">{lang === "fr" ? "Personne Morale / Fonds d'investissement" : "Institution / Corporate Fund"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="inv-reg-email">{t.authLoginEmail}</Label>
                    <Input
                      id="inv-reg-email"
                      type="email"
                      placeholder="investisseur@domaine.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="inv-reg-password">{t.authLoginPassword}</Label>
                    <div className="relative">
                      <Input
                        id="inv-reg-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Au moins 8 caractères"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
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
                    {loading ? "Création..." : (lang === "fr" ? "Créer mon compte investisseur" : "Create investor account")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="relative my-4">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                {t.authLoginOr}
              </span>
            </div>

            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleGoogle}
              type="button"
              disabled={loading}
            >
              <GoogleIcon />
              {t.authLoginWithGoogle}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
