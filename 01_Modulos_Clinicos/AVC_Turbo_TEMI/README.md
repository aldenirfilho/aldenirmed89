# AVC agudo — Turbo TEMI (edição 1.1)

Módulo estático e interativo sobre AVC isquêmico, hemorragia intracerebral e
hemorragia subaracnóidea: primeiros minutos, reperfusão, controle pressórico,
reversão de anticoagulação, HSA e vasoespasmo, escalas, complicações, fármacos e
laboratório de estudo para o TEMI.

Esta pasta é **artefato de publicação**. A fonte editável é o pacote auditado
`AVC_TURBO_TEMI_2026-09-11_v1.1` (fora do repositório), que contém
`conteudo/*.md|json`, `build.py`, testes, evidências de QA e as 20 ilustrações
PNG originais de 1672 px. A pasta é regenerada por
`scripts_admin/gerar_modulo_avc_turbo_temi.py <pacote>`.

## Arquivos

- `index.html` — dez percursos, calculadoras, laboratório TEMI e referências.
- `assets/style.css` — layout responsivo, tema compartilhado do portal, impressão.
- `assets/app.js` — navegação, busca local, tema, quiz, flashcards, ferramentas.
- `assets/nihss.js` — regras de pontuação NIHSS (UN, subtotal, coerência em coma).
- `assets/tools.js` — ABC/2, Glasgow → WFNS, ICH Score, Fisher, relógio, revisão espaçada.
- `assets/data.js` — fichas farmacológicas, casos, questões, flashcards e referências.
- `assets/images/` — 20 figuras WebP (1280 px) e uma figura vetorial SVG.
- `data/visual-assets.json` — registro auditável das figuras (hashes, estado de auditoria).
- `module.manifest.json` — publicação, privacidade, evidência, auditoria e gate de revisão.
- `CHECKLIST_OPERACIONAL.md` — checklists de uso e de homologação.
- `manifest.webmanifest` — metadados de instalação; o cache offline é do `sw.js` da raiz.

## Diferenças em relação ao pacote auditado

1. Figuras 01–20 servidas em WebP (1,8 MB no total, contra 37,8 MB em PNG); os
   PNG originais permanecem no pacote, com hashes registrados em
   `data/visual-assets.json`.
2. Tema integrado ao esquema de acessibilidade do portal
   (`antigravity:a11y:v1`): Visualização clara, texto ampliado, alto contraste e
   redução de movimento seguem a preferência global.
3. Faixa visível de prévia pública em revisão médica, linha de edição com
   retorno à página inicial e ligações para o relatório de auditoria, para o
   texto canônico no UpDown Hub e para o app AVC Agudo anterior.

Nenhum texto clínico, referência, calculadora ou aviso foi alterado no transporte.

## Limites de segurança

- Conteúdo educacional e apoio cognitivo para adultos; não é protocolo
  assistencial homologado nem serviço assistencial.
- Nenhum dado digitado nas calculadoras é guardado ou transmitido; o progresso
  de estudo só fica no aparelho se o leitor marcar a opção.
- Campo vazio não vale zero, item não testável (UN) não entra como zero e o
  subtotal nunca é apresentado como total; soma isolada não decide reperfusão
  nem prognóstico.
- As figuras são esquemas gerados por IA, não exames reais; as figuras 03, 06 e
  13 têm correção pendente, antecipada nas legendas e na figura 21.
- As fichas adaptadas ao Brasil (metoprolol, esmolol, nitroprussiato, diazepam)
  aguardam conferência com a farmácia e o protocolo do serviço.
- O estado é `em-revisao-medica` com `public-preview`; mudar para `ativo`
  exige cumprir o `reviewGate` do manifesto.

## Auditoria

A edição 1.0 passou por auditoria independente em 11/09/2026: 33
identificadores PubMed, comunicados regulatórios, protocolos ENLS e bulas
conferidos; 50 achados (3 altos, todos corrigidos; 12 médios; 35 baixos);
nenhum erro de dose ou unidade confirmado nas fichas. Relatório completo em
`docs_usuario/AUDITORIA_AVC_TURBO_TEMI_2026-09-11.md`. A auditoria não é
certificação clínica.

## Validação

```bash
python3 -m unittest tests.test_avc_turbo_temi_module -v
node --check 01_Modulos_Clinicos/AVC_Turbo_TEMI/assets/app.js
node --check 01_Modulos_Clinicos/AVC_Turbo_TEMI/assets/nihss.js
node --check 01_Modulos_Clinicos/AVC_Turbo_TEMI/assets/tools.js
python3 scripts_admin/validate_mapa_vivo.py data/connections.json
```

No pacote auditado: `python3 build.py --require-images`, `python3 testes/estrutura.py`,
`node testes/nihss.test.cjs`, `node testes/tools.test.cjs` e `node testes/browser.cjs`.
