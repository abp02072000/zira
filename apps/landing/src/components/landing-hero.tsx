import React from "react";
import { Link } from "wouter";
import { Button } from "@zira/ui";
import { 
  RocketLaunchIcon, 
  BanknotesIcon, 
  SparklesIcon, 
  ShieldCheckIcon 
} from "@heroicons/react/24/solid";
import type { LandingHero, LandingStat } from "@zira/shared";

interface LandingHeroProps {
  hero: LandingHero;
  stats: LandingStat[];
  porteurUrl: string;
  investisseurUrl: string;
}

export function LandingHero({ hero, stats, porteurUrl, investisseurUrl }: LandingHeroProps) {
  return (
    <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold">
              <SparklesIcon className="w-4 h-4 text-amber-500" />
              <span>{hero.badge}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-foreground">
              {hero.headline}
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {hero.subheadline}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <Link href={porteurUrl}>
                <Button size="lg" className="w-full sm:w-auto font-semibold gap-2 shadow-xs bg-primary text-primary-foreground hover:bg-primary/90">
                  <RocketLaunchIcon className="w-5 h-5 text-amber-300" /> Porteur : Lever des fonds
                </Button>
              </Link>
              <Link href={investisseurUrl}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto font-semibold gap-2 border-primary/40 text-foreground hover:bg-primary/5">
                  <BanknotesIcon className="w-5 h-5 text-primary" /> Investisseur : Découvrir
                </Button>
              </Link>
            </div>

            {/* Key stats from Markdown content */}
            <div className="pt-8 border-t grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto lg:mx-0">
              {stats.map((stat, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-xs text-foreground font-semibold">{stat.label}</div>
                  <div className="text-[10px] text-muted-foreground">{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border shadow-lg bg-card group">
              <img
                src={hero.heroImage}
                alt="ZIRA Invest - Plateforme d'Equity Crowdfunding"
                className="w-full h-[380px] sm:h-[420px] object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 text-white">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
                  <ShieldCheckIcon className="w-4 h-4 text-amber-400" />
                  <span>{hero.trustBadge}</span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1.5">Investir dans l'économie réelle en RDC</h3>
                <p className="text-xs text-white/85 mt-1">
                  Accédez aux meilleures startups et PME congolaises à Kinshasa avec des droits de vote et dividendes sécurisés.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
