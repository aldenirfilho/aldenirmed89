> Relatório da auditoria independente da edição 1.0 do módulo **AVC agudo — Turbo TEMI**, que originou a edição 1.1 publicada em [01_Modulos_Clinicos/AVC_Turbo_TEMI](../01_Modulos_Clinicos/AVC_Turbo_TEMI/index.html). Auditoria de fontes, doses, escalas, figuras, aprendizagem, software e acessibilidade; **não é homologação clínica**. Reproduzido do pacote auditado sem alteração de conteúdo.

# Auditoria independente — AVC Turbo TEMI 1.0 → 1.1

**Data:** 11/09/2026 · **Auditor:** Claude (Anthropic), a pedido de Aldenir Rocha · **Objeto:** pacote `AVC_TURBO_TEMI_2026-09-11` (edição 1.0 para auditoria).

## Método e limites

- Leitura integral de `CONTEUDO_COMPLETO_CLAUDE.md` (≈12 mil palavras), `conteudo/*.json`, `site/assets/nihss.js`, `auditoria/NIHSS_ESPECIFICACAO.md`, `auditoria/RELATORIO_QA.md`, `build.py`, `app.js`, `style.css` e testes.
- As 20 imagens PNG foram abertas e inspecionadas individualmente (não apenas nomes/transcrições).
- Testes originais reproduzidos: build determinístico (hashes idênticos), `estrutura.py` ✅, `nihss.test.cjs` 14/14 ✅, `browser.cjs` 13/13 ✅ (Chromium/Playwright).
- **Fontes conferidas nesta sessão:** 33 identificadores PubMed (todos os PMIDs do pacote + novos) via consulta direta; comunicado de segurança e lista de retiradas da FDA (Andexxa); AHA/ASA AIS 2026 *Top Things to Know* (DOI confere); AHA/ASA HSA 2023 em PDF integral de espelho institucional (UCSD); ESO/EANS HIC 2025 (PMID 40401775, abstract e página PMC); ENLS v6.0 (AVC isquêmico, hipertensão intracraniana, estado de mal); bulas DailyMed de KCENTRA e nimodipino.
- **Não acessados (declarado):** texto integral em ahajournals.org da AIS 2026 e da HIC 2022 (HTTP 403 — mesmo bloqueio relatado pelo autor); PCDT do Ministério da Saúde (gov.br) nesta sessão; texto integral da diretriz SBDCV 2012 (SciELO 403). As recomendações dessas fontes foram conferidas por resumos oficiais ou abstract, e isso está sinalizado no conteúdo.
- Nenhum teste de software aqui descrito é certificação clínica.

Legenda: **Gravidade** crítico / alto / médio / baixo · **Tipo** [E] erro confirmado · [D] dúvida ou limite · [O] oportunidade editorial · **Status** ✅ resolvido na 1.1 · ⏳ pendente · ➖ registrado.

## A · Segurança clínica e fontes

| # | Grav. | Tipo | Arquivo/trecho | Problema | Consequência prática | Fonte | Correção | Status |
|---|---|---|---|---|---|---|---|---|
| A1 | alto | E | `farmacos.json` Crioprecipitado; roteiro "Hemorragia após trombólise" | "doses adicionais **para** fibrinogênio >150" inverte a lógica do ENLS ("até" >150) | sub/superdose em sICH | ENLS AIS v6.0 | Reescrito: repetir **até** fibrinogênio >150 mg/dL; regra também nas "Regras práticas" e no roteiro | ✅ |
| A2 | alto | E/lacuna | fichas Nicardipina e Labetalol; §PA | Únicos anti-hipertensivos IV detalhados têm disponibilidade rara/inexistente no Brasil, sem alternativa | plantonista sem opção prática | R34/R37; SBDCV 2012 (só abstract) | Nova ficha "PA no Brasil: metoprolol, esmolol e nitroprussiato" com doses de referência **a confirmar no protocolo local** e limite declarado; nota nas fichas antigas e no §PA | ✅ (doses a validar localmente ⏳) |
| A3 | alto | E/lacuna | ficha Benzodiazepínico; roteiro Crise | Lorazepam IV como 1ª linha — não comercializado no Brasil; diazepam ausente | atraso no estado de mal | ENLS EME v6.0 | Diazepam 0,15 mg/kg IV (máx. 10 mg) incluído; nota de disponibilidade; segunda linha ampliada (valproato, fenitoína/fosfenitoína) | ✅ |
| A4 | médio | lacuna | §Reperfusão; `referencias.json` | Omite DISTAL (negativo, 2025); ensaio de 2026 sem nome/números | leitura enviesada | PMID 39908430; 42127389 | Tabela comparativa ESCAPE-MeVO / DISTAL / ORIENTAL-MeVO com populações, desfechos e segurança; R44 criada; questão 22 e aprofundamento 4 | ✅ |
| A5 | médio | lacuna | §Antitrombóticos; ficha AAS+clopidogrel | Sem critério (NIHSS ≤3 / ABCD² ≥4) nem janela (≤24 h) para DAPT | uso fora da população dos ensaios | CHANCE; POINT (R49); AHA 2026 Top Things | Parágrafo "Quem entra" com seleção, início ≤24 h, 21 dias e sangramento no POINT | ✅ |
| A6 | médio | lacuna | §Reperfusão 4,5–9 h e 6–24 h | EXTEND e DEFUSE 3 não citados | rastreabilidade | PMID 31067369; 29364767 | R45/R46 criadas e citadas na tabela de cenários | ✅ |
| A7 | médio | O·TEMI | §Escalas | Falta WFNS (AHA 2023: HH **ou** WFNS, COR 1) | prova e comunicação | AHA HSA 2023 PDF | Tabela WFNS, classificador Glasgow → WFNS, questão 23, flashcard, R53/R54 | ✅ |
| A8 | médio | D | §Fisher modificado; `fisherModified()` | "Espesso" não definido | graduação inconsistente | Frontera 2006 | Definição (preenche completamente ≥1 cisterna/fissura) no texto, nas opções do classificador e no resultado | ✅ |
| A9 | médio | lacuna | roteiro Angioedema | Sem esquema de referência | sem conduta concreta | ENLS AIS v6.0 | Esquema (difenidramina 50 mg IV, famotidina 20 mg IV, metilprednisolona 125 mg IV, adrenalina IM 0,3–0,5 mg, icatibante 30 mg SC/C1-inibidor) no roteiro e em nova ficha, com ressalva de disponibilidade | ✅ |
| A10 | médio | O | §HIC PA; §Início | INTERACT4 ausente | ensino de "imagem antes da PA" | PMID 38752650 | Parágrafos no início, na tabela de PA do isquêmico e no §PA da HIC; R48; questão 24 | ✅ |
| A11 | baixo | E | §HIC cerebelar "≥15 mL" | Diretrizes usam ">15 mL" | consistência | ESO/EANS 2025 | Corrigido | ✅ |
| A12 | baixo | O | §HSA crises | Falta "crise nova: 7 dias"; estatina/Mg IV não | pontos de prova | AHA 2023 | Adicionado | ✅ |
| A13 | baixo | O | §HSA antifibrinolítico | Fortalecer classe/nível | prova | AHA 2023 | "Classe 3: sem benefício, nível A (ULTRA 60% vs 64%)" | ✅ |
| A14 | baixo | O | ficha Nimodipino | Falta "≤96 h" e lavagem 20 mL SF; apresentação brasileira | prática | bula DailyMed | Adicionado (comprimido 30 mg no Brasil, confirmar com farmácia) | ✅ |
| A15 | baixo | O | ficha CCP4 | Falta peso máx. 100 kg, velocidade e HIT | prática | bula KCENTRA | Adicionado | ✅ |
| A16 | baixo | O | §Andexanet | Faltam números do FDA/ANNEXA-I | didática | FDA | Adicionados (trombose 14,6% vs 6,9%; mortes 2,5% vs 0,9%; 22/12 e 23/12/2025) | ✅ |
| A17 | baixo | lacuna | §Grande núcleo | Só SELECT2 | rastreabilidade | PMID 36762852 | ANGEL-ASPECT (R47) | ✅ |
| A18 | baixo | O | roteiro Herniação | Hiperventilação sem alvo | prática | ENLS PIC v6.0 | PaCO₂ 32–35 mmHg breve; Na <160; PPC 60–70 individualizada | ✅ |
| A19 | baixo | O | roteiro Edema maligno | Sem critérios clássicos de hemicraniectomia | prova | AHA AIS (texto integral não acessado) | Critérios adicionados com ressalva explícita de conferência | ✅ (ressalva ⏳) |
| A20 | baixo | E | `nihss.js` item 4 | "asimetria" | credibilidade | — | Corrigido | ✅ |
| A21 | médio | D | R01/R02/R27 | Texto integral AHA bloqueado | classes/níveis da AIS 2026 não conferidos item a item | — | Limite declarado no §Fontes e neste relatório | ➖ |
| A22 | baixo | D | R06 PCDT | Não acessado nesta sessão | — | — | Mantido; conferir versão vigente antes de publicar | ⏳ |

## B · Escalas e NIHSS

| # | Grav. | Tipo | Trecho | Problema | Correção | Status |
|---|---|---|---|---|---|---|
| B1 | médio | O·segurança | `assess()` | Guardas de coma só para 8 e 9 | Alertas para 1b=2, 1c=2, 10=2/UN; nunca preenchimento automático; testes ampliados | ✅ |
| B2 | baixo | O | NIHSS mobile | Estado do exame some ao rolar | Barra fixa com estado (incompleto/UN/total/alertas) | ✅ |
| B3 | baixo | O | NIHSS | Sem comparação item a item | "Guardar como exame anterior" (memória da aba) + tabela de mudanças com direção; entra no resumo TXT | ✅ |
| B4 | baixo | O | item 7 | Nota de cegueira ausente | Adicionada | ✅ |
| B5 | baixo | O | Escalas | Sem Fisher original nem limpar | Classificador de Fisher original (padrão misto sinalizado) + botão "Limpar escalas" | ✅ |

Conferência dos 15 itens contra o manual NINDS (R07): opções, faixas (0–42), lateralidade (5a/6a esquerdo; 5b/6b direito), tempos (10 s braço, 5 s perna), ângulos (90°/45°; 30°), regras de coma, afasia, mutismo (2), intubação (UN em 10; escrita no 9), UN restrito a barreira física e vazio ≠ zero — **sem erro estrutural**. A tradução continua didática e não validada; os estímulos oficiais não são reproduzidos.

## C · Aprendizagem

| # | Grav. | Achado | Correção | Status |
|---|---|---|---|---|
| C1 | baixo | 20 gabaritos e 80 comentários corretos e coerentes; Q5 e Q10 ganham detalhe (dose CCP4; definição Fisher III) | Explicações ampliadas | ✅ |
| C2 | baixo | Faltavam basilar, DOAC+trombólise, WFNS, MeVO, INTERACT4, benzodiazepínico no Brasil | +2 casos (6 e 7), +5 questões (21–25), +5 flashcards (26–30) | ✅ |
| C3 | baixo | D1/D7/D14/D30 sem ferramenta | Plano de revisão com datas e .ics local; modo treino de flashcards | ✅ |
| C4 | baixo | Progresso só na sessão | Persistência local **opcional** (questões e marcações), com "Apagar dados locais"; NIHSS nunca persiste | ✅ |
| C5 | ➖ | 16 roteiros: estrutura reconhecer→agora→investigar→evitar→reavaliar consistente | Ajustes de A1, A3, A9, A18, A19 | ✅ |

## D · Imagens (20 esquemas de IA + 1 vetor novo)

| Fig. | Grav. | Problema exato observado | O que precisa mudar (regeneração) | Mitigação na 1.1 | Status |
|---|---|---|---|---|---|
| 03 | médio | HSA como faixa lisa contínua entre crânio e córtex (aspecto subdural), não em sulcos/cisternas | Hiperdensidade preenchendo sulcos da convexidade e cisternas basais (estrela suprasselar/silviana), sem faixa sob a calota | Legenda corretiva + **Figura 21** vetorial com os 4 compartimentos | ⏳ regenerar |
| 13 | médio | Mesma faixa subdural-like; inset "HSA fina ou espessa" mostra sangue sobre o córtex sob o osso | Sangue nos sulcos: fino vs. cisterna totalmente preenchida; manter inset ventricular | Legenda corretiva + Figura 21 | ⏳ regenerar |
| 06 | médio | Linha "Diplopia" aponta lobo frontal; "Ataxia" aponta córtex parieto-occipital; tronco desenhado como bulbo | Linhas para tronco (diplopia/disfagia) e cerebelo (ataxia); basilar ventral ao tronco | Legenda corretiva | ⏳ regenerar |
| 12 | baixo | Painel I "sem sangue" com tom rosado nas cisternas; padrão em "Y" pouco realista | Painel I sem vermelho; II/III com cisternas basais e fissura inter-hemisférica | Legenda corretiva | ⏳ |
| 16 | baixo | Nimodipino "enteral" com bolsa tipo IV ligada ao estômago | Seringa enteral/SNG e rótulo "NUNCA IV" | Legenda corretiva | ⏳ |
| 20 | baixo | Cabeçalho com 3 dimensões; texto com 4 | Acrescentar "Tendência" ao cabeçalho | Legenda ajustada | ⏳ |
| 17 | baixo | "não espere nova imagem" pode ser lido como "não faça TC" | "Estabilize antes de transportar para a TC" | Legenda ajustada | ⏳ |
| 15 | baixo | Coletor da DVE parece câmara de gotejamento; "Rebaixamento" aponta o pescoço | Bureta graduada; linha para a cabeça | Legenda corretiva | ⏳ |
| 09 | baixo | Linha "Reversão" sem alvo | Apontar hematoma ou remover | — | ⏳ |
| 01·02·04·05·07·08·10·11·14·18·19 | ✅ | Sem erro relevante | Manter | — | ✅ |
| todas | baixo | 37,8 MB em PNG | WebP para exibição (1,8 MB no total), PNG original mantido para download | `<picture>` + WebP | ✅ |
| 21 (nova) | — | — | Esquema vetorial nativo "Onde está o sangue?" (HSA, HIC, subdural, epidural), inspecionado renderizado em 1600×900 e em 390 px | SVG sem dependência externa | ✅ |

## E · Software e acessibilidade

| # | Grav. | Achado | Correção | Status |
|---|---|---|---|---|
| E1 | baixo | H1 → H3 na seção inicial | Seção inicial usa H2 | ✅ |
| E2 | baixo | Deep link em celular aterrissava no meio do formulário | Navegação inicial após injeção dos componentes, com rolagem instantânea; teste automatizado | ✅ |
| E3 | baixo | Tema fixo; sem tamanho de fonte | Tema claro/escuro por escolha (escuro continua padrão, preservando a identidade) e A−/A+ (80–140%), guardados como preferência | ✅ |
| E4 | baixo | Sem busca global | Busca local sobre todo o conteúdo (atalho "/", setas, Enter, Esc), com salto para o trecho e roteiros de complicações | ✅ |
| E5 | baixo | Testes não cobriam teclado/impressão/ferramentas | 21 testes NIHSS, 20 testes de ferramentas, 24 grupos de navegador (incl. impressão emulada, deep link, persistência, WebP, sem JS) | ✅ |
| E6 | ✅ | Zero requisição externa, zero armazenamento, zero erro JS | Mantido: `localStorage` apenas para preferências e progresso de estudo opcional; teste confirma zero requisição remota | ✅ |
| E7 | baixo | Sem manifest | `manifest.webmanifest` + ícones locais (sem service worker) | ✅ |
| E8 | baixo | Resultados da busca ficavam fora da tela ao rolar | Posicionamento fixo calculado a partir do campo | ✅ |

## Pendências (não resolvidas nesta edição)

1. Regenerar as figuras 03, 13 e 06 (erros de compartimento/rótulo) e, se possível, 12, 15, 16, 17, 20; inspecionar cada arquivo regenerado antes de trocar.
2. Validar localmente doses/disponibilidade da ficha "PA no Brasil", das alternativas de benzodiazepínico e do esquema de angioedema com a farmácia e o protocolo do HRN/Santa Casa.
3. Conferir classes/níveis da AHA/ASA AIS 2026 e HIC 2022 no texto integral institucional; conferir PCDT vigente.
4. Revisão médica independente (segundo revisor) das 25 questões, 7 casos e 30 flashcards; teste com usuários reais em celular.
5. Safari/iOS físicos não testados nesta sessão (Chromium apenas).
