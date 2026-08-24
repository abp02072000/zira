import React, { useState } from "react";
import { Project, formatUSD, useAppData, useAuth } from "@shared/index";
import { ShieldCheck, CheckCircle2, AlertCircle, X, ArrowRight, Lock } from "lucide-react";

interface InvestModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InvestModal({ project, isOpen, onClose }: InvestModalProps) {
  const { addInvestment } = useAppData();
  const { user } = useAuth();
  const [amount, setAmount] = useState<number>(project?.fundraising.minInvestment || 1000);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !project) return null;

  const min = project.fundraising.minInvestment || 500;
  const max = project.fundraising.maxInvestment || project.fundraising.targetAmountUSD;
  const calculatedEquity = ((amount / (project.fundraising.targetAmountUSD || 100000)) * project.fundraising.equityPercent).toFixed(2);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await addInvestment(project.id, amount, parseFloat(calculatedEquity));
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Souscription Enregistrée !</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Votre engagement de <strong className="text-foreground">{formatUSD(amount)}</strong> pour{" "}
              <strong className="text-foreground">{project.name}</strong> a été validé. Les fonds seront sécurisés sur compte séquestre certifié.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={() => {
                  setIsSuccess(false);
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm shadow hover:bg-primary/90 transition-colors"
              >
                Accéder à mon Portefeuille
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConfirm} className="space-y-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Souscription Sécurisée</span>
              </div>
              <h3 className="text-xl font-black text-foreground">Investir dans {project.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Secteur : {project.sector} • Objectif : {formatUSD(project.fundraising.targetAmountUSD)}
              </p>
            </div>

            {/* Investment Amount Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground flex justify-between">
                <span>Montant de votre investissement (USD)</span>
                <span className="text-muted-foreground">Min : {formatUSD(min)}</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={min}
                  max={max}
                  step="100"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-lg font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="absolute right-4 top-3.5 text-sm font-bold text-muted-foreground">$ USD</span>
              </div>
            </div>

            {/* Simulation Card */}
            <div className="p-4 rounded-xl bg-muted/50 border border-border/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Part de capital acquise estimée :</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">~{calculatedEquity}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pacte d'actionnaires :</span>
                <span className="font-semibold text-foreground">Format Standardisé OHADA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Séquestre bancaire :</span>
                <span className="font-semibold text-foreground">Rawbank RDC / Ecobank</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-200 text-xs">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                En validant, vous confirmez que vous avez vérifié votre profil KYC et acceptez les termes de la convention de souscription.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isProcessing || amount < min}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isProcessing ? "Traitement..." : `Confirmer ${formatUSD(amount)}`}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
