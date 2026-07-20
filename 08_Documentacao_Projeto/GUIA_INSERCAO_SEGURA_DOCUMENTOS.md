# 📥 Guia de inserção segura de documentos

**Projeto:** Antigravity Consultas

**Versão:** 1.0 — 20/07/2026
**Objetivo:** inserir novos conteúdos na seção correta sem expor dados privados,
violar licença, quebrar rotas ou publicar material clínico não revisado.

---

## 1. Regra de ouro — uma linha

> 🔒 **Todo arquivo nasce privado. Só é copiado para uma pasta pública depois de
> passar pelos gates LGPD, licença e revisão clínica.**

Os diretórios `inbox/` e `00_INBOX_ATUALIZACAO/` são **staging local privado**:
ficam ignorados pelo Git, não entram nos catálogos e nunca são copiados para o
site. A publicação só ocorre a partir de `public/`, `acervo/` ou `content/`,
conforme a seção.

---

## 2. O que fazer agora — fluxo TDAH-friendly 🧠

```text
RECEBER EM STAGING PRIVADO
        ↓
GATE 1 — LGPD / anonimização
        ↓
GATE 2 — licença / direitos autorais
        ↓
GATE 3 — revisão clínica e editorial
        ↓
ESCOLHER O HUB PÚBLICO
        ↓
GERAR CATÁLOGO / REGISTRY
        ↓
VALIDAR → PREVIEW → PR → DEPLOY → TESTE REAL
```

### Checklist de 60 segundos

- [ ] O arquivo está primeiro em `_private/`?
- [ ] Não contém identificador de paciente ou dado pessoal?
- [ ] Há autorização/licença para publicação?
- [ ] O conteúdo foi transformado em material autoral quando necessário?
- [ ] Dados clínicos, doses e recomendações foram revisados?
- [ ] Escolhi o hub correto na tabela abaixo?
- [ ] Vou adicionar somente os arquivos públicos explicitamente aprovados?

Se uma resposta for **não** ou **não sei**, o arquivo permanece privado.

---

## 3. Etapa 0 — criar staging privado

Na raiz do repositório:

```bash
mkdir -p "00_INBOX_ATUALIZACAO/_private/triagem"
git check-ignore -v "00_INBOX_ATUALIZACAO/triagem/arquivo-teste.local"
```

O segundo comando deve mostrar a regra `00_INBOX_ATUALIZACAO/` do `.gitignore`.

### Uso correto

1. Coloque o arquivo bruto em:

```text
00_INBOX_ATUALIZACAO/triagem/
```

2. Faça a triagem sem mover o original.
3. Crie uma cópia anonimizada/autoral para publicação.
4. Só depois copie essa versão aprovada para o hub público.

### Nunca fazer

```bash
git add .
git add -A
```

Use staging explícito apenas dos arquivos públicos revisados:

```bash
git add "CAMINHO/DO/ARQUIVO_PUBLICO"
git add "CAMINHO/DO/MANIFESTO_ATUALIZADO.json"
git diff --cached --stat
git diff --cached --check
```

> O staging privado é local e ignorado. Ele não é backup: mantenha o original em
> armazenamento seguro e protegido conforme a política institucional.

---

## 4. Três gates obrigatórios antes da pasta pública 🛡️

### Gate 1 — LGPD e confidencialidade

- [ ] zero nome, iniciais identificáveis, prontuário, CPF, telefone ou endereço;
- [ ] zero datas/combinações que permitam reidentificação;
- [ ] imagens sem face, pulseira, etiqueta, tela de prontuário ou metadados;
- [ ] casos clínicos suficientemente anonimizados e generalizados;
- [ ] nenhum documento pessoal, financeiro, jurídico ou institucional restrito;
- [ ] na dúvida, manter em `_private/` e não catalogar.

### Gate 2 — licença e direitos autorais

- [ ] autoria e titularidade conhecidas;
- [ ] licença permite distribuição pública;
- [ ] fonte e versão registradas;
- [ ] sem livro, artigo ou diretriz integral protegida sem autorização;
- [ ] preferência por síntese autoral, referência e link oficial;
- [ ] imagens de terceiros com licença e atribuição compatíveis.

### Gate 3 — revisão clínica/editorial

- [ ] recomendação compatível com fonte vigente;
- [ ] dose, unidade, diluição, velocidade e ajuste renal/hepático conferidos;
- [ ] diferenças entre evidência, diretriz, protocolo e inferência sinalizadas;
- [ ] data de revisão e referências presentes;
- [ ] linguagem educacional, sem substituir decisão clínica individual;
- [ ] aprovação médica antes de mudar `status` para `ativo`.

---

## 5. Para qual seção o documento deve ir?

| Conteúdo aprovado | Destino público | Atualização necessária |
|---|---|---|
| Artigo, diretriz ou documento para acervo pesquisável | `02_Biblioteca_IA_Engine/acervo/<tema>/` | Scanner da Biblioteca |
| Conteúdo autoral Markdown/HTML de estudo | `01_UpDown_Hub/content/<area>/` | Entrada manual em `01_UpDown_Hub/registry.json` |
| Ebook/guia longo com licença pública | `04_Ebooks_Intensiva_Clinica/public/` | Scanner do hub |
| Questão comentada, OSCE, CSV ou Anki | `07_Questoes_Comentadas/public/` | Scanner do hub |
| Transcrição anonimizada e autorizada | `08_Transcricoes/public/` | Scanner do hub |
| Aula, imagem, vídeo ou material POCUS licenciado | `09_POCUS_Hub/public/` | Scanner do hub |
| Card/infográfico autoral | `05_Midia_E_Feed/assets/cards/public/` | Scanner do Card Feed |
| Página/app clínico interativo | `01_Modulos_Clinicos/<dominio>/` | Registro/links e teste manual |
| Calculadora clínica | `03_Calculadoras_UTI/` | Manifest/rota e testes clínicos |
| Link externo | `<hub>/links/links.json` | Scanner do hub correspondente |
| Imagem de galeria | `imagens/` | Link/index manual e teste de caixa/Unicode |

> 🚨 Nunca promova o diretório inteiro de staging. Copie **somente a versão
> final aprovada** para a pasta pública indicada e revise o diff explicitamente.

---

## 6. Passo a passo por seção

### A. Biblioteca IA Engine 📚

Use para fontes e documentos pesquisáveis já autorizados para distribuição.

1. Escolha um tema público existente ou crie um slug simples:

```text
02_Biblioteca_IA_Engine/acervo/ventilacao-mecanica/
02_Biblioteca_IA_Engine/acervo/pocus/
02_Biblioteca_IA_Engine/acervo/neurointensivismo/
```

2. Copie apenas a versão aprovada para o tema.
3. Regenere o catálogo:

```bash
(cd 02_Biblioteca_IA_Engine && python3 scan_biblioteca.py)
```

4. Saneie metadados e verifique o portão:

```bash
python3 scripts_admin/publication_guard.py sanitize-data .
python3 scripts_admin/publication_guard.py check-repository .
```

5. Revise o diff dos JSON gerados antes de adicionar ao Git.

**Não usar:** a área de staging da biblioteca como fonte pública. Ela é privada,
ignorada e excluída dos catálogos públicos.

---

### B. UpDown Hub — conteúdo canônico ✍️

Use para material didático autoral e revisado.

1. Crie o arquivo em:

```text
01_UpDown_Hub/content/<area>/<slug>.md
```

2. Use slug minúsculo, sem acento e com hífens.
3. Inclua frontmatter:

```yaml
---
title: "Título do tema"
slug: "slug-do-tema"
category: "Terapia Intensiva"
tags: [uti, temi]
status: "rascunho"
visibility: "publico"
source_type: "síntese autoral baseada em fontes citadas"
copyright_safety: "reescrita autoral, sem cópia literal extensa"
links_relacionados: []
created_for: "Projeto Antigravity"
---
```

4. Adicione a entrada correspondente em:

```text
01_UpDown_Hub/registry.json
```

Campos mínimos:

```json
{
  "id": "updown-slug-do-tema",
  "title": "Título do tema",
  "icon": "🩺",
  "path": "content/area/slug-do-tema.md",
  "theme": "tema",
  "status": "rascunho",
  "version": "v0.1",
  "summary": "Resumo curto e objetivo.",
  "tags": ["uti", "temi"]
}
```

5. Mantenha `rascunho` ou `em_revisao` até o aceite médico.
6. Depois do aceite, mude para `ativo` e execute os validadores gerais.

> Não há scanner automático confiável para o registry: a entrada é revisada e
> adicionada manualmente.

---

### C. Ebooks, Questões, Transcrições e POCUS 📘🧠🎙️🔊

Após os três gates, copie a versão aprovada para o diretório `public/` do hub
correto. Os scripts mantêm o nome legado `scan_inbox.sh`, mas leem somente
`public/`; nenhum arquivo de `inbox/` é catalogado.

Execute somente o scanner do hub alterado:

```bash
bash 04_Ebooks_Intensiva_Clinica/scan_inbox.sh
bash 07_Questoes_Comentadas/scan_inbox.sh
bash 08_Transcricoes/scan_inbox.sh
bash 09_POCUS_Hub/scan_inbox.sh
```

Ou execute o scanner genérico diretamente:

```bash
python3 scripts_admin/scan_content_module.py 04_Ebooks_Intensiva_Clinica
python3 scripts_admin/scan_content_module.py 07_Questoes_Comentadas
python3 scripts_admin/scan_content_module.py 08_Transcricoes
python3 scripts_admin/scan_content_module.py 09_POCUS_Hub
```

O catálogo gerado fica em:

```text
<hub>/data/catalogo.json
```

Revise, no mínimo: `title`, `path`, `format`, `sizeBytes`, `tags` e contagem.

#### Arquivos grandes

- GitHub rejeita arquivo individual acima do limite da plataforma.
- Um arquivo aceito individualmente ainda pode tornar o artefato total inviável.
- Prefira página autoral + link oficial para obras longas protegidas.
- O artefato inteiro deve permanecer abaixo do orçamento interno de 900 MiB.

---

### D. Links externos 🔗

Para Ebooks, Questões, Transcrições ou POCUS:

1. Edite o arquivo do hub:

```text
<hub>/links/links.json
```

2. Use uma entrada como:

```json
{
  "id": "diretriz-oficial-tema-ano",
  "title": "Diretriz oficial — tema",
  "url": "https://dominio-oficial.example/documento",
  "format": "link",
  "tags": ["diretriz", "tema"],
  "description": "Fonte oficial consultada em DD/MM/AAAA."
}
```

3. Confirme que o domínio é oficial e a URL usa HTTPS.
4. Rode o scanner do hub.
5. Teste o link no navegador.

---

### E. Card Feed 🖼️

1. Confirme autoria/licença e remova qualquer identificador.
2. Use imagem otimizada em PNG, JPG/JPEG ou WebP.
3. Copie a versão final para:

```text
05_Midia_E_Feed/assets/cards/public/
```

4. Atualize o manifesto:

```bash
(cd 05_Midia_E_Feed && bash scan_inbox.sh)
```

5. Abra o Card Feed e verifique corte, texto, contraste e mobile.

Sugestão de desempenho: prefira WebP quando não houver perda de legibilidade e
evite imagens maiores que a resolução necessária para o card.

---

### F. Módulos clínicos e calculadoras 🧮

Esses itens não são simples documentos: podem alterar decisões clínicas.

1. Crie/edite em branch própria.
2. Mantenha funções de cálculo separadas da interface quando possível.
3. Adicione testes com casos conhecidos, limites e entradas inválidas.
4. Verifique unidades, arredondamentos e sexo biológico quando a fórmula exigir.
5. Adicione aviso de apoio cognitivo e conferência institucional.
6. Registre a rota nos manifests aplicáveis.
7. Obtenha revisão médica antes de ativar o link público.

Checklist mínimo:

- [ ] fórmula comparada com fonte primária/diretriz;
- [ ] entrada mínima, máxima, vazia e não numérica;
- [ ] unidade visível em entrada e resultado;
- [ ] nenhum valor clínico inventado no fallback;
- [ ] resultado não persiste identificador do paciente;
- [ ] mobile e teclado funcionam;
- [ ] console sem erro.

---

### G. Imagens e galeria 🖼️

1. Use nome de arquivo em Unicode NFC e preserve a mesma caixa em HTML/JSON.
2. Evite acentos no slug quando uma versão simples for viável.
3. Inclua texto alternativo clínico e objetivo.
4. Atualize o índice/manifesto que referencia a imagem.
5. Teste em servidor local Linux-like; o GitHub Pages diferencia maiúsculas e
   minúsculas.

---

## 7. Atualização em lote

Se vários hubs públicos foram alterados e todos os documentos já estão
aprovados:

```bash
bash scripts_admin/atualizar_tudo.sh
```

Esse comando escreve manifests. Portanto, logo depois execute:

```bash
git status --short
git diff --stat
git diff --check
```

Revise os arquivos gerados. Não aceite exclusões ou mudanças inesperadas sem
investigar.

---

## 8. Validação obrigatória antes do commit 🧪

### Suíte copiável

```bash
python3 scripts_admin/publication_guard.py check-repository .
python3 scripts_admin/check_static_manifests.py
python3 scripts_admin/validar_paths.py --check
python3 scripts/validate_routes.py
python3 scripts_admin/validate_mapa_vivo.py
bash scripts_admin/atualizar_tudo.sh --check
```

Todos os comandos devem terminar com código 0. Avisos precisam ser lidos; não
devem ser ignorados automaticamente.

### Preview local

```bash
python3 -m http.server 8000
```

Abra:

```text
http://localhost:8000/
```

Teste a home, o hub alterado, o documento novo, um link de retorno e uma rota
inválida. Encerre o servidor com `Control + C`.

### Checklist visual

- [ ] documento aparece no hub correto;
- [ ] título, tags e descrição estão legíveis;
- [ ] link abre sem 404;
- [ ] imagens carregam;
- [ ] PDF/download funciona quando permitido;
- [ ] console sem erro crítico;
- [ ] layout mobile não corta informação essencial;
- [ ] conteúdo antigo continua acessível.

---

## 9. Commit seguro e Pull Request

Crie uma branch descritiva:

```bash
git switch -c content/slug-do-tema-AAAA-MM-DD
```

Adicione explicitamente apenas a versão pública e os manifests esperados:

```bash
git add "CAMINHO/DO/CONTEUDO_PUBLICO"
git add "CAMINHO/DO/CATALOGO.json"
git diff --cached --stat
git diff --cached --check
git commit -m "content: adiciona tema revisado ao hub correto"
git push -u origin content/slug-do-tema-AAAA-MM-DD
```

No PR, registre:

- origem/licença;
- confirmação de anonimização;
- responsável pela revisão clínica;
- scanners e validadores executados;
- rotas testadas;
- tamanho do arquivo e impacto no artefato;
- screenshots quando houver alteração visual.

---

## 10. Depois do merge — não parar no “Actions verde” 🌐

1. Confirmar o SHA mergeado.
2. Aguardar o workflow do GitHub Pages.
3. Confirmar que o deploy usa o mesmo SHA.
4. Abrir o site original sem depender da aba antiga.
5. Testar o novo conteúdo e uma rota antiga relacionada.
6. Verificar Console e Network.
7. Testar desktop e mobile.
8. Registrar data/hora, navegador, URL e resultado.

> Build verde prova que a automação terminou; não prova que a experiência visual
> ou o conteúdo clínico foram aprovados.

---

## 11. Diagnóstico rápido de falhas

| Sintoma | Verificar primeiro | Ação segura |
|---|---|---|
| Documento não aparece | Catálogo/registry e `status` | Regenerar scanner ou corrigir entrada manual |
| Link retorna 404 | Caixa, Unicode, caminho relativo e alias | Corrigir referência; preservar wrapper legado |
| Scanner remove item | Arquivo existe e está no hub correto? | Não aceitar a exclusão até confirmar destino |
| Portão de privacidade falha | Caminho rastreado ou metadado JSON | Retirar do staging Git, manter local e sanear dados |
| Upload Pages falha | Tamanho individual e total | Remover do artefato público; usar link externo autorizado |
| Site mostra versão antiga | Service worker/cache/deploy SHA | Confirmar SHA, atualizar e testar janela nova |
| HTML não abre no preview | Sandbox ou formato não aprovado | Não relaxar segurança sem análise; converter para formato seguro |

---

## 12. Principais erros a evitar ❌

1. Colocar arquivo bruto diretamente em `public/` ou tentar versionar `inbox/`.
2. Publicar material clínico antes da revisão médica.
3. Publicar obra integral protegida porque “é apenas para estudo”.
4. Usar dados de caso real sem anonimização robusta.
5. Rodar scanner e aceitar todo o diff sem revisão.
6. Usar `git add .` em um repositório com staging local.
7. Corrigir 404 movendo/renomeando arquivos sem preservar aliases.
8. Considerar o deploy concluído sem testar o site original.

---

## 13. Síntese prática

### Melhor fluxo

**Privado → três gates → hub público → scanner → validadores → preview → PR →
deploy → teste real.**

### Alternativa para obra protegida ou muito grande

Publicar uma **síntese autoral** com referência e link oficial, sem hospedar o
arquivo integral.

### Plano de contingência

Se houver qualquer dúvida de privacidade, licença ou segurança clínica:

1. manter o arquivo em `_private/`;
2. não catalogar nem adicionar ao Git;
3. solicitar revisão específica antes de continuar.
