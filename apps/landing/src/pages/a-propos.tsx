import React from "react";
import { Link } from "wouter";
import { landingContent } from "@zira/shared";
import { Button, Badge } from "@zira/ui";
import { 
  ShieldCheckIcon, 
  RocketLaunchIcon, 
  UserGroupIcon, 
  GlobeAltIcon, 
  ArrowTrendingUpIcon, 
  AcademicCapIcon, 
  CheckCircleIcon, 
  ArrowRightIcon, 
  LockClosedIcon,
  SparklesIcon,
  BuildingOffice2Icon,
  BriefcaseIcon
} from "@heroicons/react/24/solid";
import { LandingHeader } from "../components/landing-header";
import { LandingFooter } from "../components/landing-footer";

export default function AProposPage() {
  const getPorteurUrl = () => {
    return window.location.hostname === "localhost" ? "http://localhost:3000/porteur" : "/porteur";
  };

  const getInvestisseurUrl = () => {
    return window.location.hostname === "localhost" ? "http://localhost:3000/investisseur" : "/investisseur";
  };

  const getModerateurUrl = () => {
    return window.location.hostname === "localhost" ? "http://localhost:3000/moderation" : "/moderation";
  };

  const VALUES = [
    {
      icon: RocketLaunchIcon,
      title: "Impact Économique Réel",
      desc: "Nous canalisons l'épargne vers l'économie productive et créatrice d'emplois durables à Kinshasa et en RDC."
    },
    {
      icon: ShieldCheckIcon,
      title: "Transparence et Rigueur",
      desc: "Chaque opportunité est auditée selon les normes OHADA en RDC. Les pactes d'actionnaires sont digitalisés et les comptes séquestres certifiés."
    },
    {
      icon: GlobeAltIcon,
      title: "Inclusion et Diaspora Congolaise",
      desc: "Permettre à chaque citoyen en RDC et membre de la diaspora congolaise d'investir dès $50 dans les fleurons nationaux."
    },
    {
      icon: AcademicCapIcon,
      title: "Alignement des Intérêts",
      desc: "Une commission au succès uniquement : nous réussissons lorsque les entrepreneurs congolais et les investisseurs réussissent."
    }
  ];

  const SECTORS = [
    { title: "AgriTech et Agro-industrie", desc: "Sécurité alimentaire et transformation locale en RDC", stat: "35% du dealflow" },
    { title: "FinTech et Mobile Money RDC", desc: "Inclusion financière M-Pesa, Orange Money, Airtel Money", stat: "25% du dealflow" },
    { title: "CleanTech et Énergie Solaire", desc: "Accès à l'énergie solaire et solutions hors-réseau à Kinshasa", stat: "20% du dealflow" },
    { title: "Santé et Logistique Urbaine", desc: "Infrastructure de santé et supply chain à Kinshasa", stat: "20% du dealflow" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">
      <LandingHeader currentPage="apropos" />

      <main className="flex-1">
        {/* ── Hero Section À Propos ── */}
        <section className="py-16 sm:py-24 bg-muted/20 border-b relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
            <Badge variant="outline" className="text-primary border-primary/30 py-1 px-3">
              Notre Raison d'Être
            </Badge>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
              Bâtir l'avenir économique de la RDC par l'actionnariat participatif
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              ZIRA Invest est la première plateforme d'equity crowdfunding dédiée à la République Démocratique du Congo, démocratisant l'investissement en fonds propres dans les PME et startups à fort potentiel basées à Kinshasa et en RDC.
            </p>
          </div>
        </section>

        {/* ── Notre Mission et Vision ── */}
        <section className="py-16 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 text-primary font-bold text-sm">
                <SparklesIcon className="w-4 h-4" />
                <span>La Vision ZIRA Invest en RDC</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Combler le déficit de financement des entreprises congolaises
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Des milliers d'entrepreneurs brillants en République Démocratique du Congo manquent de capital d'amorçage pour passer à l'échelle. Parallèlement, des millions de membres de la diaspora congolaise et de résidents à Kinshasa recherchent des placements transparents, porteurs de sens et rémunérateurs.
              </p>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                ZIRA Invest crée ce pont de confiance : une infrastructure technologique et légale sécurisée qui transforme chaque investisseur en copropriétaire officiel des champions économiques de la RDC.
              </p>

              <div className="pt-2 flex items-center gap-4">
                <div className="p-4 rounded-xl border bg-card">
                  <div className="text-2xl font-black text-primary">50$</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Ticket d'entrée accessible (ou CDF)</div>
                </div>
                <div className="p-4 rounded-xl border bg-card">
                  <div className="text-2xl font-black text-foreground">100%</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Fonds sous séquestre bancaire</div>
                </div>
                <div className="p-4 rounded-xl border bg-card">
                  <div className="text-2xl font-black text-foreground">Kinshasa</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Siège et Équipe en RDC</div>
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-2xl p-8 space-y-6 shadow-xs">
              <h3 className="text-lg font-bold text-foreground">Ce qui nous différencie</h3>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>Equity Réelle : </strong> Vous devenez actionnaire officiel avec pacte d'actionnaires conforme au droit OHADA en RDC, droits de vote et dividendes.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>Audit Multi-Niveaux : </strong> Vérification rigoureuse des entreprises enregistrées au RCCM en RDC par notre équipe d'audit à Kinshasa.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>Paiements Locaux et Internationaux : </strong> Mobile Money (M-Pesa Vodacom, Orange Money RDC, Airtel Money RDC), cartes Visa/Mastercard et banques partenaires (Rawbank, EquityBCDC, Afriland).</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>Transparence et Suivi : </strong> Tableau de bord de valorisation et rapports trimestriels pour chaque projet financé.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── Nos Valeurs Fondamentales ── */}
        <section className="py-16 bg-muted/20 border-y">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight">Nos Valeurs Cardinales</h2>
              <p className="text-sm text-muted-foreground">
                L'intégrité, la clarté et l'impact guident chacune de nos décisions opérationnelles et technologiques à Kinshasa et en RDC.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {VALUES.map((val, idx) => {
                const IconComp = val.icon;
                return (
                  <div key={idx} className="bg-card border rounded-2xl p-6 space-y-3 hover:border-primary/40 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-base text-foreground">{val.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{val.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Secteurs Stratégiques ── */}
        <section className="py-16 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight">Secteurs à Fort Impact Financier et Social en RDC</h2>
            <p className="text-sm text-muted-foreground">
              Nous sélectionnons des secteurs d'avenir résilients capables de générer des rendements solides et une croissance pérenne en République Démocratique du Congo.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SECTORS.map((sec, idx) => (
              <div key={idx} className="p-6 rounded-2xl border bg-card space-y-2">
                <div className="text-xs font-semibold text-primary">{sec.stat}</div>
                <h4 className="font-bold text-base text-foreground">{sec.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{sec.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA Final ── */}
        <section className="py-16 border-t bg-card text-center space-y-6">
          <div className="max-w-3xl mx-auto px-4 space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight">Rejoignez le Mouvement ZIRA en RDC</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Que vous soyez entrepreneur congolais prêt à accélérer ou investisseur désireux de faire fructifier votre épargne, démarrez dès aujourd'hui à Kinshasa.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/choisir">
                <Button size="lg" className="font-semibold gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  Accéder aux portails ZIRA <ArrowRightIcon className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline">
                  Nous Contacter
                </Button>
              </Link>
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
