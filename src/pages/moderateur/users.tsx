import React from "react";
import { useAppData } from "@shared/index";
import { Header } from "../../components/layout/header";
import { Footer } from "../../components/layout/footer";

export function ModerateurUsersPage() {
  const { users, suspendUser, activateUser } = useAppData();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header currentUniverse="moderation" />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        <h1 className="text-2xl font-black text-foreground">Comptes Utilisateurs</h1>

        <div className="rounded-2xl border border-border bg-card shadow-sm divide-y divide-border">
          {users.map((u) => (
            <div key={u.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-foreground">{u.name}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold uppercase">
                    {u.role}
                  </span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    u.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                  }`}>
                    {u.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{u.email} {u.companyName && `• ${u.companyName}`}</p>
              </div>

              <div className="flex items-center gap-2">
                {u.status !== "active" ? (
                  <button
                    onClick={() => activateUser(u.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
                  >
                    Activer
                  </button>
                ) : (
                  <button
                    onClick={() => suspendUser(u.id)}
                    className="px-3.5 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold"
                  >
                    Suspendre
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
