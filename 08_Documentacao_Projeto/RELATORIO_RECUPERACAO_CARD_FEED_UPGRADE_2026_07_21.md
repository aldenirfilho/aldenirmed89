# Relatório de recuperação e upgrade do Card Feed

**Projeto:** Antigravity Consultas
**Data:** 21/07/2026
**Branch de trabalho:** `codex/card-feed-recovery-upgrade`
**Estado deste relatório:** validação local concluída; publicação remota pendente nesta revisão

## 1. Resultado executivo

As imagens não haviam sido apagadas do Mac. A regressão de publicação ocorreu quando o endurecimento de privacidade passou a excluir todo diretório chamado `inbox`, inclusive o antigo acervo do Card Feed. O conteúdo autoral foi recuperado a partir dos mestres locais, sem tornar o staging privado público.

| Indicador | Resultado |
|---|---:|
| Fontes autorais encontradas | 257 |
| Arquivos públicos únicos derivados | 220 |
| Duplicatas eliminadas por SHA-256 | 36 |
| Cards históricos reconciliados | 195 |
| Cards disponíveis na interface em perfil local limpo | 255 |
| Cards com imagem em perfil local limpo | 252 |
| Cards sem imagem em perfil local limpo | 3 |
| Peso bruto dos mestres | 420,2 MiB |
| Peso dos derivados públicos | 41,9 MiB |
| Redução aproximada | 90% |
| Arquivos em quarentena | 1 |
| Referências históricas ausentes | 0 |

Os mestres originais continuam preservados em `00_INBOX_ATUALIZACAO/_private/card-feed-recovery-2026-07-21/`, área local ignorada pelo Git. A impressão digital reproduzível das 257 fontes suportadas é `6684542494db23bd796ff7f0a0dec56735e5c77f8da345207044668304232a03`: SHA-256 da sequência ordenada `caminho relativo normalizado em NFC + NUL + SHA-256 do arquivo + quebra de linha`.

## 2. Cronograma em blocos operacionais

Os blocos foram organizados para caber em ciclos de aproximadamente 20 minutos, sempre encerrados por um gate verificável.

| Bloco | Entrega | Gate |
|---|---|---|
| 1 — Guard e inventário | Checkout, branch, causa raiz, integridade por hash e separação público/privado | baseline e acervo confirmados |
| 2 — Recuperação | Deduplicação, normalização Unicode, conversão WebP, sanitização SVG e novo manifesto | 257 fontes; 220 derivados; 1 quarentena; 0 ausências |
| 3 — Upgrade do feed | Grade, feed contínuo, modo compacto, filtros, sorteio, resumo e conexões temáticas | teste funcional local |
| 4 — Biblioteca e conexões | Grafo global deduplicado, grafo da biblioteca, parâmetros de busca/tema e triagem autoral privada | portão de privacidade |
| 5 — Release | testes, artefato, navegador, revisão de diff, commit, push, deploy e produção | evidência de produção |

## 3. Recuperação segura das imagens

Foi adicionada a ferramenta `scripts_admin/prepare_card_feed_recovery.py`, com o seguinte contrato:

1. lê apenas os mestres privados;
2. reconcilia divergências Unicode NFC/NFD;
3. cria nomes ASCII estáveis com hash curto;
4. deduplica por SHA-256;
5. converte raster para WebP, com aresta máxima de 1600 px e remoção de metadados;
6. sanitiza SVG e bloqueia conteúdo ativo;
7. gera `cards.json` e `recovery_manifest.json` sem sobrescrever os originais.

Os 219 WebP foram auditados sem EXIF, ICC, XMP ou comentários incorporados. Um SVG foi sanitizado e publicado. O SVG de hipotermia/bradicardia foi retirado dos derivados e colocado em quarentena porque continha doses desatualizadas; ele exige correção e nova revisão clínica antes de qualquer promoção. Todo card clínico recuperado permanece marcado como **revisão clínica pendente**.

## 4. Upgrade do Card Feed

### Visualização e navegação

- Grade responsiva.
- Feed contínuo para revisão sequencial.
- Modo compacto para varredura rápida.
- Persistência do modo escolhido no navegador.
- Filtros: com imagem, sem imagem, favoritos, revisão, publicados e locais.
- Sorteio de card para estudo sem ordem fixa.
- Cópia de resumo clínico.
- Link por tema para TEMI, RespiraCrit, POCUS, Calculadoras ou Biblioteca IA.
- Acesso direto ao mapa de conexões.

### Bugs corrigidos

- Overrides locais de cards do repositório agora sobrevivem ao reload.
- Overrides legados não podem mais substituir URL, hash, autoria ou licença canônicos por caminhos antigos de `inbox`.
- A tela de cards ocultos deixou de ficar sempre vazia.
- Assets já referenciados não são duplicados como cards automáticos.
- Cards automáticos usam o diretório temático canônico e não confundem “recovered” com “eco” nem “comandos” com “coma”.
- O contador “em revisão” inclui revisão clínica pendente e revisão vencida.
- Lista de ocultos passou a ser validada e deduplicada.
- Falha JavaScript no fallback de imagem indisponível foi corrigida após teste real no navegador.
- Barra superior considera a área segura lateral.
- Imagem do card virou controle acessível e o toast ganhou anúncio assistivo.

## 5. Conexões e diretórios

O gerador global passou a deduplicar arestas pela relação completa e a normalizar aliases para as rotas canônicas.

| Grafo | Nós | Arestas |
|---|---:|---:|
| Global | 75 | 137 |
| Biblioteca IA | 211 | 210 |

O grafo da Biblioteca conecta o hub a 25 temas e a 185 documentos públicos, usando IDs determinísticos. O builder falha de forma fechada quando um tema ou arquivo público está ausente. Rotas antigas permanecem apenas como redirects de compatibilidade.

## 6. Anexação de novos conteúdos

Cinco arquivos de três famílias com forte indício de autoria foram copiados, sem mover nem apagar as fontes, para triagem local privada:

- hemostasia/transfusão — DOCX e PDF;
- sedação/delirium — DOCX e PDF;
- crioprecipitado — DOCX.

Eles **não foram publicados automaticamente**. A promoção exige confirmação de autoria/licença, comparação entre rendições, inspeção de dados sensíveis, revisão clínica e definição de referências. Conteúdo jurídico-financeiro e materiais de terceiros permanecem privados.

O procedimento completo para novos documentos e novas imagens está em `08_Documentacao_Projeto/GUIA_INSERCAO_SEGURA_DOCUMENTOS.md`.

## 7. Evidências de validação local

| Verificação | Resultado |
|---|---:|
| Testes automatizados | 21/21 |
| Manifests | 69/69 |
| Caminhos catalogados | 792 válidos; 0 com 404 |
| Rotas | 56/56 |
| Portão do repositório | aprovado |
| Artefato de deploy | 718 arquivos; 221,6 MiB |
| Sanitização do artefato | 0 diretórios e 0 registros removidos |
| Portão de privacidade do artefato | aprovado |
| JavaScript do Feed e Biblioteca | sintaxe válida |
| Navegador — cards | 255 renderizados |
| Navegador — imagens | 252 presentes; 0 quebradas |
| Navegador — filtros | 3 sem imagem; 252 com imagem; 255 total |
| Navegador — favorito após reload | persistência confirmada |
| Navegador — ocultar/restaurar | 1 card isolado e restaurado; 0 ocultos ao final |
| Navegador — override legado | caminho antigo de `inbox` ignorado; asset público canônico preservado |
| Navegador — classificação automática | Comandos/Obsidian em IA e POCUS preservado pelo diretório canônico |
| Navegador — asset clínico bloqueado | 0 referências públicas ao SVG em quarentena |
| Navegador — console após correção | 0 erros/avisos |
| Navegador — conexão com Biblioteca | busca e tema pré-aplicados |

O teste automatizado foi feito em navegador Chromium integrado. A aprovação visual humana em Safari/iPhone e o breakpoint físico de 390 px continuam como gate separado e não são presumidos.

## 8. Rollback

Se a publicação apresentar regressão, reverter o commit da release por um novo commit no Git, aguardar o workflow de deploy e confirmar a restauração no GitHub Pages. Não apagar os derivados nem restaurar diretamente sobre os mestres privados.

## 9. Publicação e produção

- Commit principal da recuperação: `75ea417b1092d74eb2f61bd18a0e763065c10326`.
- Pull request: [#8 — Restore and upgrade the medical card feed](https://github.com/aldenirfilho/antigravity-consultas/pull/8).
- Branch remota: `codex/card-feed-recovery-upgrade`.
- URL alvo de produção: [Card Feed — Antigravity Consultas](https://aldenirfilho.github.io/antigravity-consultas/05_Midia_E_Feed/index.html).
- Estado deste registro: PR em modo rascunho, aguardando os gates remotos, merge e teste automatizado no GitHub Pages. O resultado final permanece verificável no histórico da PR e do workflow de deploy.

## 10. Próximos upgrades recomendados

1. Curar títulos, tags e comentários dos 57 assets recuperados que ainda entram como cards automáticos.
2. Criar miniaturas `srcset` de 480/960/1600 px para reduzir tráfego móvel.
3. Adicionar fila editorial com estados autoria → privacidade → clínica → referências → publicação.
4. Unificar DOCX/PDF como rendições da mesma obra, evitando IDs duplicados.
5. Criar painel de revisão clínica por tema e data.
6. Executar teste humano no Safari do Mac e no iPhone antes de declarar aprovação visual final.

## 11. Principais erros a evitar

- Não publicar arquivos diretamente de `inbox` ou `_private`.
- Não usar nome de arquivo ou “gerado por IA” como prova isolada de autoria.
- Não editar `public_site` ou wrappers legados como fonte canônica.
- Não enviar material clínico sem revisão e referências.
- Não fazer promoção em massa sem manifesto, hash, rollback e teste de produção.
