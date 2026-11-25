# Validação móvel — 03/11/2026

| Entrega/verificação | Resultado |
|---|---|
| Código web local | Vite 7.3.7; build de produção aprovado |
| Runtime nativo | Capacitor 8.6.0, projetos iOS/Android gerados e sincronizados |
| Testes de modelo | 4 aprovados: limites e persistência de tarefas/notas, normalização/armazenamento inválido, revisões, configuração de conta recusando URLs/chaves inadequadas |
| Interface | Chrome headless, 390 × 844, aprovada; sem erro JavaScript ou overflow inicial |
| iOS | **BUILD SUCCEEDED** para simulador, Xcode 27.1, SDK iphonesimulator27.1, `CODE_SIGNING_ALLOWED=NO` |
| Correspondência iOS | SHA-256 dos cinco recursos web finais conferido entre `dist/` e `App.app/public/`: HTML, configuração, ícone, JS e CSS idênticos |
| Android | Projeto e sync aprovados; `./gradlew assembleDebug` local falhou pela ausência de Java Runtime; **sem APK/AAB local** |
| Conta e pagamento reais | Não testados; configuração pública vazia; nenhum login, compra, assinatura, chave privada ou dado de paciente usado |
| Aparelho real/lojas | Não testado em aparelho físico; nenhuma assinatura de distribuição, TestFlight, App Store ou Google Play |

## QA de interface

`tests/browser.mjs` usou o Playwright já disponível no runtime e o Google Chrome instalado. Verificou criação de três tarefas, limite, remoção, texto semelhante a HTML tratado como texto, persistência após reload, pista de retomada, revelação de respostas, agendamento em 14 dias, favorito na biblioteca e conta indisponível sem configuração. Com o navegador sem rede, as ações de cartões já carregados continuaram funcionando. Isso verifica a interface local, **não equivale a teste nativo em modo avião**.

As capturas locais, ignoradas pelo Git, estão em:

- `build/qa/mobile-today.png`
- `build/qa/mobile-cards.png`

## Compilação iOS final

O build final usou os pacotes Swift já baixados:

```sh
xcodebuild -project ios/App/App.xcodeproj -scheme App \
  -sdk iphonesimulator -configuration Debug \
  -destination 'generic/platform=iOS Simulator' \
  -derivedDataPath build/ios \
  -clonedSourcePackagesDirPath build/SourcePackages \
  -disableAutomaticPackageResolution \
  -onlyUsePackageVersionsFromResolvedFile \
  CODE_SIGNING_ALLOWED=NO build
```

O log local `build-ios-source-final.log` terminou com `BUILD SUCCEEDED` e exit code 0. Uma tentativa anterior foi interrompida na resolução de pacotes; o sucesso acima corresponde à fonte final, incluindo a correção da Política de Segurança de Conteúdo (CSP) e o suporte confirmado `aldenirmed@gmail.com`.

Bundle de simulador: `build/ios/Build/Products/Debug-iphonesimulator/App.app`. **Não é um IPA para instalar em iPhone físico.** Binários/caches/logs não são versionados. Os fontes e lockfiles permitem reproduzir o build. Nenhuma conta Apple foi acessada.

## Limites para liberação

Os recursos de estudo offline são a entrega funcional desta base. A conexão com assinantes exige configurar e homologar autenticação, CORS nativo e servidor `/api/me`; conteúdos pagos ainda não são consumidos pelo aplicativo. Cadastro, gestão/exclusão de conta, suporte/política pública, assinatura das lojas, testes em dispositivos e revisão de distribuição precisam ser concluídos antes de anunciar disponibilidade nas lojas.
