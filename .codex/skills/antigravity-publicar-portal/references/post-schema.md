# Esquema de uma publicação

O arquivo de entrada contém um único objeto:

```json
{
  "type": "evidence-summary",
  "category": "Terapia Intensiva",
  "priority": 1,
  "title": "Título factual e curto",
  "summary": "Síntese proporcional ao resultado.",
  "publishedAt": "2026-07-25T20:30:00-03:00",
  "source": {
    "name": "Nome da fonte",
    "url": "https://...",
    "date": "2026-07-25",
    "checkedAt": "2026-07-25T20:30:00-03:00"
  },
  "turbo": {
    "clinicalImpact": "Aplicabilidade ou por que importa.",
    "temiHook": "Como o tema pode ser cobrado ou revisado.",
    "memoryAnchor": "ÂNCORA CURTA",
    "takeaways": ["Ponto 1", "Ponto 2"],
    "caveat": "Limitação principal."
  },
  "audit": {
    "sourceChecked": true,
    "clinicalReview": "pending",
    "noDirectPatientData": true,
    "reviewedAt": "2026-07-25T20:30:00-03:00",
    "reviewedBy": "Codex Antigravity"
  }
}
```

Tipos permitidos: `evidence-summary`, `clinical-news`, `health-policy`,
`study-note` e `system-upgrade`.

`clinicalReview` aceita `pending`, `confirmed` ou `not-required`. Conteúdo com
ordem terapêutica, prescrição ou dose exige `confirmed`. Publicações com
`pending` devem permanecer descritivas e mostrar a ressalva editorial no feed.
