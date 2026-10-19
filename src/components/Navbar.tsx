import { useReducedMotion } from "framer-motion";
import MenuConfiguracoes from "./MenuConfiguracoes";
import { LOGO_ALT, LOGO_SRC, UI, rolarParaTopo } from "../config/constantes";
import { usePassouDoScroll } from "../hooks/usePassouDoScroll";
import "./Navbar.css";

/**
 * Navbar fixa com três itens: "Início", logo e "Configurações".
 *
 * Ao rolar além de UI.navbar.limiteScroll ela encolhe (80px -> 56px) e ganha
 * vidro fosco. O encolhimento é feito com transform: scale no fundo e nos
 * itens — nada de mexer em width/height, então não há layout shift.
 * Todos os ajustes visuais ficam nas variáveis do topo de Navbar.css.
 */
export default function Navbar() {
  const encolhida = usePassouDoScroll(UI.navbar.limiteScroll);
  const somenteTransform = useReducedMotion();

  // Com menos movimento a navbar não encolhe: só troca cor e vidro.
  const estado = !somenteTransform && encolhida ? " navbar--encolhida" : "";

  return (
    <header className={`navbar${estado}`} data-encolhida={encolhida ? "sim" : "nao"}>
      <div className="navbar__fundo" aria-hidden="true" />

      <nav className="navbar__conteudo" aria-label="Principal">

        <div className="navbar__item">
          <img className="navbar__logo" src={LOGO_SRC} alt={LOGO_ALT} draggable={false} />
        </div>

        <div className="navbar__item">
          <MenuConfiguracoes />
        </div>
      </nav>
    </header>
  );
}
