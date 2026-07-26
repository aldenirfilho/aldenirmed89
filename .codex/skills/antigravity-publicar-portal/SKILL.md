---
name: antigravity-publicar-portal
description: Rotear, auditar e transformar observações, artigos, links, alertas, descobertas de estudo e melhorias da plataforma em publicações rastreáveis para a Estação Radar Diário ou para o Portal Vivo Antigravity. Usar quando o usuário pedir para postar, publicar, destacar, atualizar ou converter algo para o Radar, feed de UPGRADE ou formato Turbo TEMI Antigravity.
---

# Publicar nas estações Antigravity

## Destino obrigatório

Toda entrada precisa carregar `destination` e `target`:

- `target: "radar-diario"` e
  `destination: "Estação Radar Diário — conteúdo clínico/estudo do chat"`:
  destino padrão para artigo, notícia clínica, alerta de saúde, nota de estudo,
  conteúdo TEMI, síntese produzida no chat e produto/promoção útil a ser
  auditado no canal `Produtividade & Compras`.
- `target: "portal-vivo-upgrade"` e
  `destination: "Portal Vivo — UPGRADE da plataforma"`: usar somente para nova
  estação, recurso, correção, integração ou melhoria operacional do
  Antigravity.

Se o usuário enviar conteúdo de estudo sem indicar destino, escolher
`radar-diario`. O Portal Vivo não é o armazenamento de notícias clínicas.

## Entrada mínima

Receber a observação do usuário e uma URL de fonte. Pedir a fonte apenas quando
ela não puder ser localizada com segurança. Nunca incluir identificadores de
paciente, credenciais, dados financeiros ou material privado.

## Fluxo obrigatório

1. Confirmar `destination` e `target` antes de formatar.
2. Abrir e conferir a fonte original. Para afirmações técnicas, priorizar artigo,
   diretriz, órgão oficial ou documento primário. Não usar agregador como única
   sustentação quando a fonte primária estiver disponível.
3. Verificar duplicidade pela identidade específica da publicação, nesta ordem:
   DOI, PMID, identificador editorial e URL canônica do artigo/documento.
   Domínio, favicon ou página inicial não identificam uma notícia. Quando a
   instituição fornece apenas uma landing page, registrar `source.id` estável.
4. Separar fato, interpretação e incerteza. Não extrapolar o desfecho e não
   inventar número ausente.
5. Converter para português claro no formato Turbo TEMI:
   impacto clínico, gancho de prova, âncora visual, 2 a 5 pontos e ressalva.
6. Rotular preprint, acesso, desenho e revisão clínica pendente quando aplicável.
   Para `product-watch`, registrar preço e horário da conferência,
   disponibilidade, especificações verificáveis, compatibilidade, garantia,
   uso prático, riscos, quando vale, quando não comprar e link direto. Nunca
   prometer ganho de produtividade, foco ou resultado clínico.
7. Criar o JSON conforme `references/post-schema.md` em uma pasta temporária.
8. Para `portal-vivo-upgrade`, ler `17_Portal_Vivo/data/posts.json` e
   `17_Portal_Vivo/data/publication-history.json`, então validar antes de alterar
   o feed:

   `python3 .codex/skills/antigravity-publicar-portal/scripts/publish_portal.py validate --input ARQUIVO.json`

9. Publicar no Portal Vivo somente quando o usuário tiver pedido publicação e o
   `target` for `portal-vivo-upgrade`:

   `python3 .codex/skills/antigravity-publicar-portal/scripts/publish_portal.py publish --input ARQUIVO.json`

10. Para `radar-diario`, não executar `publish_portal.py publish`: integrar a
    edição datada e o histórico antirrepetição da Estação Radar Diário,
    preservando fonte, desenho, achado, relevância, limitação e imagem
    referenciada. Não desviar o conteúdo para `17_Portal_Vivo/data/posts.json`.
11. Executar `python3 -m unittest tests.test_portal_vivo -v`, os testes
    relacionados e o builder público. Revisar o diff antes de versionar.
12. Usar o fluxo seguro do GitHub do projeto e verificar a página pública.

## Limites clínicos

- Não transformar notícia, preprint ou estudo isolado em protocolo.
- Não publicar dose ou ordem terapêutica imperativa sem revisão clínica humana
  confirmada.
- Manter aviso de que a publicação é apoio educacional.
- Para urgência real de paciente, priorizar a assistência e tratar a publicação
  como atividade posterior.
- Se a fonte estiver inacessível ou contraditória, publicar apenas como
  pendência editorial ou não publicar.

## Imagens

Usar imagem apenas quando comunicar um conceito específico. Vincular título,
data, fonte e URL. Evitar figura decorativa, texto excessivo, logotipo dominante
ou reprodução não autorizada de figura do artigo. Cada imagem publicada no
Radar precisa de um par: widescreen mais completo e card vertical
autossuficiente. Produtos também seguem esse contrato.
