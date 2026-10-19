import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { sumario, type ItemSumario } from "../config/sumario";
import { UI, rolarParaPx } from "../config/constantes";
import { useConfig } from "../context/ConfigContext";

/**
 * Sumário lateral fixo.
 *
 * Aparece só quando o checkbox "Ativar sumário" está ligado (ConfigContext).
 * Marca automaticamente o item da seção visível (scroll spy) e trava o item
 * clicado durante a rolagem, para não piscar no caminho.
 */
export default function Sumario() {
  const { sumarioAtivo } = useConfig();
  const somenteTransform = useReducedMotion();

  const [ativo, setAtivo] = useState<string>(sumario[0]?.id ?? "");
  /** item travado por um clique: o spy não mexe enquanto a rolagem acontece */
  const travado = useRef<string | null>(null);
  const destinos = useRef<number[]>([]);

  /* --- mede a posição de cada destino (px) e refaz ao redimensionar ------- */
  const medir = useCallback(() => {
    destinos.current = sumario.map((item) => {
      if (typeof item.scrollPara === "number") return item.scrollPara;
      const el = document.getElementById(item.scrollPara);
      if (!el) return Number.POSITIVE_INFINITY; // id inexistente: nunca fica ativo
      // Compensa a navbar fixa, para o item não ficar escondido atrás dela.
      return el.getBoundingClientRect().top + window.scrollY - UI.conteudo.paddingTopNavbar;
    });
  }, []);

  useEffect(() => {
    medir();
    window.addEventListener("resize", medir);
    // as imagens dos blocos definem a altura final da página
    window.addEventListener("load", medir);
    return () => {
      window.removeEventListener("resize", medir);
      window.removeEventListener("load", medir);
    };
  }, [medir]);

  /* --- scroll spy: o último destino que já passou do topo é o ativo ------- */
  useEffect(() => {
    if (!sumarioAtivo) return;
    let agendado = 0;

    const atualizar = () => {
      agendado = 0;
      // trava até o navegador parar de rolar
      if (travado.current) {
        const indice = sumario.findIndex((i) => i.id === travado.current);
        const alvo = destinos.current[indice];
        if (alvo !== undefined && Math.abs(window.scrollY - alvo) < 2) travado.current = null;
        return;
      }

      const leitura = window.scrollY + UI.sumario.offsetAtivo;
      let novo = sumario[0]?.id ?? "";
      for (let i = 0; i < sumario.length; i++) {
        const y = destinos.current[i];
        if (y !== undefined && y <= leitura) novo = sumario[i].id;
      }
      setAtivo((atual) => (atual === novo ? atual : novo));
    };

    const agendar = () => {
      if (!agendado) agendado = requestAnimationFrame(atualizar);
    };

    agendar();
    window.addEventListener("scroll", agendar, { passive: true });
    return () => {
      window.removeEventListener("scroll", agendar);
      if (agendado) cancelAnimationFrame(agendado);
    };
  }, [sumarioAtivo]);

  const aoClicar = (item: ItemSumario) => {
    const y = destinos.current[sumario.findIndex((i) => i.id === item.id)] ?? 0;
    // marca na hora e segura até chegar, para o spy não piscar no caminho
    travado.current = item.id;
    setAtivo(item.id);
    rolarParaPx(y);
  };

  return (
    <AnimatePresence>
      {sumarioAtivo && sumario.length > 0 ? (
        <motion.nav
          className="sumario"
          aria-label="Sumário"
          initial={somenteTransform ? { opacity: 0 } : { opacity: 0, x: -24 }}
          animate={somenteTransform ? { opacity: 1 } : { opacity: 1, x: 0 }}
          exit={somenteTransform ? { opacity: 0 } : { opacity: 0, x: -24 }}
          transition={{ duration: somenteTransform ? 0.01 : 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          {sumario.map((item) => {
            const eAtivo = item.id === ativo;
            return (
              <motion.button
                key={item.id}
                type="button"
                className="sumario__item"
                aria-current={eAtivo ? "true" : undefined}
                data-ativo={eAtivo ? "sim" : undefined}
                /* feedback de "pressionado" antes de disparar o scroll */
                whileTap={somenteTransform ? undefined : { scale: 0.94, x: 0 }}
                onClick={() => aoClicar(item)}
              >
                <span className="sumario__marcador" aria-hidden="true" />
                <span className="sumario__rotulo">{item.label}</span>
              </motion.button>
            );
          })}
        </motion.nav>
      ) : null}
    </AnimatePresence>
  );
}
