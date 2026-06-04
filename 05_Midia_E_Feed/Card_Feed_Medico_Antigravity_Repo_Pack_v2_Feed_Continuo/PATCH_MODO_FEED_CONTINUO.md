# Patch — Modo Feed Contínuo estilo Instagram/X 📲

## Objetivo

Adicionar ao módulo `06_Card_Feed_Medico/index.html` um modo de rolagem contínua, com cards/imagens em coluna única, um abaixo do outro, preservando o modo grade.

## Resultado esperado

Botão novo:

```html
<button class="btn" id="btnFeedMode">📲 Feed contínuo</button>
<span class="view-mode-indicator" id="viewModeIndicator">▦ Grade</span>
```

Comportamento:

- ao clicar em `📲 Feed contínuo`, o body recebe a classe `feed-continuous`;
- o feed deixa de usar colunas e vira `flex-column`;
- cards ficam centralizados, largura máxima ~680px;
- imagens aparecem em sequência vertical;
- comentários permanecem abaixo de cada imagem;
- a preferência é salva em `localStorage`.

## CSS essencial

```css
body.feed-continuous .wrap {
  width: min(760px, calc(100% - 18px));
}

body.feed-continuous .feed {
  columns: unset;
  column-gap: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: min(680px, 100%);
  margin: 0 auto;
}

body.feed-continuous .card {
  width: 100%;
  margin: 0 0 16px;
  break-inside: auto;
  border-radius: 26px;
}

body.feed-continuous .imgbox {
  min-height: unset;
  background: #020617;
}

body.feed-continuous .imgbox img {
  width: 100%;
  height: auto;
  max-height: none;
  object-fit: contain;
}
```

## JS essencial

```js
let viewMode = localStorage.getItem("cardFeedViewMode") || "grid";

function applyViewMode() {
  const isContinuous = viewMode === "continuous";
  document.body.classList.toggle("feed-continuous", isContinuous);
  const btn = $("btnFeedMode");
  const indicator = $("viewModeIndicator");
  if (btn) btn.textContent = isContinuous ? "▦ Modo grade" : "📲 Feed contínuo";
  if (indicator) indicator.textContent = isContinuous ? "📲 Feed contínuo" : "▦ Grade";
  localStorage.setItem("cardFeedViewMode", viewMode);
}

function toggleViewMode() {
  viewMode = viewMode === "continuous" ? "grid" : "continuous";
  applyViewMode();
  window.scrollTo({ top: 0, behavior: "smooth" });
  toast(viewMode === "continuous" ? "📲 Modo Feed Contínuo ativado." : "▦ Modo Grade ativado.");
}
```

No `wire()`:

```js
$("btnFeedMode").onclick = toggleViewMode;
```

No início do `render()`:

```js
applyViewMode();
```

## Teste

- Abrir a página.
- Clicar em `📲 Feed contínuo`.
- Confirmar coluna única.
- Clicar em `▦ Modo grade`.
- Confirmar retorno às colunas.
