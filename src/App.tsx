import { useState } from "react";
import Bloco from "./components/Bloco";
import Navbar from "./components/Navbar";
import Sumario from "./components/Sumario";
import BarraProgresso from "./components/BarraProgresso";
import BotaoVoltarTopo from "./components/BotaoVoltarTopo";
import { ConfigProvider } from "./context/ConfigContext";
import { INFOGRAFICO } from "./config/infografico";
import { lerFlagDaUrl } from "./config/constantes";

export default function App() {
  // /?debug=true mostra bordas tracejadas, ids e coordenadas de cada elemento.
  const [depuracao] = useState(() => lerFlagDaUrl("debug"));

  return (
    <ConfigProvider>
      <Navbar />
      <BarraProgresso />
      <Sumario />

      <main className={`pagina${depuracao ? " pagina--debug" : ""}`}>
        {/*
          Coluna de leitura centralizada: o conteúdo fica no meio e sobram barras
          nas laterais, o que ajuda a ler o infográfico em telas largas.
          Troque max-w-[800px] por outro valor (ex.: max-w-6xl) quando quiser.
        */}
        <div className="mx-auto w-full max-w-[800px]">
          {INFOGRAFICO.map((bloco, indice) => (
            <Bloco
              key={bloco.id}
              bloco={bloco}
              primeiro={indice === 0}
              depuracao={depuracao}
            />
          ))}
        </div>

        {depuracao ? (
          <span className="aviso-debug" aria-hidden="true">
            MODO DEPURAÇÃO — bordas tracejadas, ids e left/top/width de cada elemento
          </span>
        ) : null}
      </main>

      <BotaoVoltarTopo />
    </ConfigProvider>
  );
}
