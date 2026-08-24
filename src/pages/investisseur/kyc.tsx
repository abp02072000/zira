import React, { useState } from "react";
import { useAuth, useAppData } from "@shared/index";
import { Header } from "../../components/layout/header";
import { Footer } from "../../components/layout/footer";
import { ShieldCheck, Upload, Award, CheckCircle2 } from "lucide-react";

export function InvestisseurKycPage() {
  const { user } = useAuth();
  const { submitKyc, kycRequests } = useAppData();
  const [docType, setDocType] = useState("PASSPORT");
  const [fileName, setFileName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const myKyc = kycRequests.find((k) => k.userId === user?.id) || kycRequests[1];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitKyc([
      { document_type: docType, document_url: `/documents/${fileName || "passport_investor.pdf"}` }
    ]);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header currentUniverse="investisseur" />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-10 w-full space-y-8">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Accréditation Investisseur</span>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground mt-1">Passeport d'Investissement & KYC</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Permet de souscrire sans plafond réglementaire aux levées de fonds dans les pays de l'espace OHADA et à l'international.
          </p>
        </div>

        {/* Status */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground">Statut d'accréditation</span>
            <p className="text-lg font-bold text-foreground">Investisseur Qualifié & Conforme</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1.5">
            <Award className="w-4 h-4" />
            <span>Accrédité</span>
          </span>
        </div>

        {/* Upload form */}
        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-foreground">Mettre à jour vos Justificatifs d'Identité</h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Type de Pièce d'Identité</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="PASSPORT">Passeport International</option>
                <option value="ID_CARD">Carte Nationale d'Identité</option>
                <option value="PROOF_OF_FUNDS">Attestation de Provenance des Fonds</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Document (PDF ou Image)</label>
              <input
                type="file"
                onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
                className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow transition-all flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Soumettre pour Renouvellement</span>
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
}
