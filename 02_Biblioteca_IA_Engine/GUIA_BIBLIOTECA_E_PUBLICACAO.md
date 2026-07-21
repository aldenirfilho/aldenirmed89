# Biblioteca IA — guia de estudo, recuperação e publicação

Versão: 2026-07-21
Escopo: `02_Biblioteca_IA_Engine`

## O que foi corrigido

- O manifesto físico passou a ser a única fonte estrutural do catálogo.
- Cada documento público possui um ID e um caminho canônico únicos.
- Rotas Unicode são normalizadas em NFC e divergências agora bloqueiam o deploy.
- PDF usa o leitor nativo do navegador, com fallback visível no celular.
- DOCX recebe uma prévia textual local, sanitizada e gerada no build.
- Markdown, TXT, CSV e TSV são renderizados sem executar conteúdo ativo.
- Pages, Anki e formatos sem leitor seguro permanecem disponíveis para download.
- Dados antigos do navegador não podem substituir path, ID, hash, extensão ou autoria.
- O caderno de estudo salva notas, síntese, confiança, favoritos e próxima revisão sem alterar o original.

## Inserir um novo documento — fluxo seguro

### 0. Criar checkpoint e branch antes de mexer no acervo

```bash
git status --short --branch
git switch -c agent/biblioteca-lote-AAAA-MM-DD
```

Só prossiga com o checkout esperado e sem mudanças desconhecidas. Registre o commit inicial para ter rollback. Não use `site/` nem `public_site/` como fonte.

### 1. Colocar na área privada

Copie o original para:

```text
02_Biblioteca_IA_Engine/inbox/
```

Não coloque diretamente no `acervo/`. O inbox é ignorado pelo Git e nunca entra no site público.

### 2. Confirmar os quatro gates

Antes de publicar, registre e confira:

| Gate | Valores recomendados |
|---|---|
| Autoria | `confirmado-autoral`, `autoral-com-ia`, `terceiro-referencia` ou `a-confirmar` |
| Licença | licença própria, permissão explícita ou referência externa permitida |
| Privacidade | sem dados de paciente, pessoais, jurídicos ou financeiros identificáveis |
| Revisão clínica | conteúdo revisado, desatualizado/quarentenado ou ainda não revisado |

Se qualquer gate estiver incerto, o arquivo permanece privado.

**Importante:** o acervo legado que já estava publicado foi congelado em um baseline técnico, mas continua sinalizado como licença/autoria/revisão a confirmar quando não há prova itemizada. Esse congelamento não é prova de licença. Qualquer arquivo novo, removido ou alterado bloqueia o scanner até receber atestações explícitas.

### 3. Gerar o inventário privado

Na raiz do repositório:

```bash
python3 scripts_admin/inventory_library_candidates.py \
  --source-root 02_Biblioteca_IA_Engine/inbox \
  --output 02_Biblioteca_IA_Engine/_private/library-candidates.json
```

O inventário calcula SHA-256 e duplicatas. Ele não extrai texto, não copia, não apaga e não publica arquivos. `authorshipHint` é apenas pista pelo nome, nunca prova de autoria.

### 4. Escolher a seção correta

Promova uma cópia aprovada para uma pasta temática existente:

```text
02_Biblioteca_IA_Engine/acervo/<tema>/NOME_DO_DOCUMENTO.ext
```

Exemplos:

- ventilação e SDRA → `acervo/vm-sdra/`
- hemodinâmica e drogas vasoativas → `acervo/cardio-hemodinamica/`
- neurologia intensiva → `acervo/neuro-uti/`
- infectologia hospitalar → `acervo/infectologia/`
- preparação de prova → `acervo/temi-prova/`
- protocolos institucionais → `acervo/protocolos-institucionais/`

Use nome descritivo, extensão real e composição Unicode NFC. Não use cópias com sufixos ` 2`, ` 3` etc.

Depois de revisar o original e promover a cópia, atualize o baseline somente se puder declarar honestamente os três gates:

```bash
python3 scripts_admin/update_library_publication_baseline.py --approve \
  --reviewer "NOME DO REVISOR" \
  --change-note "Descrição do documento e da revisão realizada" \
  --attest-authorship-license \
  --attest-privacy \
  --attest-clinical-review
```

Sem as três flags, o baseline não é alterado. A atestação não substitui prova documental de licença nem registro da revisão clínica.

### 5. Regenerar catálogo, previews e conexões

```bash
python3 02_Biblioteca_IA_Engine/scan_biblioteca.py
python3 scripts_admin/build_library_previews.py
python3 scripts_admin/build_library_connections.py
```

Esses comandos:

1. reconstrói o manifesto e o catálogo canônico;
2. calcula SHA-256;
3. gera previews DOCX sanitizados;
4. atualizam conexões da Biblioteca.

`bash scripts_admin/atualizar_tudo.sh` também funciona, mas reindexa outros hubs e pode corrigir paths. Prefira os comandos direcionados acima e sempre revise `git diff` antes de continuar.

**A prévia DOCX não é uma auditoria LGPD.** Ela extrai principalmente `word/document.xml`; pode não revelar imagens, cabeçalhos/rodapés, comentários, alterações controladas, propriedades, anexos, macros ou outros metadados. Inspecione o arquivo original e suas propriedades antes de publicar.

### 6. Completar os metadados editoriais

No registro correspondente de `data/biblioteca_catalogo.json`, revise somente os campos editoriais permitidos:

- `title` e `resumo`;
- `tags` e `ia_origem`;
- `authorshipStatus` e `authorshipEvidence`;
- `license`;
- `privacyReviewStatus`;
- `clinicalReviewStatus` e `reviewedAt`.

Nunca edite manualmente `id`, `path`, `filename`, `extension`, `sourceSha256`, `previewMode` ou `sizeBytes`.

Rode novamente os três comandos direcionados da etapa 5 para consolidar a camada editorial.

### 7. Executar os gates antes do push

```bash
python3 -m unittest discover -s tests -p 'test_*.py' -v
python3 scripts_admin/update_library_publication_baseline.py --check
python3 scripts_admin/build_library_previews.py --check
python3 scripts_admin/validar_paths.py --check
python3 scripts_admin/publication_guard.py check-repository .
python3 scripts_admin/build_public_site.py . site
python3 scripts_admin/publication_guard.py check-site site
```

O resultado esperado é zero 404, zero paths corrigíveis, zero conteúdo privado e cobertura integral dos DOCX.

### 8. Testar no navegador

Confirme pelo menos:

- um PDF com várias páginas;
- um Word na prévia textual;
- um Markdown;
- um CSV/TSV, se houver;
- um formato download-only;
- salvar e reabrir uma nota no modo Estudo;
- links para Cards, Questões, POCUS, Calculadoras e Mapa Vivo.

### 9. Publicar com rollback

Revise os arquivos da branch criada na etapa 0, faça commit, abra a Pull Request e aguarde os checks. Faça merge somente com o gate verde. O commit anterior permanece como rollback.

## Usar o Modo Estudo com segurança

- O original é somente leitura; síntese e notas ficam em camada separada.
- O caderno usa armazenamento local do navegador: **não é criptografado, não sincroniza entre aparelhos e pode desaparecer ao limpar os dados do site**.
- Nunca registre nome, prontuário, imagem, data identificável ou qualquer dado pessoal de paciente.
- O backup exportado é JSON aberto; armazene-o em local privado.
- “Copiar prompt” coloca suas anotações no clipboard. O documento não é anexado automaticamente; revise o texto antes de colar em qualquer IA.
- Se o SHA-256 do documento mudar, o item volta para revisão e mantém as notas anteriores como contexto.
- Use Exportar caderno antes de trocar de navegador, limpar dados ou migrar de computador.

Para obra de terceiro, hospede o arquivo somente com licença aberta ou autorização explícita. Sem isso, mantenha apenas a referência bibliográfica e um link oficial.

## Recuperação dos documentos que ficaram invisíveis

Os documentos do `inbox/` não são apagados: ficam fora da interface pública por privacidade. A recuperação deve ocorrer em lotes pequenos:

1. agrupar duplicatas por SHA-256;
2. agrupar DOCX/PDF/PPTX/XLSX da mesma obra como versões do mesmo conteúdo;
3. validar autoria/licença;
4. revisar privacidade e segurança clínica;
5. promover somente as obras aprovadas;
6. regenerar e testar;
7. publicar um lote por vez.

## Erros a evitar

- Publicar todo o inbox de uma vez.
- Inferir autoria apenas pelo nome do arquivo.
- Inserir dados identificáveis de pacientes ou documentos jurídicos/financeiros.
- Usar `site/` ou `public_site/` como fonte canônica.
- Alterar um path no `localStorage` ou no catálogo para “resolver” um 404.
- Considerar DOCX/PDF da mesma obra como perda ou duplicata descartável sem revisão.
- Liberar orientação clínica sem revisão e data.
