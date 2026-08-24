import React, { useState, useMemo } from "react";
import { Link } from "wouter";
import { useLang, landingContent } from "@zira/shared";
import { Button, Input, Badge } from "@zira/ui";
import { 
  MagnifyingGlassIcon, 
  QuestionMarkCircleIcon, 
  ChevronDownIcon, 
  ShieldCheckIcon, 
  RocketLaunchIcon, 
  ArrowTrendingUpIcon, 
  ScaleIcon, 
  BanknotesIcon, 
  ArrowLeftIcon,
  ArrowRightIcon,
  SparklesIcon
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import { LandingHeader } from "../components/landing-header";
import { LandingFooter } from "../components/landing-footer";

interface FaqItem {
  q: string;
  a: string;
  category: "general" | "investisseur" | "porteur" | "sro_securite" | "fiscalite";
}

const EXTENDED_FAQS: FaqItem[] = [
  // Général
  {
    category: "general",
    q: "Qu'est-ce que ZIRA Invest et comment fonctionne la plateforme en RDC ?",
    a: "ZIRA Invest est la première plateforme d'investissement participatif en equity (equity crowdfunding) en République Démocratique du Congo. Elle permet à des porteurs de projets et PME congolaises de lever des fonds en fonds propres auprès d'une communauté d'investisseurs locaux à Kinshasa et de la diaspora congolaise, en échange de parts d'actionnariat réelles et de droits aux dividendes."
  },
  {
    category: "general",
    q: "Où se situe le champ d'action de ZIRA Invest ?",
    a: "ZIRA Invest opère exclusivement en République Démocratique du Congo avec son siège social à Kinshasa (Gombe), et s'adresse aux résidents congolais ainsi qu'à la diaspora congolaise établie à l'international."
  },
  {
    category: "general",
    q: "Quelles devises et méthodes de paiement sont acceptées en RDC ?",
    a: "La plateforme accepte les devises courantes en RDC : le Dollar américain (USD) et le Franc Congolais (CDF), via Mobile Money locaux (M-Pesa Vodacom, Orange Money RDC, Airtel Money RDC) et cartes bancaires ou virements (Rawbank, EquityBCDC, Afriland)."
  },

  // Investisseurs
  {
    category: "investisseur",
    q: "Quel est le montant minimum pour investir ?",
    a: "Pour démocratiser l'investissement dans l'économie congolaise, le ticket d'entrée est fixé à partir de 50 USD (ou équivalent en Franc Congolais CDF) selon les campagnes. Il n'y a pas de plafond d'investissement pour les investisseurs accrédités."
  },
  {
    category: "investisseur",
    q: "Comment sont protégés mes droits d'actionnaire ?",
    a: "Chaque investissement est encadré par un pacte d'actionnaires standardisé rédigé par des juristes agréés en conformité avec le droit OHADA applicable en RDC. Vous recevez un certificat numérique de détention de parts (attestation d'actionnaire) conférant des droits de vote aux assemblées générales et des droits aux dividendes."
  },
  {
    category: "investisseur",
    q: "Quand et comment puis-je percevoir des rendements ou des dividendes ?",
    a: "Les rendements proviennent de la distribution de dividendes votée lors des assemblées générales de l'entreprise congolaise, ou lors d'une cession de vos parts (sortie / rachat par un fonds ou tour de table ultérieur). Les fonds sont directement crédités sur votre portefeuille ZIRA et virables vers votre compte bancaire ou Mobile Money en RDC."
  },
  {
    category: "investisseur",
    q: "Qu'advient-il si une campagne n'atteint pas son objectif minimal ?",
    a: "Toutes nos levées sont soumises à la règle du 'Tout ou Rien'. Si l'objectif minimum de la campagne n'est pas atteint à la date d'échéance, 100% des fonds sont automatiquement et intégralement remboursés aux investisseurs, sans aucuns frais retenus."
  },

  // Porteurs de Projets
  {
    category: "porteur",
    q: "Quels sont les critères d'éligibilité pour soumettre un projet en RDC ?",
    a: "Votre entreprise doit être immatriculée au RCCM en RDC (ou en cours d'immatriculation au GUCE Kinshasa), disposer d'un produit/service validé avec une traction mesurable, et présenter une structure d'équipe solide et complémentaire. Les secteurs prioritaires incluent l'AgriTech, les FinTechs, la CleanTech/Énergie, la Santé et la Logistique urbaine à Kinshasa."
  },
  {
    category: "porteur",
    q: "Quels sont les frais pour le porteur de projet ?",
    a: "La soumission et l'évaluation initiale du dossier sont 100% gratuites. Une commission de succès au pourcentage (5% à 7% des fonds collectés) n'est prélevée que si et seulement si la levée de fonds réussit avec succès."
  },
  {
    category: "porteur",
    q: "Combien de temps dure le processus de sélection et de levée ?",
    a: "L'instruction de votre dossier par notre comité d'audit à Kinshasa prend entre 5 et 10 jours ouvrés. Une fois validée, la campagne publique est active sur la plateforme pour une durée moyenne de 30 à 60 jours."
  },

  // Norme SRO, Sécurité et Régulation
  {
    category: "sro_securite",
    q: "En quoi consiste la conformité aux normes SRO (Autorégulation Financière) en RDC ?",
    a: "La norme SRO (Self-Regulatory Organization) impose des protocoles stricts de Due Diligence, d'audit comptable et juridique selon l'OHADA en RDC, de lutte anti-blanchiment (AML) et d'identification client (KYC niveau 1 et 2). Les fonds sont placés sous compte séquestre bancaire tiers auprès d'une banque partenaire en RDC et ne sont libérés qu'après immatriculation des nouveaux statuts."
  },
  {
    category: "sro_securite",
    q: "Quels sont les risques associés à l'investissement en fonds propres (equity) ?",
    a: "L'investissement dans des entreprises non cotées comporte des risques de perte totale ou partielle du capital investi ainsi qu'un risque d'illiquidité (difficulté de revendre immédiatement ses titres). ZIRA Invest recommande une saine diversification de votre épargne et de n'investir que des fonds dont vous n'avez pas un besoin immédiat."
  },
  {
    category: "sro_securite",
    q: "Comment sont stockées et protégées mes données personnelles et financières ?",
    a: "Toutes les transmissions de données sont chiffrées selon les protocoles SSL/TLS 256 bits les plus stricts. Les informations financières et documents d'identité sont stockés de manière sécurisée conformément aux réglementations de protection des données."
  },

  // Fiscalité et Retraits
  {
    category: "fiscalite",
    q: "Quelle est la fiscalité applicable sur les plus-values et dividendes en RDC ?",
    a: "La fiscalité dépend de votre résidence fiscale et de la législation fiscale en RDC (notamment l'IPR et l'impôt mobilier). ZIRA Invest met à disposition un relevé fiscal annuel récapitulant vos dividendes et plus-values pour faciliter vos déclarations d'impôts."
  },
  {
    category: "fiscalite",
    q: "Sous quel délai puis-je retirer les fonds disponibles sur mon portefeuille ?",
    a: "Les demandes de retrait vers votre compte bancaire ou compte Mobile Money en RDC sont traitées sous 24 à 48 heures ouvrées après vérification de sécurité."
  }
];

const CATEGORIES = [
  { id: "all", label: "Toutes les questions", icon: QuestionMarkCircleIcon },
  { id: "general", label: "Général et Fonctionnement", icon: SparklesIcon },
  { id: "investisseur", label: "Investisseurs", icon: ArrowTrendingUpIcon },
  { id: "porteur", label: "Porteurs de Projet", icon: RocketLaunchIcon },
  { id: "sro_securite", label: "Norme SRO et Sécurité", icon: ShieldCheckIcon },
  { id: "fiscalite", label: "Paiements et Fiscalité", icon: BanknotesIcon },
];

export default function FAQPage() {
  const { lang } = useLang();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = useMemo(() => {
    return EXTENDED_FAQS.filter((faq) => {
      const matchCategory = selectedCategory === "all" || faq.category === selectedCategory;
      const matchSearch =
        search.trim() === "" ||
        faq.q.toLowerCase().includes(search.toLowerCase()) ||
        faq.a.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [search, selectedCategory]);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
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
      {/* ── En-tête Navigation Complète ── */}
      <LandingHeader currentPage="faq" />

      {/* ── Hero Section FAQ ── */}
      <main className="flex-1">
        <section className="py-14 sm:py-18 bg-muted/20 border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
            <Badge variant="outline" className="text-primary border-primary/30 py-1 px-3">
              Centre d'Assistance et Régulation
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
              Foire Aux Questions et Transparence
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Toutes les réponses sur le fonctionnement de ZIRA Invest en RDC, les règles d'investissement en equity, la sécurité des fonds et les normes SRO.
            </p>

            {/* Barre de Recherche */}
            <div className="pt-4 max-w-xl mx-auto relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Rechercher une question (ex: dividende, minimum, risque, retrait...)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 pr-4 py-6 text-sm rounded-xl bg-card border shadow-xs"
              />
            </div>
          </div>
        </section>

        {/* ── Filtres par Catégorie ── */}
        <section className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-2 pb-6 border-b">
            {CATEGORIES.map((cat) => {
              const IconComp = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-xs scale-102"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* ── Liste Accordéons FAQ ── */}
          <div className="py-8 space-y-4 max-w-4xl mx-auto">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-16 bg-card border rounded-2xl p-8 space-y-3">
                <QuestionMarkCircleIcon className="w-10 h-10 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-bold">Aucune réponse trouvée</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Aucune question ne correspond à votre recherche "{search}". N'hésitez pas à réinitialiser la recherche ou à nous contacter.
                </p>
                <Button variant="outline" size="sm" onClick={() => { setSearch(""); setSelectedCategory("all"); }}>
                  Réinitialiser la recherche
                </Button>
              </div>
            ) : (
              filteredFaqs.map((item, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`border rounded-2xl bg-card transition-all overflow-hidden ${
                      isOpen ? "border-primary/50 shadow-xs" : "hover:border-border"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleAccordion(idx)}
                      className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-semibold text-foreground focus:outline-hidden"
                    >
                      <span className="text-base sm:text-lg tracking-tight pr-2">{item.q}</span>
                      <div className={`p-1.5 rounded-lg bg-muted text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-180 text-primary bg-primary/10" : ""}`}>
                        <ChevronDownIcon className="w-4 h-4" />
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="px-5 sm:px-6 pb-6 pt-1 text-sm text-muted-foreground leading-relaxed border-t border-border/40">
                            {item.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>

          {/* ── Encadré SRO et Transparence Légale ── */}
          <div className="max-w-4xl mx-auto my-8 p-6 sm:p-8 rounded-2xl border bg-amber-500/10 border-amber-500/30 space-y-3">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-sm">
              <ScaleIcon className="w-5 h-5 shrink-0 text-amber-500" />
              <span>Avertissement Légal et Réglementaire (Norme SRO)</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              L'investissement dans des entreprises non cotées (startups et PME en RDC) comporte des risques de perte totale ou partielle du capital investi, ainsi qu'un risque d'illiquidité. ZIRA Invest agit en tant que plateforme d'intermédiation participative appliquant les standards d'autorégulation financière (SRO) et ne garantit pas la rentabilité future des projets présentés. Diversifiez vos placements.
            </p>
          </div>

          {/* ── Section Contact / Support ── */}
          <div className="max-w-4xl mx-auto my-10 p-8 rounded-2xl border bg-card text-center space-y-4">
            <h3 className="text-xl font-bold">Vous avez une autre question ?</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Notre équipe d'accompagnement répond à toutes vos questions sur les levées de fonds et les investissements.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/choisir">
                <Button className="font-semibold gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  Accéder aux portails <ArrowRightIcon className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline">
                  Retour à l'accueil
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <LandingFooter
        footer={landingContent.footer}
        porteurUrl={getPorteurUrl()}
        investisseurUrl={getInvestisseurUrl()}
        moderateurUrl={getModerateurUrl()}
      />
    </div>
  );
}
