# 📰 Jornal Diário 360 — pipeline diário (padrão de 30 páginas)

Pasta **não pública** (fora da allowlist do site). Tudo o que uma sessão nova precisa para produzir,
publicar e entregar a edição do dia, pedida pelo proprietário em 16/11/2026: lançamento diário até as
**05:30 (Sobral, America/Fortaleza)**, publicação no site e no Códice 360X, app com acervo e leitura em HTML
para iPhone.

## Ordem das 32 páginas (fixa; Serviço Humanitário desde 25/11/2026, Neurodiversidade desde 27/11/2026)

| Pág. | Seção | Pág. | Seção |
|---|---|---|---|
| 1 | Capa (manchete, Em 60 segundos, índice 30 itens) | 16 | Nerd · gamer · curiosidades |
| 2 | Brasil | 17 | Carros |
| 3 | Ceará · Sobral (+ "Para o intensivista") | 18 | Classificados (ofertas e golpes) |
| 4 | Economia (+ "Seu bolso · modo proteção") | 19 | Compras · atualizações de apps e SO |
| 5 | Mundo · geopolítica · geografia | 20 | 💰 Educação financeira I — poupar, renda fixa, doutrina Bastter |
| 6 | Hoje na história (estilo "Neste dia") | 21 | 💰 Educação financeira II — terreno, imóvel, veículo, revenda, antigolpe |
| 7 | Saúde · medicina | 22 | 😂 Humor 360 I — economia, política, geopolítica (3 tirinhas) |
| 8 | Pílula TEMI | 23 | 😂 Humor 360 II — esportes e tecnologia (3 tirinhas + charge) |
| 9 | Pílula R3 Clínica Médica | 24 | 📜 Arcanos 360 I — medicina entre o sagrado e a evidência |
| 10 | POCUS · ECG · VM (1 conceito cada) | 25 | 📜 Arcanos 360 II — geopolítica do oculto e memória |
| 11 | Tecnologia · IA | 26 | 🏛️ Honra 360 I |
| 12 | ⚽ Esportes I — futebol brasileiro, todos os times, Seleção | 27 | 🏛️ Honra 360 II |
| 13 | 🌵 Esportes II — Sobral, Ceará, Nordeste (municipal → regional) | 28 | ⚖️ Equilíbrio 360 I |
| 14 | 🏁 Esportes III — mundo, F1/motor, tênis, finais continentais | 29 | ⚖️ Equilíbrio 360 II |
| 15 | ♀️ Esportes IV — feminino, vôlei, basquete, outros | 30 | Dicas · para aprofundar · fontes · expediente |
|  |  | 31 | 🧠 Neurodiversidade 360 — TDAH, autismo, dislexia e neurodiversidade: ciência da semana, Brasil em números, direitos e projetos (federal e Ceará), escola, mito × fato, ferramenta do dia, QR para ADDitude e Ministério da Saúde (padrão desde 27/11/2026; modelo em `modelo/pages/31_neurodiversidade.html`) |
|  |  | 32 | 🤝 Serviço Humanitário 360 — antigolpe, 4 causas com canal oficial conferido (QR), empresas que ajudam, Conecte-se (sempre a ÚLTIMA página; padrão desde 25/11/2026) |

O modelo completo da edição nº 011 (16/11/2026) está em `modelo/pages/01..30.html`: copie a estrutura de
cada página (classes CSS, caixas, rodapé com fontes) e troque o conteúdo. **Nunca** reaproveite notícia
antiga sem fato novo.

## Passo a passo

1. **Preparar** (2 min): `python3 scripts_admin/jornal360/setup.py /home/claude/j360/AAAA-MM-DD`
   (instala fontes, cria `pages/` e `img/`). Leia a skill `agente-editorial-360` se estiver disponível.
2. **Pesquisar** (o grosso do tempo): data de hoje primeiro; ~50–70 buscas, uma por item, em paralelo;
   priorize as últimas 24 h e fontes confiáveis (órgãos oficiais, agências, G1/Folha/Estadão/O Povo/
   Diário do Nordeste; esportes: CBF, ge, Lance!, O Povo, Diário do Nordeste; finanças: BC, Tesouro, CVM,
   FGC). Esportes cobre **todos os times** e vai do municipal (Sobral: Guarany, Vila Real, Junco) ao
   internacional, com seção feminina. Re-cheque eventos agendados para o próprio dia.
3. **Escrever** as 32 páginas em `pages/NN.html` (uma `<section class="page">` por arquivo).
   - Pílulas: siga a rotação de `pilulas-log.md` (sem repetir por 30 dias) e atualize o log no fim.
   - Finanças: conteúdo educativo; **sem** recomendar nem induzir renda variável; doutrina Bastter
     apresentada com fidelidade (acúmulo, trabalho como renda, renda fixa preserva poder de compra, não
     tentar acertar a hora); terrenos, imóveis, veículos (consumo, honestamente), compra e revenda
     (MEI, nota, CDC, receptação) e golpes da semana. Números atuais conferidos (Selic, poupança, IR,
     FGC, LCI/LCA, MEI).
   - Humor: tirinhas com `comics.py` (personagens originais: Dona Selic, Seu Dólar, Porquinho, Barril,
     MEI, Lei, Calendário, plantonista, robô Gepeto, torcedores genéricos, Leão, Vovô, galo). **Nunca**
     pôr falas em pessoas reais, sem escudos/marcas, sem partido; quadro "Por trás da piada" com os fatos.
   - Gráficos: `charts.py` (`hbars`, `pairs`), paleta validada S1 #0087a3, S2 #a8750a, S3 #5b5fa8,
     cinza #b9b2a3, vermelho #b3261e; `J360_IMG=pasta/img`.
4. **Montar e renderizar**: `python3 assemble.py PASTA` → `python3 render.py PASTA/jornal.html PASTA/jornal.pdf 1.15 0.85`.
   Página com `slack` < 12 ou `colOver` = conteúdo cortado: encurte. Folga > 60 px no zoom máximo:
   acrescente uma caixa útil. Confira visualmente (`pdftoppm -r 70`) capa, esportes, finanças e humor.
5. **Publicar** (site + Códice): escreva `PASTA/edicao.json` (formato no topo de `publish.py`) e rode
   `python3 scripts_admin/jornal360/publish.py PASTA <raiz aldenirmed89> <raiz intensivahub>`.
6. **Portões** no aldenirmed89 (todos precisam passar):
   `build_jornal_360.py --check` · `editorial_gate.py --check --changed-since origin/main --json` ·
   `publication_guard.py check-repository .` · `python3 -m unittest discover -s tests -p 'test_*.py'`.
   O portão editorial bloqueia palavras como *golpista, criminoso/a, fraudador, corrupto, roubou,
   mentiroso, negligente* — reescreva de forma factual e neutra ("suspeito de integrar uma facção").
   Nada de CPF, telefone ou e-mail pessoal no conteúdo.
7. **Git**: branch `jornal360/AAAA-MM-DD` a partir de `origin/main`, commit, push, PR e merge *squash*
   pela API REST (`gh api repos/aldenirfilho/aldenirmed89/pulls ...`, `.../pulls/N/merge`). No
   intensivahub, o mesmo para a coleção `j360`. Se o CI falhar por algo alheio à edição, mescle mesmo
   assim só se os portões locais passaram e relate o problema.
8. **Entregar**: envie o PDF com legenda curta e os links (site, leitura no celular, app); catalogue no
   Drive e no Notion quando os conectores existirem (iCloud não tem conector: diga isso em uma linha).

## Regras permanentes

- Selos de frescor em toda matéria: `24 h`, `72 h`, `Hoje/Previsto`, `Contexto`.
- Política: só fatos atribuídos, mesmo tratamento a todos os lados.
- Direitos autorais: parafrasear; citação direta < 15 palavras e 1 por fonte; fontes datadas no rodapé.
- Imagens: só SVG original e gráficos próprios; nunca fotos de terceiros ou de figuras públicas.
- Saúde: educativo, doses só de fonte verificada, "siga o protocolo institucional".
- Privacidade: nenhum dado pessoal do proprietário ou de terceiros entra no jornal, no site, no app ou
  no Códice.
- Quando cobrir a Anthropic, informar que o jornal é produzido com o Claude.

- Crédito obrigatório (pedido de 20/11/2026): "ALDENIR ROCHA DE OLIVEIRA FILHO · PROJETO 360X" na capa, no rodapé de todas as páginas e no metadado /Author de todos os PDFs (publish.py aplica o /Author).
- Página 31 (Neurodiversidade 360): fatos das últimas 1–2 semanas com data; estudo é estudo (não conduta); projeto de lei marcado "em tramitação"; nada de dose; fontes prioritárias: ADDitude, CHADD, The Transmitter, Society for Neuroscience, Ministério da Saúde, ABDA, Agência Senado/Câmara, ALECE; sem dados pessoais de ninguém.
- Página 32 (Serviço Humanitário): PIX só com chave aberta no site oficial no próprio dia; sem conferência, QR para o site oficial. Conferir os QR decodificando a página renderizada (OpenCV).
