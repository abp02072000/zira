import React, { useState } from "react";
import { Link } from "wouter";
import { useLang } from "@zira/shared";
import { Button, ThemeSelector } from "@zira/ui";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";

interface BlogHeaderProps {
  showBackButton?: boolean;
}

export function BlogHeader({ showBackButton = false }: BlogHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { lang, setLang } = useLang();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-3">
          {showBackButton && (
            <Link href="/blog">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-muted-foreground hover:text-foreground mr-1">
                {lang === "fr" ? "Retour Blog" : "Back to Blog"}
              </Button>
            </Link>
          )}

          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer group">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center font-black text-primary-foreground text-lg shadow-xs group-hover:scale-105 transition-transform">
                Z
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                ZIRA <span className="text-primary font-medium">INVEST</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Desktop sans icônes */}
        <nav className="hidden md:flex items-center space-x-7">
          <Link href="/">
            <span className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              Accueil
            </span>
          </Link>
          <Link href="/a-propos">
            <span className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              À Propos
            </span>
          </Link>
          <Link href="/blog">
            <span className="text-sm font-bold text-primary cursor-pointer transition-colors">
              Blog
            </span>
          </Link>
          <Link href="/contact">
            <span className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              Contact
            </span>
          </Link>
          <Link href="/faq">
            <span className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              FAQ
            </span>
          </Link>
        </nav>

        {/* Actions Desktop sans icônes */}
        <div className="hidden md:flex items-center space-x-3">
          <ThemeSelector variant="compact" />
          <Link href="/choisir">
            <Button size="sm" className="font-semibold shadow-xs bg-primary text-primary-foreground hover:bg-primary/90">
              {lang === "fr" ? "Accéder aux portails" : "Access Portals"}
            </Button>
          </Link>
        </div>

        {/* Bouton Mobile */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          aria-label="Menu"
        >
          {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
        </button>
      </div>

      {/* Menu Mobile */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b bg-background px-6 py-5 space-y-4"
          >
            <div className="flex flex-col space-y-3">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <span className="text-base font-semibold py-1 block">Accueil</span>
              </Link>
              <Link href="/a-propos" onClick={() => setMobileMenuOpen(false)}>
                <span className="text-base font-semibold py-1 block">À Propos</span>
              </Link>
              <Link href="/blog" onClick={() => setMobileMenuOpen(false)}>
                <span className="text-base font-bold text-primary py-1 block">
                  Blog
                </span>
              </Link>
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                <span className="text-base font-semibold py-1 block">Contact</span>
              </Link>
              <Link href="/faq" onClick={() => setMobileMenuOpen(false)}>
                <span className="text-base font-semibold py-1 block">FAQ</span>
              </Link>
            </div>

            <div className="pt-4 border-t flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">
                  {lang === "fr" ? "Langue" : "Language"}
                </span>
                <div className="flex items-center border rounded-lg p-0.5 bg-muted/40 text-xs">
                  <button
                    onClick={() => setLang("fr")}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      lang === "fr" ? "bg-card text-foreground font-bold" : "text-muted-foreground"
                    }`}
                  >
                    FR
                  </button>
                  <button
                    onClick={() => setLang("en")}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      lang === "en" ? "bg-card text-foreground font-bold" : "text-muted-foreground"
                    }`}
                  >
                    EN
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">
                  {lang === "fr" ? "Thème visuel" : "Visual Theme"}
                </span>
                <ThemeSelector variant="segmented" />
              </div>
              <Link href="/choisir" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  {lang === "fr" ? "Choisir un portail" : "Choose a portal"}
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
