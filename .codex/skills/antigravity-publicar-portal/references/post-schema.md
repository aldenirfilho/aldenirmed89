# Esquema de uma publicação

O arquivo de entrada contém um único objeto:

```json
{
  "destination": "Estação Radar Diário — conteúdo clínico/estudo do chat",
  "target": "radar-diario",
  "type": "evidence-summary",
  "category": "Terapia Intensiva",
  "priority": 1,
  "title": "Título factual e curto",
  "summary": "Síntese proporcional ao resultado.",
  "publishedAt": "2026-07-25T20:30:00-03:00",
  "source": {
    "name": "Nome da fonte",
    "url": "https://...",
    "doi": "10.0000/exemplo",
    "pmid": "12345678",
    "id": "identificador-editorial-quando-nao-houver-doi-ou-pmid",
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

Destinos permitidos:

- `radar-diario`: conteúdo clínico, científico, de saúde pública, TEMI ou nota
  de estudo, além de produto/promoção auditada para `Produtividade & Compras`.
  É o padrão para conteúdo elaborado no chat.
- `portal-vivo-upgrade`: somente `type: "system-upgrade"` sobre evolução da
  plataforma.

Em `source`, DOI, PMID e ID são opcionais individualmente. Informe o
identificador mais específico disponível. Não use o domínio ou a homepage como
identificador. Quando duas notícias diferentes compartilham a mesma landing
page, atribua a cada uma seu `source.id` editorial.

Tipos permitidos: `evidence-summary`, `clinical-news`, `health-policy`,
`study-note`, `product-watch` e `system-upgrade`.

Em `product-watch`, o agente completa no Radar: preço e horário da conferência,
disponibilidade, especificações verificáveis, compatibilidade, vendedor,
garantia/devolução, uso prático, risco, motivo para comprar, motivo para não
comprar e divulgação de ausência de afiliação. Possível benefício nunca pode ser
apresentado como rendimento garantido.

`clinicalReview` aceita `pending`, `confirmed` ou `not-required`. Conteúdo com
ordem terapêutica, prescrição ou dose exige `confirmed`. Publicações com
`pending` devem permanecer descritivas e mostrar a ressalva editorial no feed.
