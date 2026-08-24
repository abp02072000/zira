import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "fr" | "en";

interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultText?: string) => string;
}

const I18nContext = createContext<I18nContextValue>({
  language: "fr",
  setLanguage: () => {},
  t: (_k, d) => d || _k,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("fr");

  const t = (key: string, defaultText?: string) => {
    return defaultText || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
