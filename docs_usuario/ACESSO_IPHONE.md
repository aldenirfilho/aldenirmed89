# 📱 Acesso rápido ao Antigravity no iPhone

Este guia cria um ícone do **Antigravity Consultas** na Tela de Início, com
abertura semelhante a um app. É o caminho mais simples e TDAH-friendly: um
toque para entrar na plataforma.

## ⚡ Instalação em 60 segundos

### 1. Abra pelo Safari

No iPhone, abra o **Safari** e acesse:

<https://aldenirfilho.github.io/aldenirmed89/>

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
