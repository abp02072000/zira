import React, { useState } from "react";
import { useLocation } from "wouter";
import { useAppData, useAuth, ProjectSector } from "@shared/index";
import { Header } from "../../components/layout/header";
import { Footer } from "../../components/layout/footer";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  DollarSign,
  Users,
  Video,
  CheckCircle2,
} from "lucide-react";

export function NewProjectPage() {
  const [, setLocation] = useLocation();
  const { addProject } = useAppData();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    sector: "Tech" as ProjectSector,
    targetMarket: "RDC & Afrique Centrale",
    shortDescription: "",
    fullDescription: "",
    videoUrl: "",
    targetAmountUSD: 100000,
    equityPercent: 15,
    minInvestment: 500,
    maxInvestment: 25000,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const sectors: ProjectSector[] = [
    "Tech",
    "Fintech",
    "Agritech",
    "Santé",
    "Énergie",
    "Éducation",
    "Logistique",
    "Autre",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addProject({
        name: formData.name,
        sector: formData.sector,
        targetMarket: formData.targetMarket,
        shortDescription: formData.shortDescription,
        fullDescription: formData.fullDescription,
        videoUrl: formData.videoUrl,
        team: [{ name: user?.name || "Fondateur", role: "CEO & Fondateur" }],
        fundraising: {
          targetAmountUSD: Number(formData.targetAmountUSD),
          equityPercent: Number(formData.equityPercent),
          minInvestment: Number(formData.minInvestment),
          maxInvestment: Number(formData.maxInvestment),
          raisedAmount: 0,
        },
        status: "active",
      });
      setIsSuccess(true);
      setTimeout(() => {
        setLocation("/porteur/projets");
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header currentUniverse="porteur" />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="mb-8">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Formulaire de Dépôt</span>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground mt-1">Créer une Campagne de Financement</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Renseignez les éléments clés de votre entreprise. Une fois validé, votre projet sera soumis aux investisseurs.
          </p>
        </div>

        {isSuccess ? (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Projet Publié avec Succès !</h2>
            <p className="text-xs text-muted-foreground">Redirection vers vos projets en cours...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: General Info */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                <span>1. Informations Générales</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground">Nom du Projet / Entreprise</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: KaziPay RDC"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Secteur d'Activité</label>
                  <select
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value as ProjectSector })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    {sectors.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Marché Cible Principal</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Kinshasa, RDC & Diaspora"
                    value={formData.targetMarket}
                    onChange={(e) => setFormData({ ...formData, targetMarket: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground">Pitch Court (Accroche - 1 phrase)</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Passerelle de paiement mobile money unifiée pour les PME en RDC."
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground">Description Complète & Modèle Économique</label>
                  <textarea
                    rows={4}
                    placeholder="Décrivez votre produit, vos métriques actuelles, votre traction et votre vision."
                    value={formData.fullDescription}
                    onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Financial Terms */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <span>2. Conditions Financières & Levée de Fonds</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Montant Cible Recherché (USD)</label>
                  <input
                    type="number"
                    min="5000"
                    step="1000"
                    required
                    value={formData.targetAmountUSD}
                    onChange={(e) => setFormData({ ...formData, targetAmountUSD: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Pourcentage de Capital Cédé (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="49"
                    step="0.5"
                    required
                    value={formData.equityPercent}
                    onChange={(e) => setFormData({ ...formData, equityPercent: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Ticket Minimum (USD)</label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    required
                    value={formData.minInvestment}
                    onChange={(e) => setFormData({ ...formData, minInvestment: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Ticket Maximum (USD)</label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    required
                    value={formData.maxInvestment}
                    onChange={(e) => setFormData({ ...formData, maxInvestment: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Submission notice */}
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-200 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Contrôle de Conformité & Signature OHADA</p>
                <p className="text-[11px] mt-0.5 opacity-90">
                  Après publication, votre projet sera vérifié sous 24h par l'équipe juridique ZIRA. Les fonds levés seront séquestrés sur compte bancaire dédié.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => setLocation("/porteur/projets")}
                className="px-5 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                {isSubmitting ? "Enregistrement..." : "Publier le Projet"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
