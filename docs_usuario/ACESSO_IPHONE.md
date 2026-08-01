# 📱 Acesso rápido ao Antigravity no iPhone

Este guia cria um ícone do **Antigravity Consultas** na Tela de Início, com
abertura semelhante a um app. É o caminho mais simples e TDAH-friendly: um
toque para entrar na plataforma.

## ⚡ Instalação em 60 segundos

### 1. Abra pelo Safari

No iPhone, abra o **Safari** e acesse:

<https://aldenirfilho.github.io/antigravity-consultas/>

> Use o Safari para esta instalação. Abrir o link dentro de WhatsApp, Gmail ou
> outro navegador pode ocultar a opção necessária.

### 2. Abra o menu de compartilhamento

- Toque em **Mais** e depois em **Compartilhar**; ou
- toque diretamente no botão **Compartilhar**, conforme o layout do Safari.

### 3. Adicione à Tela de Início

1. Role a lista de ações.
2. Toque em **Adicionar à Tela de Início**.
3. Ative **Abrir como App da Web**.
4. Confirme o nome `Antigravity Consultas`.
5. Toque em **Adicionar**.

✅ O ícone aparecerá na Tela de Início. Ao tocá-lo, o site abrirá como app da
web.

## 🔄 Widget nativo “Radar Diário”

O repositório também contém uma **extensão WidgetKit nativa**, separada do
atalho web. Ela mostra até três itens da edição atual do Radar, alterna o foco
a cada 20 minutos, solicita atualização a cada 60 minutos e abre diretamente o
item correspondente no site.

### O que já está pronto

- app-contêiner SwiftUI e extensão WidgetKit;
- tamanhos pequeno, médio e grande;
- feed público sincronizado com a Estação Radar;
- cache compartilhado e fallback offline;
- sem conta, telemetria, credenciais ou dados de pacientes.

### O que você precisa fazer no Mac com Xcode

1. Instale ou abra o **Xcode completo** pela App Store.
2. Baixe ou sincronize a pasta oficial do projeto pelo iCloud/GitHub.
3. Abra
   `ios/AntigravityRadar/AntigravityRadar.xcodeproj`.
4. Na lateral do Xcode, selecione o projeto **AntigravityRadar**.
5. Abra **Signing & Capabilities** no target **AntigravityRadar**.
6. Em **Team**, selecione sua equipe Apple.
7. Confirme o bundle ID `com.aldenirfilho.antigravity.radar`.
8. Adicione **App Groups** e marque
   `group.com.aldenirfilho.antigravity.radar`.
9. Repita as etapas 5–8 no target **RadarDiarioWidget**, com o bundle ID
   `com.aldenirfilho.antigravity.radar.widget` e o mesmo App Group.
10. Conecte e desbloqueie o iPhone, autorize o Mac e selecione o aparelho como
    destino.
11. Execute o scheme **AntigravityRadar** uma vez.
12. No iPhone, mantenha a Tela de Início pressionada → **Editar** →
    **Adicionar Widget** → procure **Radar Diário**.
13. Teste os três tamanhos e toque em cada item para confirmar o deep link.

> A assinatura e a instalação física não podem ser concluídas automaticamente
> sem sua equipe Apple e um iPhone conectado. O projeto está
> `source-ready-signing-pending`: pronto em código, ainda não declarado como
> instalado ou homologado.

Código e instruções técnicas:
<https://github.com/aldenirfilho/antigravity-consultas/tree/main/ios/AntigravityRadar>

### Se a opção não aparecer

1. Role até o final da lista de compartilhamento.
2. Toque em **Editar Ações**.
3. Adicione **Adicionar à Tela de Início**.
4. Volte e repita a instalação.

## 🎯 Organização recomendada para TDAH

- Coloque o ícone na **primeira Tela de Início** ou no **Dock**.
- Use uma pasta curta, como `UTI`, `TEMI` ou `Plantão`.
- Mantenha apenas **um atalho principal** para reduzir duplicidade.
- Antes de iniciar um sprint, ative um modo Foco do iPhone por 12 minutos.
- Use a busca interna da plataforma em vez de abrir várias abas.

## 🧩 Qual ícone usar?

O Safari escolhe automaticamente o ícone adequado. O conjunto mantido no
repositório é:

| Tamanho | Arquivo | Destino principal |
|---:|---|---|
| 120 × 120 | `assets/icons/ios/apple-touch-icon-120.png` | iPhone Retina legado |
| 152 × 152 | `assets/icons/ios/apple-touch-icon-152.png` | iPad Retina |
| 167 × 167 | `assets/icons/ios/apple-touch-icon-167.png` | iPad Pro |
| 180 × 180 | `assets/icons/ios/apple-touch-icon-180.png` | iPhone atual |
| 1024 × 1024 | `assets/icons/ios/apple-touch-icon-1024.png` | fonte mestre |

O arquivo padrão `assets/icons/apple-touch-icon.png` é a cópia de 180 × 180.
Não há texto pequeno no desenho, o que preserva a leitura em tamanhos reduzidos.

## 🛠️ Solução de problemas

### O ícone antigo continua aparecendo

1. Confirme que a versão nova do site já foi publicada.
2. Remova somente o atalho antigo da Tela de Início.
3. Abra novamente o site no Safari.
4. Adicione-o outra vez à Tela de Início.

O iPhone pode manter o ícone anterior em cache. Recriar o atalho costuma ser
mais seguro do que apagar todos os dados do Safari.

### O site abre em uma aba comum

Remova o atalho e repita a instalação, certificando-se de ativar
**Abrir como App da Web** antes de tocar em **Adicionar**.

### O site está sem conexão

Abra uma vez com internet após instalar ou atualizar. Conteúdos ainda não
armazenados no dispositivo podem exigir conexão.

### A página parece desatualizada

Feche o app da web, abra o endereço no Safari e recarregue. Se necessário,
remova e recrie o atalho depois que a publicação for concluída.

## 📦 Pacote para manutenção

Os cinco PNGs e um README rápido estão reunidos em:

`downloads/Antigravity-Consultas-iPhone-Icones.zip`

Para verificar o pacote em um Mac:

```bash
cd ~/Downloads
grep ' Antigravity-Consultas-iPhone-Icones.zip$' SHA256SUMS.txt \
  | shasum -a 256 -c -
unzip -t Antigravity-Consultas-iPhone-Icones.zip
```

## 🔒 Privacidade e segurança clínica

- O atalho não solicita dados de pacientes.
- Os ícones não contêm informações pessoais ou clínicas.
- Não salve prontuários, fotos identificáveis ou credenciais dentro do
  repositório público.
- A plataforma é apoio educacional e cognitivo; protocolos locais e revisão
  humana continuam obrigatórios.

## 📚 Referência oficial

As etapas seguem o Manual de Uso do iPhone da Apple:

<https://support.apple.com/pt-br/guide/iphone/iphea86e5236/ios>
