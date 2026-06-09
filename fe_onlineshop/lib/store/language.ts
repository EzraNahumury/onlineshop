import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Lang = "id" | "en";

interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export const useLanguage = create<LangState>()(
  persist(
    (set) => ({
      lang: "id",
      setLang: (lang) => set({ lang }),
    }),
    {
      name: "ayres-language",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
