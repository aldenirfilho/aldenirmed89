# NEXUS E360X Render Clínico 23X

Versão pública, sintética e desidentificada da arquitetura:

```text
FONTE BRUTA
→ NEXUS ARACNE-DECODE
→ CASE-IR
→ CÓDIGOS + TAG# + RELAÇÕES
→ QR0–QR8
→ RENDER CLÍNICO 23X
→ AÇÃO + REAVALIAÇÃO
→ ACRA 1.5 + TURBO TEMI
→ GRAFO U1–U2–U3
```

## Objetivo

Transformar uma evolução linear em uma representação clínica verificável,
cronológica, visual e executável. O sistema não substitui julgamento clínico,
protocolos locais nem revisão médica.

## Arquivos

- `NEXUS_CLINICAL_RENDER_23X_v2.1.md`: contrato canônico vigente.
- `NEXUS_CLINICAL_RENDER_22X_v2.2.md`: linhagem intermediária preservada.
- `NEXUS_E360X_PIPELINE_ORCHESTRATOR_v2.0.md`: sequência dos motores e gates.
- `case-ir.schema.json`: contrato intermediário entre decodificação e render.
- `render-23x.schema.json`: contrato das quatro telas e 23 módulos.
- `render-22x.schema.json`: schema intermediário preservado para rastreabilidade.
- `index.html`: protótipo visual interativo com caso inteiramente sintético.
- `SHA256SUMS.txt`: integridade do pacote público.

## Regras de segurança

- Nenhum identificador real de paciente pode entrar neste diretório público.
- Dados clínicos P2/P3 permanecem em superfícies privadas autorizadas.
- GitHub e Sites recebem apenas arquitetura, código e exemplos sintéticos.
- Publicação falha de modo fechado se identidade, fonte ou revisão estiverem
  ausentes.
- O conteúdo assistencial deve manter fatos, inferências, lacunas e sugestões
  explicitamente separados.

## Comando simples

```text
RENDER CLÍNICO 23X: <evolução ou fontes>
```

Esse comando seleciona somente as capacidades disponíveis e pertinentes. Ele
não ativa artificialmente todos os plugins, não publica e não envia dados sem
autorização.
