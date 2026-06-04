# Patch da homepage — RespiraSense ICU 🫁

## Caminho recomendado

Copie a pasta inteira para a raiz do projeto:

```text
/respirasense-icu/
```

O link final ficará assim:

```text
https://aldenirfilho.github.io/antigravity-consultas/respirasense-icu/index.html
```

## Inserção rápida na página principal

Cole este card na seção de calculadoras/dashboards:

```html
<article class="module-card" data-module="respirasense-icu" data-tags="uti ventilacao mecanica gasometria sara ards rox pf vni cbaf temi">
  <div class="module-card__icon">🫁</div>
  <div class="module-card__body">
    <p class="module-card__kicker">Calculadora • UTI • PWA offline</p>
    <h3>RespiraSense ICU</h3>
    <p>Dashboard de suporte respiratório: oxigenoterapia, CBAF/HFNC, VNI, VM protetora, SARA/ARDS, gasometria, assincronias e snapshots anônimos.</p>
  </div>
  <a class="module-card__cta" href="./respirasense-icu/index.html">Abrir 🫁</a>
</article>
```

## Integração por registro automático

Se sua homepage usar um array/lista de módulos, adicione:

```js
{
  id: "respirasense-icu",
  title: "RespiraSense ICU",
  emoji: "🫁",
  category: "Calculadoras UTI",
  href: "./respirasense-icu/index.html",
  tags: ["UTI", "VM", "Gasometria", "SARA", "ARDS", "ROX", "P/F", "TEMI"],
  status: "PWA offline"
}
```

## Arquivo de metadados

O arquivo `module.manifest.json` foi incluído para permitir que o Antigravity ou outra IA faça integração futura automática com busca, tags e temas correlacionados.
