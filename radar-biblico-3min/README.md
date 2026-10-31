# Radar Bíblico — mensagem diária e blog

Edição de 31/10/2026. A seção **Hoje** conecta o Radar ao [Bíblia Cristã para Guerreiros de Fé](https://biblia-crista-guerreiros-de-fe.aldenirmed.chatgpt.site/). As oito trilhas anteriores continuam disponíveis.

## Leitura e compartilhamento

- Uma leitura do acervo de 24 mensagens é selecionada por dia, no fuso `America/Fortaleza`.
- A data de calendário, convertida em número de dias desde 1970, seleciona um índice no acervo ordenado pelo identificador. É a mesma regra do blog, usando explicitamente o dia de Sobral.
- Abrir, retornar à página ou permanecer nela durante a virada do dia atualiza a seleção. Datas e leituras abertas por links compartilhados permanecem fixas até escolher **Voltar a hoje**.
- O ciclo volta ao início após as 24 leituras. Isso não representa geração de texto novo a cada dia.
- O texto bíblico, a reflexão, o contexto, a ação e os cuidados têm identificação própria. A revisão teológica independente permanece pendente.
- **Copiar**, **Compartilhar** e **Enviar pelo WhatsApp** preparam o conteúdo; o visitante escolhe o destinatário e confirma o envio. Não há envio automático por WhatsApp, e-mail ou notificações push.
- Não há conta nem coleta de destinatários, respostas ou relatos. O diário anterior continua local ao dispositivo.

## Origem e atualização do acervo

`daily-messages.js` é uma cópia pública versionada da edição 0.4.0 do blog. Cada trecho importado foi comparado ao texto da respectiva página pública; o SHA256 da página foi registrado. Nenhum rascunho ou arquivo privado é importado.

Na raiz deste repositório, execute com o caminho do checkout do blog na máquina usada:

```sh
python3 scripts_admin/sync_radar_daily.py --source '/caminho/do/blog' --verified-on YYYY-MM-DD
```

O importador exige que a versão local coincida com `publicacao.json`, que cada leitura conste das rotas públicas e que título, resumo, versículo, contexto, pergunta, ação e cuidado correspondam à publicação. Uma divergência interrompe a operação antes de gravar. `--check` confere sem escrever.

Depois, revise o diff, atualize o registro editorial e a versão dos ativos na página, rode os testes e publique pelo workflow normal. A seção não importa conteúdo novo do blog silenciosamente.

## Verificar

```sh
node --test tests/radar-daily.test.cjs
python3 -m unittest discover -s tests -p 'test_*.py'
python3 scripts_admin/editorial_gate.py --check --changed-file radar-biblico-3min/index.html --changed-file radar-biblico-3min/daily-messages.js --json
```

O HTML original de setembro permanece no histórico Git. A edição atual acrescenta o calendário e a conexão com o blog sem alterar a home, o design do portal, o cronômetro, os cenários ou os conteúdos clínicos.
