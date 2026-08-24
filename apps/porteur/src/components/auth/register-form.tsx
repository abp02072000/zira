import React, { useState } from "react";
import { Button, Input, Label } from "@zira/ui";
import { useLang } from "@zira/shared";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

interface RegisterFormProps {
  loading: boolean;
  onSubmit: (e: React.FormEvent, data: { name: string; company: string; email: string; pass: string }) => void;
}

/**
 * Formulaire de création de compte porteur de projet.
 */
export function RegisterForm({ loading, onSubmit }: RegisterFormProps) {
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { t, lang } = useLang();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e, { name: fullName, company: companyName, email, pass: password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="reg-name">{lang === "fr" ? "Nom et prénom" : "Full Name"}</Label>
        <Input
          id="reg-name"
          type="text"
          placeholder="ex: Moussa Diakité"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reg-company">
          {lang === "fr" ? "Nom de l'entreprise / Projet" : "Company / Project Name"}
        </Label>
        <Input
          id="reg-company"
          type="text"
          placeholder="ex: AgriBio Tech"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reg-email">{t.authLoginEmail}</Label>
        <Input
          id="reg-email"
          type="email"
          placeholder="fondateur@startup.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reg-password">{t.authLoginPassword}</Label>
        <div className="relative">
          <Input
            id="reg-password"
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

      <Button type="submit" className="w-full font-semibold" disabled={loading}>
        {loading ? "Création..." : lang === "fr" ? "Créer mon compte porteur" : "Create founder account"}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </form>
  );
}
