import React, { useState } from "react";
import { useAuth, useAppData } from "@shared/index";
import { Header } from "../../components/layout/header";
import { Footer } from "../../components/layout/footer";
import { ShieldCheck, Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";

export function PorteurKycPage() {
  const { user } = useAuth();
  const { submitKyc, kycRequests } = useAppData();
  const [docType, setDocType] = useState("ID_CARD");
  const [fileName, setFileName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const myKyc = kycRequests.find((k) => k.userId === user?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitKyc([
      { document_type: docType, document_url: `/documents/${fileName || "document_justificatif.pdf"}` }
    ]);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header currentUniverse="porteur" />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-10 w-full space-y-8">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Conformité Réglementaire</span>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground mt-1">Dossier KYC & Agrément Porteur</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Conformément aux directives bancaires et OHADA, la vérification d'identité des dirigeants et le RCCM de l'entreprise sont obligatoires pour collecter des fonds.
          </p>
        </div>

        {/* Current status card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground">Statut de votre dossier actuel</span>
            <p className="text-lg font-bold text-foreground">
              {myKyc?.status === "approved"
                ? "Dossier Validé & Actif"
                : myKyc?.status === "pending"
                ? "Dossier en Cours d'Examen"
                : "Dossier non soumis ou à compléter"}
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>{myKyc?.status || "Conforme"}</span>
          </span>
        </div>

        {/* Upload form */}
        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-foreground">Téléverser de Nouveaux Justificatifs</h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Type de Document</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="ID_CARD">Pièce d'identité / Passeport Dirigeant</option>
                <option value="RCCM">Extrait RCCM / Statuts Notariés</option>
                <option value="TAX_CERT">Attestation Fiscale / Numéro Impôt</option>
                <option value="BANK_RIB">Relevé d'Identité Bancaire (RIB Séquestre)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Fichier (PDF ou Image)</label>
              <input
                type="file"
                onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
                className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition-all flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Transmettre pour Vérification</span>
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
}
