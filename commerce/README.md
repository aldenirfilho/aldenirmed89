# Servidor de assinaturas — preparação 0.1.0

**03/11/2026 · Não implantado · Nenhuma venda habilitada por este código.**

O site atual é estático e público. Este serviço acrescenta uma área privada para conteúdo novo, sem fingir que um bloqueio visual protege os arquivos publicados no GitHub Pages ou no histórico de um repositório público. Apps nativos usam apenas consumo: o servidor não determina elegibilidade das lojas para links de compra.

## O que está implementado

- Catálogo em centavos: Básico 4990, Pro 9990, Ultra 14990 BRL, recorrência mensal; permissões cumulativas 6/9/12.
- Verificação de sessão no Supabase Auth `/auth/v1/user`; ID, e-mail confirmado e conta não anônima. Não há confiança no token só decodificado ou em IDs/e-mails enviados no corpo.
- Stripe Checkout hospedado com tentativa/payload/chave de idempotência persistidos antes da API, Billing em modo `flexible`, preço determinado pelo servidor e validado na Stripe; Customer Portal vinculado ao Customer do usuário autenticado.
- Webhooks Stripe assinados e Hotmart HOTTOK, sem corpos completos ou e-mails em logs/banco. SQLite durável armazena o mínimo de vínculos, estado e deduplicação.
- Período pago finito, cancelamento ao final, deduplicação transacional e conciliação Stripe por estado atual. Reembolso, disputa e aviso de fraude suspenderão o vínculo afetado até revisão manual; nenhum reembolso financeiro automático é executado.
- Conteúdo JSON/Markdown/texto servido pelo servidor só após validar as permissões, caminho real e allowlist. Nenhum arquivo pago vem neste repositório.

**As 12 funções são uma proposta comercial, não 12 funções completas entregues.** Favoritos, histórico, simulados, exportação e revisão personalizada ainda precisam de implementação/homologação de produto. `FEATURES_HOMOLOGATED=false` impede tratar alguns arquivos como prova de que todas as funções funcionam.

## Contrato de API

Base do serviço é uma origem HTTPS distinta do GitHub Pages. O cliente acrescenta as rotas abaixo. Todas as rotas `/api/*` exigem `Origin` exato allowlisted; as protegidas exigem `Authorization: Bearer <sessão Supabase>`.

| Método e rota | Entrada | Resposta |
| --- | --- | --- |
| GET `/health` | — | estado do processo, sem segredos |
| GET `/api/catalog` | Origin | catálogo, `salesEnabled`, `readiness` |
| GET `/api/me` | bearer | `user:{id}`, `tier`, `features`, `subscriptions`, `content:[{slug,title,feature}]` |
| POST `/api/checkout` | bearer, JSON `{ "tier": "basico" }` | `{ "url": "checkout real" }` quando apto |
| POST `/api/portal` | bearer, JSON `{}` | `{ "url": "portal do próprio Customer" }` |
| GET `/api/content/:slug` | bearer | bytes JSON ou texto; cache desativado |
| POST `/webhooks/stripe` | corpo bruto + Stripe-Signature | recebimento/deduplicação |
| POST `/webhooks/hotmart` | JSON + X-HOTMART-HOTTOK | recebimento/deduplicação |

No cadastro, o frontend fala diretamente com Supabase Auth e só acessa esta API após confirmação de e-mail. Nenhuma conta foi criada/configurada por este serviço. O bearer não vai na URL. O retorno do checkout apenas indica que o navegador voltou; não concede acesso.

## Preparar ambiente de homologação

1. Use **sandbox separado** Stripe; não teste cobranças com cartões reais na conta de produção. Os produtos/preços reais preparados separadamente não substituem IDs próprios do sandbox.
2. Instale Node **24**; neste diretório execute `npm ci --ignore-scripts`, `npm test` e `npm run check`.
3. Crie projeto Supabase de homologação: confirmação de e-mail obrigatória, URLs de redirecionamento e SMTP conforme o host. A API só precisa da chave pública do Supabase; não requer `service_role`.
4. Configure as variáveis de `.env.example` no cofre do provedor. O exemplo não contém credenciais. Para Node local, pode-se usar `node --env-file=/caminho/privado/commerce.env src/server.mjs` com arquivo fora do checkout.
5. Crie chave Stripe **restrita (`rk_`)**, específica do ambiente, com o mínimo de permissões para ler preços/assinaturas/faturas/InvoicePayments/charges, criar Customers/Checkout Sessions/Portal Sessions. Não copie segredos para código, apps móveis, registros públicos ou conversa.
6. Configure no Stripe Customer Portal cancelamento ao fim do período e atualização de pagamento; não habilite troca de preço indiscriminada. Upgrades, downgrade, prorrata e faturas pendentes exigem homologação adicional antes da oferta.
7. Configure endpoint HTTPS e segredo dos eventos abaixo; o corpo precisa chegar **bruto**, sem reserialização do proxy. Defina `STRIPE_LIVEMODE=false` no sandbox e `true` apenas com recursos reais da conta selecionada.
8. Monte conteúdo autoral revisado em volume privado fora do checkout, sem dados de pacientes ou material protegido de terceiros. Veja `private-content/README.md`.
9. Informe suporte real, controlador/identidade empresarial, termos e privacidade vigentes, revisão de oferta e fluxo fiscal. Só então marque `LEGAL_REVIEWED`, `FEATURES_HOMOLOGATED` e `SALES_ENABLED` como `true` após testes reais ponta a ponta.

Sem esses dados, `/api/catalog` informa `salesEnabled:false` e o checkout responde 503. Preços Stripe inativos também são recusados. Não há descoberta automática de chaves existentes no computador.

### Eventos Stripe exatos

- `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`;
- `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`;
- `invoice.paid`, `invoice.payment_failed`;
- `charge.refunded`, `charge.dispute.created`, `radar.early_fraud_warning.created`.

Não se guarda nome/e-mail/endereço de Customer localmente, por isso `customer.updated` não é necessário para sincronização desses campos. O dono é resolvido por `Customer ID` persistido antes do checkout. Para riscos, o grafo atual é Charge → PaymentIntent → InvoicePayment → Invoice → Subscription; metadados arbitrários não são usados como vínculo de titularidade.

Eventos com erro transitório retornam erro e não ficam marcados como concluídos; o provedor precisa reenviar. Duplicatas são persistidas. Estados com risco têm bloqueio permanente até revisão operacional; recuperar o dinheiro, responder disputa ou liberar a conta exige um procedimento humano seguro. Não existe endpoint administrativo público para remover bloqueios.

### Hotmart

Cadastre um produto de assinatura com os três planos; guarde seus IDs reais. `HOTMART_PRODUCT_ID` corresponde a `data.product.id`; `HOTMART_PLAN_MAP` é JSON de ID para `basico`, `pro`, `ultra`, por exemplo `{"ID_BASICO":"basico"}` — apenas marcador, não ID válido.

Selecione webhook 2.0 e valide HOTTOK. Assinatura é identificada pelo produto+código do assinante; compra por e-mail só se vincula a uma conta com **o mesmo e-mail confirmado no Supabase**. Guarda-se HMAC do e-mail, não e-mail em texto. A chave HMAC precisa permanecer estável; rotação exige migração planejada de vínculos.

Eventos implementados: `PURCHASE_APPROVED`, `PURCHASE_COMPLETE`, `PURCHASE_CANCELED`, `PURCHASE_REFUNDED`, `PURCHASE_CHARGEBACK`, `PURCHASE_EXPIRED`, `PURCHASE_DELAYED`, `SUBSCRIPTION_CANCELLATION`. A aprovação exige `purchase.date_next_charge` ou `data.date_next_charge` válido e finito no próximo ciclo mensal; sem limite real do período, devolve 422 para conciliação. Isso precisa ser testado com payloads reais do produto antes de vender; não se substitui mês por 30 dias arbitrários. Cancelamento usa `data.subscriber`, com acesso preservado até o limite pago anterior. Mudanças de e-mail/código e troca de plano precisam de conciliação operacional.

O backend de recebimento está preparado; **não cria produto Hotmart, não oferece checkout Hotmart autenticado nem sincroniza automaticamente o painel Hotmart**. A compra externa e o mesmo e-mail confirmado serão homologados antes de divulgar links reais.

## Implantação separada

GitHub Pages não executa Node nem guarda SQLite. Publique o servidor em host Node/Docker com HTTPS, um volume persistente para `/data` e outro privado para conteúdo. O Dockerfile compila apenas o serviço; não copia acervo público ou conteúdo premium.

```sh
docker build -t aldenirmed-membership:0.1.0 .
docker run --name aldenirmed-membership \
  --env-file /caminho/privado/commerce.env \
  -v /caminho/privado/database:/data \
  -v /caminho/privado/conteudo:/private-content:ro \
  -p 127.0.0.1:8788:8788 \
  aldenirmed-membership:0.1.0
```

Use proxy HTTPS à frente e allowlist exata de origens. `capacitor://localhost` e `http://localhost` só entram se explicitamente configurados para o app; não autorize `null` ou `*`. Configure no proxy limites de requisições/corpo, TLS, proteção de borda e monitoramento. O limite em memória da aplicação é auxiliar e não é defesa global de múltiplas instâncias.

Esta versão usa **uma única instância** com SQLite/WAL. Não compartilhe o arquivo SQLite entre máquinas ou réplicas. Faça backup consistente via ferramenta SQLite/volume e teste a restauração antes de habilitar venda; copiar apenas o `.sqlite` enquanto grava pode perder WAL. Não configure sleep/scale-to-zero que perca o volume. Para múltiplas réplicas, migre para banco gerenciado e concorrência transacional adequada.

Rollback: desative `SALES_ENABLED`, preserve banco, eventos, backups e segredos, volte à imagem anterior compatível com esquema. Isso não cancela assinaturas nem reembolsa automaticamente: comunique e trate obrigações no provedor. Parar o servidor não interrompe renovação Stripe/Hotmart.

## Limites de validação e pendências reais

- Testes locais usam fixtures e SDK oficial de verificação de assinatura; não atestam autenticação real, entrega SMTP, webhooks externos, cancelamento real ou pagamento de sandbox.
- Não há processo agendado de conciliação e alerta, retenção/exportação/exclusão de conta, painel de suporte, recuperação de vínculos ou tratamento administrativo de risco. Esses itens são pendências de operação/produção; exclusão de conta também é pendência de publicação nas lojas se houver conta.
- Eventos atrasados Stripe são conciliados via API, mas após indisponibilidade prolongada é preciso reprocessar eventos e conferir dados no painel. Nenhum acesso dura além do período comprovadamente pago armazenado.
- Tentativas de checkout com resposta perdida repetem o mesmo payload/chave; após 30 minutos sem resolução são bloqueadas para conciliação, sem criar outra sessão. Ainda é necessário testar compra duplicada/concorrente, mudança de plano, expiração de checkout, pagamentos assíncronos, recuperação de falhas, reembolso parcial e migração de dados contra provedores reais. Vendas continuam desativadas.
- Custos de host, taxas Stripe/Billing/Hotmart, tributos, emissão fiscal e suporte não foram aceitos/calculados por este código. **Stripe Tax não está habilitado**: seu uso depende de jurisdição, produto e registros fiscais ativos; revise com contador antes do lançamento.
- Não há aprovação AMIB/TEMI, validação clínica independente, liberação de loja ou garantia de resultado de prova implícita na integração.

## Fontes oficiais

Consultadas em 03/11/2026: [Stripe Checkout e assinaturas](https://docs.stripe.com/billing/subscriptions/build-subscriptions?payment-ui=checkout), [webhooks do ciclo de vida e riscos](https://docs.stripe.com/billing/subscriptions/webhooks), [Invoice Payments](https://docs.stripe.com/api/invoice-payment/list), [Customer Portal](https://docs.stripe.com/customer-management/integrate-customer-portal), [segredos e chaves restritas](https://docs.stripe.com/keys-best-practices), [Stripe Tax](https://docs.stripe.com/billing/taxes/collect-taxes), [Hotmart assinaturas](https://developers.hotmart.com/docs/pt-BR/tutorials/use-webhook-for-subscriptions/), [Hotmart compra](https://developers.hotmart.com/docs/pt-BR/2.0.0/webhook/purchase-webhook/), [Hotmart cancelamento](https://developers.hotmart.com/docs/pt-BR/2.0.0/webhook/cancel-subscription-webhook/), [Supabase getUser](https://supabase.com/docs/reference/javascript/auth-getuser).
