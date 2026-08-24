import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "fr" | "en";

export type TFunction = ((key: string, defaultText?: string) => string) & Record<string, string>;

function createTProxy(rawT: (key: string, defaultText?: string) => string): TFunction {
  const proxy = new Proxy(rawT, {
    apply(_target, _thisArg, args) {
      return rawT(args[0], args[1]);
    },
    get(_target, prop) {
      if (typeof prop === "string" && prop !== "then" && prop !== "toJSON") {
        return rawT(prop, prop);
      }
      return undefined;
    },
  });
  return proxy as TFunction;
}

interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TFunction;
}

const defaultT = createTProxy((k, d) => d || k);

const I18nContext = createContext<I18nContextValue>({
  language: "fr",
  setLanguage: () => {},
  t: defaultT,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("fr");

  const rawT = (key: string, defaultText?: string) => defaultText || key;
  const t = createTProxy(rawT);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export function useLang() {
  const { language, setLanguage, t } = useI18n();
  return { lang: language, setLang: setLanguage, t };
}
