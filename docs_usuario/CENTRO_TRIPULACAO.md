# 🧑‍🚀 Operar o Centro da Tripulação

Guia rápido para métricas, assinaturas, diretório administrativo, boletim e
manifestações sem expor dados da tripulação.

## O que já funciona sem backend

- navegação, apresentação e preferências locais;
- escolha de tema e idioma neste dispositivo;
- explicação pública dos compromissos de privacidade;
- estado honesto `—` para métricas ainda não conectadas;
- preparação do texto de uma manifestação, sem simular envio.

Sem um serviço seguro configurado, **não** há criação de conta, envio de e-mail,
protocolo, conversa ou contagem real. Isso evita senhas falsas e números
inventados.

## O que o público pode ver

- total agregado de assinantes ativos;
- total agregado de visualizações;
- visualizações agregadas por seção;
- perfis básicos somente quando cada pessoa fizer opt-in explícito.

E-mail, UUID, assinatura individual, histórico de navegação, manifestações e
respostas nunca pertencem à área pública.

## O que fica no Comando autenticado

- diretório básico dos usuários;
- contato privado necessário à operação;
- consentimento e situação do boletim;
- preferências declaradas;
- caixa de manifestações e respostas.

Uma conta comum não pode ler o diretório. A função administrativa deve ser
concedida no servidor, nunca por um botão do navegador.

## Portal de Escuta

Antes do envio, a pessoa escolhe obrigatoriamente:

1. agradecimento;
2. sugestão;
3. contribuição;
4. informação;
5. notificação;
6. reclamação;
7. outra — com especificação obrigatória.

A manifestação pode ser identificada ou anônima. No modo anônimo, o servidor
gera protocolo e chave secreta; ambos devem ser guardados para acompanhar e
responder na conversa da página. É uma conversa assíncrona, não um chat em tempo
real nem uma promessa de resposta automática.

O e-mail institucional só aparece quando um endereço oficial monitorado for
configurado. Enquanto isso, a interface informa `Canal de e-mail em
configuração`.

## Ativar os serviços reais

Use o manual técnico:

```text
18_Centro_Tripulacao/ATIVAR_BACKEND.md
```

Resumo obrigatório:

1. crie um projeto de homologação no provedor de autenticação;
2. exija confirmação de e-mail e limite tentativas;
3. aplique o esquema com RLS;
4. teste como anônimo, tripulante comum e administrador;
5. configure somente URL e chave pública no frontend;
6. nunca publique `service-role`, chave de e-mail ou segredo;
7. proteja envio anônimo com CAPTCHA acessível e rate limit no servidor;
8. configure um domínio e e-mail institucionais reais;
9. teste descadastro e retenção antes do primeiro boletim;
10. só então altere `mode` de `disconnected` para `connected`.

## Publicar uma atualização para a tripulação

1. redija uma mensagem curta com data, impacto e ação esperada;
2. confirme autoria, privacidade e revisão clínica quando aplicável;
3. publique a atualização canônica na seção correta;
4. registre a mudança no Portal Vivo quando for um UPGRADE;
5. inclua no boletim apenas assinantes com consentimento ativo;
6. ofereça cancelamento simples em todo envio;
7. não personalize recomendação clínica a partir de histórico de leitura.

## Checklist

- [ ] números vieram do backend e não foram digitados manualmente;
- [ ] área pública contém somente agregados;
- [ ] diretório exige sessão e função administrativa válidas;
- [ ] anônimo não consegue listar manifestações;
- [ ] usuário comum lê somente suas próprias conversas;
- [ ] e-mail institucional existe e é monitorado;
- [ ] envio diário passou por dry-run e revisão humana;
- [ ] senha, token e endereço privado não aparecem no Git ou nos logs;
- [ ] mobile, teclado, tema claro e impressão foram conferidos;
- [ ] exclusão, retenção, descadastro e resposta humana estão definidos.
