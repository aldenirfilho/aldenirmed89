# 🔎 Relatório de auditoria e upgrade — Antigravity Consultas

**Data da auditoria:** 20/07/2026

**Repositório:** `aldenirfilho/antigravity-consultas`

**Branch de trabalho:** `agent/auditoria-otimizacao-jul-2026`

**Base auditada:** `ad1674f8b4871067fe86e47fdf9807134265b467`

**PR técnico publicado:** `#5`

**SHA técnico em produção:** `76004e8cdc270a0fbf5537b7c5ad984fdc3449e9`

**Estado deste documento:** release técnica publicada e testada em produção;
aceites humanos mobile/Safari e clínico integral ainda não presumidos

**Responsável pelo aceite clínico e visual:** Dr. Aldenir Rocha

> ⚠️ O deploy e o teste automatizado no site público em Google Chrome foram
> concluídos. Este relatório **não** presume aprovação visual humana, teste em
> Safari/iPhone/iPad ou revisão clínica humana integral.

---

## 1. Resultado executivo

A auditoria encontrou riscos relevantes em **privacidade**, **tamanho do artefato**,
**segurança do leitor de Markdown**, **cálculos/textos clínicos**, **rotas**,
**catálogos** e **cache PWA**.

As correções foram aplicadas e publicadas com estratégia **manifest-first**, sem
reorganização destrutiva do acervo. O principal ganho foi
a implantação de um portão de publicação que bloqueia staging e categorias
privadas, saneia metadados e rejeita um artefato acima do limite interno.

### Situação em uma tela 🧠

| Área | Situação atual | Próximo gate |
|---|---|---|
| Privacidade do estado atual | Portões do repositório e do artefato aprovados; 1.254 arquivos deixaram de ser rastreados sem exclusão local | Tratar o histórico Git em projeto separado e autorizado |
| Rotas e diretórios | 56/56 rotas e 427 referências HTML/CSS aprovadas | Manter regressão no CI |
| Conteúdo clínico interativo | Correções críticas publicadas e 9/9 regressões verdes | Obter revisão médica humana integral |
| Segurança do frontend | Endurecimento publicado; IA externa do RespiraCrit desativada | Manter teste de segurança no CI |
| Performance/publicação | Artefato final com 497 arquivos e 179,4 MiB | Criar orçamento por módulo |
| GitHub/Pages | PR #5 mergeado, Actions e deploy verdes; teste desktop automatizado concluído | Validar Safari e dispositivos móveis reais |

---

## 2. Escopo e método

### Incluído

- árvore de diretórios e fontes canônicas;
- rotas, aliases, wrappers e página `404`;
- manifests e scanners de conteúdo;
- workflow de GitHub Pages e allowlist pública;
- privacidade, LGPD e risco de publicação acidental;
- tamanho do artefato e limites da plataforma;
- leitores de conteúdo, previews e iframes;
- service workers e estratégia de cache;
- módulos clínicos prioritários identificados na auditoria;
- testes estáticos, validação local, rollback e documentação operacional.

### Não incluído como aceite final

- revisão clínica humana de todos os módulos;
- auditoria jurídica de direitos autorais de cada documento;
- limpeza do histórico Git;
- teste completo em todos os navegadores/dispositivos;
- aprovação visual humana em iPhone/iPad e Safari;
- revisão clínica humana integral de todos os módulos.

### Princípios usados

1. **Preservar primeiro:** arquivos locais não foram apagados como parte da
   retirada do rastreamento público.
2. **Falhar fechado:** divergências de privacidade, rota ou tamanho devem
   interromper a publicação.
3. **Mudança reversível:** branch própria, commits pequenos e rollback por
   `git revert`, sem reescrita destrutiva.
4. **Sem aprovação visual presumida:** validação estática não substitui o teste
   do site real.
5. **Aceite clínico integral exige duplo gate:** teste de software + revisão
   médica humana.

---

## 3. Plano estratégico em blocos médios de 20 minutos ⏱️

> Cada bloco possui uma entrega verificável. Se um bloco exceder 20 minutos,
> interromper em um checkpoint seguro, registrar a pendência e continuar no
> bloco seguinte.

| Bloco | Janela | Objetivo | Entrega/critério de saída | Estado no momento deste relatório |
|---|---:|---|---|---|
| 0 | 0–20 min | Guard inicial | Projeto, branch, base/HEAD, remote e worktree registrados | ✅ Concluído localmente |
| 1 | 20–40 min | Arquitetura e rotas | Mapa de hubs, wrappers, aliases, 404 e transições | ✅ Concluído localmente |
| 2 | 40–60 min | Privacidade e publicação | Rastreamento privado interrompido; portão fail-closed criado | ✅ Repositório e artefato final aprovados |
| 3 | 60–80 min | Segurança do frontend | Leitor Markdown, preview, iframes e armazenamento local revisados | ✅ Correções publicadas e QA automatizado aprovado |
| 4 | 80–100 min | Segurança clínica | Fórmula de PBW e texto de ciclagem em PSV revisados/testados | ✅ Regressões automatizadas verdes; aceite médico humano pendente |
| 5 | 100–120 min | Diretórios e catálogos | Scanners regenerados; referências obsoletas removidas dos manifests | ✅ Concluído e validado no artefato final |
| 6 | 120–140 min | PWA e desempenho | Cache isolado; artefato abaixo do limite; estratégia de atualização validada | ✅ Artefato final: 497 arquivos e 179,4 MiB |
| 7 | 140–160 min | Testes locais | Validadores verdes + smoke test das rotas críticas | ✅ Gate local concluído em artefato reconstruído |
| 8 | 160–180 min | Documentação e handoff | Relatório, guia de inserção e checklist de release | ✅ Documentos preparados |
| 9 | 180–200 min | GitHub | Escopo revisado, commit, push e PR com evidências | ✅ PR #5 mergeado em `main` |
| 10 | 200–220 min | Deploy e produção | Actions verde, Pages no SHA esperado e navegador real aprovado | ✅ Deploy e desktop automatizado concluídos; mobile/Safari humano pendente |

### Regra de checkpoint

Ao terminar cada bloco, registrar:

- [ ] arquivos alterados;
- [ ] comando/teste executado;
- [ ] resultado objetivo;
- [ ] risco residual;
- [ ] ação de rollback;
- [ ] próximo bloco.

---

## 4. Achados priorizados

### Legenda

- **P0 — bloqueador:** pode expor dados, comprometer segurança, gerar erro
  clínico ou impedir a publicação.
- **P1 — alto:** quebra navegação, confiabilidade ou atualização, mas admite
  contingência.
- **P2 — melhoria:** dívida técnica, acessibilidade, desempenho ou manutenção.

### P0 — bloqueadores 🚨

| ID | Achado | Impacto | Tratamento | Estado |
|---|---|---|---|---|
| P0-01 | O workflow copiava uma árvore ampla da biblioteca, incluindo staging e uma categoria pessoal | Exposição pública de conteúdo sensível e metadados | Remover essas classes do rastreamento atual, ignorá-las, saneá-las dos JSON e bloquear no repositório/artefato | ✅ Mitigado no estado publicado; histórico Git ainda requer plano próprio |
| P0-02 | O conjunto permitido para o Pages ultrapassava aproximadamente 1 GiB | Falha de upload/deploy, lentidão e custo de distribuição | Limite interno de 900 MiB e revisão da allowlist/acervo público | ✅ Artefato final reduzido para 179,4 MiB |
| P0-03 | O banco de questões carregava um arquivo de dados vazio na rota pública | Tela sem conteúdo ou falha silenciosa | Corrigir a fonte canônica/wrapper e adicionar teste de carregamento | ✅ Quatro módulos publicados; rota e redirect aprovados em produção |
| P0-04 | O cálculo de peso corporal predito (PBW) limitava alturas baixas a 152,4 cm | Superestimação de PBW e volume corrente em pacientes de menor estatura | Usar a altura real validada e cobrir limites com testes | ✅ Corrigido e coberto por regressão; aceite clínico humano pendente |
| P0-05 | A orientação textual de ciclagem em PSV estava invertida entre ciclagem precoce e tardia | Risco educacional e de aplicação clínica inadequada | Corrigir direção do ajuste, citar fonte e obter revisão médica | ✅ Corrigido e coberto por regressão; aceite clínico humano pendente |
| P0-06 | O leitor Markdown aceitava caminho arbitrário e injetava HTML renderizado diretamente | XSS/execução de conteúdo não confiável no mesmo domínio | Restringir a origem/caminhos, sanitizar o HTML e usar fallback seguro | ✅ Allowlist/sanitização aplicadas e regressão verde |
| P0-07 | Previews HTML eram abertos em iframes sem sandbox | Conteúdo incorporado podia executar scripts com privilégios do domínio | Aplicar sandbox mínimo e restringir formatos/caminhos aceitos | ✅ Sandbox mínimo e validação fail-closed aplicados |
| P0-08 | A primeira versão do portão verificava apenas uma lista parcial de JSON; metadados privados e cópias `* 2.*` ainda passavam | Falso verde de privacidade no artefato | Varrer todos os JSON, rejeitar JSON inválido e excluir cópias de conflito no builder | ✅ 128 JSON do repositório e 59 do artefato: zero privados/inválidos; zero `* 2.*` no site |

### P1 — alta prioridade ⚠️

| ID | Achado | Impacto | Tratamento | Estado |
|---|---|---|---|---|
| P1-01 | Links do hub de apps não subiam um nível de diretório | Navegação para caminhos inexistentes | Corrigir caminhos relativos | ✅ Publicado e testado |
| P1-02 | Imagens do módulo de AVC divergiam em caixa e normalização Unicode | 404 em ambiente Linux/GitHub Pages | Alinhar caixa e usar nomes NFC | ✅ Publicado e testado |
| P1-03 | A página 404 não era copiada e os links relativos falhavam em rotas aninhadas | Recuperação inconsistente de navegação | Copiar `404.html` e definir base pública | ✅ Publicado e testado |
| P1-04 | O wrapper amigável do Card Feed não fazia parte do artefato | Rota amigável ausente | Incluir o wrapper na allowlist | ✅ Publicado e testado |
| P1-05 | Validadores podiam terminar com sucesso após encontrar divergências; um modo de correção removia referências | Falso verde e perda silenciosa de catálogo | Tornar falhas não zero e impedir poda automática de item ausente | ✅ Publicado e validado no CI |
| P1-06 | Service workers removiam caches que não lhes pertenciam | Interferência entre módulos do mesmo domínio | Prefixar/fixar a família de cache e apagar apenas versões próprias | ✅ Isolamento publicado e testado |
| P1-07 | Snapshots clínicos persistiam HTML/dados livres no armazenamento local | Privacidade local e superfície de injeção | Persistir somente dados necessários, escapar saída e evitar identificadores | ✅ Chave versionada, limites e escape publicados; QA automatizado aprovado |
| P1-08 | A pasta espelho `public_site/` divergia da fonte principal | Duplicidade, confusão de fonte canônica e validações frágeis | Torná-la gerada automaticamente ou removê-la do contrato após migração controlada | ⏳ Decisão arquitetural pendente |
| P1-09 | A execução do Pages informou depreciação do runtime Node.js 20 em actions oficiais | Risco futuro de incompatibilidade quando o fallback for removido | Atualizar/fixar versões oficiais compatíveis com Node.js 24 e repetir o deploy | ⏳ Próximo ciclo; não bloqueou a release atual |

### P2 — otimização e manutenção 🛠️

| ID | Achado | Melhoria recomendada |
|---|---|---|
| P2-01 | Não há regressão visual automatizada das galerias e hubs | Adicionar screenshots comparativos em desktop e mobile |
| P2-02 | Há aliases, wrappers e nomes legados em paralelo | Formalizar uma rota canônica por produto e testar todos os redirects |
| P2-03 | Scanners aceitam muitos formatos sem política de publicação por tipo | Criar allowlist por hub e exigir sandbox/revisão para HTML e arquivos executáveis |
| P2-04 | Catálogos podem manter entradas de arquivos removidos ou grandes demais | Tornar scanners determinísticos e comparar catálogo com disco no CI |
| P2-05 | O build centralizado ainda não gera manifesto criptográfico do artefato | Gerar lista SHA-256 para auditoria e comparação entre releases |
| P2-06 | Não há orçamento explícito por módulo | Adotar limite de tamanho, contagem e tempo de carregamento por hub |
| P2-07 | Falta matriz automatizada de acessibilidade e mobile | Incluir testes de teclado, contraste, viewport e redução de movimento |

---

## 5. Correções aplicadas e publicadas

> As mudanças desta seção foram publicadas pelo PR #5. Aprovação humana clínica,
> visual e mobile continua sendo um gate separado.

### 5.1 Privacidade e LGPD

- staging da biblioteca e uma categoria pessoal deixaram de ser rastreados no
  estado atual do Git, sem apagar as cópias locais;
- regras de ignore foram adicionadas para impedir nova inclusão acidental;
- manifests públicos foram saneados, removendo centenas de registros privados;
- o scanner da biblioteca passou a indexar somente o acervo público aprovado;
- foi criado `scripts_admin/publication_guard.py` com quatro modos:
  `sanitize-data`, `check-repository`, `sanitize-site` e `check-site`;
- o portão verifica caminhos privados, referências privadas em JSON e tamanho
  máximo interno do artefato;
- uma segunda auditoria removeu o falso verde inicial: agora todos os JSON do
  repositório/artefato são parseados e examinados recursivamente, JSON inválido
  falha e cópias de conflito `* 2.*` não entram no build.

### 5.2 Pipeline e validação

- o workflow passou a regenerar a biblioteca antes do build;
- validações passaram a ocorrer antes da montagem/publicação;
- o build passou a copiar a página 404 e o wrapper do Card Feed;
- a sanitização e o portão do artefato foram inseridos antes do upload;
- o validador de rotas agora retorna erro quando encontra rota quebrada;
- a validação de catálogos deixou de remover automaticamente referências
  ausentes durante o modo de correção.

### 5.3 Rotas, transições e assets

- caminhos relativos do hub de apps foram corrigidos;
- referências de imagens do módulo AVC foram alinhadas à caixa e Unicode do
  filesystem publicado;
- a página 404 recebeu base compatível com o subdiretório do GitHub Pages;
- o catálogo de ebooks foi regenerado para remover referência obsoleta a um
  item incompatível com o limite da plataforma.

### 5.4 PWA/cache

- service workers auditados passaram a remover apenas caches pertencentes ao
  próprio módulo, evitando colisão entre produtos do mesmo site.

### 5.5 Segurança clínica e frontend

- a equação de PBW deixou de limitar indevidamente alturas abaixo de 152,4 cm e
  agora alerta que o resultado nessa faixa é extrapolação com validação limitada;
- as ações para ciclagem precoce/tardia em PSV foram alinhadas à direção correta;
- um erro de execução causado pelo uso de `ph` em vez de `pH` no RespiraCrit foi
  corrigido e recebeu teste de regressão;
- o envio direto de gasometria ou imagem clínica do navegador para uma API de IA
  foi desativado até existir backend autenticado, governança e política de
  privacidade adequados;
- o leitor Markdown, os previews, a Biblioteca e os snapshots receberam
  validação de caminho, sandbox, escape e/ou sanitização;
- a suíte crítica passou a cobrir nove regressões clínicas e de segurança.

**Fontes clínicas verificadas em 20/07/2026:** protocolo oficial
[NIH/NHLBI ARDSNet EDEN–OMEGA](https://biolincc.nhlbi.nih.gov/media/studies/omega/Protocol.pdf),
ensaio [ARDS Network/ARMA](https://pubmed.ncbi.nlm.nih.gov/10793162/), análise
antropométrica de [Martin et al., 2017](https://doi.org/10.1186/s12890-017-0427-1),
revisão do [Jornal Brasileiro de Pneumologia, 2018](https://www.jornaldepneumologia.com.br/details/2835/pt-BR/assincronia-paciente-ventilador%3B)
e estudo fisiológico de [Tassaux et al., 2005](https://pubmed.ncbi.nlm.nih.gov/16109983/).
Os valores `25% → 50%` e `50% → 25%` são exemplos de direção de ajuste, não
prescrições universais; a resposta deve ser reavaliada nas curvas e na clínica.

---

## 6. Pendências residuais após a release

### Aceites humanos ainda não presumidos

- [ ] obter revisão médica humana das correções de PBW/ciclagem e dos demais
  módulos clínicos;
- [ ] concluir inspeção visual humana em Safari, iPhone e iPad reais;
- [ ] registrar formalmente os aceites clínico e visual com data e responsável.

### Próximo ciclo técnico

- [ ] decidir o destino definitivo do espelho `public_site/`;
- [ ] consolidar nomes canônicos e aliases legados;
- [ ] ampliar a matriz de atualização/fallback dos service workers em navegadores
  e estados offline diferentes;
- [ ] adicionar automação de acessibilidade, mobile e orçamento de desempenho;
- [ ] atualizar/fixar as actions oficiais para runtime Node.js atual e repetir o
  deploy;
- [ ] avaliar distribuição externa de arquivos muito grandes;
- [ ] planejar, com backup e autorização explícita, a eventual limpeza do
  histórico Git que contenha material sensível.

---

## 7. Suíte mínima de validação

Executar na raiz do repositório, depois da última mudança:

```bash
python3 scripts_admin/publication_guard.py check-repository .
python3 scripts_admin/check_static_manifests.py
python3 scripts_admin/validar_paths.py --check
python3 scripts/validate_routes.py
python3 scripts_admin/validate_mapa_vivo.py
bash scripts_admin/atualizar_tudo.sh --check
python3 -m unittest discover -s tests -p 'test_p0_regressions.py' -v
python3 scripts_admin/build_public_site.py . site
python3 scripts_admin/publication_guard.py sanitize-site site
python3 scripts_admin/publication_guard.py check-site site
```

### Resultado final local em 20/07/2026

- portão do repositório e do artefato verdes;
- 128 JSON do repositório e 59 do artefato: zero valor privado e zero inválido;
- artefato determinístico com 497 arquivos e 179,4 MiB;
- 69/69 checagens de manifests;
- 595 caminhos válidos, 0 correções necessárias e 0 referências quebradas;
- 56/56 rotas canônicas/aliases válidos;
- 427 referências HTML/CSS auditadas, zero quebrada;
- 33 arquivos JavaScript e 49 scripts inline sintaticamente válidos;
- 9/9 regressões clínicas e de segurança aprovadas;
- Mapa Vivo sem erro crítico; nove avisos de tipos novos renderizáveis
  (`desafio` e `mnemonico`).

### Smoke test local

```bash
python3 -m http.server 8000 --directory site
```

Abrir `http://localhost:8000/` e verificar:

- [x] home carrega sem erro crítico no console;
- [x] Biblioteca, UpDown, apps, calculadoras, questões, POCUS e Card Feed abrem;
- [x] busca, catálogos e filtros básicos inicializam;
- [x] 404 possui recuperação compatível com a base do GitHub Pages;
- [x] banco de questões contém quatro módulos no teste local;
- [x] traversal do leitor é rejeitado e previews usam sandbox;
- [x] service workers usam versão/família de cache isolada;
- [x] layout desktop foi aprovado no smoke test automatizado em Chrome;
- [ ] viewport móvel real ainda requer teste humano — a automação disponível
  impôs largura mínima e não produziu emulação móvel conclusiva.

### Smoke test no site original

- [x] home respondeu HTTP 200 e abriu sem erro crítico;
- [x] duas rotas privadas sentinela responderam HTTP 404;
- [x] Banco TEMI exibiu quatro módulos e a rota antiga redirecionou para a
  canônica;
- [x] Biblioteca exibiu 50 cards e Card Feed exibiu três cards, sem termos
  privados detectados;
- [x] traversal do leitor Markdown foi rejeitado;
- [x] Galeria, Ebooks e POCUS abriram sem imagem quebrada detectada;
- [x] RespiraCrit exibiu o alerta de `pH` crítico e manteve as ações de IA
  desativadas;
- [x] RespiraSense calculou PBW feminino de 38,8 kg e VT de 233 mL para 145 cm,
  com avisos de extrapolação e de não uso pediátrico;
- [ ] inspeção humana em Safari/iPhone/iPad permanece pendente.

---

## 8. Critérios de aceite da release ✅

### Privacidade e publicação

- [x] `check-repository` retorna código 0;
- [x] artefato contém zero caminhos/metadados privados detectados;
- [x] `check-site` retorna código 0;
- [x] artefato final mede no máximo 900 MiB;
- [x] nenhum caminho ou termo privado previsto pelos portões foi encontrado no
  site publicado;
- [x] risco de exposição histórica foi registrado e tem plano separado.

### Integridade funcional

- [x] validadores estáticos e de rotas retornam código 0;
- [x] aliases preservam links antigos;
- [x] nenhum 404 nas rotas críticas;
- [x] banco de questões carrega quatro módulos reais;
- [x] imagens auditadas carregam com caixa/Unicode corretos;
- [x] console do navegador sem erro crítico.

### Segurança clínica

- [x] fórmula de PBW validada por regressão com exemplos de ambos os sexos e alturas abaixo,
  próximas e acima de 152,4 cm;
- [ ] texto de ciclagem em PSV revisado pelo responsável médico;
- [ ] doses, unidades, arredondamentos e avisos clínicos revisados;
- [x] ferramenta mantém aviso de apoio cognitivo, não prescrição.

### Segurança web

- [x] leitor aceita somente documentos públicos previstos;
- [x] HTML renderizado é sanitizado, com fallback seguro;
- [x] iframes usam sandbox mínimo compatível;
- [x] armazenamento local não persiste identificadores desnecessários;
- [x] service workers não removem caches de outros módulos.

### Release e validação humana

- [x] PR #5 passou pelos gates automatizados e foi mergeado; revisão humana não
  presumida;
- [x] GitHub Actions verde no SHA esperado;
- [x] GitHub Pages publicou o SHA técnico esperado;
- [x] teste automatizado no site original concluído em Chrome real;
- [ ] teste mobile concluído;
- [ ] aprovação visual e clínica registrada por humano.

---

## 9. Evidências da release

| Evidência | Valor |
|---|---|
| Commit técnico publicado | `76004e8cdc270a0fbf5537b7c5ad984fdc3449e9` |
| URL da Pull Request | `https://github.com/aldenirfilho/antigravity-consultas/pull/5` |
| Revisores/aceites | Gates automatizados aprovados; aceite humano não presumido |
| URL da execução GitHub Actions | `https://github.com/aldenirfilho/antigravity-consultas/actions/runs/29777630244` |
| Resultado do build/deploy | Sucesso |
| Tamanho do artefato | 179,4 MiB; 497 arquivos |
| SHA publicado no Pages | `76004e8cdc270a0fbf5537b7c5ad984fdc3449e9` |
| URL de produção testada | `https://aldenirfilho.github.io/antigravity-consultas/` |
| Data/hora do teste (America/Fortaleza) | 20/07/2026, 17:53 (-03) |
| Navegador/versão | Google Chrome conectado via Codex Desktop; versão não exposta pela automação |
| Console/Network | Sem erro crítico; home HTTP 200; duas rotas privadas sentinela retornaram HTTP 404 |
| Desktop | Aprovado no teste automatizado em produção |
| Mobile | Automação inconclusiva por largura mínima; teste humano pendente |
| Aprovação visual humana | `NÃO PRESUMIDA — PENDENTE` |
| Aprovação clínica humana | `NÃO PRESUMIDA — PENDENTE` |

---

## 10. Plano de rollback reversível ↩️

### Gatilhos

Executar rollback se houver:

- exposição de dado privado;
- cálculo clínico divergente;
- quebra de home/rota crítica;
- erro persistente de JavaScript;
- artefato incompleto;
- comportamento de cache que preserve versão defeituosa.

### Procedimento recomendado

1. Registrar URL, horário, SHA e captura do problema.
2. Interromper nova divulgação da release.
3. Criar branch a partir de `main` atual.
4. Reverter o merge defeituoso de forma auditável:

```bash
git switch main
git pull --ff-only
git switch -c hotfix/rollback-antigravity-AAAA-MM-DD
git revert <SHA_DO_MERGE>
git push -u origin hotfix/rollback-antigravity-AAAA-MM-DD
```

5. Abrir PR de rollback e validar o mesmo conjunto de gates.
6. Após o merge, acompanhar o novo deploy do Pages.
7. Testar a rota afetada e registrar o SHA restaurado.

> Não usar `git reset --hard`, force-push ou reescrita de histórico como rollback
> rotineiro. Limpeza de histórico sensível é um projeto separado, com backup,
> análise de impacto e autorização explícita.

---

## 11. Backlog recomendado após estabilização

### Melhor opção — próximo ciclo

1. Preparar, com backup e autorização explícita, a remediação do histórico Git
   que possa conter material privado.
2. Adicionar E2E de mobile, acessibilidade e orçamento de desempenho.
3. Atualizar/fixar as GitHub Actions para runtime Node.js atual e registrar hash
   do artefato publicado.

### Alternativa

1. Distribuir mídias pesadas em armazenamento externo confiável.
2. Manter no Pages apenas índices, conteúdos autorais e apps leves.
3. Gerar catálogos assinados/hashados para detectar divergência.

### Contingência

1. Congelar novos arquivos públicos.
2. Publicar somente correções P0/P1.
3. Retomar expansão após orçamento de tamanho, licença e privacidade estar verde.

---

## 12. Síntese prática

**A release técnica foi publicada com os portões automatizados verdes. O aceite
integral permanece dividido em quatro gates auditáveis:**

1. 🔒 privacidade/LGPD — **automatizado verde; histórico separado pendente**;
2. 🩺 segurança clínica — **regressões verdes; revisão médica humana pendente**;
3. 🧪 testes locais e automáticos — **verde**;
4. 🌐 site original — **desktop automatizado verde; Safari/mobile humano
   pendente**.

O deploy não deve ser confundido com aprovação clínica ou visual humana. Esses
aceites permanecem explicitamente não presumidos.

### Principais erros a evitar

- usar `git add .` com material ainda em triagem;
- versionar ou publicar qualquer `inbox/`/staging privado;
- confiar em “arquivo existe localmente” sem verificar o artefato do Pages;
- aceitar validador verde que não retorna código de erro;
- publicar HTML/Markdown não sanitizado;
- considerar correção clínica aprovada sem revisão médica;
- confundir push, merge, deploy e teste visual — são gates diferentes.
