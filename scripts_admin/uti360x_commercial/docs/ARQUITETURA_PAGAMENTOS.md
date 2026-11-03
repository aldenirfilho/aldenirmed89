# Pagamento e licenças — desenho futuro, não implementado

Consulta técnica: 03/11/2026. Nenhum segredo, produto Stripe/Hotmart, checkout, webhook implantado ou cobrança criado.

## Arquitetura
O aplicativo local é demonstração. Código ou chaves no navegador não são barreira de acesso. Recursos pagos futuros exigem autorização no servidor. O catálogo divulgado não se torna confidencial por mudança de interface.

Fluxo proposto: autenticação → servidor escolhe preço autorizado → Checkout de teste → webhook com assinatura validada → conferir estado do pagamento no provedor → gravação idempotente do direito → entrega autorizada. Não usar página de sucesso como prova de pagamento. Tratar pagamentos assíncronos, reembolso, cancelamento e contestação.

Entidades sugeridas: accounts, products, orders, payment_events com ID único, entitlements, delivery_events. Produto institucional futuro exige isolamento por organização em toda consulta. Não criar login fictício nem permitir alterar plano por localStorage.

## Controles
Deduplicação por evento e compra; valor e moeda conferidos no servidor; pagamento confirmado; direito único por compra; transação atômica; logs sem segredos, cartão, paciente ou contratos sigilosos; bloqueio por padrão. Nunca ativar produção apenas mudando uma flag neste aplicativo.

## Aceitação antes da primeira venda
Pagamento aprovado/negado/pendente; assinatura inválida; eventos repetidos/fora de ordem; produto/moeda incorretos; reembolso/disputa; direito revogado; download sem autenticação; acesso entre organizações; falha de entrega e recuperação. Não executados: não há backend de pagamento no pacote.

## Documentação primária
- https://docs.stripe.com/checkout/fulfillment
- https://docs.stripe.com/webhooks
- https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
- https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers

A estrutura PWA requer implantação compatível. HTML offline não instala a aplicação. Não há validação para todas as plataformas ou navegadores.
