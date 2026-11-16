# Logotipo AldenirMed 360X (16/11/2026)

Evolução do emblema orbital original (A branco, órbita ciano e ponto âmbar) para a marca **AldenirMed 360X**: a órbita fecha os 360°, o núcleo ganha uma cruz clínica e a placa obsidiana recebe filete dourado.

| Arquivo | Uso |
|---|---|
| `aldenirmed-360x-mark.svg` | Emblema (cabeçalho, rodapé, páginas novas) |
| `aldenirmed-360x-logo.svg` / `.png` | Logotipo horizontal para fundo escuro |
| `aldenirmed-360x-logo-claro.svg` / `.png` | Logotipo horizontal para fundo claro e impressão |
| `icons/aldenirmed-360x-{32,180,192,512,1024}.png` | Renderizações do emblema para usos futuros |
| `aldenirmed-360x-launch-card.svg` / `.png` | Cartão de lançamento 1200×630 do Portal de missão (abertura da página inicial) |

- Desenho vetorial autoral, sem fontes embutidas nem scripts; PNGs gerados com `rsvg-convert`.
- O ícone do aplicativo instalado (PWA) e o favicon continuam no pacote original `assets/icons/aerospace-v2/`, protegido por proveniência e SHA-256. A troca desse pacote é uma etapa separada.

## Abertura · Portal de missão 360X

- A abertura da página inicial usa o cartão `aldenirmed-360x-launch-card.png`, o emblema `aldenirmed-360x-mark.svg` no núcleo da decolagem e `icons/aldenirmed-360x-192.png` no botão de repetir a abertura.
- Renderização do cartão: `rsvg-convert -w 1200 -h 630 aldenirmed-360x-launch-card.svg -o aldenirmed-360x-launch-card.png`, mantendo só os blocos IHDR, IDAT e IEND (sem metadados).
- O cartão aeroespacial antigo (`assets/brand/aldenirmed89-aerospace-launch-card.png`) permanece no acervo porque outras páginas ainda o usam.
