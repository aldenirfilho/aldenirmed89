# 📖 Leitor, anotações, revisão clínica e Card Feed — guia V2

**Data:** 21/07/2026
**Escopo:** Biblioteca IA + Dashboard editorial + Card Feed
**Regra central:** o original é somente leitura; anotações e decisões ficam em
camadas separadas e não alteram o arquivo-fonte.

## O que fazer agora

1. Abra um documento pela Biblioteca.
2. Use **Leitura limpa** para pesquisar, destacar ou sublinhar.
3. Use **PDF original**, **Abrir original** ou **Baixar** para conferir a
   paginação e a diagramação reais.
4. Exporte as anotações antes de limpar dados do navegador.
5. Registre responsável, fonte, data e validade em **🩺 Revisão clínica**.
6. No Card Feed, mantenha **📲 Feed contínuo** para uma rolagem leve.

## 1. Visualização por formato

| Formato | Leitura no painel | Conferência do original |
|---|---|---|
| PDF | HTML local com texto nativo ou OCR; permite busca e anotações | Botão **PDF original**, **Abrir original** ou **Baixar** |
| DOCX / Word | Conversão local do texto e estrutura; não promete paginação idêntica | **Abrir original**, **Baixar** ou Office Online externo para URL pública |
| Markdown | Renderização segura, com HTML bruto escapado | Botão **Fonte original** |
| TXT | Texto original em leitura limpa | Abrir/baixar |
| CSV / TSV | Tabela de até 300 linhas e 40 colunas | Abrir/baixar |

MD, TXT, CSV e TSV possuem limite de **2 MiB antes da carga integral**. Quando o
arquivo excede esse teto, o painel interrompe o stream e mantém os botões para o
original. Isso evita travamento do navegador sem apagar ou truncar a fonte.

## 2. Destaque e sublinhado com teclado

### Caminho por botão

1. Selecione um trecho dentro da leitura limpa.
2. Escolha a cor.
3. Clique em **🖍️ Destacar** ou **U Sublinha**.

### Caminho rápido H/U

1. Clique em **⌨️ Ativar atalhos H/U**.
2. Selecione um trecho.
3. Pressione:

```text
H = destacar
U = sublinhar
Esc = desativar os atalhos
```

Os atalhos são opt-in e não atuam em `input`, `textarea`, `select` ou campos
editáveis. Destaques antigos sem campo `kind` continuam tratados como destaque.

## 3. Exportações

As anotações podem ser exportadas em:

- Markdown;
- JSON;
- HTML autossuficiente e sem scripts;
- **PDF anotado (imprimir)**.

### Salvar a folha anotada como PDF

1. Crie ao menos uma anotação.
2. Clique em **PDF\*** ou selecione **PDF anotado (imprimir)**.
3. No diálogo do navegador, escolha **Salvar como PDF**.
4. Defina o nome e a pasta.

> O resultado é uma folha A4 com trechos, tipos e notas. Ele **não desenha uma
> sobreposição no PDF original** e não altera o original.

## 4. Dashboard da recuperação autoral

Abra:

```text
02_Biblioteca_IA_Engine/recovery-review-dashboard.html
```

Fotografia agregada atual:

| Indicador | Valor |
|---|---:|
| Fotografia anterior citada | 549 candidatos |
| Varredura atual | 555 candidatos |
| Diferença | +6 |
| Obras únicas por SHA | 425 |
| Grupos de duplicatas exatas | 85 |
| Ocorrências dentro desses grupos | 215 |
| Possíveis rendições | 9 |
| SHA já públicos / ocorrências excluídas | 6 / 8 |
| Obras elegíveis para triagem privada | 419 |
| Próximo lote | 5 obras / 6 ocorrências |
| Restantes depois do lote | 414 obras |

O JSON público contém somente essas contagens. Nomes, caminhos, IDs, hashes e
conteúdo dos candidatos permanecem privados.

### Conferir se a fotografia pública ainda está atual

Na raiz do repositório:

```bash
python3 scripts_admin/update_authorial_recovery_public_summary.py \
  --source-root "02_Biblioteca_IA_Engine/inbox" \
  --source-root "00_INBOX_ATUALIZACAO/_private/triagem-biblioteca-autoral-2026-07-21" \
  --public-manifest "02_Biblioteca_IA_Engine/data/biblioteca_documentos_manifest.json" \
  --baseline-candidates 549 \
  --batch-size 5 \
  --check
```

Esse comando é somente leitura. Se informar que o dashboard está desatualizado,
revise primeiro a prévia agregada sem flag. A escrita pública exige a autorização
explícita `--write-public` e só pode atingir o JSON canônico do dashboard.

## 5. Fila de revisão clínica

No dashboard:

1. Localize o documento.
2. Clique em **Editar revisão**.
3. Informe:
   - status;
   - responsável;
   - fonte ou referência;
   - data da revisão;
   - validade;
   - notas sem dados de paciente.
4. Clique em **Salvar revisão**.
5. Use **Exportar fila JSON** para backup.

O status **Aprovado** exige responsável, fonte, data de revisão e validade. Uma
validade anterior à revisão é recusada. Quando a validade passa, o painel mostra
**Validade vencida** automaticamente.

> A fila fica no `localStorage` deste navegador, sem criptografia e sem escrita
> no GitHub. Não inclua qualquer dado identificável de paciente.

## 6. Cache OCR por SHA

- diretório local/CI: `.cache/library-ocr-v1/`;
- ignorado pelo Git e excluído do site;
- chave: SHA da fonte + versão do pipeline + línguas + DPI + limite de páginas +
  PSM e limites técnicos;
- cache inválido, corrompido ou simbólico vira miss seguro;
- build pode gravar; `--check` somente lê;
- falhas transitórias de OCR não são persistidas.

No primeiro deploy frio, cada SHA que exige OCR é processado uma vez e o check
reutiliza o resultado. Em deploy quente sem mudanças, o cache do GitHub Actions
pode evitar o OCR inteiramente. Isso reduz aproximadamente pela metade a etapa
OCR build/check, não necessariamente o tempo total do deploy.

## 7. Card Feed contínuo

- visualização padrão: **Feed contínuo**;
- lote inicial: 10 cards;
- Grade: 24 por lote;
- Compacto: 20 por lote;
- novos lotes: `IntersectionObserver`;
- contingência acessível: botão **Carregar mais cards**;
- primeiras duas imagens: prioridade alta;
- demais imagens: carregamento preguiçoso;
- busca, tema, filtro, ordenação, modo e card permanecem na URL/estado local.

Se o filtro retornar zero, use **Limpar filtros**. Se os dados não carregarem, o
estado vazio mostra **Tentar novamente** sem sugerir que o acervo foi apagado.

## 8. Inserir novos documentos

Siga o guia canônico:

```text
08_Documentacao_Projeto/GUIA_INSERCAO_SEGURA_DOCUMENTOS.md
```

Resumo mínimo:

1. Receba o bruto em `00_INBOX_ATUALIZACAO/_private/triagem/`.
2. Preserve backup e não mova o original.
3. Complete LGPD, licença/autoria e revisão clínica.
4. Copie somente a versão aprovada para o hub público correto.
5. Regenere o scanner/manifesto específico.
6. Revise o diff arquivo por arquivo; nunca use `git add .`.
7. Rode testes, build seguro e teste real no navegador.

## Principais erros a evitar

- anotar o PDF original e supor que o arquivo foi modificado;
- usar leitura OCR como única conferência clínica;
- aprovar conteúdo sem fonte e validade;
- registrar dados de paciente na fila ou nas notas;
- enviar material de terceiro integral ao acervo público;
- confundir duplicata por SHA com autorização para excluir;
- limpar o navegador sem exportar as anotações e a fila;
- tratar testes verdes como aprovação visual humana.
