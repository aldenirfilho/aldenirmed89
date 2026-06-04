# Prompt para outras IAs gerarem cards compatíveis com o GPT Card Feed Médico 🧠📲

Use este prompt no Claude, Gemini, Qwen, Grok, Antigravity ou outro gerador de conteúdo.

---

## Prompt mestre

Você vai gerar conteúdo compatível com meu aplicativo **GPT Card Feed Médico**.

Contexto:
Sou médico clínico/plantonista de UTI e estudo TEMI/R3. Quero cards visuais didáticos, organizados por tema, com linguagem prática, segura, TDAH-friendly e útil para plantão.

Gere:

1. Uma imagem/card em formato vertical, preferencialmente:
   - 1080×1920 px ou 1440×1920 px
   - PNG ou JPG
   - fundo escuro, visual limpo, alto contraste
   - texto curto, organizado em blocos
   - ideal para leitura no iPhone

2. Um JSON de metadados compatível com o app, seguindo este schema:

```json
{
  "cards": [
    {
      "title": "Título curto e claro do card",
      "theme": "UTI Geral | TEMI | Ventilação Mecânica | Sepse/Choque | Nefro/AKI/TRS | Endocrino/Diabetes | Neurologia Intensiva | Cardio/Hemodinâmica | Infectologia | Farmacologia/Doses | POCUS | Obsidian/IA/Produtividade | Jurídico/Financeiro | Família/Cuidados | Outros",
      "tags": ["tag1", "tag2", "tag3"],
      "explanation": "Explicação didática curta: como usar o card, armadilhas, decisão prática e pérolas.",
      "notes": "Notas opcionais para revisão futura.",
      "source": "Fonte ou origem: guideline, artigo, ChatGPT, Claude, protocolo institucional, etc.",
      "status": "novo",
      "imageName": "nome_do_arquivo.png"
    }
  ]
}
```

3. Se possível, gere também uma versão Markdown do conteúdo-fonte:

```markdown
# Título do card

## Tema
...

## Objetivo
...

## Conteúdo principal
...

## Pérolas de prova TEMI
...

## Armadilhas
...

## Referências
...
```

Regras:
- Não inventar dado clínico crítico, dose ou guideline.
- Se não tiver certeza, marcar como “checar fonte primária”.
- Não usar dados identificáveis de paciente.
- Priorizar algoritmos, checklists, tabelas e condutas práticas.
- Conteúdo deve ser educacional e não substituir julgamento clínico.

---

## Prompt curto para geração rápida

Gere um card vertical 1080×1920 para iPhone sobre: **[TEMA]**.  
Estilo: UTI/TEMI, escuro, limpo, didático, com 5–10 blocos no máximo.  
Depois gere JSON compatível com GPT Card Feed Médico contendo: title, theme, tags, explanation, notes, source, status, imageName.

---

## Prompt para Antigravity organizar cards no repo

Você é o agente de organização do meu repositório de cards médicos.

Tarefa:
1. Receber imagens em `/assets/cards`.
2. Criar ou atualizar `/data/cards.json`.
3. Cada imagem deve virar um objeto:
   - id
   - title
   - theme
   - tags
   - explanation
   - source
   - imageUrl
   - createdAt
4. Não apagar arquivos existentes.
5. Não publicar dados sensíveis.
6. Manter nomes de arquivos sem espaços, com kebab-case ou snake_case.
7. Gerar diff incremental e explicar o que foi alterado.

Schema:

```json
{
  "cards": [
    {
      "id": "aki-kdigo-2026-10-passos",
      "title": "KDIGO 2026 AKI na UTI em 10 passos",
      "theme": "Nefro/AKI/TRS",
      "tags": ["AKI", "KDIGO", "TRS", "UTI", "TEMI"],
      "explanation": "Mapa visual para revisão rápida no plantão e prova TEMI.",
      "source": "ChatGPT + KDIGO 2026 draft",
      "imageUrl": "assets/cards/kdigo_2026_aki_uti_10_passos.png",
      "status": "novo",
      "createdAt": "2026-05-07"
    }
  ]
}
```
