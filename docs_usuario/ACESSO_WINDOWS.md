# 🪟 Acesso ao Antigravity Consultas no Windows

Guia TDAH-friendly para instalar um ícone no Desktop e no Menu Iniciar sem
permissão de administrador.

## ⚡ Rota rápida

1. Baixe `Antigravity-Consultas-Windows.zip`.
2. Confirme o checksum SHA-256.
3. Clique com o botão direito no ZIP e escolha **Extrair Tudo**.
4. Abra a pasta extraída.
5. Dê dois cliques em `INSTALAR.cmd`.
6. Use o novo ícone **Antigravity Consultas** no Desktop ou Menu Iniciar.

> Não execute o instalador dentro da visualização compactada do ZIP. Extraia
> todos os arquivos primeiro.

## 🔐 Verificar o download

Baixe também `SHA256SUMS.txt` para a mesma pasta do ZIP. Abra o PowerShell nessa
pasta e execute:

```powershell
Get-FileHash .\Antigravity-Consultas-Windows.zip -Algorithm SHA256
```

Compare o resultado com a linha correspondente em `SHA256SUMS.txt`. As
sequências devem ser idênticas. Se forem diferentes, não execute o pacote.

Opcionalmente, no Prompt de Comando:

```cmd
certutil -hashfile Antigravity-Consultas-Windows.zip SHA256
```

## 📁 O que a instalação altera

Somente o perfil do usuário atual:

```text
%LOCALAPPDATA%\Antigravity Consultas\
Desktop\Antigravity Consultas.lnk
Menu Iniciar\Programas\Antigravity Consultas\
```

O instalador:

- copia o launcher, o desinstalador e o ícone;
- usa um ícone multirresolução para Desktop, Menu Iniciar e Barra de Tarefas;
- cria um atalho no Desktop;
- cria atalhos de abrir e desinstalar no Menu Iniciar;
- não solicita elevação;
- não altera registro global;
- não instala serviço, extensão, tarefa agendada ou inicialização automática;
- não muda navegador padrão, firewall ou política permanente do PowerShell.
- recusa pastas controladas por junction ou link simbólico.

## 🌐 O que o launcher faz

Ele executa somente:

```text
https://aldenirfilho.github.io/antigravity-consultas/
```

no navegador padrão. Não há telemetria, API clínica, sincronização própria,
conta ou envio de arquivos.

## 🧹 Desinstalação reversível

Método recomendado:

1. abra o Menu Iniciar;
2. procure `Antigravity Consultas`;
3. clique em **Desinstalar Antigravity Consultas**;
4. aguarde a confirmação.

Alternativas:

- execute `DESINSTALAR.cmd` da pasta que foi extraída do ZIP.

O desinstalador remove apenas a lista conhecida de arquivos e atalhos. Se a
pasta tiver conteúdo desconhecido, ela é preservada para evitar perda
acidental.

## 🧯 Solução rápida de problemas

| Sintoma | Ação |
|---|---|
| Windows bloqueou o download | Verifique origem e SHA-256 antes de liberar |
| `Instalar.ps1` não encontrado | Extraia todo o ZIP e tente novamente |
| Ícone não aparece imediatamente | Atualize o Desktop ou saia e entre na sessão |
| Site abre no navegador errado | Altere o navegador padrão nos Ajustes do Windows |
| Atalho não abre | Execute `app\Abrir-Antigravity.cmd` para diagnosticar |
| Instalação parcial | Execute `DESINSTALAR.cmd` e reinstale o pacote íntegro |
| Página antiga | Recarregue o site e limpe somente o cache desse site, se necessário |

## 🛡️ Transparência do PowerShell

O `.cmd` inicia o script local com `ExecutionPolicy Bypass` apenas naquele
processo. Isso permite executar um script não assinado sem alterar a política
permanente do computador. Todos os scripts são texto simples e podem ser
abertos no Bloco de Notas.

Este pacote não possui assinatura digital Authenticode e não deve ser
apresentado como software assinado. A estrutura e o ZIP foram verificados em
macOS; instalação, atalhos, SmartScreen e desinstalação ainda exigem teste
manual em Windows 10/11 real.

## ♿ Acessibilidade e foco

- fixe o atalho na Barra de Tarefas pelo Menu Iniciar, se desejar;
- pressione a tecla Windows e digite `Antigravity` para abrir rapidamente;
- use `Ctrl + L` no navegador para voltar à busca por URL;
- use zoom com `Ctrl + +` e `Ctrl + -`;
- ative o leitor de tela do Windows com `Windows + Ctrl + Enter`, quando
  necessário.

## 🩺 Segurança clínica

O pacote apenas abre o site. Não inclua nome, prontuário, imagem ou outro dado
identificável de paciente em atalhos, nomes de arquivos ou anotações locais.
Conteúdo clínico continua educacional e depende de revisão médica humana,
protocolo institucional e dupla checagem.
