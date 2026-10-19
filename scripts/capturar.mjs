/**
 * Captura de telas do site via Chrome DevTools Protocol (Edge headless).
 * Sem dependencias: usa o WebSocket nativo do Node.
 *
 * Uso:
 *   node scripts/capturar.mjs --url http://localhost:5173/ --out tmp/a.png --scroll 0
 *   node scripts/capturar.mjs --url "http://localhost:5173/?debug=true" --out tmp/b.png --scroll 1200
 *   node scripts/capturar.mjs --url http://localhost:5173/ --out tmp/c.png --scroll 1600 --reduced-motion
 *   node scripts/capturar.mjs --url http://localhost:5173/ --out tmp/d.png --full
 *   node scripts/capturar.mjs --url http://localhost:5173/ --out tmp/e.png --eval "document.querySelectorAll('.elemento')[0].style.width='120%'"
 */
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORTA = 9333;

function arg(nome, padrao) {
  const i = process.argv.indexOf(`--${nome}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : padrao;
}
const temFlag = (n) => process.argv.includes(`--${n}`);

const url = arg("url", "http://localhost:5173/");
const out = resolve(arg("out", "tmp/screenshot.png"));
const scroll = Number(arg("scroll", "0"));
const largura = Number(arg("width", "1440"));
const altura = Number(arg("height", "900"));
const fullPage = temFlag("full");
const reduzido = temFlag("reduced-motion");

// O perfil do Edge fica FORA do projeto: dentro dele, o Vite tentaria
// observar os arquivos do perfil e o watcher trava com EBUSY.
const perfil = join(tmpdir(), "edge-headless-infografico");
mkdirSync(dirname(out), { recursive: true });
mkdirSync(perfil, { recursive: true });

const args = [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  "--no-first-run",
  "--no-default-browser-check",
  "--disable-extensions",
  `--remote-debugging-port=${PORTA}`,
  `--user-data-dir=${perfil}`,
  `--window-size=${largura},${altura}`,
  "about:blank",
];
if (reduzido) args.push("--force-prefers-reduced-motion");

const edge = spawn(EDGE, args, { stdio: "ignore" });
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

async function alvo() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORTA}/json/list`);
      const lista = await r.json();
      const pagina = lista.find((t) => t.type === "page");
      if (pagina?.webSocketDebuggerUrl) return pagina.webSocketDebuggerUrl;
    } catch {
      /* ainda subindo */
    }
    await dormir(250);
  }
  throw new Error("Edge headless nao respondeu na porta de depuracao.");
}

const ws = new WebSocket(await alvo());
await new Promise((r) => (ws.onopen = r));

let id = 0;
const pendentes = new Map();
const eventos = [];
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pendentes.has(msg.id)) {
    const { resolve: res, reject } = pendentes.get(msg.id);
    pendentes.delete(msg.id);
    msg.error ? reject(new Error(JSON.stringify(msg.error))) : res(msg.result);
  } else if (msg.method) {
    eventos.push(msg.method);
    if (msg.method === "Runtime.consoleAPICalled" && msg.params.type !== "log") {
      console.log(
        `[console.${msg.params.type}] ${msg.params.args.map((a) => a.value ?? a.description ?? "").join(" ")}`,
      );
    }
    if (msg.method === "Runtime.exceptionThrown") {
      const d = msg.params.exceptionDetails;
      console.log(`[erro] ${d.exception?.description ?? d.text}`);
    }
    if (msg.method === "Log.entryAdded" && msg.params.entry.level === "error") {
      console.log(`[log] ${msg.params.entry.text} ${msg.params.entry.url ?? ""}`);
    }
  }
};

function cdp(method, params = {}) {
  const meu = ++id;
  ws.send(JSON.stringify({ id: meu, method, params }));
  return new Promise((res, rej) => pendentes.set(meu, { resolve: res, reject: rej }));
}

await cdp("Page.enable");
await cdp("Runtime.enable");
await cdp("Log.enable");
await cdp("Emulation.setDeviceMetricsOverride", {
  width: largura,
  height: altura,
  deviceScaleFactor: 1,
  mobile: false,
});

const carregado = new Promise((res) => {
  const intervalo = setInterval(() => {
    if (eventos.includes("Page.loadEventFired")) {
      clearInterval(intervalo);
      res();
    }
  }, 60);
  setTimeout(() => {
    clearInterval(intervalo);
    res();
  }, 15000);
});

await cdp("Page.navigate", { url });
await carregado;
await dormir(1200); // fontes/imagens e o primeiro paint das animacoes

// Deixa a animacao de entrada concluir antes de capturar.
await cdp("Runtime.evaluate", { expression: "window.scrollTo(0, 0)" });
await dormir(150);

if (scroll > 0) {
  await cdp("Runtime.evaluate", {
    expression: `window.scrollTo({ top: ${scroll}, behavior: "instant" })`,
  });
  await dormir(1600); // espera o mola do useSpring assentar
}

// JavaScript opcional para testar um cenario antes da captura.
// --eval "expressao"   ou   --evalFile caminho\para\arquivo.js
const arquivoEval = arg("evalFile", "");
const expr = arquivoEval ? readFileSync(resolve(arquivoEval), "utf8") : arg("eval", "");
if (expr) {
  const r = await cdp("Runtime.evaluate", { expression: expr, returnByValue: true });
  const v = r?.result?.value;
  console.log(`eval -> ${v !== undefined ? v : JSON.stringify(r)}`);
}

// Segunda fase: roda depois de --eval2Delay ms. Útil para medir animações,
// que precisam de tempo para começar.
const expr2 = arg("eval2File", "") ? readFileSync(resolve(arg("eval2File", "")), "utf8") : "";
if (expr2) {
  await dormir(Number(arg("eval2Delay", "1000")));
  const r = await cdp("Runtime.evaluate", { expression: expr2, returnByValue: true });
  const v = r?.result?.value;
  console.log(`eval2 -> ${v !== undefined ? v : JSON.stringify(r)}`);
}

await dormir(500);

const dimensoes = await cdp("Runtime.evaluate", {
  expression: "JSON.stringify({h: document.documentElement.scrollHeight, w: document.documentElement.scrollWidth, c: document.documentElement.clientWidth})",
  returnByValue: true,
});

let captura = { format: "png" };
if (fullPage) {
  const { h } = JSON.parse(dimensoes.result.value);
  await cdp("Emulation.setDeviceMetricsOverride", {
    width: largura,
    height: Math.min(h, 20000),
    deviceScaleFactor: 1,
    mobile: false,
  });
  await dormir(700);
  captura = await cdp("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
} else {
  captura = await cdp("Page.captureScreenshot", { format: "png" });
}

writeFileSync(out, Buffer.from(captura.data, "base64"));
console.log(`OK -> ${out}`);
console.log(`pagina: ${dimensoes.result.value}`);

ws.close();
edge.kill();
process.exit(0);
