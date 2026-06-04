---
type: dashboard
plugin: dataview
created: 2026-04-20
tags:
  - dashboard
  - dataview
  - medicina/uti
---

# 📊 Dashboard de Protocolos - UTI & Emergência

> [!info] Como usar
> 1. Instale o plugin **Dataview** (Settings → Community Plugins)
> 2. Certifique-se de que suas notas têm **YAML frontmatter** (tags, status, etc.)
> 3. As queries abaixo atualizam automaticamente ao modificar as notas

---

## 🚨 Protocolos Ativos de UTI (Ordenados por Atualização)

```dataview
TABLE without id 
  file.link as "Protocolo", 
  status as "Status", 
  versao as "Versão", 
  file.mtime as "Última Atualização",
  tags as "Tags"
FROM #medicina/uti OR #protocolo OR #emergencia
WHERE status = "ativo"
SORT file.mtime DESC
LIMIT 10