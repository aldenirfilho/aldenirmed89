# Conheça Aldenir — idealizador Antigravity

Canal público, discreto e cronológico para reflexões, ideias, insights, promessas públicas, relatos, manifestações e história/biografia de Aldenir Rocha de Oliveira Filho que tenham sido **explicitamente aprovados para publicação**.

Este diretório é estático e público. Nenhum rascunho, documento privado, dado sensível, credencial de acesso ou relato ainda não revisado deve ser salvo aqui. O GitHub Pages não protege arquivos apenas porque não há um link visível para eles.

## Separação de finalidades

- **Conheça Aldenir:** documentos pessoais públicos, blog de itens revisados e, futuramente, conversa pessoal/produtiva com assinantes.
- **Caderno do Idealizador:** área autenticada do Centro da Tripulação para rascunhos, documentos pessoais e materiais ainda em revisão.
- **Portal de Escuta do Centro da Tripulação:** recebe sugestões, críticas, pedidos, reclamações e contribuições sobre a plataforma Antigravity.
- **Integridade Editorial:** canal separado para políticas, referências, correções, direitos e responsabilidades da plataforma.

O nome do canal não autoriza publicar credenciais profissionais, títulos acadêmicos, fatos biográficos, dados de terceiros ou alegações jurídicas sem evidência verificável e revisão apropriada.

## Documentos pessoais públicos

Os documentos aprovados ficam em:

`data/content/public-documents.json`

Categorias previstas:

- `apresentacao`
- `biografia`
- `curriculo`
- `historia`
- `experiencia-profissional`
- `relatos`
- `manifestacoes`

Cada documento usa os mesmos campos básicos do feed e acrescenta `verificationStatus`. Os valores aceitos são:

- `not-applicable`: apresentação institucional sem afirmação biográfica ou credencial;
- `self-reported`: relato pessoal revisado, claramente apresentado como relato;
- `verified`: informação factual ou credencial conferida com documentação.

Entradas com `kind: "factual"` ou `kind: "credential"` só são renderizadas quando `verificationStatus` for `verified` e houver ao menos uma referência HTTPS válida. Ausência de um documento significa apenas que ele ainda não foi publicado; o sistema não preenche a lacuna com texto automático.

## Blog e feed contínuo

As publicações ficam em:

`data/content/public-feed.json`

Cada entrada precisa conter:

| Campo | Regra |
| --- | --- |
| `id` | Identificador único em minúsculas, números e hífens |
| `status` | Exatamente `public-approved` |
| `visibility` | Exatamente `public` |
| `kind` | `institutional`, `personal`, `factual` ou `credential` |
| `category` | Uma das categorias permitidas abaixo |
| `title` | Título curto e objetivo |
| `content` | Texto aprovado para exposição pública |
| `publishedAt` | Data e hora ISO 8601 da primeira publicação |
| `updatedAt` | Data e hora ISO 8601 da revisão mais recente |
| `version` | Versão editorial, por exemplo `1.0.0` |
| `references` | Lista de fontes HTTPS; obrigatória e não vazia quando `kind` for `factual` ou `credential` |

Categorias aceitas:

- `reflexoes`
- `ideias`
- `insights`
- `promessas-publicas`
- `relatos`
- `manifestacoes`
- `historia-biografia`

## Fluxo seguro para adicionar uma publicação

1. Escreva e mantenha o rascunho no Caderno do Idealizador autenticado. Não o inclua neste diretório.
2. Remova dados clínicos identificáveis, informações íntimas desnecessárias, acusações sem prova, dados pessoais de terceiros e segredos de acesso.
3. Confira se a publicação diferencia experiência pessoal, opinião e afirmação factual.
4. Para conteúdo factual ou credencial, adicione ao menos uma fonte primária ou institucional em `references` e registre a verificação.
5. Verifique direitos de texto, imagem, marca e demais materiais incorporados. Não envie nem publique obra ou material de terceiro sem direito, licença ou autorização compatível.
6. Confirme que credenciais profissionais e fatos biográficos citados têm documentação verificável.
7. Registre `publishedAt`, `updatedAt` e `version`.
8. Somente após revisão e aprovação explícita, copie a entrada para o feed com `status: "public-approved"` e `visibility: "public"`.
9. Execute o teste do canal antes da publicação:

   ```bash
   python3 -m unittest tests.test_conheca_aldenir
   ```

10. Revise a página no celular e no computador antes de publicar.

## Exemplo mínimo

```json
{
  "id": "titulo-curto-da-publicacao",
  "status": "public-approved",
  "visibility": "public",
  "kind": "factual",
  "category": "insights",
  "title": "Título aprovado",
  "content": "Conteúdo revisado e adequado à exposição pública.",
  "publishedAt": "2026-07-25T12:00:00-03:00",
  "updatedAt": "2026-07-25T12:00:00-03:00",
  "version": "1.0.0",
  "references": [
    {
      "label": "Nome da fonte primária",
      "url": "https://exemplo-institucional.org/documento"
    }
  ]
}
```

## Comportamento de segurança

O navegador aplica um filtro adicional e só renderiza entradas que atendem ao contrato público. Itens com `draft`, `private`, status desconhecido, campos obrigatórios inválidos ou afirmações factuais sem referência são ignorados. Esse filtro reduz exposição acidental, mas não substitui revisão humana, assessoria jurídica ou governança editorial.

## Conversa com o idealizador

O formulário público é entregue **desativado**. No estado atual:

- `mode` é `disconnected`;
- `conversationEndpoint` e `threadEndpoint` estão vazios;
- `contactEmail` está vazio;
- os campos e botões permanecem bloqueados;
- nenhuma mensagem é enviada ou simulada;
- a interface mostra “e-mail institucional em ativação”.

`AldenGrav360` é apenas a identidade textual sugerida para um futuro endereço. Ela não é apresentada como e-mail existente.

O canal deve ser usado para pergunta, contato pessoal adequado, produtividade, contribuição operacional, contribuição científica ou relato dirigido ao idealizador. Assuntos sobre funcionamento da plataforma, críticas, reclamações e pedidos gerais continuam no Portal de Escuta do Centro da Tripulação.

### Configuração pública

`config.example.js` documenta o contrato e `config.js` contém a configuração efetivamente carregada. Ambos devem permanecer sem segredos.

Nunca inclua nesses arquivos:

- senha ou código de acesso;
- token de usuário ou token administrativo;
- chave privada ou segredo de assinatura;
- chave com privilégio de serviço;
- segredo de cliente OAuth;
- credencial de banco de dados.

Esses valores pertencem ao ambiente seguro do gateway. O navegador só recebe endpoints públicos, limites, a identidade sugerida e, depois de existir, um endereço institucional publicamente verificável.

### Requisitos mínimos do gateway

Antes de mudar `mode` para `gateway`:

1. Implemente dois endpoints: criação da conversa e consulta da thread.
2. Use HTTPS. Endpoint relativo de mesma origem também é aceito.
3. Para origem externa, registre a origem HTTPS exata em `allowedGatewayOrigins`.
4. Se o gateway for externo, ajuste a política `connect-src` do HTML para a origem exata; não use liberação genérica para toda a internet.
5. Valide os campos novamente no servidor e rejeite categorias desconhecidas.
6. Aplique limite de tamanho, taxa por origem/conta, proteção contra automação, retenção mínima e trilha de auditoria.
7. Não dependa apenas do limite de uma tentativa por minuto aplicado na memória do navegador.
8. Autentique consultas de thread no servidor. O código temporário deve ser armazenado somente em forma protegida no backend, expirar e nunca aparecer em logs.
9. Envie respostas com texto puro e datas ISO 8601. Não devolva HTML executável.
10. Disponibilize política de privacidade, canal de exclusão e prazo de retenção antes da ativação.

Exemplo de ativação somente depois de o gateway existir:

```js
window.ANTIGRAVITY_IDEALIZER_CONFIG = Object.freeze({
  mode: "gateway",
  conversationEndpoint: "/api/idealizador/conversations",
  threadEndpoint: "/api/idealizador/threads",
  allowedGatewayOrigins: [],
  contactEmail: "",
  suggestedEmailIdentity: "AldenGrav360",
  maxMessageLength: 3000,
  minimumSubmissionIntervalMs: 60000,
  requestTimeoutMs: 12000
});
```

O endpoint de criação recebe JSON com categoria, nome de exibição, e-mail, assunto, mensagem e confirmações de direitos/privacidade. Deve responder com um protocolo de 8 a 40 caracteres (`A-Z`, números e hífen) e, opcionalmente, mensagens iniciais da thread.

O endpoint de consulta recebe `operation: "read-thread"`, protocolo e código temporário. O código é usado apenas durante a requisição e limpo do campo; não é gravado em `localStorage`, `sessionStorage` ou cookie criado por esta página.

Mensagens devolvidas pelo gateway podem usar `authorRole` igual a `subscriber`, `idealizer` ou `system`, além de `body` e `createdAt`. A página cria nós de texto seguros e ignora estruturas desconhecidas.

### Regras obrigatórias de conteúdo

- Nunca enviar dados clínicos identificáveis de pacientes.
- Nunca usar o canal para urgência, consulta ou atendimento médico.
- Nunca anexar, copiar ou oferecer obra de terceiro sem direito, licença ou autorização adequada.
- Não enviar senhas, documentos pessoais sensíveis, segredos ou dados financeiros.
- Consentimento para tratamento da mensagem e declaração de direitos são obrigatórios.
