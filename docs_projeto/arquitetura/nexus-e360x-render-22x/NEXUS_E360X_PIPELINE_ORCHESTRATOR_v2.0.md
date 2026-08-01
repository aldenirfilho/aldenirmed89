# NEXUS E360X Pipeline Orchestrator v2.0

## Comando único

```text
RENDER CLÍNICO 23X: <texto bruto, anexos ou referências>
```

## Sequência

```text
1. INVENTARIAR FONTES
2. PROTEGER IDENTIDADE E PRIVACIDADE
3. DEDUPLICAR PACIENTE/CASO
4. ARACNE-DECODE
5. NORMALIZAR CASE-IR
6. GERAR P0–Pn, CÓDIGOS, TAG# E ARESTAS
7. AUDITAR PRESCRIÇÃO, SUPORTES E DISPOSITIVOS
8. APLICAR QR0–QR8
9. RENDERIZAR RADAR 10 s + CASO 60 s + 23 MÓDULOS
10. GERAR ACRA 1.5 E MICROPARTÍCULAS
11. PERSISTIR TRANSCRIPT INTEGRAL EM MARKDOWN
12. SINCRONIZAR SOMENTE SUPERFÍCIES AUTORIZADAS
13. REGISTRAR PROVENIÊNCIA, HASH, VERSÃO E CHECKPOINT
```

## Roteamento por capacidade

| Necessidade | Capacidade preferencial |
|---|---|
| captura clínica privada | Notion e armazenamento privado autorizado |
| schema, testes e código | GitHub |
| doutrina e decisões | Markdown local versionado; GitHub apenas em branch/PR autorizados |
| tarefas e aceite | backlog Markdown local e checklist do PR rascunho |
| diagrama e interface | Visualize/Figma |
| métricas estruturadas | Data Analytics |
| mídia e originais | Google Drive privado |
| site público | Sites, somente conteúdo desidentificado |
| template reutilizável | Template Creator |
| procedimento operacional | Generate Runbook |

O catálogo inteiro é considerado, mas apenas capacidades relevantes,
disponíveis e autorizadas são chamadas. “Ativar todos” não significa gerar
chamadas artificiais, conceder permissões ou publicar automaticamente.

## Autoridade por superfície

- **Notion privado:** nó clínico canônico, transcript, TAG# e relações.
- **Drive privado:** fontes e mídia com SHA-256.
- **GitHub:** contratos públicos, código, testes e exemplos sintéticos.
- **Markdown local versionado:** arquitetura, norma operacional e decisões.
- **Backlog local:** aceite, responsáveis e bloqueios; quando autorizado, o
  checklist pode ser espelhado em um PR rascunho do GitHub.
- **Sites:** visualização pública sintética ou desidentificada.

## Downgrade preventivo de contas encerradas

Desde 2026-08-01, Airtable, Asana, Confluence e Jira não são superfícies de
manutenção do Antigravity. As quatro contas estão em `RETIRED_ACCOUNT`, com
roteamento `BLOCKED`, sem automação ativa, escrita, leitura ou sincronização.

| Serviço aposentado | Estado | Substituição ativa |
|---|---|---|
| Airtable | `RETIRED_ACCOUNT / BLOCKED` | dados estruturados no repositório ou Notion privado autorizado |
| Asana | `RETIRED_ACCOUNT / BLOCKED` | backlog Markdown local |
| Confluence | `RETIRED_ACCOUNT / BLOCKED` | documentação Markdown local versionada |
| Jira | `RETIRED_ACCOUNT / BLOCKED` | backlog local e checklist de PR rascunho |

As referências anteriores a Confluence/Jira permanecem somente como registro
histórico redigido no manifesto; identificadores externos ficam apenas no cofre
local privado. Elas não podem ser usadas para descobrir credenciais,
criar tarefas, atualizar páginas ou reativar integrações. Uma eventual
reativação exige nova decisão explícita do proprietário e nova revisão de
privacidade; nunca ocorre por fallback automático.

## Idempotência

```text
case_key = SHA256(patient_key | institution | unit | temporal_anchor)
source_key = SHA256(bytes | source_type | source_timestamp)
edge_key = SHA256(from_uid | relation | to_uid | qualifier)
render_key = SHA256(case_ir_revision | recipe_version | privacy_profile)
```

Nenhum título isolado funciona como chave. Em conflito, atualizar/versionar o
nó existente; nunca criar outro silenciosamente.

## Saída mínima

- `CASE-IR` válido;
- quatro telas progressivas;
- 23 módulos completos ou lacunas explícitas;
- QR0–QR8;
- transcript Markdown integral;
- depósito TAG#;
- registro de sincronização por superfície;
- itens bloqueados e próxima ação humana.
