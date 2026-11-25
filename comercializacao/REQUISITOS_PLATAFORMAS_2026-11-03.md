# Hotmart e lojas móveis — pesquisa operacional

Verificado em **03/11/2026**, com fontes oficiais. Relatório técnico para implementação; não atesta que contas, produtos, pagamentos ou aplicativos estejam ativos.

## 1. Hotmart: configuração dos três planos

A Hotmart permite configurar valores e periodicidades diferentes em planos de um produto de assinatura, inclusive troca de planos. Proposta a confirmar: um produto educacional com planos **Básico R$ 49,90/mês, Pro R$ 99,90/mês e Ultra R$ 149,90/mês**. Evitar prometer funcionalidades que ainda não foram entregues. No painel: Produtos → Meus produtos → produto → Precificação. Criar planos, periodicidade e ofertas; copiar seus identificadores e URLs reais. A integração precisa mapear identificadores, e não adivinhar o plano pelo preço ou nome. [Configuração de planos — Hotmart](https://suportehotmart.zendesk.com/hc/pt-br/articles/360060619412-Como-criar-e-configurar-planos-de-assinatura-e-cupons-de-desconto).

Para uma plataforma externa, o fluxo é checkout Hotmart → evento autenticado → assinatura no banco → permissões no servidor. Ter produto de assinatura ativo, endpoint e hottok são pré-requisitos da integração oficial. Ferramentas → Webhook (API e notificações) → cadastrar → selecionar produto, endpoint e eventos; usar versão 2.0.0. O segredo chega no cabeçalho **X-HOTMART-HOTTOK** e deve ser validado antes de processar. [Tutorial oficial de integração de assinaturas](https://developers.hotmart.com/docs/pt-BR/tutorials/use-webhook-for-subscriptions/).

## 2. Contrato de webhook Hotmart 2.0

Eventos de pedidos incluem PURCHASE_APPROVED, PURCHASE_COMPLETE, PURCHASE_CANCELED, PURCHASE_REFUNDED, PURCHASE_CHARGEBACK, PURCHASE_EXPIRED e PURCHASE_DELAYED. A documentação fornece **id** (evento), **creation_date** (milissegundos UTC), **data.product.ucode/id**, **data.subscription.plan.id**, **data.subscription.subscriber.code**, **data.buyer.email** e dados da transação. O código de oferta fica em data.purchase.offer.code. Aprovado é liberação; boleto/Pix gerado ou checkout aberto não comprova pagamento. [Eventos de pedidos](https://developers.hotmart.com/docs/pt-BR/2.0.0/webhook/purchase-webhook/).

**Cancelamento usa outro formato**: SUBSCRIPTION_CANCELLATION inclui data.subscriber.email/code, data.subscription.id/plan.id, data.cancellation_date e data.date_next_charge. A Hotmart explica que date_next_charge pode determinar o fim do acesso já pago: cancelamento no dia 20 de uma assinatura renovada todo dia 10 mantém acesso até o dia 10 seguinte. [Evento de cancelamento](https://developers.hotmart.com/docs/pt-BR/2.0.0/webhook/cancel-subscription-webhook/).

Decisões técnicas propostas (inferência): idempotência por provedor + evento; rejeitar produto/plano desconhecido; persistir cada assinatura separadamente por provedor; não sobrescrever uma assinatura válida Stripe com cancelamento de outra Hotmart; conferir ordem/estado atual ao tratar eventos atrasados; autenticar identidade por email verificado ou ID interno, nunca pelo email digitado no navegador; reembolso/chargeback devem revogar o vínculo pertinente. Reconciliar troca de plano antes de cobrar upgrade. Não liberar conteúdo premium somente com localStorage, query string, CSS ou retorno do checkout.

## 3. PWA, app nativo e distribuição

**PWA** é a aplicação web instalável pelo navegador. Pode oferecer acesso em iOS/Android sem significar publicação nas lojas. **Projeto nativo** e **binário compilado/assinado** são etapas distintas; **publicado na App Store/Google Play** exige contas e análise das lojas. Não anunciar presença nas lojas até existir URL pública real.

Recomendação de lançamento: aquisição e pagamentos pela web; PWA inicialmente; app de consumo/login como próxima etapa, mantendo navegação e funções úteis próprias. Não incluir botões Hotmart/Stripe em shell nativo sem enquadramento e aprovação do programa da loja aplicável. É uma decisão operacional conservadora, não uma declaração universal de proibição de compras externas.

### Apple

Compras digitais no aplicativo seguem a diretriz 3.1 e exceções por tipo de app/região. A diretriz 4.2 pede utilidade e experiência que superem o simples empacotamento de um site. Aplicativos médicos passam por análise adicional; a regra 1.4.2 restringe calculadoras de dosagem a fabricantes, hospitais, universidades, seguradoras, farmácias, outras entidades aprovadas ou aprovação regulatória. Se houver criação de conta, oferecer exclusão dentro do app. A diretriz consultada declara última atualização em **16/10/2026**. [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/).

“Reader app” não é sinônimo de aplicativo educacional: a função principal deve ser livros, revistas, jornais, áudio, música ou vídeo. Recursos clínicos/calculadoras podem impedir esse enquadramento. O entitlement External Link Account exige solicitação por bundle ID e aprovação; quando utilizado, não coexistir com IAP no iOS/iPadOS/tvOS. Seus links têm regras específicas de apresentação e navegação. [Reader apps — Apple](https://developer.apple.com/br/support/reader-apps/).

A inscrição Apple Developer Program custa **US$ 99 por ano**, ou valor local apresentado no processo; preços variam por região. Conta individual/organização, verificação, certificados/perfis e dados bancários/fiscais dependem do titular. [Inscrição Apple](https://developer.apple.com/help/account/membership/program-enrollment/).

### Google Play

O Google aceita aplicativo somente de consumo: login e conteúdo adquirido em outro local, sem venda dentro do aplicativo. Links e chamadas para pagamento fora do Play dependem da política/programa aplicável; não basta abrir checkout externo numa webview. [Política de pagamentos — explicação oficial](https://support.google.com/googleplay/android-developer/answer/10281818?hl=en).

O Brasil participa do user choice billing para apps elegíveis, com adesão empresarial, termos, requisitos, APIs e reporte de transações; o programa não elimina automaticamente a taxa da loja. Na documentação consultada, transações brasileiras pelo sistema alternativo têm redução de quatro pontos percentuais até a atualização global de taxas. Não ativar ou estimar margem como se Stripe/Hotmart eliminassem as obrigações do Google. [User choice billing](https://support.google.com/googleplay/android-developer/answer/13821247?hl=en-en); [Adesão e requisitos](https://support.google.com/googleplay/android-developer/answer/12570971?hl=en-EN).

A conta de desenvolvedor Google Play tem taxa única de **US$ 25**, verificação de identidade e requisitos conforme tipo de conta. [Cadastro Play Console](https://support.google.com/googleplay/android-developer/answer/6112435/). Contas pessoais novas criadas após 13/11/2023 precisam de teste fechado com **ao menos 12 testadores inscritos continuamente por 14 dias** antes da solicitação de acesso à produção. [Requisitos de teste](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en-US).

Apps com conteúdo/funções de saúde precisam preencher a declaração de saúde e publicar política de privacidade acessível, dentro do app e no cadastro. Caso sejam dispositivos médicos, apresentar a documentação regulatória aplicável; demais apps médicos devem trazer declaração clara sobre não serem dispositivos e não diagnosticar/tratar/curar/prevenir condições. O enquadramento real deve corresponder às funcionalidades, e não somente ao texto comercial. [Saúde — Google Play](https://support.google.com/googleplay/android-developer/answer/16679511?hl=en); [Declaração de saúde](https://support.google.com/googleplay/android-developer/answer/14738291?hl=en).

## 4. Portão de lançamento mínimo

- Conta/produto/plano e checkout reais; identidade, contato de suporte e política de cancelamento preenchidos.
- Login funcional, identidade verificada e permissões aplicadas pelo servidor/armazenamento privado.
- Teste de aprovação, renovação, duplicata, atraso, cancelamento ao fim do período, reembolso, chargeback e troca de plano.
- Conteúdo com direitos/licenças compatíveis com comercialização, sem dados identificáveis de pacientes.
- Loja: identificadores definitivos, assinatura de builds, revisão de contas/exclusão/privacidade, capturas e conteúdo real; não afirmar publicação antecipadamente.
- Divulgação inicial pode mostrar planos e convidar a conhecer demonstração/avisos; não aceitar pagamento por acesso indisponível nem alegar validação clínica ou aprovação TEMI/AMIB inexistentes.
