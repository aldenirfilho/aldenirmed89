# Cadastro do AldenirMed89 na Hotmart

Versão 0.1 · 03/11/2026 · rascunho para cadastro. Nenhum produto, aprovação ou checkout Hotmart é comprovado por este arquivo.

## Estrutura proposta

**Um produto de assinatura** com três planos mensais. A Hotmart permite planos diferentes e troca entre planos do mesmo produto. O identificador real de cada plano deverá ser mapeado no servidor; o nome ou o valor isolado não identifica com segurança o acesso. [Planos e cupons Hotmart](https://suportehotmart.zendesk.com/hc/pt-br/articles/360060619412-Como-criar-e-configurar-planos-de-assinatura-e-cupons-de-desconto).

| Campo | Texto ou configuração proposta |
| --- | --- |
| Nome | AldenirMed89 — Antigravity Consultas |
| Formato | Assinatura educacional com acesso em plataforma externa |
| Idioma | Português do Brasil |
| Tema | Educação em Clínica Médica e Medicina Intensiva |
| Público | Médicos e estudantes da área da saúde interessados em estudo estruturado |
| Moeda | Real brasileiro, BRL |
| Cobrança | Mensal, renovação automática até cancelamento |
| Básico | R$ 49,90/mês |
| Pro | R$ 99,90/mês |
| Ultra | R$ 149,90/mês |
| Período gratuito | Nenhum nesta proposta |
| Afiliados | Manter desativado até validar suporte, margem e regras de divulgação |
| Página de apresentação | `https://aldenirfilho.github.io/aldenirmed89/planos/` depois da publicação |
| Área de acesso | URL HTTPS real da área de membros, depois da implantação e teste |

## Descrição para o cadastro

**Usar o texto abaixo somente quando os recursos descritos estiverem disponíveis e os termos estiverem preenchidos.** Antes disso, manter como rascunho no cadastro.

> O AldenirMed89 — Antigravity Consultas é uma plataforma educacional voltada ao estudo de Clínica Médica e Medicina Intensiva, com apoio à preparação para o TEMI, prova de título em Medicina Intensiva. A proposta combina leitura guiada, microestudos e recursos de revisão em blocos curtos, com navegação simples para retomar assuntos interrompidos.
>
> A assinatura é individual e mensal. O plano Básico custa R$ 49,90/mês e reúne estudo essencial, microestudos, flashcards, favoritos, histórico de estudo e leitura guiada. O Pro custa R$ 99,90/mês e acrescenta questões comentadas, simulados e ferramentas educacionais. O Ultra custa R$ 149,90/mês e acrescenta trilhas avançadas, exportação de materiais autorais elegíveis e revisão personalizada conforme o estudo registrado. A oferta final informa disponibilidade e limites de cada recurso.
>
> O acesso é liberado após a confirmação do pagamento e a identificação da conta vinculada. A assinatura não inclui consulta médica, mentoria individual ou garantia de aprovação. Não há vínculo oficial anunciado com a prova ou certificação de especialista. Conteúdos públicos existentes continuam identificados como públicos.
>
> Ferramenta educacional/de apoio à decisão. Não substitui o julgamento clínico, os protocolos institucionais ou a avaliação médica individual. Não inserir dados identificáveis de pacientes.

## Cadastro e integração

1. Acessar a conta do titular em [app.hotmart.com](https://app.hotmart.com/). Concluir os dados comerciais, fiscais, bancários e de identidade solicitados pela plataforma.
2. Criar o produto no formato de assinatura, definir entrega em plataforma externa e manter rascunho até concluir a oferta. O painel e a elegibilidade da conta podem alterar os nomes das telas.
3. Na precificação do produto, criar Básico, Pro e Ultra com recorrência mensal e os valores confirmados. Conferir renovação, cancelamento, impostos e condições de reembolso apresentadas ao comprador.
4. Copiar **IDs de produto e planos, códigos de oferta e URLs reais** para a configuração privada do servidor. Nunca substituir esses IDs por nomes inferidos.
5. Configurar Webhook versão 2.0.0 com endpoint HTTPS e segredo `X-HOTMART-HOTTOK`, armazenado no ambiente seguro do servidor. [Tutorial de assinaturas](https://developers.hotmart.com/docs/pt-BR/tutorials/use-webhook-for-subscriptions/).
6. Homologar aprovação, renovação, atraso, duplicata, cancelamento, reembolso, chargeback e troca de plano. No cancelamento, respeitar o período já pago conforme os dados do evento. [Eventos de pedidos](https://developers.hotmart.com/docs/pt-BR/2.0.0/webhook/purchase-webhook/) e [cancelamento](https://developers.hotmart.com/docs/pt-BR/2.0.0/webhook/cancel-subscription-webhook/).
7. Revisar conteúdo, licenças, suporte e condições; solicitar a análise da Hotmart pelo painel. Cadastrar produto não equivale a obter aprovação.
8. Abrir a compra somente depois do teste completo de uma conta de assinante e da verificação da oferta exibida pelo checkout.

## Registro de conferência

| Dado | Situação |
| --- | --- |
| Conta e titular Hotmart | A confirmar no painel |
| ID e código do produto | Não informado |
| ID Básico e URL de oferta | Não informado |
| ID Pro e URL de oferta | Não informado |
| ID Ultra e URL de oferta | Não informado |
| Endpoint e segredo configurados | Não confirmados |
| E-mail de suporte comercial | Não informado |
| Política e prazo de reembolso | Não definidos |
| Aprovação Hotmart | Não confirmada |

Não preencher dados do titular com endereço residencial, telefone ou documentos presentes em chats sem conferir necessidade e finalidade do campo. Esses dados não devem aparecer no repositório público.
