import { useRef } from "react";
import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { SPRING, UI, rolarParaTopo } from "../config/constantes";
import { usePassouDoScroll } from "../hooks/usePassouDoScroll";

/** Janela em ms na qual um clique é considerado "o mesmo" do arraste. */
const JANELA_CLIQUE_MS = 350;

/**
 * Botão flutuante "voltar ao topo".
 *
 * - some no topo da página e aparece depois de UI.voltarTopo.limiteScroll;
 * - usa o MESMO arraste elástico dos elementos do infográfico, voltando à
 *   posição original com mola ao soltar;
 * - se o arraste foi pequeno (ou não houve arraste), conta como clique e
 *   executa a rolagem suave para o topo.
 */
export default function BotaoVoltarTopo() {
  const visivel = usePassouDoScroll(UI.voltarTopo.limiteScroll);
  const somenteTransform = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const fimDoArraste = useRef(0);
  const limite = UI.voltarTopo.tamanho / 2;

  return (
    <motion.button
      type="button"
      className="voltar-topo"
      style={{ x, y }}
      /* mesmo comportamento de arraste dos elementos arrastáveis */
      drag={!somenteTransform}
      dragConstraints={{ left: -limite, right: limite, top: -limite, bottom: limite }}
      dragElastic={0.3}
      dragMomentum={false}
      onDragEnd={(_evento, info) => {
        fimDoArraste.current = Date.now();
        // arraste curto = foi um clique, não um arrasto
        if (Math.hypot(info.offset.x, info.offset.y) < UI.voltarTopo.arrasteParaClicar) {
          rolarParaTopo();
        }
        // volta pra casa com a mesma mola dos elementos do infográfico
        animate(x, 0, SPRING.arraste);
        animate(y, 0, SPRING.arraste);
      }}
      onClick={() => {
        // clique puro (teclado, ou mouse sem arraste). Depois de um arraste,
        // a ação já foi tratada no onDragEnd — não dispara duas vezes.
        if (Date.now() - fimDoArraste.current < JANELA_CLIQUE_MS) return;
        rolarParaTopo();
      }}
      aria-label="Voltar ao topo"
      animate={somenteTransform ? { opacity: visivel ? 1 : 0 } : { opacity: visivel ? 1 : 0, scale: visivel ? 1 : 0.6 }}
      transition={
        somenteTransform
          ? { duration: 0.15 }
          : { type: "spring", stiffness: 320, damping: 26, mass: 0.7 }
      }
      /* some também da navegação por teclado quando está invisível */
      aria-hidden={!visivel}
      tabIndex={visivel ? 0 : -1}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          d="M12 19V5m0 0-6 6m6-6 6 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.button>
  );
}
