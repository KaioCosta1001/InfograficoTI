import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Tema = "claro" | "escuro";

type ConfigContextValue = {
  /** "claro" = fundo branco, "escuro" = fundo preto. */
  tema: Tema;
  definirTema: (tema: Tema) => void;
  /** Inverte entre claro e escuro. */
  alternarTema: () => void;
  /** Se o sumário lateral está visível. */
  sumarioAtivo: boolean;
  definirSumarioAtivo: (ativo: boolean) => void;
};

const ConfigContext = createContext<ConfigContextValue | null>(null);

/**
 * Estado global da interface (tema e sumário), controlado pelo menu
 * "Configurações" da navbar e consultado por qualquer componente.
 */
export function ConfigProvider({ children }: { children: ReactNode }) {
  const [tema, definirTema] = useState<Tema>("escuro");
  const [sumarioAtivo, definirSumarioAtivo] = useState(true);

  const alternarTema = useCallback(() => {
    definirTema((atual) => (atual === "escuro" ? "claro" : "escuro"));
  }, []);

  const valor = useMemo<ConfigContextValue>(
    () => ({ tema, definirTema, alternarTema, sumarioAtivo, definirSumarioAtivo }),
    [tema, alternarTema, sumarioAtivo],
  );

  // O tema vive no <html> para o CSS do body poder reagir a ele.
  useEffect(() => {
    document.documentElement.dataset.tema = tema;
  }, [tema]);

  return <ConfigContext.Provider value={valor}>{children}</ConfigContext.Provider>;
}

/** Acesso ao estado global. Lança erro se usado fora do ConfigProvider. */
export function useConfig(): ConfigContextValue {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error("useConfig precisa estar dentro de <ConfigProvider>");
  return ctx;
}
