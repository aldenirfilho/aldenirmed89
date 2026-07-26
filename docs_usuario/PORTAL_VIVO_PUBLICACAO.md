# Portal Vivo — publicação manual e contínua

## O que o Portal reúne

O Portal Vivo é uma camada opcional de evolução da plataforma. Ele não substitui
o Radar, o Card Feed, a Biblioteca ou os módulos clínicos. A página combina:

1. publicações de UPGRADE auditadas em `17_Portal_Vivo/data/posts.json`;
2. a coluna **UPGRADE** com as últimas sessões atualizadas;
3. atalhos para a Estação Radar Diário e as demais estações;
4. notas, salvos e revisados privados no navegador.

O arquivo `posts.js` é gerado a partir de `posts.json`. Não edite os dois
separadamente.

Conteúdo clínico, científico, de saúde pública, TEMI ou produzido durante o
estudo pertence à **Estação Radar Diário**. Produto ou promoção útil entra como
`product-watch` no canal **Produtividade & Compras** do Radar, após auditoria de
preço, especificações, vendedor, garantia e necessidade real. O Portal Vivo registra somente novas
estações, recursos, correções e melhorias operacionais da plataforma.

## Publicar diretamente a partir do chat

1. Abra o Portal e selecione **Publicar**.
2. Escolha o destino. O padrão é **Estação Radar Diário — conteúdo
   clínico/estudo do chat**. Selecione **Portal Vivo — UPGRADE da plataforma**
   somente para evolução do sistema.
3. Cole o link da fonte, informe o nome da instituição e escreva sua observação.
4. Selecione prioridade, categoria e tipo. Para produto/promoção, use
   **Produto / promoção auditada**.
5. Use **Auditar rascunho**.
6. Use **Copiar para o chat** e cole o pacote na conversa com o Codex.
7. O agente `antigravity-publicar-portal` respeita `destination` e `target`,
   confere a fonte, busca duplicidade,
   separa fato de interpretação, converte para Turbo TEMI e executa os testes.
8. A atualização pública só aparece depois da integração e do deploy seguro.

O botão **Prévia local** não publica. Ele mostra um cartão temporário,
identificado como `RASCUNHO LOCAL · NÃO PUBLICADO`.

## Fluxo alternativo por arquivo

Use **Baixar JSON** no compositor e anexe o arquivo ao chat. O pacote sempre
carrega:

- `target: "radar-diario"` e o nome completo da Estação Radar Diário; ou
- `target: "portal-vivo-upgrade"` e o nome completo do Portal Vivo.

O agente transforma o rascunho no esquema público do destino selecionado.

Para validar um post já formatado:

```bash
python3 .codex/skills/antigravity-publicar-portal/scripts/publish_portal.py \
  validate --input /caminho/post.json
```

Para publicar um UPGRADE no armazenamento canônico do Portal:

```bash
python3 .codex/skills/antigravity-publicar-portal/scripts/publish_portal.py \
  publish --input /caminho/post.json
```

O publicador do Portal recusa conteúdo destinado ao Radar. Quando o destino for
`radar-diario`, o agente deve atualizar a edição datada e o histórico próprios
da Estação Radar Diário.

Para `product-watch`, o agente também gera duas imagens vinculadas ao mesmo
item: widescreen para desktop e card vertical para celular. As duas apresentam
preço datado ou “não confirmado”, uso, especificações, limite e fonte.

O publicador do Portal atualiza `posts.json`, `posts.js` e o histórico
antirrepetição.

## Formato Turbo TEMI

Cada publicação contém:

- título factual e síntese curta;
- motivo de relevância clínica ou organizacional;
- gancho de prova TEMI;
- âncora mnemônica visual;
- dois a cinco pontos essenciais;
- limitação, ressalva ou incerteza;
- fonte, data e horário da conferência;
- status de revisão clínica.

## Segurança e auditoria

Não publique:

- nome, prontuário, fotografia ou identificador de paciente;
- credencial, token, documento privado ou informação financeira;
- dose ou ordem terapêutica sem revisão clínica humana confirmada;
- conclusão maior que o resultado da fonte;
- imagem decorativa ou sem referência;
- item repetido apenas para preencher o feed;
- conteúdo cuja fonte não possa ser conferida.

A deduplicação usa DOI, PMID, identificador editorial ou URL canônica específica
do artigo/documento. O domínio, favicon ou página inicial não identificam uma
publicação. Se notícias diferentes compartilharem a mesma landing page, cada uma
deve receber um `source.id` próprio.

Uma publicação clínica com revisão pendente permanece descritiva e exibe esse
estado no Portal. O feed é apoio educacional; protocolo local e julgamento
clínico continuam obrigatórios.

## Como atualizar a coluna UPGRADE

Edite a lista `upgrades` em `17_Portal_Vivo/data/posts.json` com:

- identificador único;
- nome da sessão;
- descrição objetiva do que mudou;
- data;
- caminho público;
- `status: "UPGRADE"`.

Depois gere novamente `posts.js`:

```bash
python3 .codex/skills/antigravity-publicar-portal/scripts/publish_portal.py build-js
```

## Validação antes de publicar

Execute:

```bash
python3 -m unittest tests.test_portal_vivo -v
python3 .codex/skills/antigravity-publicar-portal/scripts/publish_portal.py check-store
python3 scripts_admin/build_public_site.py . site
python3 scripts_admin/publication_guard.py check-site site
```
