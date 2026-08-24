import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button, ThemeSelector } from "@zira/ui";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";

interface LandingHeaderProps {
  currentPage?: "accueil" | "apropos" | "blog" | "contact" | "faq" | "autre";
}

export function LandingHeader({ currentPage = "autre" }: LandingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const navItems = [
    { label: "Accueil", href: "/", id: "accueil" },
    { label: "À Propos", href: "/a-propos", id: "apropos" },
    { label: "Blog", href: "/blog", id: "blog" },
    { label: "Contact", href: "/contact", id: "contact" },
    { label: "FAQ", href: "/faq", id: "faq" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
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

        {/* Navigation Desktop sans icônes */}
        <nav className="hidden md:flex items-center space-x-7">
          {navItems.map((item) => {
            const isActive = currentPage === item.id || (item.href === "/" && location === "/");
            return (
              <Link key={item.id} href={item.href}>
                <span
                  className={`text-sm font-semibold cursor-pointer transition-colors ${
                    isActive
                      ? "text-primary font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Actions Desktop sans icônes */}
        <div className="hidden md:flex items-center space-x-3">
          <ThemeSelector variant="compact" />
          <Link href="/choisir">
            <Button size="sm" className="font-semibold shadow-xs bg-primary text-primary-foreground hover:bg-primary/90">
              Accéder aux portails
            </Button>
          </Link>
        </div>

        {/* Bouton Mobile */}
        <div className="flex md:hidden items-center space-x-2">
          <ThemeSelector variant="compact" />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-foreground focus:outline-hidden"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Menu Mobile Déroulant */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b bg-background px-4 py-6 space-y-4 shadow-lg"
          >
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => {
                const isActive = currentPage === item.id || (item.href === "/" && location === "/");
                return (
                  <Link key={item.id} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                    <span
                      className={`text-base font-semibold py-1 block cursor-pointer ${
                        isActive ? "text-primary font-bold" : "text-foreground"
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
            <div className="pt-4 border-t flex flex-col gap-3">
              <Link href="/choisir" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full font-semibold justify-center bg-primary text-primary-foreground hover:bg-primary/90">
                  Accéder aux portails ZIRA
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
