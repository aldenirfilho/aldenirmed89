# AldenirMed89 | Laranja Mecânica | Hepatite associada ao álcool

Módulo clínico estático, responsivo e integrado à rota pública do AldenirMed89.

## Versão 2.1

- Conteúdo clínico: diagnóstico NIAAA, fisiopatologia, prednisolona, suporte, complicações, STASH 2025 e CORTISAVE 2026.
- Cinco calculadoras educacionais: Maddrey, MELD/MELD-Na, ABIC, GAHS e Lille.
- Série visual Turbo TEMI 360 X com 10 mapas vetoriais widescreen 16:9.
- Bloco destacado na página principal, no menu, no elenco de módulos e no rodapé.
- Atlas posicionado logo no início do módulo, com âncoras diretas.
- Galeria com filtros, abertura ampliada e download individual em SVG.
- Gráficos produzidos localmente pelo `app.js`, sem buscar imagens ou bibliotecas externas.

## Recibo de descoberta e publicação

- Bloco estático inserido na homepage em 04/09/2026.
- Atalhos incluídos no menu superior, hero, tópicos, elenco de módulos e rodapé.
- Arquivos HAA incluídos no aquecimento do PWA, preservando o contrato de cache `v28` exigido pela suíte de regressão.
- Esta atualização funciona como gatilho verificável do deploy final no GitHub Pages.

## Arquivos

- `index.html`: conteúdo canônico, fluxo de decisão e referências.
- `styles.css`: identidade Laranja Mecânica, responsividade, acessibilidade e impressão.
- `app.js`: calculadoras, hierarquia dos escores e geração do atlas SVG.
- `module.manifest.json`: versão, metadados, segurança, série visual e manutenção.

## Rota pública

`/aldenirmed89/01_Modulos_Clinicos/Hepatite_Alcool_Associada/`

O módulo está ligado ao card da página inicial e aos manifestos canônicos do AldenirMed89.

## Segurança

Apoio educacional para profissionais de saúde. Validar diagnóstico, fórmulas, unidades, contraindicações, dose e protocolo institucional antes da prescrição. A página não armazena nem transmite os valores inseridos nas calculadoras. O texto canônico e as calculadoras institucionais prevalecem sobre as sínteses visuais.
