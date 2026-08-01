# Radar Diário — extensão WidgetKit nativa

Projeto iOS com dois targets:

- `AntigravityRadar`: aplicativo-contêiner SwiftUI;
- `RadarDiarioWidget`: extensão WidgetKit nos tamanhos pequeno, médio e grande.

## O que já está implementado

- feed público derivado da edição atual de
  `15_Radar_Cientifico/data/radar.js`;
- atualização HTTPS somente pelo GitHub Pages oficial;
- rotação de até três itens a cada 20 minutos;
- nova tentativa de atualização a cada 60 minutos;
- fallback empacotado e cache compartilhado por App Group;
- deep link para o item correspondente na Estação Radar;
- aviso educacional, limite clínico e status de revisão;
- nenhuma conta, telemetria, credencial ou dado de paciente.

## Ação necessária no seu Mac com Xcode

1. Instale ou abra o **Xcode completo** pela App Store.
2. Abra `AntigravityRadar.xcodeproj`.
3. Selecione o projeto `AntigravityRadar` na barra lateral.
4. No target **AntigravityRadar**, abra **Signing & Capabilities**.
5. Escolha sua equipe Apple em **Team**.
6. Confirme o bundle ID `com.aldenirfilho.antigravity.radar`.
7. Adicione a capability **App Groups** e marque:
   `group.com.aldenirfilho.antigravity.radar`.
8. Repita no target **RadarDiarioWidget**, usando o bundle ID
   `com.aldenirfilho.antigravity.radar.widget` e o mesmo App Group.
9. Conecte o iPhone por cabo, desbloqueie-o e autorize o computador.
10. Escolha seu iPhone como destino e execute o scheme
    **AntigravityRadar**.
11. No iPhone: mantenha pressionada a Tela de Início → **Editar** →
    **Adicionar Widget** → procure **Radar Diário**.
12. Teste os três tamanhos, toque no widget e confirme a abertura do item no
    Radar.

## Sincronização editorial

Depois de atualizar `15_Radar_Cientifico/data/radar.js`, execute:

```sh
node scripts_admin/build_radar_widget_feed.mjs
```

Para conferir sem alterar arquivos:

```sh
node scripts_admin/build_radar_widget_feed.mjs --check
```

O workflow do GitHub bloqueia divergência entre o Radar e o feed do widget.

## Limites atuais

- A assinatura e a instalação física dependem da conta Apple do proprietário.
- Este ambiente tem o compilador Swift, mas não o Xcode completo; por isso a
  compilação iOS, o simulador, a assinatura e a homologação no iPhone ficam
  pendentes.
- WidgetKit controla o horário exato das atualizações; 20 e 60 minutos são
  solicitações de timeline, não garantia de execução no minuto exato.
- O conteúdo continua sendo apoio educacional em revisão clínica.
