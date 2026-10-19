import ElementoAnimado from "./ElementoAnimado";
import type { Bloco as BlocoConfig } from "../config/infografico";

type Props = {
  bloco: BlocoConfig;
  /** true apenas no primeiro bloco: a primeira imagem carrega sem espera. */
  primeiro?: boolean;
  /** true exibe borda tracejada, ids e coordenadas dos elementos. */
  depuracao?: boolean;
};

export default function Bloco({ bloco, primeiro = false, depuracao = false }: Props) {
  return (
    <section
      /* O id permite o sumário (config/sumario.ts) rolar até este bloco. */
      id={bloco.id}
      className="bloco"
      data-debug={depuracao ? "bloco" : undefined}
      style={bloco.proporcao ? ({ aspectRatio: bloco.proporcao } as React.CSSProperties) : undefined}
      aria-label={bloco.alt || undefined}
    >
      <img
        className="bloco__fundo"
        src={bloco.fundo}
        alt={bloco.alt ?? ""}
        loading={primeiro ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={primeiro ? "high" : "auto"}
        draggable={false}
      />

      <div className="bloco__elementos">
        {bloco.elementos.map((elemento) => (
          <ElementoAnimado
            key={elemento.id}
            elemento={elemento}
            carregamentoImediato={primeiro}
            depuracao={depuracao}
          />
        ))}

        {depuracao ? (
          <span className="bloco__debug" aria-hidden="true">
            {bloco.id} · {bloco.elementos.length} elemento(s) · {bloco.fundo}
          </span>
        ) : null}
      </div>
    </section>
  );
}
