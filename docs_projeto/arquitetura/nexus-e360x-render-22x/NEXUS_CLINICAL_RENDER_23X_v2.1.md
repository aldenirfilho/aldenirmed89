# NEXUS COSMOS U3 — Renderização Cognitivo-Clínica 23X

**Versão:** `2.1.0`  
**SHA-256 da especificação canônica de origem:** `1fb585ad11f1cb8918d9d8e57e4846e78067c0c7de0ff0f28e44d84e57b2ec08`  
**Classe:** arquitetura pública, sintética e desidentificada

> Renderizar não é decorar nem resumir. É reconstruir o caso clínico como
> modelo visual, cronológico, rastreável e executável.

## Profundidade progressiva

| Tela | Orçamento de atenção | Conteúdo |
|---|---:|---|
| Tela 0 — Radar | 10 s | P0/P1, mudança, ação urgente e lacuna crítica |
| Tela 1 — Caso | 60 s | timeline, suportes, problemas e pendências |
| Tela 2 — Completa | sob demanda | 23 módulos |
| Tela 3 — Aprendizagem | focal | imagens, micropartículas, ACRA, questões e revisão |

Completude significa poder recuperar tudo, não exibir tudo simultaneamente.

## Os 23 módulos canônicos

1. Identificação, contexto e corte temporal.
2. Diagnósticos confirmados.
3. Hipóteses e dúvidas diagnósticas.
4. Lista hierarquizada P0–Pn.
5. Cronologia visual.
6. Estado clínico atual e suportes.
7. Exame físico por sistemas.
8. Laboratório, tendências e lacunas.
9. Imagens, localização e limitações.
10. Análise crítica integrativa.
11. Auditoria da prescrição e segurança.
12. Checklist essencial.
13. Exames a solicitar, repetir ou evitar.
14. Condutas priorizadas por problema.
15. Alertas e riscos silenciosos.
16. Assuntos derivados para estudo.
17. Pérolas e armadilhas clínicas.
18. Pendências, dependências e responsáveis.
19. Conduta mais urgente agora.
20. Síntese executiva e passagem.
21. Nome canônico sugerido.
22. Plano de reavaliação, gatilhos e contingências.
23. Depósito TAG estruturado.

## R-ENGINE

```text
FONTE BRUTA
→ ÁTOMOS CLÍNICOS
→ TEMPO + CERTEZA + PRIORIDADE
→ CASE-IR
→ RECEITA VISUAL
→ RADAR 10 s
→ CASO 60 s
→ 23 MÓDULOS
→ AÇÃO + REAVALIAÇÃO
→ APRENDIZAGEM ATIVA
```

O motor escolhe a representação pela relação:

| Necessidade | Representação |
|---|---|
| sequência | timeline proporcional |
| ameaça | radar P0–P3 |
| mecanismo | mapa causal |
| tendência | small multiple ou sparkline |
| conduta | algoritmo + contingência |
| prescrição | matriz medicamento × risco |
| imagem clínica | imagem anotada + limitações |
| passagem | cartão de 10 linhas |
| estudo | ACRA/caso ramificado |
| grafo | mapa TAG |

## Contrato de ação

```text
AÇÃO → ALVO → PRAZO → REAVALIAÇÃO → GATILHO → CONTINGÊNCIA
```

Cada bloco identifica tempo, certeza, prioridade, tendência, proveniência e
classe de privacidade. Ausência, conflito e inferência permanecem visíveis.

## QR0–QR8

1. `QR0 Fidelidade`
2. `QR1 Tempo`
3. `QR2 Incerteza`
4. `QR3 Hierarquia`
5. `QR4 Compreensão`
6. `QR5 Execução`
7. `QR6 Carga`
8. `QR7 Acessibilidade`
9. `QR8 Transferência`

## Depósito TAG

Compartimentos:

`TOP5`, `NUCLEARES`, `MECANISMOS`, `ARSENAL`, `CONTEXTO`, `DIDÁTICAS`,
`APOIO`, `CANDIDATAS` e `REJEITADAS`.

Cada TAG preserva:

```text
tag_uid | rótulo | tipo | maturidade | evidência | problema |
relações | universos | privacidade | origem | versão
```

Uma TAG composta é um conceito próprio: `#AB` não implica automaticamente
`#A + #B`.

## Piloto obrigatório

O primeiro piloto deve usar caso sintético ou integralmente desidentificado,
medir tempo até reconhecer P0/P1, exigir tentativa antes do feedback e
reprocessar o mesmo `CASE-IR` com zero duplicação.

