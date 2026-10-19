import { useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";

/**
 * Diz se a página já passou de um determinado ponto de scroll.
 *
 * Não devolve o valor do scroll a cada quadro: só muda o estado quando
 * CRUZA o limite, então a navbar e o botão de topo não re-renderizam a cada
 * pixel rolado.
 */
export function usePassouDoScroll(limite: number): boolean {
  const { scrollY } = useScroll();
  const [passou, setPassou] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const novo = y > limite;
    // Devolve o mesmo valor quando não houve mudança: o React cancela o render.
    setPassou((atual) => (atual === novo ? atual : novo));
  });

  return passou;
}
