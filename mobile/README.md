# Antigravity Consultas — aplicativo móvel 0.1.0

Preparado em **03/11/2026**. Projetos Capacitor para iOS e Android. **Não publicado na App Store ou Google Play.** O estado de compilação consta em `VALIDACAO.md`.

## O que esta versão entrega

- Sessão de estudo com até três tarefas, conclusão e remoção.
- Pista de retomada com salvamento local.
- Doze cartões originais sobre organização de estudo, resposta revelável e lembrete local de 1, 7 ou 14 dias.
- Biblioteca de favoritos e exclusão dos dados locais.
- Área de conta preparada para Supabase Auth e `GET /api/me`, desativada enquanto a configuração estiver vazia.

Os recursos de estudo funcionam offline e não dependem de assinatura. Esta base não contém a biblioteca clínica pública do site, PDFs de terceiros, dados de pacientes, calculadoras, doses ou conteúdo clínico premium. Não anuncia que estes recursos já estejam disponíveis no app. Também não tem notificações, rastreadores ou compras.

## Abrir e testar

Na pasta `mobile/`, com Node 22 ou posterior:

```sh
npm ci
npm test
npm run build
npx cap sync
```

Para abrir os projetos:

```sh
npm run ios
npm run android
```

`ios/` e `android/` são projetos nativos gerados; não precisam ser gerados novamente. `dist/`, `node_modules/`, caches e binários são ignorados pelo Git e regeneráveis. O `package-lock.json` fixa as versões instaladas. O runtime nativo é **Capacitor 8.6.0**.

## Conectar uma conta existente

Edite `public/config.json` com a URL HTTPS do servidor, a URL do projeto Supabase e **somente a chave pública** `sb_publishable_…` ou JWT legado com `role: anon`. Nunca coloque uma chave privada/`service_role` no aplicativo.

```json
{
  "apiBaseUrl": "https://SEU-SERVIDOR",
  "supabaseUrl": "https://SEU-PROJETO.supabase.co",
  "supabasePublishableKey": "CHAVE_PUBLICA_DO_PROJETO"
}
```

Os campos acima são marcadores, não credenciais prontas. A configuração entregue está vazia. A interface recusa HTTP, URLs com credenciais e chaves reconhecidas como privadas. O build permite a origem local para ler `config.json` e apenas as origens externas exatas configuradas na Política de Segurança de Conteúdo (CSP); sem configuração, `connect-src 'self'`. Execute novamente build e sync após alterar o arquivo.

O login chama diretamente `/auth/v1/token?grant_type=password` do Supabase e exige e-mail confirmado. O token fica apenas na memória até sair/encerrar o processo. A senha é limpa após a tentativa. Não há renovação persistente ou armazenamento de token em `localStorage`. Um próximo ciclo pode implementar Keychain/Keystore após revisão específica; não persistir tokens em texto simples.

O servidor deve aceitar a origem nativa apropriada via CORS (**`capacitor://localhost` no iOS e `https://localhost` no Android**, sem curinga), validar o token no provedor e responder `GET /api/me` com um plano de servidor, por exemplo `{"tier":"pro"}`. O app aceita `tier`, `plan` ou `entitlement.tier` apenas para exibição. **Não libera material pago localmente por esse valor.** Entrega de conteúdo exige endpoints protegidos no servidor, ainda não consumidos por esta versão.

## Monetização e lojas

A modalidade implementada é consumo/consulta de conta. Não existem botões, links ou webviews para Hotmart, Stripe ou compras externas. Preços e aquisição permanecem no canal web. Isso não garante enquadramento como “reader app” nem aprovação das lojas: as funções reais e o país da loja determinam as regras aplicáveis.

Antes de distribuir, falta definir e testar:

1. Cadastro do titular nas lojas, identificador definitivo, certificados/assinatura, contato de suporte, política de privacidade pública e formulários de dados.
2. Conta real com backend homologado, gestão/exclusão de conta e tratamento de cancelamentos; conteúdos licenciados e protegidos no servidor.
3. Testes em aparelhos reais, acessibilidade, continuidade offline, perda/restauração local, telas e metadados de loja.

Android requer Java 21 e Android Studio/SDK compatível com API 36. Não foi instalado SDK ou Java nesta tarefa. iOS usa Xcode e Swift Package Manager; a tentativa de compilação não usa conta Apple nem assinatura.

As inscrições têm custos externos: Apple Developer **US$ 99/ano** e Play Console **US$ 25 uma vez**, conforme valores oficiais consultados em 03/11/2026. Não foi feita inscrição, pagamento, envio de app ou pedido de revisão. Apps clínicos podem exigir avaliações adicionais; a base atual não oferece função de diagnóstico, tratamento ou dosagem.

## Privacidade e reversão

As tarefas/notas/cartões ficam em `localStorage` sob `antigravity.study.v1`, sem envio pelo aplicativo. O botão de exclusão pede confirmação e remove somente essa chave. Não altera a assinatura ou a conta do serviço. Backups do sistema seguem as configurações do aparelho; Android está com `allowBackup=false`. Informações sensíveis não devem ser registradas.

Para manter o app em modo exclusivamente offline, preserve os três campos vazios, faça build e sync novamente. Não é necessário alterar o site público para usar ou reverter esta base móvel.

## Fontes oficiais

- [Capacitor: instalação](https://capacitorjs.com/docs/getting-started) e [ambiente](https://capacitorjs.com/docs/getting-started/environment-setup).
- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), [reader apps](https://developer.apple.com/br/support/reader-apps/) e [inscrição](https://developer.apple.com/help/account/membership/program-enrollment/).
- [Google Play: pagamentos](https://support.google.com/googleplay/android-developer/answer/10281818?hl=en), [cadastro](https://support.google.com/googleplay/android-developer/answer/6112435/) e [testes de novas contas pessoais](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en-US).
