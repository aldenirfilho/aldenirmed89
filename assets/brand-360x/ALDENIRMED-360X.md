# Logotipo AldenirMed 360X (16/11/2026)

Evolução do emblema orbital original (A branco, órbita ciano e ponto âmbar) para a marca **AldenirMed 360X**: a órbita fecha os 360°, o núcleo ganha uma cruz clínica e a placa obsidiana recebe filete dourado.

| Arquivo | Uso |
|---|---|
| `aldenirmed-360x-mark.svg` | Emblema (cabeçalho, rodapé, páginas novas) |
| `aldenirmed-360x-logo.svg` / `.png` | Logotipo horizontal para fundo escuro |
| `aldenirmed-360x-logo-claro.svg` / `.png` | Logotipo horizontal para fundo claro e impressão |
| `icons/aldenirmed-360x-{32,180,192,512,1024}.png` | Renderizações do emblema para usos futuros |
| `aldenirmed-360x-app-icon.svg` | Ícone do aplicativo em sangria total (PWA e iOS aplicam a própria máscara) |
| `aldenirmed-360x-launch-card.svg` / `.png` | Cartão de lançamento 1200×630 do Portal de missão (abertura da página inicial) |

- Desenho vetorial autoral, sem fontes embutidas nem scripts; PNGs gerados com `rsvg-convert`.
- Desde 16/11/2026 o ícone do aplicativo instalado (PWA), os ícones do iPhone/iPad, o favicon e a prévia de compartilhamento usam o pacote `assets/icons/360x-v1/`, gerado por `scripts_admin/build_360x_icon_release.py` a partir de `aldenirmed-360x-mark.svg` (favicon e ícones pequenos) e `aldenirmed-360x-app-icon.svg` (ícone em sangria total). Conferência: `python3 scripts_admin/build_360x_icon_release.py --check`.
- O pacote anterior `assets/icons/aerospace-v2/` continua preservado, com proveniência e SHA-256; no site público, links antigos para ele passam a apontar para o pacote 360X.

## Abertura · Portal de missão 360X

- A abertura da página inicial usa o cartão `aldenirmed-360x-launch-card.png`, o emblema `aldenirmed-360x-mark.svg` no núcleo da decolagem e `icons/aldenirmed-360x-192.png` no botão de repetir a abertura.
- Renderização do cartão: `rsvg-convert -w 1200 -h 630 aldenirmed-360x-launch-card.svg -o aldenirmed-360x-launch-card.png`, mantendo só os blocos IHDR, IDAT e IEND (sem metadados).
- O cartão aeroespacial antigo (`assets/brand/aldenirmed89-aerospace-launch-card.png`) permanece no acervo porque outras páginas ainda o usam.
