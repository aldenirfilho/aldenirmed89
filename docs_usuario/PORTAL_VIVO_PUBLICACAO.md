# Portal Vivo — publicação manual e contínua

## O que o Portal reúne

O Portal Vivo é uma camada opcional. Ele não substitui o Radar, o Card Feed,
a Biblioteca ou os módulos clínicos. A página combina:

1. publicações manuais auditadas em `17_Portal_Vivo/data/posts.json`;
2. a edição atual do Radar em `15_Radar_Cientifico/data/radar.js`;
3. a coluna **UPGRADE** com as últimas sessões atualizadas;
4. notas, salvos e revisados privados no navegador.

O arquivo `posts.js` é gerado a partir de `posts.json`. Não edite os dois
separadamente.

## Publicar diretamente a partir do chat

1. Abra o Portal e selecione **Publicar**.
2. Cole o link da fonte, informe o nome da instituição e escreva sua observação.
3. Selecione prioridade, categoria e tipo.
4. Use **Auditar rascunho**.
5. Use **Copiar para o chat** e cole o pacote na conversa com o Codex.
6. O agente `antigravity-publicar-portal` confere a fonte, busca duplicidade,
   separa fato de interpretação, converte para Turbo TEMI e executa os testes.
7. A atualização pública só aparece depois da integração e do deploy seguro.

O botão **Prévia local** não publica. Ele mostra um cartão temporário,
identificado como `RASCUNHO LOCAL · NÃO PUBLICADO`.

## Fluxo alternativo por arquivo

Use **Baixar JSON** no compositor e anexe o arquivo ao chat. O agente transforma
esse rascunho no esquema público completo.

Para validar um post já formatado:

```bash
python3 .codex/skills/antigravity-publicar-portal/scripts/publish_portal.py \
  validate --input /caminho/post.json
```

Para publicar no armazenamento canônico:

```bash
python3 .codex/skills/antigravity-publicar-portal/scripts/publish_portal.py \
  publish --input /caminho/post.json
```

O publicador atualiza `posts.json`, `posts.js` e o histórico antirrepetição.

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
