# 🪟 AldenirMed89 para Windows

Atalho leve para abrir o site oficial do AldenirMed89 no navegador
padrão. Não exige instalação administrativa, não cria serviço em segundo plano
e não adiciona telemetria.

## ⚡ Instalar em três passos

1. Extraia **todo** o ZIP para uma pasta.
2. Dê dois cliques em `INSTALAR.cmd`.
3. Ao final, use o ícone **AldenirMed89** no Desktop ou Menu Iniciar.

O instalador grava somente no perfil atual:

```text
%LOCALAPPDATA%\AldenirMed89\
%USERPROFILE%\Desktop\AldenirMed89.lnk
%APPDATA%\Microsoft\Windows\Start Menu\Programs\AldenirMed89\
```

O caminho real do Desktop é obtido do próprio Windows e também funciona quando
ele é gerenciado pelo OneDrive.

## 🧹 Desinstalar

Escolha uma das opções:

- Menu Iniciar → AldenirMed89 → **Desinstalar AldenirMed89**;
- execute `DESINSTALAR.cmd` a partir desta pasta extraída.

O desinstalador remove somente atalhos e arquivos conhecidos. Se encontrar
arquivos desconhecidos na pasta do aplicativo, preserva-os e mostra um aviso.
Ele não altera navegador, registro global, políticas, firewall ou programas.

## 🔍 O que cada arquivo faz

| Arquivo | Função |
|---|---|
| `INSTALAR.cmd` | inicia o instalador PowerShell visível |
| `DESINSTALAR.cmd` | inicia a remoção reversível |
| `app/Instalar.ps1` | copia a pequena carga local e cria atalhos |
| `app/Desinstalar.ps1` | remove somente os artefatos conhecidos |
| `app/Abrir-Antigravity.cmd` | abre exclusivamente o site oficial |
| `app/AntigravityConsultas.ico` | ícone A Orbital multirresolução dos atalhos (16–256 px) |

Os scripts são texto aberto: podem ser inspecionados no Bloco de Notas antes da
execução.

## 🛡️ Segurança e privacidade

- sem conta, senha ou credencial;
- sem privilégio de administrador;
- sem tarefa agendada, serviço ou inicialização automática;
- sem coleta de uso ou telemetria;
- sem envio de arquivos locais;
- a única ação de rede é abrir
  `https://aldenirfilho.github.io/aldenirmed89/`;
- nenhuma informação de paciente deve ser inserida ou armazenada nos atalhos.

O parâmetro `ExecutionPolicy Bypass` vale somente para o processo que executa os
scripts locais e transparentes do pacote. Ele não modifica permanentemente a
política do Windows.

## ⚠️ Assinatura e homologação

Este pacote **não possui assinatura digital Authenticode**. O Windows pode
exibir um aviso porque o arquivo veio da internet. Confirme o SHA-256 publicado,
inspecione os scripts e prossiga somente se o arquivo tiver vindo do repositório
oficial.

A estrutura e os checksums foram validados fora do Windows. A instalação ainda
precisa de homologação manual em um Windows real.

## 🩺 Limite clínico

O launcher é apenas um acesso educacional. Ele não é dispositivo médico, não
substitui avaliação clínica, protocolos institucionais ou revisão médica humana
dos conteúdos.
