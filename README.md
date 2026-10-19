# Site de apresentação de infográfico (página única, animado pelo scroll)

Página única com rolagem vertical onde **todo o visual vem de imagens** (PNG/JPG/WebP).
O código apenas **posiciona e anima** essas imagens. Nenhum texto, título, forma ou logo
é redesenhado em HTML/CSS/SVG.

## Stack

- React 19 + Vite 8
- TypeScript
- Tailwind CSS 4 (para estilos novos — as classes do infográfico continuam em `index.css`)
- Framer Motion (`useScroll`, `useTransform`, `whileInView`, `useReducedMotion`)
- Sem backend

## Comandos

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + build de produção
npm run preview    # serve o dist
```

## Onde trocar as imagens

```
/public/blocos/     -> fundos dos blocos        (bloco-1.png, bloco-2.png, ...)
/public/elementos/  -> PNG sobrepostos, fundo transparente
```

Basta sobrescrever os arquivos com os seus e atualizar o caminho em
`src/config/infografico.ts`. As imagens de exemplo (retângulos com borda tracejada
e o nome do arquivo) existem só para você ver o resultado funcionando.

> Ao trocar o fundo de um bloco, atualize também `proporcao` para a proporção real
> da imagem (`largura/altura`). É o que evita a página "pular" enquanto carrega.

## Onde mexer: UM arquivo só

`src/config/infografico.ts`

- `INFOGRAFICO` — a lista de blocos, na ordem vertical da página.
- `PADROES_ANIMACAO` — valores padrão de animação (rotação leve, fade, easing).
  Todo elemento que não sobrescrever um campo usa este valor.
- `SCROLL` — suavização e janela do scrub.
- O topo do arquivo tem um comentário com exemplo de bloco e de elemento.

Para adicionar, remover ou reordenar blocos, basta editar esse arquivo.
Nenhum componente precisa ser tocado.

## Como posicionar

```ts
posicao: { left: "8%", top: "18%", width: "52%" }
```

`left`, `top` e `width` são **porcentagem do bloco**, então o layout é idêntico
em qualquer tamanho de tela. A altura do elemento acompanha a proporção da imagem.

Se a sua PNG já vier com margem transparente, use o ajuste fino para mexer só no
desenho e manter a caixa no lugar (muito útil para centralizar):

```ts
posicao: { left: "40%", top: "10%", width: "20%" },
posicaoEmImagem: { top: "15%" },   // % do próprio elemento
```

## Como animar

| tipo      | o que faz                                                          |
| --------- | ------------------------------------------------------------------ |
| `scroll`  | o elemento se move **enquanto o bloco atravessa a tela** (scrub)  |
| `entrada` | dispara **uma única vez** quando o elemento entra na tela         |

Campos opcionais: `fade`, `rotacao: { de, para }`, `escala: { de, para }`,
`deslocamento: { x, y }`, `balancoContinuo: { graus, duracao }`,
`duracao`, `delay`, `easing`.

Em `scroll`, `duracao`/`delay`/`easing` não se aplicam — o percurso é o próprio
scroll. Para mudar o movimento, ajuste os valores `de`/`para` ou `SCROLL.janela`.

### Balanço contínuo (loop sem emenda)

```ts
balancoContinuo: { graus: 5, duracao: 3 }
```

O elemento balança de um lado para o outro e repete para sempre. O loop é
perfeito de verdade: ele sai do ângulo de descanso (o mesmo em que a animação de
entrada terminou), vai até `graus` de lado e **volta para o ângulo de descanso**.
Como o easing `easeInOut` zera a velocidade nas pontas, o reinício do ciclo é
indistinguível do movimento — não tem emenda nem solavanco.

Medido no altofalante do `bloco-1` (amplitude 5°, período 3s): comparando o mesmo
instante do ciclo com um período depois, a diferença máxima é de **0,1°** e a
média de **0,016°** (só jitter da amostragem). O maior salto de ângulo entre duas
amostras ocorre no meio do ciclo (6,6°/s, exatamente o pico teórico do easeInOut)
e **não** na virada do ciclo.

O balanço roda no `<img>`, separado do `transform` da camada de animação, então
funciona tanto em elementos `entrada` quanto em `scroll` sem os dois brigarem.

## Largura da coluna de leitura

O conteúdo é limitado a 800px e centralizado, sobrando barras nas laterais para
facilitar a leitura em telas largas. Está em `src/App.tsx`:

```tsx
<div className="mx-auto w-full max-w-[800px]">
```

Troque por outro valor quando quiser (`max-w-[1100px]`, `max-w-6xl`, etc.).
Os elementos são posicionados em % do bloco, então mudar isso não quebra nenhum
ajuste feito no config.

## Tailwind

O Tailwind está instalado e pronto para uso. O CSS do infográfico continua em
`src/index.css` (dentro de `@layer base` e `@layer components`, justamente para
que as utilitárias tenham prioridade sobre essas classes). Na prática, é só usar
classes utilitárias onde for mais prático, sem mexer no CSS existente:

```tsx
<div className="mx-auto w-full max-w-[800px]">
<div className="absolute inset-0 pointer-events-none">
```

## Modo de depuração

Abra com `/?debug=true` para ver:

- borda tracejada em cada bloco (rosa) e em cada elemento (ciano);
- o `id` do elemento e os valores de `left`, `top` e `width`;
- o tipo de animação e os valores de rotação, escala e deslocamento.

Ajuste os números no config até bater com o desenho e pronto.

## Detalhes já resolvidos

- `prefers-reduced-motion`: sem rotação, sem deslocamento, sem escala e sem fade —
  o conteúdo fica sempre visível e estático.
- Sem barra de rolagem horizontal: `overflow-x: clip` no container e em cada bloco,
  então elemento que ultrapassa a lateral é cortado.
- `loading="lazy"` em todas as imagens, exceto as do primeiro bloco
  (que usam `eager` + `fetchpriority="high"`).
- Blocos empilhados sem espaçamento, com a proporção natural da imagem preservada
  (sem corte e sem distorção).
- `proporcao: "largura/altura"` reserva o espaço da imagem e evita a página "pular"
  enquanto ela carrega. Se não existir, é usada a proporção natural do arquivo.
- O `width`/`height` real da imagem é lido no `onLoad` (e não antes, para não
  quebrar o `loading="lazy"`), então a caixa do elemento tem a altura certa e as
  dimensões expostas no HTML ficam corretas.

## Scripts auxiliares (opcionais)

```bash
# regera as imagens placeholder
powershell -ExecutionPolicy Bypass -File .\scripts\gerar-placeholders.ps1

# captura de tela via Edge headless (útil para conferir sem abrir o navegador)
node .\scripts\capturar.mjs --url "http://localhost:5173/?debug=true" --out tmp\debug.png --scroll 300

# mede se um balanço contínuo está com loop perfeito (amostra o ângulo por 7s)
node .\scripts\capturar.mjs --url http://localhost:5173/ --out tmp\x.png --evalFile medir.js --eval2File ler.js --eval2Delay 9000
```
