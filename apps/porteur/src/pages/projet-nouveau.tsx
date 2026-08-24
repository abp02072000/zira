import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button, RedirectIfNotOnboarded, isOnboarded, useToast } from "@zira/ui";
import { FileText, Users, PieChart as PieChartIcon, DollarSign, CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react";
import { useAppData, useAuth, useLang, uploadFile, type ProjectSector, type ProjectStatus } from "@zira/shared";
import { StepIndicator } from "../components/projet-nouveau/step-indicator";
import { StepInfo } from "../components/projet-nouveau/step-info";
import { StepTeam } from "../components/projet-nouveau/step-team";
import { StepEquity } from "../components/projet-nouveau/step-equity";
import { StepFunding } from "../components/projet-nouveau/step-funding";
import { StepReview } from "../components/projet-nouveau/step-review";
import type { FormTeamMember } from "../components/projet-nouveau/types";

/**
 * Assistant de création de projet d'investissement en 5 étapes.
 */
export default function PorteurProjetNouveau() {
  const { addProject, refreshData, currentPorteurId } = useAppData();
  const { profile } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { lang } = useLang();

  if (!isOnboarded("porteur")) return <RedirectIfNotOnboarded universe="porteur" to="/porteur/onboarding" />;

  const STEPS = [
    { title: lang === "fr" ? "Infos" : "Info", icon: FileText },
    { title: lang === "fr" ? "Équipe" : "Team", icon: Users },
    { title: lang === "fr" ? "Cap Table" : "Equity", icon: PieChartIcon },
    { title: lang === "fr" ? "Financement" : "Funding", icon: DollarSign },
    { title: lang === "fr" ? "Revue" : "Review", icon: CheckCircle2 },
  ];

  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");
  const [poster, setPoster] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [sector, setSector] = useState<ProjectSector>("Tech");
  const [targetMarket, setTargetMarket] = useState("Afrique de l'Ouest et Diaspora");
  const [videoUrl, setVideoUrl] = useState("");
  const [team, setTeam] = useState<FormTeamMember[]>([{ name: profile?.name || "Fondateur", role: "CEO & Fondateur" }]);
  const [porteurEquity, setPorteurEquity] = useState(75);
  const [targetAmount, setTargetAmount] = useState(100000);
  const [equityPercent, setEquityPercent] = useState(15);
  const [minInvestment, setMinInvestment] = useState(500);
  const [maxInvestment, setMaxInvestment] = useState(25000);
  const [status, setStatus] = useState<ProjectStatus>("active");

  const handleUpload = async (file: File, type: "logo" | "poster") => {
    try {
      const url = await uploadFile(file, type === "logo" ? "project-logo" : "project-poster");
      if (type === "logo") setLogo(url); else setPoster(url);
    } catch { toast({ title: "Erreur upload", variant: "destructive" }); }
  };

  const handleNext = () => {
    if (step === 0 && !name.trim()) return setErrors({ name: "Nom requis" });
    setErrors({});
    const nxt = Math.min(step + 1, STEPS.length - 1);
    setStep(nxt);
    setMaxStep((m) => Math.max(m, nxt));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const created = await addProject({
        id: "", porteurId: profile?.id || currentPorteurId || "dev-user-1", name: name.trim(),
        logo: logo || "/images/poster-1.png", poster: poster || "/images/poster-2.png",
        shortDescription: shortDescription.trim(), sector, targetMarket: targetMarket.trim(), videoUrl: videoUrl.trim(),
        team: team.filter(m => m.name.trim()).map((m, i) => ({ id: `tm_${i}`, name: m.name.trim(), role: m.role.trim() })),
        equityBreakdown: { porteur: porteurEquity, investors: equityPercent, available: Math.max(0, 100 - porteurEquity - equityPercent) },
        fundraising: { targetAmountUSD: targetAmount, equityPercent, minInvestment, maxInvestment, raisedAmount: 0 },
        status, createdAt: new Date().toISOString(),
      });
      await refreshData();
      toast({ title: "Projet créé avec succès !" });
      navigate(created?.id ? `/porteur/projets/${created.id}` : "/porteur/projets");
    } catch (e) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Erreur", variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  return (
    <div className="py-6 px-4 md:px-6 max-w-4xl mx-auto space-y-6">
      <StepIndicator steps={STEPS} currentStep={step} maxStepReached={maxStep} onStepClick={setStep} />
      {step === 0 && <StepInfo name={name} setName={setName} sector={sector} setSector={setSector} targetMarket={targetMarket} setTargetMarket={setTargetMarket} shortDescription={shortDescription} setShortDescription={setShortDescription} logo={logo} setLogo={setLogo} poster={poster} setPoster={setPoster} videoUrl={videoUrl} setVideoUrl={setVideoUrl} onUpload={handleUpload} errors={errors} />}
      {step === 1 && <StepTeam team={team} onAddMember={() => setTeam([...team, { name: "", role: "" }])} onRemoveMember={(i) => setTeam(team.filter((_, idx) => idx !== i))} onUpdateMember={(i, k, v) => { const c = [...team]; c[i] = { ...c[i], [k]: v }; setTeam(c); }} errors={errors} />}
      {step === 2 && <StepEquity porteurEquity={porteurEquity} setPorteurEquity={setPorteurEquity} equityPercent={equityPercent} errors={errors} />}
      {step === 3 && <StepFunding targetAmount={targetAmount} setTargetAmount={setTargetAmount} equityPercent={equityPercent} setEquityPercent={setEquityPercent} minInvestment={minInvestment} setMinInvestment={setMinInvestment} maxInvestment={maxInvestment} setMaxInvestment={setMaxInvestment} porteurEquity={porteurEquity} errors={errors} />}
      {step === 4 && <StepReview name={name} sector={sector} targetMarket={targetMarket} shortDescription={shortDescription} poster={poster} logo={logo} team={team} targetAmount={targetAmount} equityPercent={equityPercent} minInvestment={minInvestment} maxInvestment={maxInvestment} projectStatusToCreate={status} setProjectStatusToCreate={setStatus} submitting={submitting} onSubmit={handleSubmit} />}
      <div className="flex justify-between">
        {step > 0 && <Button variant="outline" onClick={() => setStep(step - 1)}><ArrowLeft className="w-4 h-4 mr-2" /> Précédent</Button>}
        {step < STEPS.length - 1 && <Button className="ml-auto" onClick={handleNext}>Suivant <ArrowRight className="w-4 h-4 ml-2" /></Button>}
      </div>
    </div>
  );
}
