# ♿ Antigravity Consultas no Dock do Mac

Este guia cria um acesso direto e visual ao Antigravity Consultas no Dock. O
atalho funciona em MacBook Air, MacBook Pro e Mac Pro, tanto com processador
Apple Silicon quanto Intel, desde que o macOS seja 11 ou posterior.

> **Resumo TDAH-friendly:** baixe o ZIP, mova o aplicativo para `Aplicativos`,
> abra com clique direito na primeira vez e arraste o ícone para o Dock.

## Opção 1 — aplicativo pronto com ícone próprio

### Instalar

1. Baixe `Antigravity-Consultas-macOS.zip` na seção de downloads do site.
2. Confirme a integridade do arquivo conforme a seção **Verificar o download**.
3. Dê dois cliques no ZIP para descompactá-lo.
4. Arraste `Antigravity Consultas.app` para a pasta **Aplicativos** do macOS.
5. Na pasta Aplicativos, clique com o botão direito sobre o app e escolha
   **Abrir**.
6. Confirme **Abrir** na primeira execução.
7. Arraste o app da pasta Aplicativos para a posição desejada no Dock.

Ao clicar no ícone, o app abre
`https://aldenirfilho.github.io/antigravity-consultas/` no navegador padrão.
Ele não solicita login, não envia telemetria e não armazena dados de pacientes.

### Por que o macOS pode mostrar um aviso?

O pacote é assinado localmente de forma **ad hoc** para detectar alterações
acidentais, mas não possui certificado comercial Apple Developer ID nem
notarização da Apple. Por isso, o Gatekeeper pode pedir uma confirmação na
primeira abertura.

Se o botão **Abrir** não aparecer:

1. tente abrir o app uma vez;
2. acesse **Ajustes do Sistema → Privacidade e Segurança**;
3. localize a mensagem sobre `Antigravity Consultas`;
4. escolha **Abrir Mesmo Assim** somente se o checksum estiver correto e o ZIP
   tiver vindo do site oficial do projeto.

Nunca desative globalmente o Gatekeeper.

## Verificar o download

Baixe também `SHA256SUMS.txt` para a mesma pasta do ZIP. No Terminal:

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

## Opção 2 — adicionar ao Dock pelo Safari

Em versões recentes do macOS:

1. abra o site no Safari;
2. no menu **Arquivo**, selecione **Adicionar ao Dock**;
3. confirme o nome `Antigravity Consultas`;
4. mantenha o ícone no Dock.

Essa opção cria um web app gerenciado pelo próprio macOS e costuma oferecer a
integração mais natural com o sistema.

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
- Para desinstalar o pacote: mova `Antigravity Consultas.app` da pasta
  Aplicativos para o Lixo.
- Para atualizar: substitua o app da pasta Aplicativos pela nova versão
  verificada e mantenha o mesmo atalho no Dock.

Remover o launcher não apaga o site nem os conteúdos do repositório. Dados
locais eventualmente gravados pelo navegador pertencem ao navegador/PWA, não a
este pequeno launcher.

## Solução rápida de problemas

| Sintoma | O que fazer |
|---|---|
| O app não abre | Confirme internet, navegador padrão e o Gatekeeper |
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
