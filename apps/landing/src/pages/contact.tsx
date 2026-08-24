import React, { useState } from "react";
import { Link } from "wouter";
import { landingContent } from "@zira/shared";
import { Button, Input, Textarea, Badge } from "@zira/ui";
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  PaperAirplaneIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ChatBubbleLeftRightIcon, 
  QuestionMarkCircleIcon, 
  ArrowRightIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/solid";
import { LandingHeader } from "../components/landing-header";
import { LandingFooter } from "../components/landing-footer";

export default function ContactPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profileType, setProfileType] = useState<"investisseur" | "porteur" | "partenaire" | "autre">("investisseur");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !message) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setSubject("");
    setMessage("");
    setSubmitted(false);
  };

  const getPorteurUrl = () => {
    return window.location.hostname === "localhost" ? "http://localhost:3000/porteur" : "/porteur";
  };

  const getInvestisseurUrl = () => {
    return window.location.hostname === "localhost" ? "http://localhost:3000/investisseur" : "/investisseur";
  };

  const getModerateurUrl = () => {
    return window.location.hostname === "localhost" ? "http://localhost:3000/moderation" : "/moderation";
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">
      <LandingHeader currentPage="contact" />

      <main className="flex-1">
        {/* ── Hero Contact ── */}
        <section className="py-14 sm:py-20 bg-muted/20 border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
            <Badge variant="outline" className="text-primary border-primary/30 py-1 px-3">
              Support et Échanges
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
              Contactez l'Équipe ZIRA Invest RDC
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Une question sur une levée de fonds, un investissement en capital ou un partenariat en RDC ? Notre équipe basée à Kinshasa vous répond sous 24h ouvrées.
            </p>
          </div>
        </section>

        {/* ── Formulaire et Coordonnées ── */}
        <section className="py-12 sm:py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10">
            {/* Formulaire Principal */}
            <div className="lg:col-span-7 bg-card border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Envoyez-nous un message</h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Remplissez ce formulaire et notre équipe dédiée à Kinshasa prendra contact avec vous.
                </p>
              </div>

              {submitted ? (
                <div className="py-10 text-center space-y-4">
                  <div className="w-14 h-14 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircleIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Message envoyé avec succès !</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Merci {fullName}. Votre demande a bien été transmise à notre équipe à Kinshasa. Nous vous répondrons à l'adresse <strong>{email}</strong> dans les meilleurs délais.
                  </p>
                  <Button onClick={resetForm} variant="outline" size="sm" className="mt-2">
                    Envoyer un autre message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Type de Profil */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Vous êtes :</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: "investisseur", label: "Investisseur" },
                        { id: "porteur", label: "Porteur de projet" },
                        { id: "partenaire", label: "Partenaire" },
                        { id: "autre", label: "Autre" }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setProfileType(item.id as any)}
                          className={`py-2 px-3 text-xs rounded-xl font-semibold border transition-all ${
                            profileType === item.id
                              ? "bg-primary text-primary-foreground border-primary shadow-xs"
                              : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Nom complet *</label>
                      <Input
                        required
                        placeholder="Ex: Christian Mukendi"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Adresse Email *</label>
                      <Input
                        type="email"
                        required
                        placeholder="christian.mukendi@exemple.cd"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Téléphone / WhatsApp (RDC)</label>
                      <Input
                        placeholder="+243 81 000 0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Sujet</label>
                      <Input
                        placeholder="Ex: Information sur une campagne à Kinshasa"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Votre message *</label>
                    <Textarea
                      required
                      rows={5}
                      placeholder="Décrivez votre demande en quelques lignes..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="rounded-xl resize-none"
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full font-semibold gap-2 py-5 rounded-xl shadow-xs bg-primary text-primary-foreground hover:bg-primary/90">
                    {loading ? "Envoi en cours..." : (
                      <>
                        <PaperAirplaneIcon className="w-4 h-4" /> Envoyer le message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>

            {/* Informations de Contact Direct */}
            <div className="lg:col-span-5 space-y-6">
              {/* Coordonnées */}
              <div className="bg-card border rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
                <h3 className="font-bold text-lg text-foreground">Coordonnées Directes</h3>
                
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <EnvelopeIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Emails de contact</div>
                      <div className="font-semibold text-foreground mt-0.5">contact@zira-invest.cd</div>
                      <div className="text-xs text-muted-foreground">dealflow@zira-invest.cd</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <PhoneIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Support Téléphonique et WhatsApp</div>
                      <div className="font-semibold text-foreground mt-0.5">+243 82 000 0000 / +243 81 555 4321</div>
                      <div className="text-xs text-muted-foreground">Lundi - Vendredi : 08h30 - 17h30 (Heure de Kinshasa, WAT/UTC+1)</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <MapPinIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Siège Social et Hub Principal</div>
                      <div className="font-semibold text-foreground mt-0.5">Boulevard du 30 Juin, Gombe, Kinshasa, RDC</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Raccourci vers la FAQ */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 space-y-3">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-sm">
                  <QuestionMarkCircleIcon className="w-5 h-5 text-amber-500" />
                  <span>Une question rapide ?</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Consultez notre Foire Aux Questions complète pour obtenir des réponses instantanées sur les tickets d'entrée en USD et CDF, les dividendes, les séquestres bancaires et les critères de sélection en RDC.
                </p>
                <Link href="/faq">
                  <Button variant="outline" size="sm" className="w-full mt-1 gap-2 font-semibold border-amber-500/40 text-foreground hover:bg-amber-500/10">
                    Consulter la FAQ <ArrowRightIcon className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              {/* Rassurance & Sécurité */}
              <div className="p-4 rounded-xl border bg-muted/20 flex items-center gap-3 text-xs text-muted-foreground">
                <ShieldCheckIcon className="w-5 h-5 text-primary shrink-0" />
                <span>Données protégées et traitées en toute confidentialité conformément au droit applicable en RDC.</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter
        footer={landingContent.footer}
        porteurUrl={getPorteurUrl()}
        investisseurUrl={getInvestisseurUrl()}
        moderateurUrl={getModerateurUrl()}
      />
    </div>
  );
}
