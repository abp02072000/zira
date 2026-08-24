import React, { useState } from "react";
import { Button, Input, Label } from "@zira/ui";
import { useLang } from "@zira/shared";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

interface LoginFormProps {
  loading: boolean;
  onSubmit: (e: React.FormEvent, email: string, pass: string) => void;
}

/**
 * Formulaire de connexion par email et mot de passe pour le porteur.
 */
export function LoginForm({ loading, onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useLang();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e, email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="login-email">{t.authLoginEmail}</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="fondateur@startup.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="login-password">{t.authLoginPassword}</Label>
        <div className="relative">
          <Input
            id="login-password"
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

      <Button type="submit" className="w-full font-semibold" disabled={loading}>
        {loading ? "Connexion..." : t.authLoginBtn}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </form>
  );
}
