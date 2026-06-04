# 10 — Integração com IA: GPT, Claude, Qwen e Gemini 🤖🧠

## Princípio de segurança
IA é acelerador de estudo, não autoridade clínica.  
Para medicina intensiva:
- conferir em diretriz/livro/fonte primária;
- pedir incertezas;
- pedir referências;
- nunca inserir dados identificáveis de paciente;
- usar para treinar raciocínio, não terceirizar julgamento.

## Divisão de trabalho sugerida

### GPT
Melhor uso:
- tutor socrático;
- criação de questões;
- correção de respostas OSCE;
- transformar erro em flashcard;
- explicar fisiologia;
- simular banca TEMI;
- revisar plano semanal.

Prompt:
> Aja como examinador TEMI. Faça uma estação de 3 minutos sobre [tema]. Depois me avalie de 0 a 5 usando critérios de segurança, priorização, fisiologia, conduta, reavaliação e comunicação. Seja rigoroso.

Prompt para flashcards:
> Transforme minhas anotações abaixo em 15 flashcards de alta qualidade, com foco em decisão de UTI, limiares, contraindicações, exceções e pegadinhas de prova. Não crie cards óbvios.

### Claude
Melhor uso:
- síntese de capítulos longos;
- comparação de diretrizes;
- criação de documentos estruturados;
- roteiros OSCE longos;
- revisão de linguagem e clareza;
- montar mapas conceituais e tabelas.

Prompt:
> Leia este material e gere: 1) resumo executivo; 2) algoritmo; 3) 20 perguntas ativas; 4) 10 flashcards; 5) 5 estações OSCE.

### Gemini
Melhor uso:
- pesquisa com web;
- atualização de diretrizes;
- transformar pesquisa em relatório;
- materiais multimodais;
- quizzes visuais;
- integração com documentos do Google.

Prompt:
> Faça uma pesquisa atualizada sobre [tema] priorizando diretrizes, revisões sistemáticas e trials dos últimos 5 anos. Separe consenso, controvérsias, impacto em prova e aplicação à UTI brasileira.

### Qwen
Melhor uso:
- alternativa de baixo custo/local quando disponível;
- automações;
- geração de scripts;
- organização de flashcards;
- programação de ferramentas simples;
- segunda opinião de raciocínio.

Prompt:
> Gere um script Python para converter uma lista de perguntas e respostas em CSV importável no Anki, com tags por tema.

## Fluxo de IA para cada tema

1. Você estuda fonte oficial.
2. IA cria perguntas ativas.
3. Você responde sem olhar.
4. IA corrige com rubrica.
5. Você confere fonte.
6. Erros viram flashcards.
7. IA cria OSCE.
8. Você grava resposta.
9. IA avalia transcrição.
10. Você refaz.

## Prompt mestre TEMI

> Estou me preparando para a prova TEMI 2027. Quero uma abordagem de médico intensivista. Para o tema [TEMA], produza: definição operacional, fisiologia essencial, diagnóstico, critérios de gravidade, condutas iniciais, condutas definitivas, armadilhas, contraindicações, trials/diretrizes relevantes, 20 questões estilo prova, 10 flashcards e 3 estações OSCE. Destaque o que muda mortalidade e o que é pegadinha.

## Prompt anti-alucinação

> Liste o que você tem certeza, o que é provável, o que é controverso e o que precisa ser verificado em diretriz atual. Não invente referência. Se não souber, diga que não sabe.

## Prompt OSCE agressivo

> Seja um examinador hostil, mas justo. Interrompa minha resposta, peça priorização, cobre segurança, cobre fisiologia e avalie se minha conduta seria aceitável em UTI real. Dê nota de 0 a 5 e diga exatamente como chegar a 5.

## Prompt de plantão

> Tenho 12 minutos e estou cansado pós-plantão. Gere um microtreino sobre [tema] com 5 flashcards, 3 perguntas, 1 caso OSCE de 2 minutos e 1 regra de ouro.
