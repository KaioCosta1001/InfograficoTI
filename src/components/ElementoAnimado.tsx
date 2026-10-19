import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  PADROES_ANIMACAO,
  SCROLL,
  type Elemento as ElementoConfig,
} from "../config/infografico";
import { SPRING } from "../config/constantes";

type Props = {
  elemento: ElementoConfig;
  /** true só no primeiro bloco, para carregar as imagens mais importantes primeiro. */
  carregamentoImediato?: boolean;
  /** true exibe borda tracejada + id + valores de left/top/width. */
  depuracao?: boolean;
};

type Tamanho = { largura: number; altura: number };

/** Usa o valor do config quando existir; senão o padrão. */
function padrao<T>(personalizado: T | undefined, reserva: T): T {
  return personalizado === undefined ? reserva : personalizado;
}

/** Padrões do arraste, usados quando o config não informa. */
const ARRASTE = { limiteX: 40, limiteY: 40, elastico: 0.2 };
/** Quanto o cursor puxa o elemento dentro do raio magnético. */
const MAGNETISMO = { deslocamento: 22, rotacao: 11 };

export default function ElementoAnimado({
  elemento,
  carregamentoImediato = false,
  depuracao = false,
}: Props) {
  const { id, src, alt, posicao, posicaoEmImagem, zIndex, animacao, arrastavel } = elemento;

  const referencia = useRef<HTMLDivElement>(null);
  const somenteTransform = useReducedMotion();

  /*
   * Proporção real da imagem, lida no onLoad do próprio <img> — pré-carregar
   * para medir quebraria o loading="lazy". Assim a caixa já nasce com a altura
   * certa e o width/height exposto no HTML fica correto.
   */
  const [tamanho, setTamanho] = useState<Tamanho>();
  const aoCarregar = (evento: SyntheticEvent<HTMLImageElement>) => {
    const img = evento.currentTarget;
    setTamanho({ largura: img.naturalWidth, altura: img.naturalHeight });
  };

  /* ====================================================================== *
   *  ARRASTÁVEL                                                            *
   * ====================================================================== */
  const podeArrastar = Boolean(arrastavel?.ativo) && !somenteTransform;
  const limiteX = padrao(arrastavel?.limite?.x, ARRASTE.limiteX);
  const limiteY = padrao(arrastavel?.limite?.y, ARRASTE.limiteY);
  const elastico = padrao(arrastavel?.elastico, ARRASTE.elastico);
  const magnetico = arrastavel?.magnetico;

  // Magnetismo só em telas com mouse de verdade (pointer: fine).
  const [temMouse, setTemMouse] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const atualizar = () => setTemMouse(mq.matches);
    atualizar();
    mq.addEventListener("change", atualizar);
    return () => mq.removeEventListener("change", atualizar);
  }, []);
  const usarMagnetismo = Boolean(podeArrastar && magnetico && temMouse);

  const arrastarX = useMotionValue(0);
  const arrastarY = useMotionValue(0);
  /** 0 = apoiado na página, 1 = levantando durante o arraste. */
  const levantar = useMotionValue(0);
  const arrastando = useRef(false);
  const [sombraAtiva, setSombraAtiva] = useState(false);

  // Sombra: cresce e escurece enquanto o elemento está no ar.
  // (hooks no topo do componente, nunca dentro do JSX)
  const sombraEscala = useTransform(levantar, [0, 1], [0.8, 1]);
  const sombraOpacidade = useTransform(levantar, [0, 1], [0.2, 0.6]);

  const aoSoltar = () => {
    arrastando.current = false;
    setSombraAtiva(false);
    destravarScroll();
    // Mola devolvendo o elemento E a sombra, no mesmo tempo.
    animate(arrastarX, 0, SPRING.arraste);
    animate(arrastarY, 0, SPRING.arraste);
    animate(levantar, 0, SPRING.arraste);
  };

  /* ====================================================================== *
   *  SCROLL (scrub)                                                        *
   * ====================================================================== */
  const progressoBruto = useScroll({
    target: referencia,
    offset: SCROLL.janela,
  }).scrollYProgress;

  // Amortece o scroll para o movimento não ficar robótico.
  const progressoSuave = useSpring(progressoBruto, {
    stiffness: SCROLL.suavizacao,
    damping: 30,
    restDelta: 0.0005,
  });

  /*
   * Durante o arraste a animação de scroll fica PAUSADA, para não competir com
   * o gesto. Como motion values são reavaliados a cada scroll, devolver o valor
   * guardado aqui é o suficiente para congelar tudo que depende do progresso.
   */
  const scrollTravado = useRef(false);
  const valorTravado = useRef<number | null>(null);

  const travarScroll = () => {
    valorTravado.current = progressoSuave.get();
    scrollTravado.current = true;
  };
  const destravarScroll = () => {
    scrollTravado.current = false;
    valorTravado.current = null;
  };

  const progresso = useTransform(progressoSuave, (atual) =>
    scrollTravado.current ? (valorTravado.current ?? atual) : atual,
  );

  /* ====================================================================== *
   *  VALORES DA ANIMAÇÃO (config > padrão global)                           *
   * ====================================================================== */
  const rotacao = padrao(animacao.rotacao, PADROES_ANIMACAO.rotacao);
  const escala = padrao(animacao.escala, PADROES_ANIMACAO.escala);
  const deslocamento = padrao(animacao.deslocamento, PADROES_ANIMACAO.deslocamento);
  const balanco = padrao(animacao.balancoContinuo, PADROES_ANIMACAO.balancoContinuo);
  const temFade = padrao(animacao.fade, PADROES_ANIMACAO.fade);
  const duracao = padrao(animacao.duracao, PADROES_ANIMACAO.duracao);
  const atraso = padrao(animacao.delay, PADROES_ANIMACAO.delay);
  const easing = padrao(animacao.easing, PADROES_ANIMACAO.easing);
  const camada = padrao(zIndex, PADROES_ANIMACAO.zIndex);

  const isScroll = animacao.tipo === "scroll";

  const [entradaDe, entradaAte] = SCROLL.fadeEntrada;
  const [saidaDe, saidaAte] = SCROLL.fadeSaida;
  const opacidade = useTransform(progresso, [entradaDe, entradaAte, saidaDe, saidaAte], [0, 1, 1, 0]);
  const moverX = useTransform(progresso, [0, 1], [deslocamento.x ?? 0, 0]);
  const moverY = useTransform(progresso, [0, 1], [deslocamento.y ?? 0, 0]);
  const girar = useTransform(
    progresso,
    [0, 1],
    [somenteTransform ? 0 : rotacao.de, somenteTransform ? 0 : rotacao.para],
  );
  const crescer = useTransform(
    progresso,
    [0, 1],
    [somenteTransform ? 1 : escala.de, somenteTransform ? 1 : escala.para],
  );

  const estadoInicial = {
    opacity: !temFade || somenteTransform ? 1 : 0,
    x: somenteTransform ? 0 : deslocamento.x ?? 0,
    y: somenteTransform ? 0 : deslocamento.y ?? 0,
    rotate: somenteTransform ? 0 : rotacao.de,
    scale: somenteTransform ? 1 : escala.de,
  };
  const estadoFinal = {
    opacity: 1,
    x: 0,
    y: 0,
    rotate: somenteTransform ? 0 : rotacao.para,
    scale: somenteTransform ? 1 : escala.para,
  };

  /*
   * Balanço contínuo em loop perfeito.
   *
   * Para não ter emenda o keyframe PRECISA voltar ao valor inicial:
   *   [repouso, repouso + graus, repouso]
   * começa e termina no mesmo ângulo, e o easeInOut zera a velocidade nas
   * pontas — o reinício do ciclo fica indistinguível do movimento.
   * Em "entrada" o repouso é o ângulo final da entrada; em "scroll" o wrapper
   * já gira com o scroll, então o img balança em torno de 0 e os transforms se
   * multiplicam.
   */
  const repouso = isScroll ? 0 : estadoFinal.rotate;
  const balancoAnimacao =
    balanco && !somenteTransform
      ? {
          rotate: [repouso, repouso + balanco.graus, repouso],
          transition: {
            duration: balanco.duracao,
            ease: "easeInOut" as const,
            repeat: Infinity,
            delay: isScroll ? 0 : duracao + atraso,
          },
        }
      : undefined;

  /* ====================================================================== *
   *  EFEITO MAGNÉTICO                                                      *
   *  O cursor atrai o elemento quando entra no raio. O spring deixa o       *
   *  movimento macio tanto na ida quanto na volta.                         *
   * ====================================================================== */
  const ux = useMotionValue(0);
  const uy = useMotionValue(0);
  const ur = useMotionValue(0);
  const magnetX = useSpring(ux, SPRING.magnetismo);
  const magnetY = useSpring(uy, SPRING.magnetismo);
  const magnetR = useSpring(ur, SPRING.magnetismo);

  useEffect(() => {
    if (!usarMagnetismo || !magnetico) return;
    const el = referencia.current;
    if (!el) return;

    // Cache do retângulo: evita layout forçado a cada movimento do mouse.
    let rect = el.getBoundingClientRect();
    let agendado = 0;
    const medir = () => {
      agendado = 0;
      rect = el.getBoundingClientRect();
    };
    const agendar = () => {
      if (!agendado) agendado = requestAnimationFrame(medir);
    };
    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", agendar);
    medir();

    let dentro = false;
    const aoMover = (evento: PointerEvent) => {
      if (evento.pointerType !== "mouse") return;
      const dx = evento.clientX - (rect.left + rect.width / 2);
      const dy = evento.clientY - (rect.top + rect.height / 2);
      const distancia = Math.hypot(dx, dy);

      if (distancia > magnetico.raio) {
        if (dentro) {
          dentro = false;
          ux.set(0);
          uy.set(0);
          ur.set(0);
        }
        return;
      }

      dentro = true;
      // Atração máxima no centro, nenhuma na borda do raio.
      const forca = (1 - distancia / magnetico.raio) * magnetico.intensidade;
      ux.set((dx / magnetico.raio) * MAGNETISMO.deslocamento * forca);
      uy.set((dy / magnetico.raio) * MAGNETISMO.deslocamento * forca);
      ur.set((dx / magnetico.raio) * MAGNETISMO.rotacao * forca);
    };

    window.addEventListener("pointermove", aoMover, { passive: true });
    return () => {
      window.removeEventListener("scroll", agendar);
      window.removeEventListener("resize", agendar);
      window.removeEventListener("pointermove", aoMover);
      if (agendado) cancelAnimationFrame(agendado);
      ux.set(0);
      uy.set(0);
      ur.set(0);
    };
  }, [usarMagnetismo, magnetico, ux, uy, ur]);

  /* ====================================================================== *
   *  CAMADA DA IMAGEM (com magnetismo e balanço)                            *
   * ====================================================================== */
  const imagem = (
    <motion.img
      className="elemento__imagem"
      src={src}
      alt={alt}
      width={tamanho?.largura}
      height={tamanho?.altura}
      loading={carregamentoImediato ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      onLoad={aoCarregar}
      style={{
        width: "100%",
        height: "auto",
        aspectRatio: tamanho ? `${tamanho.largura} / ${tamanho.altura}` : undefined,
      }}
      animate={balancoAnimacao}
    />
  );

  const camadaImagem = (
    <motion.div
      className="elemento__magnetico"
      style={usarMagnetismo ? { x: magnetX, y: magnetY, rotate: magnetR } : undefined}
    >
      {podeArrastar ? (
        /* Sombra = cópia desfocada da imagem que cresce e escurece no arraste.
           Só transform e opacity são animados; o blur é fixo. */
        <motion.img
          className="elemento__sombra"
          src={src}
          alt=""
          aria-hidden="true"
          draggable={false}
          style={{
            width: "100%",
            aspectRatio: tamanho ? `${tamanho.largura} / ${tamanho.altura}` : undefined,
            translateY: 12,
            scale: sombraEscala,
            opacity: sombraOpacidade,
          }}
        />
      ) : null}
      {imagem}
    </motion.div>
  );

  const camadaAnimacao = (
    <motion.div
      className="elemento__animacao"
      style={
        isScroll
          ? {
              // Com "menos movimento" o elemento fica parado e sempre visível:
              // um fade junto com o scrub faria ele sumir sem se mover.
              opacity: temFade && !somenteTransform ? opacidade : 1,
              x: somenteTransform ? 0 : moverX,
              y: somenteTransform ? 0 : moverY,
              rotate: girar,
              scale: crescer,
            }
          : undefined
      }
      initial={isScroll ? false : estadoInicial}
      whileInView={isScroll ? undefined : estadoFinal}
      viewport={isScroll ? undefined : { once: true, amount: 0.35, margin: "0px 0px -10% 0px" }}
      transition={
        isScroll
          ? undefined
          : {
              duration: somenteTransform ? 0 : duracao,
              delay: somenteTransform ? 0 : atraso,
              ease: easing,
            }
      }
    >
      {camadaImagem}
    </motion.div>
  );

  return (
    <div
      ref={referencia}
      id={id}
      className="elemento"
      data-debug={depuracao ? "elemento" : undefined}
      data-arrastando={sombraAtiva ? "sim" : undefined}
      style={{ left: posicao.left, top: posicao.top, width: posicao.width, zIndex: camada }}
    >
      <div
        className="elemento__ajuste"
        style={{
          top: posicaoEmImagem?.top ?? "0%",
          left: posicaoEmImagem?.left ?? "0%",
          width: posicaoEmImagem?.width ?? "100%",
        }}
      >
        {podeArrastar ? (
          /* CAMADA 1 — arraste (x, y). Fica acima da animação para os dois
             transforms se multiplicarem em vez de brigarem pelo mesmo eixo. */
          <motion.div
            className="elemento__arrasto"
            style={{ x: arrastarX, y: arrastarY }}
            drag
            dragConstraints={{ left: -limiteX, right: limiteX, top: -limiteY, bottom: limiteY }}
            dragElastic={elastico}
            dragMomentum={false}
            onDragStart={() => {
              arrastando.current = true;
              setSombraAtiva(true);
              travarScroll();
              animate(levantar, 1, { duration: 0.3, ease: "easeOut" });
            }}
            onDragEnd={aoSoltar}
          >
            {camadaAnimacao}
          </motion.div>
        ) : (
          camadaAnimacao
        )}

        {depuracao ? (
          <span className="elemento__debug" aria-hidden="true">
            {id}
            <br />
            left {posicao.left} · top {posicao.top} · w {posicao.width}
            {posicaoEmImagem?.top ? ` · img-top ${posicaoEmImagem.top}` : ""}
            <br />
            {animacao.tipo}
            {` · rot ${rotacao.de}→${rotacao.para}`}
            {` · esc ${escala.de}→${escala.para}`}
            {` · dy ${deslocamento.y ?? 0}`}
            {podeArrastar ? ` · ARRASTÁVEL ±${limiteX}/${limiteY}` : ""}
            {usarMagnetismo ? ` · MAGNÉTICO r${magnetico?.raio}` : ""}
          </span>
        ) : null}
      </div>
    </div>
  );
}
