import React from "react";
import { Button } from "@zira/ui";

interface WalletHeaderProps {
  onDeposit: () => void;
  onWithdraw: () => void;
}

/**
 * En-tête de la page portefeuille avec les boutons d'action Déposer et Retirer.
 */
export function WalletHeader({ onDeposit, onWithdraw }: WalletHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Mon Wallet</h1>
      <div className="flex gap-2">
        <Button size="sm" onClick={onDeposit}>
          + Déposer
        </Button>
        <Button size="sm" variant="outline" onClick={onWithdraw}>
          Retirer
        </Button>
      </div>
    </div>
  );
}
