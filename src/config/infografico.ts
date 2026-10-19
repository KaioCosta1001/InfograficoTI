/* eslint-disable */
/**
 * ============================================================================
 *  INFOGRÁFICO — ARQUIVO ÚNICO DE CONFIGURAÇÃO
 * ============================================================================
 *
 *  É SÓ HERE QUE VOCÊ EDITA. Nenhum componente precisa ser alterado para
 *  adicionar, remover ou reordenar blocos e elementos.
 *
 *  ---------------------------------------------------------------------------
 *  IMAGENS (coloque os arquivos nestas pastas do projeto)
 *  ---------------------------------------------------------------------------
 *    /public/blocos/     -> imagem de fundo de cada bloco   (bloco-1.png, ...)
 *    /public/elementos/  -> imagem sobreposta em PNG com fundo transparente
 *
 *  ---------------------------------------------------------------------------
 *  COMO ADICIONAR UM BLOCO
 *  ---------------------------------------------------------------------------
 *    Copie um objeto do array INFOGRAFICO e ajuste id / fundo / elementos.
 *    A ordem dos objetos no array é a ordem vertical na página.
 *
 *      {
 *        id: "bloco-3",
 *        fundo: "/blocos/bloco-3.png",
 *        proporcao: "1600/1280",   // "largura/altura" real da imagem (evita "pular")
 *        elementos: [
 *          {
 *            id: "elemento-novo",
 *            src: "/elementos/elemento-novo.png",
 *            alt: "Descrição do elemento para acessibilidade",
 *            posicao: { left: "10%", top: "20%", width: "45%" }, // % do bloco
 *            zIndex: 3,
 *            animacao: {
 *              tipo: "entrada",        // "scroll" = acompanha a rolagem | "entrada" = dispara 1x
 *              fade: true,
 *              rotacao: { de: 8, para: 0 },
 *              escala: { de: 0.9, para: 1 },
 *              deslocamento: { y: 80 }, // px de onde parte
 *              duracao: 0.9,
 *              delay: 0.1,
 *            },
 *          },
 *        ],
 *      }
 *
 *  ---------------------------------------------------------------------------
 *  COMO POSICIONAR (posicao)
 *  ---------------------------------------------------------------------------
 *    left  -> distância do elemento até a BORDA ESQUERDA do bloco, em % do bloco
 *    top   -> distância do elemento até a BORDA SUPERIOR do bloco, em % do bloco
 *    width -> largura do elemento em % do bloco (a altura acompanha a imagem)
 *
 *    Use valores de 0 a 100 para caber dentro do bloco. Valores > 100 fazem o
 *    elemento "sair" pela lateral e são cortados (sem barra de rolagem).
 *
 *    "top" é medido a partir do TOPO DA CAIXA do elemento (não da imagem).
 *    Se a sua PNG tem borda/margem transparente, use
 *    posicaoEmImagem: { top: "20%" } para deslocar só o desenho, mantendo a
 *    caixa no lugar — assim centralizar fica muito mais fácil.
 *
 *  ---------------------------------------------------------------------------
 *  COMO ANIMAR (animacao)
 *  ---------------------------------------------------------------------------
 *    tipo: "scroll"  -> usa useScroll/useTransform: o elemento se move
 *                       enquanto o bloco atravessa a tela (efeito "scrub").
 *    tipo: "entrada" -> usa whileInView: dispara uma única vez ao entrar na tela.
 *
 *    Todos os campos são OPCIONAIS: o que você não escrever usa o valor de
 *    PADROES_ANIMACAO (veja abaixo). Assim cada elemento sobrescreve apenas
 *    o que quiser.
 *
 *      rotacao:   { de: -6, para: 6 }  // graus
 *      escala:    { de: 0.9, para: 1 }
 *      deslocamento: { x: 0, y: 80 }   // px de onde parte
 *      fade:      true                 // aparece/desaparece
 *      balancoContinuo: { graus: 5, duracao: 3 } // balanço que nunca para
 *      duracao / delay / easing        // só para tipo "entrada"
 *
 *    Em "scroll", a duração é o percurso inteiro do bloco na tela: não
 *    controla a velocidade. Para ajeitar o movimento, mude os valores "de" e
 *    "para", ou a janela em SCROLL.janela.
 *
 *  ---------------------------------------------------------------------------
 *  COMO TORNAR UM ELEMENTO ARRASTÁVEL (arrastavel)
 *  ---------------------------------------------------------------------------
 *    arrastavel: { ativo: true }              // arraste livre
 *    arrastavel: {
 *      ativo: true,
 *      limite: { x: 40, y: 40 },              // px máximos em cada eixo
 *      elastico: 0.25,                        // resistência ao passar do limite (0 a 1)
 *      magnetico: { raio: 100, intensidade: 1 }, // atração pelo mouse
 *    }
 *
 *    Com "ativo: true" o elemento:
 *      - pode ser arrastado com o mouse/dedo;
 *      - volta sozinho para a posição original ao soltar, com mola;
 *      - ganha uma sombra que cresce durante o arraste ("levanta" da página);
 *      - se tiver "magnetico", inclina-se na direção do cursor quando o mouse
 *        chega perto (dentro do raio), sem precisar encostar nele.
 *
 *    Durante o arraste a animação de scroll do elemento fica parada, para não
 *    brigar com o gesto. O magnetismo é desligado em telas de toque e quando
 *    o sistema pede menos movimento (prefers-reduced-motion).
 *
 *  ---------------------------------------------------------------------------
 *  MODO DEPURAÇÃO
 *  ---------------------------------------------------------------------------
 *    Abra a página com  /?debug=true  para ver a borda tracejada, o id e os
 *    valores de left/top/width de cada elemento e ajustar a posição na tela.
 *
 * ============================================================================
 */

export type TipoAnimacao = "scroll" | "entrada";

/** Curvas aceitas no campo `easing` (nomes do Framer Motion ou cubic-bezier). */
export type Easing =
  | "linear"
  | "easeIn"
  | "easeOut"
  | "easeInOut"
  | "circIn"
  | "circOut"
  | "circInOut"
  | "backIn"
  | "backOut"
  | "backInOut"
  | "anticipate"
  | readonly [number, number, number, number];

export type Posicao = {
  /** Distância até a borda esquerda do bloco, em % do bloco. */
  left: string;
  /** Distância até a borda superior do bloco, em % do bloco. */
  top: string;
  /** Largura do elemento, em % do bloco. A altura acompanha a imagem. */
  width: string;
};

export type Elemento = {
  /** Identificador único (aparece no modo depuração). */
  id: string;
  /** Caminho da imagem. Ex.: "/elementos/megafone.png" (PNG transparente). */
  src: string;
  alt: string;
  posicao: Posicao;
  /**
   * Ajuste fino da caixa, em % do próprio elemento. Útil quando a PNG já tem
   * margem transparente: o desenho se move, a caixa continua no lugar.
   */
  posicaoEmImagem?: { top?: string; left?: string; width?: string };
  /** Empilhamento sobre o fundo do bloco. Padrão: 1. */
  zIndex?: number;
  animacao: {
    tipo: TipoAnimacao;
    /** Começa invisível e aparece. Padrão: true. */
    fade?: boolean;
    /** Rotação em graus, sempre suave. */
    rotacao?: { de: number; para: number };
    /** Escala relativa (1 = tamanho natural). */
    escala?: { de: number; para: number };
    /** Deslocamento inicial em px de onde o elemento parte. */
    deslocamento?: { x?: number; y?: number };
    /**
     * Balanço contínuo em loop perfeito: sai do ângulo de descanso, vai até
     * `graus` de lado e VOLTA para o descanso. Como o easing zera a velocidade
     * nas pontas, o reinício do ciclo não aparece.
     *      balancoContinuo: { graus: 5, duracao: 3 }   // sobe 5 graus a cada 3s
     */
    balancoContinuo?: { graus: number; duracao: number };
    /** Em segundos. Só para tipo "entrada". */
    duracao?: number;
    /** Em segundos. Só para tipo "entrada". */
    delay?: number;
    /** Curva do easing. Só para tipo "entrada". */
    easing?: Easing;
  };

  /**
   * Arraste do elemento. Se o campo não existir (ou ativo for false), o
   * elemento se comporta normalmente: sem interação de arraste, mantendo a
   * animação de scroll/entrada.
   */
  arrastavel?: {
    ativo: boolean;
    /** Distância máxima em px que o elemento pode ser arrastado. Padrão: 40. */
    limite?: { x: number; y: number };
    /** Resistência ao arrastar além do limite, de 0 a 1. Padrão: 0.2. */
    elastico?: number;
    /** Atração pelo cursor quando o mouse chega perto (sem precisar tocar). */
    magnetico?: { raio: number; intensidade: number };
  };
};

export type Bloco = {
  /** Identificador único do bloco. */
  id: string;
  /** Imagem de fundo. Ex.: "/blocos/bloco-1.png". */
  fundo: string;
  /** Proporção real da imagem, "largura/altura". Evita a página pular no load. */
  proporcao?: string;
  /** Texto alternativo do fundo. Deixe vazio se o bloco não tiver texto. */
  alt?: string;
  /** Pode ser vazio ou ter quantos elementos você quiser. */
  elementos: Elemento[];
};

/* ---------------------------------------------------------------------------
 *  PADRÕES DE ANIMAÇÃO  (altere aqui para afetar TODOS os elementos)
 *  Qualquer campo definido no elemento tem prioridade sobre estes.
 * ------------------------------------------------------------------------- */
export const PADROES_ANIMACAO = {
  fade: true,
  rotacao: { de: -4, para: 4 },
  escala: { de: 0.92, para: 1 },
  deslocamento: { x: 0, y: 70 },
  balancoContinuo: undefined as { graus: number; duracao: number } | undefined,
  duracao: 0.9,
  delay: 0.05,
  easing: "easeOut",
  zIndex: 1,
} as const;

/* ---------------------------------------------------------------------------
 *  AJUSTES GERAIS DO SCRUB (animacao.tipo === "scroll")
 * ------------------------------------------------------------------------- */
export const SCROLL = {
  /** Suavização do movimento (maior = mais "pesado"/amortecido). 0 = sem mola. */
  suavizacao: 80,
  /**
   * Janela do bloco dentro da viewport que corresponde a 0% -> 100% do scroll.
   *  "start end" = o bloco acabou de entrar pela base da tela.
   *  "end start" = o bloco já saiu pelo topo da tela.
   */
  janela: ["start end", "end start"] as ["start end", "end start"],
  /** Trecho (0 a 1) em que o elemento aparece. */
  fadeEntrada: [0, 0.25] as [number, number],
  /**
   * Trecho (0 a 1) em que o elemento sai. Começar tarde (0.78) faz o elemento
   * continuar bem visível enquanto o bloco está na tela, o que também evita que
   * ele fique apagado quando a página é curta demais para rolar até o fim.
   */
  fadeSaida: [0.78, 1] as [number, number],
};

/* ===========================================================================
 *  A LISTA DE BLOCOS DA PÁGINA
 * ======================================================================== */


export const INFOGRAFICO: Bloco[] = [
  {
    id: "bloco-1",
    fundo: "/blocos/bloco-1.png",
    // Proporção real da imagem (991 x 798). Se trocar o fundo, atualize aqui.
    proporcao: "991/798",
    alt: "",
    elementos: [
      {
        id: "b1-altofalante",
        src: "/elementos/altofalante.png",
        alt: "Altofalante",
        posicao: { left: "60%", top: "9%", width: "45%" },
        zIndex: 1,
        animacao: {
          easing:"backInOut",
          tipo: "entrada",
          fade: false,
          deslocamento: { x: 0, y: 0 },
          escala: { de: 0.2, para: 1 },
          duracao: 0.5,
          balancoContinuo: { graus: 3, duracao: 3 },
        },
        // Dá para arrastar (com mola ao soltar) e ele é atraído pelo cursor.
        arrastavel: {
          ativo: true,
          limite: { x: 20, y: 20 },
          elastico: 0.25,
          magnetico: { raio: 110, intensidade: 1 },
        },
      },
    ],
  },
  {
    id: "bloco-2",
    fundo: "/blocos/bloco-2.png",
    proporcao: "1600/1000",
    alt: "",
    elementos: [
      {
        id: "b2-portalServiços",
        src: "/elementos/PortalDeSerivços.gif",
        alt: "Portal Serviços",
        posicao: { left: "6%", top: "27%", width: "50%" },
        zIndex: 2,
        animacao: {
          tipo: "entrada",
          fade: false,
          deslocamento: { x: 0, y: 0 },
          rotacao: { de: 0, para: 0 },
          escala: { de: 0.95, para: 1 },
          duracao: 1, 
        },
      },
      {
        id: "b2-apertoMão",
        src: "/elementos/ApertodeMão.png",
        alt: "Aperto de Mão",
        posicao: { left: "48%", top: "20%", width: "56%" },
        zIndex: 1,
        animacao: {
          tipo: "entrada",
          easing:"backOut",
          fade: false,
          rotacao: { de: 0, para: 0 },
          deslocamento: { x: 0, y: 0 },
          balancoContinuo: { graus: 2, duracao: 5 },
          duracao: 1.4,

        },
      },
      {
        id: "b2-botãoCliqueAqui",
        src: "/elementos/botãoCliqueAqui.png",
        alt: "Botão Clique Aqui",
        posicao: { left: "5%", top: "54%", width: "50%" },
        zIndex: 2,
        animacao: {
          tipo: "entrada",
          easing:"backOut",
          fade: false,
          rotacao: { de: 8, para: 0 },
          deslocamento: { x: 0, y: 0 },
          balancoContinuo: { graus: 1, duracao: 4 },
        },
        arrastavel: {
          ativo: true,
          limite: { x: 12, y: 12 },
          elastico: 0.05,
          magnetico: { raio: 120, intensidade: 0.4 },
        },
      },
      {
        id: "b2-ClickSeta",
        src: "/elementos/ClickSeta.png",
        alt: "Click Seta",
        posicao: { left: "42%", top: "48%", width: "15%" },
        zIndex: 2,
        animacao: {
          tipo: "scroll",
          fade: false,
          rotacao: { de: 8, para: -8 },
          deslocamento: { x: 0, y: 100 },
          balancoContinuo: { graus: 4, duracao: 4 },
        },
      }
    ],
    
  },
   {
    id: "bloco-3",
    fundo: "/blocos/bloco-3.png",
    // Proporção real da imagem (991 x 798). Se trocar o fundo, atualize aqui.
    proporcao: "991/798",
    alt: "",
    elementos: [
      {
        id: "b1-MãoLampada",
        src: "/elementos/MãoLampada.png",
        alt: "Mão Lampada",
        posicao: { left: "-4%", top: "0%", width: "48%" },
        zIndex: 1,
        animacao: {
          tipo: "entrada",
          easing:"backOut",
          fade: false,
          deslocamento: { x: 0, y: 0 },
          balancoContinuo: { graus: 2, duracao: 3 },
        },
         arrastavel: {
          ativo: true,
          limite: { x: 1, y: 1 },
          elastico: 0.02,
          magnetico: { raio: 70, intensidade: 0.6 },
        },
      },
      {
        id: "b1-Computador Segurança",
        src: "/elementos/ComputadorSegurança.png",
        alt: "Computador Segurança",
        posicao: { left: "58%", top: "50%", width: "45%" },
        zIndex: 1,
        animacao: {
          tipo: "entrada",
          easing:"backOut",
          fade: false,
          deslocamento: { x: 0, y: 0 },
          balancoContinuo: { graus: 2, duracao: 3 },
        },
        arrastavel: {
          ativo: true,
          limite: { x: 1, y: 1 },
          elastico: 0.02,
          magnetico: { raio: 70, intensidade: 0.6 },
        },
      },
    ],
  },
  {
    id: "bloco-4",
    fundo: "/blocos/bloco-4.png",
    // Proporção real da imagem (991 x 798). Se trocar o fundo, atualize aqui.
    proporcao: "991/798",
    alt: "",
    elementos: [
      {
        id: "b1-EfeitoRecuperaçãoDados",
        src: "/elementos/EfeitoRecuperaçãoDados.png",
        alt: "Efeito Recuperação Dados",
        posicao: { left: "0%", top: "13%", width: "36%" },
        zIndex: 2,
        animacao: {
          tipo: "entrada",
          easing:"backOut",
          fade: false,
          deslocamento: { x: 0, y: 0 },
          duracao: 1,
          balancoContinuo: { graus: 1, duracao: 3 },
        },
      },
      {
        id: "b1-ArquivosRecuperaçãoDados",
        src: "/elementos/ArquivosRecuperaçãoDados.png",
        alt: "Arquivos Recuperação Dados",
        posicao: { left: "0%", top: "12%", width: "40%" },
        zIndex: 1,
        animacao: {
          tipo: "entrada",
          easing:"backOut",
          fade: false,
          deslocamento: { x: 0, y: 0 },
          duracao: 1,
          balancoContinuo: { graus: 1, duracao: 7 },
        },
        arrastavel: {
          ativo: true,
          limite: { x: 1, y: 1 },
          elastico: 0.02,
          magnetico: { raio: 70, intensidade: 0.6 },
        },
      },
      {
        id: "b1-CdRecuperaçãoDados",
        src: "/elementos/CdRecuperaçãoDados.png",
        alt: "Cd Recuperação Dados",
        posicao: { left: "5%", top: "12%", width: "20%" },
        zIndex: 1,
        animacao: {
          tipo: "entrada",
          easing:"backOut",
          fade: false,
          deslocamento: { x: 0, y: 0 },
          duracao: 1,
          balancoContinuo: { graus: 1, duracao: 8 },
        },
        arrastavel: {
          ativo: true,
          limite: { x: 1, y: 1 },
          elastico: 0.02,
          magnetico: { raio: 70, intensidade: 0.6 },
        },
      },
      {
        id: "b1-Chaves",
        src: "/elementos/Chaves.png",
        alt: "Chaves",
        posicao: { left: "63%", top: "34%", width: "35%" },
        zIndex: 1,
        animacao: {
          tipo: "entrada",
          easing:"backOut",
          fade: false,
          deslocamento: { x: 0, y: 0 },
          duracao: 1,
          balancoContinuo: { graus: 1, duracao: 8 },
        },
        arrastavel: {
          ativo: true,
          limite: { x: 1, y: 1 },
          elastico: 0.02,
          magnetico: { raio: 80, intensidade: 0.6 },
        },
      },
      {
        id: "b1-Tempo",
        src: "/elementos/Tempo.png",
        alt: "Tempo",
        posicao: { left: "5%", top: "54%", width: "35%" },
        zIndex: 1,
        animacao: {
          tipo: "entrada",
          easing:"backOut",
          fade: false,
          deslocamento: { x: 0, y: 0 },
          duracao: 1,
          balancoContinuo: { graus: 1, duracao: 8 },
        },
        arrastavel: {
          ativo: true,
          limite: { x: 1, y: 1 },
          elastico: 0.02,
          magnetico: { raio: 80, intensidade: 0.6 },
        },
      },
      {
        id: "b1-DigitandoEmail",
        src: "/elementos/DigitandoEmail.png",
        alt: "DigitandoEmail",
        posicao: { left: "62%", top: "74%", width: "44%" },
        zIndex: 1,
        animacao: {
          tipo: "entrada",
          easing:"backOut",
          fade: false,
          deslocamento: { x: 0, y: 0 },
          duracao: 1,
          balancoContinuo: { graus: 1, duracao: 8 },
        },
        arrastavel: {
          ativo: true,
          limite: { x: 1, y: 1 },
          elastico: 0.02,
          magnetico: { raio: 80, intensidade: 0.6 },
        },
      },
    ],
  },
  {
    id: "bloco-5",
    fundo: "/blocos/bloco-5.png",
    // Proporção real da imagem (991 x 798). Se trocar o fundo, atualize aqui.
    proporcao: "991/798",
    alt: "",
    elementos: [
      {
        id: "b1-Assinatura",
        src: "/elementos/Assinatura.png",
        alt: "Assinatura",
        posicao: { left: "-35%", top: "-10%", width: "80%" },
        zIndex: 1,
        animacao: {
          tipo: "entrada",
          fade: false,
          balancoContinuo: { graus: 1, duracao: 6 },
        },
        arrastavel: {
          ativo: true,
          limite: { x: 1, y: 1 },
          elastico: 0.02,
          magnetico: { raio: 80, intensidade: 0.6 },
        },
      },
      {
        id: "b1-AssinaturaGif",
        src: "/elementos/AssinaturaGif.gif",
        alt: "AssinaturaGif",
        posicao: { left: "36%", top: "10%", width: "60%" },
        zIndex: 1,
        animacao: {
          rotacao:{ de: -1, para: -1 },
          tipo: "entrada",
          fade: false,
          balancoContinuo: { graus: 1, duracao: 6 },
        },
        arrastavel: {
          ativo: true,
          limite: { x: 1, y: 1 },
          elastico: 0.02,
          magnetico: { raio: 80, intensidade: 0.6 },
        },
      },
      {
        id: "b1-Computador Segurança",
        src: "/elementos/ComputadorSegurança.png",
        alt: "Computador Segurança",
        posicao: { left: "58%", top: "50%", width: "45%" },
        zIndex: 1,
        animacao: {
          tipo: "entrada",
          easing:"backOut",
          fade: false,
          deslocamento: { x: 200, y: 0 },
          duracao: 1,
          balancoContinuo: { graus: 2, duracao: 3 },
        },
      },
    ],
  },
];
