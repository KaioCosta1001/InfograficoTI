/**
 * Constantes de interface, paleta e comportamento.
 * Tudo que é "número mágico" da UI mora aqui para facilitar o ajuste.
 *
 * Todas as durações estão em segundos (padrão do Framer Motion).
 */

/* -------------------------------------------------------------------------- */
/*  SITE                                                                       */
/* -------------------------------------------------------------------------- */
export const SITE = {
  title: "Infográfico",
  description: "Apresentação em página única com animações controladas pelo scroll.",
} as const;

/** Caminho do logo da navbar. Troque pelo seu arquivo em /public. */
export const LOGO_SRC = "/logo.png";
export const LOGO_ALT = "Logo";

/* -------------------------------------------------------------------------- */
/*  PALETA                                                                     */
/*  A navbar, a barra de progresso e o botão de topo usam estes tons.           */
/* -------------------------------------------------------------------------- */
export const PALETA = {
  roxo: "#43178a",
  roxoClaro: "#5b23b8",
  roxoEscuro: "#2f0f63",
} as const;

/* -------------------------------------------------------------------------- */
/*  LIMITES DE SCROLL E TAMANHOS                                               */
/* -------------------------------------------------------------------------- */
export const UI = {
  navbar: {
    altura: 56,
    alturaEncolhida: 56,
    /** Depois de rolar esta quantidade de px a navbar encolhe. */
    limiteScroll: 70,
  },
  progresso: {
    altura: 4,
  },
  voltarTopo: {
    /** Abaixo deste scroll o botão fica escondido. */
    limiteScroll: 500,
    tamanho: 52,
    /** Distância de arraste (px) que ainda conta como clique. */
    arrasteParaClicar: 8,
  },
  sumario: {
    largura: 200,
    /** Quantos px do topo da tela contam como "aqui" (compensa a navbar). */
    offsetAtivo: 120,
  },
  conteudo: {
    /** Padding-top do conteúdo, igual à altura da navbar, para não cobrir texto. */
    paddingTopNavbar: 80,
  },
} as const;

/* -------------------------------------------------------------------------- */
/*  MOLAS E CURVAS                                                             */
/* -------------------------------------------------------------------------- */
export const SPRING = {
  /** Retorno do elemento arrastado à posição original. Suave, sem solavanco. */
  arraste: { type: "spring", stiffness: 260, damping: 24, mass: 0.9 },
  /** Atração magnética: rápido ao seguir o mouse, macio ao voltar. */
  magnetismo: { stiffness: 220, damping: 26, mass: 0.6 },
  /** Navbar encolher. */
  navbar: { type: "spring", stiffness: 300, damping: 32, mass: 0.8 },
  /** Dropdown e sumário. */
  interface: { type: "spring", stiffness: 320, damping: 30, mass: 0.7 },
} as const;

export const EASE = {
  suave: [0.22, 1, 0.36, 1],
} as const;

/* -------------------------------------------------------------------------- */
/*  HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

/** Lê uma flag da URL (ex.: /?debug=true). */
export function lerFlagDaUrl(nome: string): boolean {
  if (typeof window === "undefined") return false;
  const valor = new URLSearchParams(window.location.search).get(nome);
  return valor !== null && valor !== "false" && valor !== "0";
}

/** Rolagem suave até o topo. */
export function rolarParaTopo() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * Rolagem suave até um destino em px.
 * Usa um rAF para respeitar o "scroll-behavior: auto" do navegador.
 */
export function rolarParaPx(y: number) {
  window.scrollTo({ top: y, behavior: "smooth" });
}

/**
 * Descobre a posição em px de um destino:
 *  - number: usa o valor direto;
 *  - string: procura o id na página e usa o topo do elemento.
 */
export function resolverDestino(destino: number | string): number {
  if (typeof destino === "number") return destino;
  const el = document.getElementById(destino);
  if (!el) return 0;
  return el.getBoundingClientRect().top + window.scrollY;
}
