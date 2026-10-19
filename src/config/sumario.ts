/**
 * ============================================================================
 *  SUMÁRIO LATERAL — ARQUIVO DE CONFIGURAÇÃO
 * ============================================================================
 *
 *  É só aqui que você mexe para adicionar, remover ou reordenar os itens.
 *  O componente <Sumario /> apenas percorre o array.
 *
 *  ---------------------------------------------------------------------------
 *  COMO ADICIONAR UM ITEM
 *  ---------------------------------------------------------------------------
 *      export const sumario: ItemSumario[] = [
 *        { id: "item-1", label: "Introdução", scrollPara: "bloco-1" },
 *        { id: "item-2", label: "Gráfico",    scrollPara: "b2-grafico" },
 *        { id: "item-3", label: "Rodapé",     scrollPara: 2400 },   // px
 *      ];
 *
 *  ---------------------------------------------------------------------------
 *  scrollPara aceita duas coisas
 *  ---------------------------------------------------------------------------
 *    string -> o id de um BLOCO ou de um ELEMENTO. A posição é calculada
 *               sozinha com getElementById + getBoundingClientRect, então
 *               continua certa mesmo se a largura da tela mudar.
 *               Use o `id` do bloco (definido em infografico.ts) ou o `id` do
 *               elemento.
 *
 *    number -> posição em pixels a partir do topo da página.
 *               Útil para "voltar ao topo" (0) ou para um ponto exato.
 *
 *  ---------------------------------------------------------------------------
 *  SCROLL SPY
 *  ---------------------------------------------------------------------------
 *  O item cujo destino já passou da posição de leitura fica marcado como
 *  ativo automaticamente. Ao clicar, o item é travado como ativo até chegar
 *  no destino, para não piscar para outro item no meio do caminho.
 *
 * ============================================================================
 */

export type ItemSumario = {
  /** Identificador único do item. */
  id: string;
  /** Texto exibido no sumário. */
  label: string;
  /** Posição em px, OU o id de um bloco/elemento para calcular sozinho. */
  scrollPara: number | string;
};

/** Lista de itens do sumário, na ordem em que aparecem. */
export const sumario: ItemSumario[] = [
  { id: "sumario-bloco-1", label: "Chegou Agora?", scrollPara: "bloco-1" },
  { id: "sumario-altofalante", label: "Copilot", scrollPara: 200 },
  { id: "sumario-bloco-2", label: "Portal de Serviços", scrollPara: "bloco-2" },
  { id: "sumario-bloco-3", label: "Incidente x Requisição", scrollPara: 1150 },
  { id: "sumario-bloco-3.1", label: "Segurança Sites", scrollPara: 1550 },
  { id: "sumario-bloco-3.2", label: "Microsoft 365", scrollPara: 1950 },
  { id: "sumario-bloco-3.3", label: "Recuperação Dados", scrollPara: 2200 },
  { id: "sumario-bloco-3.4", label: "Troca de Senha", scrollPara: 2650 },
  { id: "sumario-bloco-3.5", label: "VPN e Liberação Site", scrollPara: 3000 },
  { id: "sumario-bloco-3.6", label: "Rotulagem Arquivo/Email", scrollPara: 3450 },
  { id: "sumario-bloco-3.7", label: "Assinatura Personalizada", scrollPara: 3950 },
  { id: "sumario-bloco-4", label: "Hacker Ranger", scrollPara: 4430 },
];
