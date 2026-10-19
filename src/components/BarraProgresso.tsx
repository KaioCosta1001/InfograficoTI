import { motion, useScroll, useSpring } from "framer-motion";
import { UI } from "../config/constantes";

/**
 * Barra de progresso de leitura, fixa no topo, colada na navbar.
 *
 * A largura NÃO é animada (viraria layout): o preenchimento usa
 * transform: scaleX com origem à esquerda. O progresso vem direto do
 * useScroll do Framer Motion, sem throttle manual.
 */
export default function BarraProgresso() {
  const { scrollYProgress } = useScroll();
  // Leve amortecimento para a barra não ficar travada em roda-gigante.
  const progresso = useSpring(scrollYProgress, { stiffness: 260, damping: 40, restDelta: 0.001 });

  return (
    <div
      className="barra-progresso"
      style={{ height: UI.progresso.altura }}
      role="progressbar"
      aria-label="Progresso de leitura"
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div className="barra-progresso__preenchimento" style={{ scaleX: progresso }} />
    </div>
  );
}
