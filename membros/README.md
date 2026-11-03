# Área de membros — integração preparada

Versão 0.1 · 03/11/2026. Sem backend real configurado, cadastro e compra ficam desativados.

Preencher `config.json` apenas depois da homologação do serviço descrito em `../commerce/README.md`: `apiBaseUrl`, `supabaseUrl` e **chave pública** `supabasePublishableKey`. Jamais inserir uma chave Stripe, Supabase secret/service_role ou segredo de webhook neste diretório. O cliente só aceita chaves públicas Supabase reconhecidas e domínio de projeto Supabase.

O cliente oferece cadastro com confirmação de e-mail, login, consulta de assinatura, catálogo autorizado, abertura de materiais e redirecionamento ao Checkout/Customer Portal. Preço, titularidade e acesso são decididos pelo servidor. Retorno de checkout, parâmetros de URL e armazenamento local não concedem permissões. Tokens ficam em memória; sair ou recarregar elimina a sessão desta aba, sem armazenamento persistente. Respostas pendentes de outra sessão são descartadas.

A criação de conta/exclusão, recuperação de senha, SMTP, suporte e operação do provedor precisam ser homologados antes da abertura. A interface ainda não oferece recuperação de senha nem exclusão de conta. Não abrir o cadastro de produção até disponibilizar esses fluxos e as condições finais. O app móvel tem login de conta existente, não cadastro.

O serviço retorna `salesEnabled:false` até todos os requisitos de lançamento serem cumpridos. O estado local da vitrine não substitui essa checagem. O catálogo pago usa arquivos e manifesto privados fora do checkout público; nenhum PDF ou conteúdo pago deve ser copiado para esta pasta.

Antes da ativação, restringir `connect-src` da Política de Segurança de Conteúdo às origens HTTPS exatas do backend e Supabase, além de `'self'`; a configuração inicial não contém destinos reais. O acesso utiliza CORS exato e cabeçalho Bearer, sem cookies. Cancelamento da Stripe usa portal; Hotmart continua gerido pelo canal de compra.
