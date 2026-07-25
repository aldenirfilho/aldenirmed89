# ♿ Antigravity Consultas no Dock do Mac

Este guia cria um acesso direto e visual ao Antigravity Consultas no Dock. O
atalho funciona em MacBook Air, MacBook Pro e Mac Pro, tanto com processador
Apple Silicon quanto Intel, desde que o macOS seja 11 ou posterior.

> **Resumo TDAH-friendly recomendado:** abra o site no **Safari** e escolha
> **Arquivo → Adicionar ao Dock**. Não é necessário baixar um aplicativo e o
> Gatekeeper não bloqueia esse caminho.

## ✅ Opção 1 — Safari, sem download e sem bloqueio

Em versões recentes do macOS:

1. abra o **Safari**;
2. acesse
   `https://aldenirfilho.github.io/antigravity-consultas/`;
3. aguarde a página inicial terminar de carregar;
4. no menu superior, escolha **Arquivo → Adicionar ao Dock**;
5. confirme o nome `Antigravity Consultas`;
6. clique em **Adicionar**.

O macOS cria o web app localmente, com ícone próprio, janela dedicada e entrada
na pasta Aplicativos. Esse é o método principal porque não depende de pacote
executável baixado, certificado de terceiro ou liberação manual no Gatekeeper.

### Se “Adicionar ao Dock” não aparecer

1. confirme que o Safari e o macOS estão atualizados;
2. abra o endereço diretamente no Safari, e não dentro de outro aplicativo;
3. tente novamente pelo menu **Arquivo**;
4. como alternativa, use a opção Chrome descrita mais abaixo.

## 🧯 Vi a mensagem “O item não foi aberto”

Essa mensagem se refere à versão anterior do ZIP, que continha
`Antigravity Consultas.app`. Ela tinha assinatura local **ad hoc**, mas não
possuía Apple Developer ID nem notarização. Não foi encontrado certificado
Apple Developer válido neste Mac para produzir uma versão notarizada.

### Correção mais simples

1. clique em **OK**;
2. mova somente o `.app` antigo bloqueado para o Lixo;
3. instale novamente pelo método **Safari → Arquivo → Adicionar ao Dock**.

O download atual `Antigravity-Consultas-macOS.zip` também foi substituído: ele
agora contém somente um arquivo de endereço `.webloc` e um README. Não contém
`.app`, executável ou script e, portanto, não exige **Abrir Mesmo Assim**.

## Opção 2 — ZIP atualizado sem executável

1. baixe novamente `Antigravity-Consultas-macOS.zip`;
2. verifique o checksum conforme a seção abaixo;
3. descompacte o ZIP;
4. abra `Antigravity Consultas.webloc`;
5. no Safari, use **Arquivo → Adicionar ao Dock** para criar o app.

## 🔎 Verificar o pacote atualizado

Baixe também `SHA256SUMS.txt` para a mesma pasta do novo ZIP. No Terminal:

```bash
cd ~/Downloads
grep ' Antigravity-Consultas-macOS.zip$' SHA256SUMS.txt \
  | shasum -a 256 -c -
```

O resultado esperado termina em:

```text
Antigravity-Consultas-macOS.zip: OK
```

Se aparecer `FAILED`, apague apenas o download suspeito, baixe novamente e não
abra o app até a verificação retornar `OK`.

## Opção 3 — instalar pelo Google Chrome

1. abra o site no Chrome;
2. abra o menu `⋮`;
3. procure **Transmitir, salvar e compartilhar**;
4. escolha **Instalar página como app** ou **Criar atalho**, conforme a versão;
5. marque a opção para abrir como janela, se ela for oferecida;
6. com o app aberto, clique com o botão direito em seu ícone no Dock e escolha
   **Opções → Manter no Dock**.

Os nomes dos menus podem variar entre versões do Chrome.

## Remover ou reinstalar

- Para remover somente do Dock: arraste o ícone para fora do Dock ou use
  **Opções → Remover do Dock**.
- Para desinstalar o web app do Safari: remova `Antigravity Consultas` da pasta
  Aplicativos e do Dock.
- Para atualizar: abra novamente o web app com internet. O conteúdo vem do site
  publicado; não é necessário baixar um novo pacote para cada atualização.

Remover o launcher não apaga o site nem os conteúdos do repositório. Dados
locais eventualmente gravados pelo navegador pertencem ao navegador/PWA, não a
este pequeno launcher.

## Solução rápida de problemas

| Sintoma | O que fazer |
|---|---|
| O `.app` antigo não abre | Mova apenas essa cópia antiga para o Lixo e use Safari → Adicionar ao Dock |
| “A Apple não pôde verificar” | Confirme que você baixou o ZIP atualizado, que não contém `.app` |
| O ícone ficou genérico | Remova do Dock, abra o app em Aplicativos e fixe novamente |
| O site abre em navegador indesejado | Altere o navegador padrão em Ajustes do Sistema |
| O checksum falhou | Não abra; baixe novamente a partir do site oficial |
| A página parece antiga | Recarregue a página e aguarde a atualização do cache offline |
| Um módulo retorna 404 | Confirme o deploy verde no GitHub Actions e teste novamente |

## Segurança clínica e privacidade

O acesso pelo Dock é uma conveniência educacional. Ele:

- não transforma o site em dispositivo médico;
- não substitui avaliação clínica, protocolo institucional ou dupla checagem;
- não deve receber nome, prontuário, fotografia ou qualquer dado identificável
  de paciente;
- não acrescenta nuvem, conta, API externa ou telemetria;
- depende de revisão médica humana para o conteúdo clínico publicado.
