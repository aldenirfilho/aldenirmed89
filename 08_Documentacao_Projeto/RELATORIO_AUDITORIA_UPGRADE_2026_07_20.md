# 🔎 Relatório de auditoria e upgrade — Antigravity Consultas

**Data da auditoria:** 20/07/2026

**Repositório:** `aldenirfilho/antigravity-consultas`

**Branch de trabalho:** `agent/auditoria-otimizacao-jul-2026`

**Base auditada:** `ad1674f8b4871067fe86e47fdf9807134265b467`

**Estado deste documento:** gate local concluído; publicação e aceite em produção ainda pendentes
**Responsável pelo aceite clínico e visual:** Dr. Aldenir Rocha

> ⚠️ Este relatório não declara deploy, aprovação visual nem teste final do site
> público como concluídos. Os campos de evidência da release devem ser preenchidos
> somente após commit, Pull Request, GitHub Actions e teste no navegador real.

---

## 1. Resultado executivo

A auditoria encontrou riscos relevantes em **privacidade**, **tamanho do artefato**,
**segurança do leitor de Markdown**, **cálculos/textos clínicos**, **rotas**,
**catálogos** e **cache PWA**.

As primeiras correções foram aplicadas localmente com estratégia
**manifest-first**, sem reorganização destrutiva do acervo. O principal ganho foi
a implantação de um portão de publicação que bloqueia staging e categorias
privadas, saneia metadados e rejeita um artefato acima do limite interno.

### Situação em uma tela 🧠

| Área | Situação atual | Próximo gate |
|---|---|---|
| Privacidade do estado atual | Mitigação local aplicada | Confirmar artefato montado e tratar histórico separadamente |
| Rotas e diretórios | Correções locais aplicadas; nova validação obrigatória | Executar suíte final após todas as mudanças |
| Conteúdo clínico interativo | Correções críticas aplicadas e cobertas por regressão local | Repetir smoke test e obter revisão médica |
| Segurança do frontend | Endurecimento aplicado; IA externa do RespiraCrit desativada | Repetir QA no artefato final |
| Performance/publicação | Build allowlist medido abaixo do orçamento | Fechar varredura completa de metadados e duplicatas |
| GitHub/Pages | **Não concluído neste relatório** | Commit → PR → Actions → deploy → navegador real |

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
- comprovação de deploy do commit final.

### Princípios usados

1. **Preservar primeiro:** arquivos locais não foram apagados como parte da
   retirada do rastreamento público.
2. **Falhar fechado:** divergências de privacidade, rota ou tamanho devem
   interromper a publicação.
3. **Mudança reversível:** branch própria, commits pequenos e rollback por
   `git revert`, sem reescrita destrutiva.
4. **Sem aprovação visual presumida:** validação estática não substitui o teste
   do site real.
5. **Conteúdo clínico exige duplo gate:** teste de software + revisão médica.

---

## 3. Plano estratégico em blocos médios de 20 minutos ⏱️

> Cada bloco possui uma entrega verificável. Se um bloco exceder 20 minutos,
> interromper em um checkpoint seguro, registrar a pendência e continuar no
> bloco seguinte.

| Bloco | Janela | Objetivo | Entrega/critério de saída | Estado no momento deste relatório |
|---|---:|---|---|---|
| 0 | 0–20 min | Guard inicial | Projeto, branch, base/HEAD, remote e worktree registrados | ✅ Concluído localmente |
| 1 | 20–40 min | Arquitetura e rotas | Mapa de hubs, wrappers, aliases, 404 e transições | ✅ Concluído localmente |
| 2 | 40–60 min | Privacidade e publicação | Rastreamento privado interrompido; portão fail-closed criado | ✅ Aplicado localmente; aceite do artefato pendente |
| 3 | 60–80 min | Segurança do frontend | Leitor Markdown, preview, iframes e armazenamento local revisados | ✅ Correções aplicadas; QA final no artefato ainda obrigatório |
| 4 | 80–100 min | Segurança clínica | Fórmula de PBW e texto de ciclagem em PSV revisados/testados | ✅ Regressões automatizadas verdes; aceite médico humano pendente |
| 5 | 100–120 min | Diretórios e catálogos | Scanners regenerados; referências obsoletas removidas dos manifests | ✅ Parcialmente concluído; reexecutar no fechamento |
| 6 | 120–140 min | PWA e desempenho | Cache isolado; artefato abaixo do limite; estratégia de atualização validada | ✅ Build intermediário de 179,6 MiB; repetir medição no fechamento |
| 7 | 140–160 min | Testes locais | Validadores verdes + smoke test das rotas críticas | ✅ Gate local concluído em artefato reconstruído |
| 8 | 160–180 min | Documentação e handoff | Relatório, guia de inserção e checklist de release | ✅ Documentos preparados |
| 9 | 180–200 min | GitHub | Escopo revisado, commit, push e PR com evidências | ⏳ Pendente |
| 10 | 200–220 min | Deploy e produção | Actions verde, Pages no SHA esperado e navegador real aprovado | ⏳ Pendente — não presumir aprovação |

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
| P0-01 | O workflow copiava uma árvore ampla da biblioteca, incluindo staging e uma categoria pessoal | Exposição pública de conteúdo sensível e metadados | Remover essas classes do rastreamento atual, ignorá-las, saneá-las dos JSON e bloquear no repositório/artefato | ✅ Mitigado no estado local atual; histórico Git ainda requer plano próprio |
| P0-02 | O conjunto permitido para o Pages ultrapassava aproximadamente 1 GiB | Falha de upload/deploy, lentidão e custo de distribuição | Limite interno de 900 MiB e revisão da allowlist/acervo público | ✅ Build intermediário reduzido para 179,6 MiB; medição final obrigatória |
| P0-03 | O banco de questões carregava um arquivo de dados vazio na rota pública | Tela sem conteúdo ou falha silenciosa | Corrigir a fonte canônica/wrapper e adicionar teste de carregamento | ✅ Fonte canônica populada; rota e redirect aprovados no navegador local |
| P0-04 | O cálculo de peso corporal predito (PBW) limitava alturas baixas a 152,4 cm | Superestimação de PBW e volume corrente em pacientes de menor estatura | Usar a altura real validada e cobrir limites com testes | ✅ Corrigido e coberto por regressão; aceite clínico humano pendente |
| P0-05 | A orientação textual de ciclagem em PSV estava invertida entre ciclagem precoce e tardia | Risco educacional e de aplicação clínica inadequada | Corrigir direção do ajuste, citar fonte e obter revisão médica | ✅ Corrigido e coberto por regressão; aceite clínico humano pendente |
| P0-06 | O leitor Markdown aceitava caminho arbitrário e injetava HTML renderizado diretamente | XSS/execução de conteúdo não confiável no mesmo domínio | Restringir a origem/caminhos, sanitizar o HTML e usar fallback seguro | ✅ Allowlist/sanitização aplicadas e regressão verde |
| P0-07 | Previews HTML eram abertos em iframes sem sandbox | Conteúdo incorporado podia executar scripts com privilégios do domínio | Aplicar sandbox mínimo e restringir formatos/caminhos aceitos | ✅ Sandbox mínimo e validação fail-closed aplicados |
| P0-08 | A primeira versão do portão verificava apenas uma lista parcial de JSON; metadados privados e cópias `* 2.*` ainda passavam | Falso verde de privacidade no artefato | Varrer todos os JSON, rejeitar JSON inválido e excluir cópias de conflito no builder | ✅ 128 JSON do repositório e 59 do artefato: zero privados/inválidos; zero `* 2.*` no site |

### P1 — alta prioridade ⚠️

| ID | Achado | Impacto | Tratamento | Estado |
|---|---|---|---|---|
| P1-01 | Links do hub de apps não subiam um nível de diretório | Navegação para caminhos inexistentes | Corrigir caminhos relativos | ✅ Aplicado localmente |
| P1-02 | Imagens do módulo de AVC divergiam em caixa e normalização Unicode | 404 em ambiente Linux/GitHub Pages | Alinhar caixa e usar nomes NFC | ✅ Aplicado localmente |
| P1-03 | A página 404 não era copiada e os links relativos falhavam em rotas aninhadas | Recuperação inconsistente de navegação | Copiar `404.html` e definir base pública | ✅ Aplicado localmente |
| P1-04 | O wrapper amigável do Card Feed não fazia parte do artefato | Rota amigável ausente | Incluir o wrapper na allowlist | ✅ Aplicado localmente |
| P1-05 | Validadores podiam terminar com sucesso após encontrar divergências; um modo de correção removia referências | Falso verde e perda silenciosa de catálogo | Tornar falhas não zero e impedir poda automática de item ausente | ✅ Aplicado localmente |
| P1-06 | Service workers removiam caches que não lhes pertenciam | Interferência entre módulos do mesmo domínio | Prefixar/fixar a família de cache e apagar apenas versões próprias | ✅ Isolamento inicial aplicado |
| P1-07 | Snapshots clínicos persistiam HTML/dados livres no armazenamento local | Privacidade local e superfície de injeção | Persistir somente dados necessários, escapar saída e evitar identificadores | ✅ Chave versionada, limites e escape aplicados; QA final ainda obrigatório |
| P1-08 | A pasta espelho `public_site/` divergia da fonte principal | Duplicidade, confusão de fonte canônica e validações frágeis | Torná-la gerada automaticamente ou removê-la do contrato após migração controlada | ⏳ Decisão arquitetural pendente |

### P2 — otimização e manutenção 🛠️

| ID | Achado | Melhoria recomendada |
|---|---|---|
| P2-01 | Um índice de imagens aponta para uma folha de estilo ausente | Corrigir para asset compartilhado existente e adicionar smoke test visual |
| P2-02 | Há aliases, wrappers e nomes legados em paralelo | Formalizar uma rota canônica por produto e testar todos os redirects |
| P2-03 | Scanners aceitam muitos formatos sem política de publicação por tipo | Criar allowlist por hub e exigir sandbox/revisão para HTML e arquivos executáveis |
| P2-04 | Catálogos podem manter entradas de arquivos removidos ou grandes demais | Tornar scanners determinísticos e comparar catálogo com disco no CI |
| P2-05 | O workflow usa cópias repetidas e permissões amplas no artefato | Criar script único de build local/CI e aplicar permissões mínimas |
| P2-06 | Não há orçamento explícito por módulo | Adotar limite de tamanho, contagem e tempo de carregamento por hub |
| P2-07 | Falta matriz automatizada de acessibilidade e mobile | Incluir testes de teclado, contraste, viewport e redução de movimento |

---

## 5. Correções aplicadas localmente

> “Aplicada localmente” significa presente na branch de trabalho; não significa
> que já esteja publicada no site original.

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

## 6. Correções ainda pendentes antes da release

### Bloqueiam publicação

- [x] endurecer o portão para varrer todos os JSON e rejeitar duplicatas de
  conflito, reconstruindo o artefato com zero referência privada;
- [ ] obter aceite médico humano das correções de PBW/ciclagem;
- [x] repetir o smoke test em aba limpa após o último build;
- [x] montar o artefato final e comprovar tamanho `≤ 900 MiB` e zero metadado
  privado;
- [x] reexecutar toda a suíte após a última alteração.

### Podem entrar em ciclo posterior, se os P0 estiverem fechados

- [ ] decidir o destino definitivo do espelho `public_site/`;
- [ ] consolidar nomes canônicos e aliases legados;
- [ ] ampliar a matriz de atualização/fallback dos service workers em navegadores
  e estados offline diferentes;
- [ ] adicionar automação de acessibilidade, mobile e orçamento de desempenho;
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
python3 -m http.server 8000
```

Abrir `http://localhost:8000/` e verificar:

- [x] home carrega sem erro crítico no console;
- [x] Biblioteca, UpDown, apps, calculadoras, questões, POCUS e Card Feed abrem;
- [x] busca, catálogos e filtros básicos inicializam;
- [x] 404 possui recuperação compatível com a base do GitHub Pages;
- [x] banco de questões contém quatro módulos no teste local;
- [x] traversal do leitor é rejeitado e previews usam sandbox;
- [x] service workers usam versão/família de cache isolada;
- [ ] layout é utilizável em desktop e viewport móvel.

---

## 8. Critérios de aceite da release ✅

### Privacidade e publicação

- [ ] `check-repository` retorna código 0;
- [ ] artefato contém zero caminhos/metadados privados;
- [ ] `check-site` retorna código 0;
- [ ] artefato final mede no máximo 900 MiB;
- [ ] nenhum dado de paciente, documento pessoal ou bastidor aparece no site;
- [ ] risco de exposição histórica foi registrado e tem plano separado.

### Integridade funcional

- [ ] validadores estáticos e de rotas retornam código 0;
- [ ] aliases preservam links antigos;
- [ ] nenhum 404 nas rotas críticas;
- [ ] banco de questões carrega conteúdo real;
- [ ] imagens auditadas carregam com caixa/Unicode corretos;
- [ ] console do navegador sem erro crítico.

### Segurança clínica

- [ ] fórmula de PBW validada com exemplos de ambos os sexos e alturas abaixo,
  próximas e acima de 152,4 cm;
- [ ] texto de ciclagem em PSV revisado pelo responsável médico;
- [ ] doses, unidades, arredondamentos e avisos clínicos revisados;
- [ ] ferramenta mantém aviso de apoio cognitivo, não prescrição.

### Segurança web

- [ ] leitor aceita somente documentos públicos previstos;
- [ ] HTML renderizado é sanitizado, com fallback seguro;
- [ ] iframes usam sandbox mínimo compatível;
- [ ] armazenamento local não persiste identificadores desnecessários;
- [ ] service workers não removem caches de outros módulos.

### Release e validação humana

- [ ] PR revisado e mergeado;
- [ ] GitHub Actions verde no SHA esperado;
- [ ] GitHub Pages aponta para o mesmo SHA;
- [ ] teste no site original concluído em navegador real;
- [ ] teste mobile concluído;
- [ ] aprovação visual e clínica registrada por humano.

---

## 9. Evidências da release — preencher após execução

| Evidência | Valor |
|---|---|
| Commit final | `PREENCHER` |
| URL da Pull Request | `PREENCHER` |
| Revisores/aceites | `PREENCHER` |
| URL da execução GitHub Actions | `PREENCHER` |
| Resultado do build | `PENDENTE` |
| Tamanho do artefato | `PENDENTE` |
| SHA publicado no Pages | `PENDENTE` |
| URL de produção testada | `https://aldenirfilho.github.io/antigravity-consultas/` |
| Data/hora do teste (America/Fortaleza) | `PENDENTE` |
| Navegador/versão | `PENDENTE` |
| Console/Network | `PENDENTE` |
| Desktop | `PENDENTE` |
| Mobile | `PENDENTE` |
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

1. Criar um único script de build local idêntico ao GitHub Actions.
2. Adicionar testes automatizados de segurança e cálculo clínico.
3. Trocar publicação de acervo bruto por conteúdo autoral leve e links às fontes.

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

**O projeto deve ser publicado apenas quando quatro gates estiverem verdes:**

1. 🔒 privacidade/LGPD;
2. 🩺 segurança clínica;
3. 🧪 testes locais e automáticos;
4. 🌐 validação do site original em navegador real.

### Principais erros a evitar

- usar `git add .` com material ainda em triagem;
- versionar ou publicar qualquer `inbox/`/staging privado;
- confiar em “arquivo existe localmente” sem verificar o artefato do Pages;
- aceitar validador verde que não retorna código de erro;
- publicar HTML/Markdown não sanitizado;
- considerar correção clínica aprovada sem revisão médica;
- confundir push, merge, deploy e teste visual — são gates diferentes.
