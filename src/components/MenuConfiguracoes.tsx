import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useConfig, type Tema } from "../context/ConfigContext";
import { SPRING } from "../config/constantes";

/**
 * Item "Configurações" da navbar: botão + menu em cascata.
 * Abre no hover (mouse) e no clique (toque/teclado), fecha ao clicar fora
 * ou apertar Esc.
 */
export default function MenuConfiguracoes() {
  const [aberto, setAberto] = useState(false);
  const [hover, setHover] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const somenteTransform = useReducedMotion();

  const { tema, definirTema, sumarioAtivo, definirSumarioAtivo } = useConfig();

  // Fecha ao clicar fora do menu.
  useEffect(() => {
    if (!aberto) return;
    const aoClicarFora = (evento: PointerEvent) => {
      if (!container.current?.contains(evento.target as Node)) setAberto(false);
    };
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setAberto(false);
    };
    document.addEventListener("pointerdown", aoClicarFora);
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("pointerdown", aoClicarFora);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto]);

  // Abre no hover, mas só com mouse de verdade.
  const abrirHover = () => {
    if (window.matchMedia("(pointer: fine)").matches) setHover(true);
  };
  const fecharHover = () => setHover(false);
  const visivel = aberto || hover;

  const opcoes: { valor: Tema; rotulo: string }[] = [
    { valor: "claro", rotulo: "Claro" },
    { valor: "escuro", rotulo: "Escuro" },
  ];

  return (
    <div
      ref={container}
      className="navbar__config"
      onPointerEnter={abrirHover}
      onPointerLeave={fecharHover}
    >
      <button
        type="button"
        className="navbar__botao"
        aria-expanded={visivel}
        aria-haspopup="true"
        onClick={() => setAberto((v) => !v)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
      </button>

      <AnimatePresence>
        {visivel ? (
          <motion.div
            className="navbar__painel"
            initial={somenteTransform ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.97 }}
            animate={somenteTransform ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={somenteTransform ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.97 }}
            transition={somenteTransform ? { duration: 0.01 } : SPRING.interface}
            role="menu"
          >
            <p className="navbar__painel-titulo">Aparência</p>

            <div className="navbar__grupo">
              <span>Fundo da página</span>
              <div className="tema" role="group" aria-label="Fundo da página">
                {opcoes.map((opcao) => (
                  <button
                    key={opcao.valor}
                    type="button"
                    role="radio"
                    aria-checked={tema === opcao.valor}
                    className={`tema__botao${tema === opcao.valor ? " tema__botao--ativo" : ""}`}
                    onClick={() => definirTema(opcao.valor)}
                  >
                    {tema === opcao.valor ? (
                      <motion.span
                        className="tema__bolinha"
                        layoutId="tema-ativo"
                        transition={somenteTransform ? { duration: 0.01 } : SPRING.interface}
                      />
                    ) : null}
                    {opcao.rotulo}
                  </button>
                ))}
              </div>
            </div>

            <div className="navbar__separador" />

            <div className="navbar__grupo">
              <span id="rotulo-sumario">Ativar sumário</span>
              <label className="checkbox">
                <input
                  className="checkbox__input"
                  type="checkbox"
                  checked={sumarioAtivo}
                  aria-labelledby="rotulo-sumario"
                  onChange={(e) => definirSumarioAtivo(e.target.checked)}
                />
                <span className="checkbox__trilho" />
                <span className="checkbox__bolinha" />
              </label>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
