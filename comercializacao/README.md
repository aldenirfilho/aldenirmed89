# Lançamento das assinaturas AldenirMed89

Versão 0.1 · 03/11/2026 · preparação comercial.

Os três valores foram confirmados como **mensais**: Básico R$ 49,90, Pro R$ 99,90 e Ultra R$ 149,90. A vitrine está em `planos/`, com compra desativada. A distribuição de recursos é uma proposta para homologação; não é uma declaração de entrega completa.

## Arquivos para a operação

| Arquivo | Uso |
| --- | --- |
| `HOTMART_CADASTRO.md` | Nome, descrição e sequência de cadastro do produto e dos três planos |
| `DIVULGACAO.md` | Três publicações, vídeo curto e anúncios em rascunho com links de campanha |
| `CONDICOES_MINUTA.md` | Campos que precisam ser preenchidos nas condições e na privacidade |
| `CHECKLIST_LANCAMENTO.md` | Liberação do produto, suporte, cobrança e divulgação |
| `FONTES.md` | Referências oficiais verificadas em 03/11/2026 |

## Matriz comercial proposta

| Plano | Mensalidade | Áreas cumulativas | Funções adicionais |
| --- | ---: | ---: | --- |
| Básico | R$ 49,90 | 6 | Estudo essencial, microestudos, flashcards, favoritos, histórico e leitura guiada |
| Pro | R$ 99,90 | 9 | Tudo do Básico; questões comentadas, simulados e ferramentas educacionais |
| Ultra | R$ 149,90 | 12 | Tudo do Pro; trilhas avançadas, exportação autoral elegível e revisão personalizada |

**Revisão personalizada** significa um percurso de revisão de acordo com o estudo registrado. Não oferecer mentoria, atendimento humano, consultas, inteligência artificial ilimitada nem garantia de aprovação. Definir limites de exportação e funcionamento de cada recurso na oferta final.

## Separar proposta e acesso entregue

O acervo atualmente público não vira conteúdo exclusivo por receber uma tela de planos. Cada recurso pago precisa ser entregue por um servidor que confira a conta e a assinatura. Conteúdo que continue disponível em URLs públicas deve ser descrito como público.

Antes de vender, trocar a linguagem da vitrine de “planejado” para “disponível” somente nos itens que passaram por homologação. Não ativar apenas `salesEnabled` esperando que a página crie contas, assinaturas, políticas ou permissões automaticamente.

## Próximas ações

1. Concluir a entrega protegida e testar acesso/cancelamento/reembolso.
2. Os três produtos/preços Stripe já foram criados e desativados na conta Projeto360x; conferir `STRIPE_CADASTRO_REAL.json`. Cadastrar os planos Hotmart e configurar os identificadores do ambiente de homologação no servidor.
3. Publicar a oferta final com suporte e condições completas e executar o lançamento orgânico.

## Decisões confirmadas em 03/11/2026

- Operação indicada pelo titular: pessoa física (CPF); não registrar o número no repositório.
- Suporte comercial: aldenirmed@gmail.com. Horários e prazos ainda precisam ser definidos.
- Stripe Projeto360x, produção: cadastro real concluído com produtos e preços inativos, sem checkout/link de pagamento ou cobrança criada.
- Fonte e código preparados não equivalem a servidor implantado, conta Supabase configurada ou validação de pagamento real.
- Apple/Google: contas, assinaturas, revisão e publicação continuam pendentes. O workflow Android gera somente build debug de teste.
