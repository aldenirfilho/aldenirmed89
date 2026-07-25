---
name: antigravity-publicar-portal
description: Transformar observações, artigos, links, alertas e descobertas de estudo em publicações rastreáveis para o Portal Vivo Antigravity. Usar quando o usuário pedir para postar, publicar, destacar, atualizar ou converter algo para o feed, Radar ou formato Turbo TEMI Antigravity.
---

# Publicar no Portal Antigravity

## Entrada mínima

Receber a observação do usuário e uma URL de fonte. Pedir a fonte apenas quando
ela não puder ser localizada com segurança. Nunca incluir identificadores de
paciente, credenciais, dados financeiros ou material privado.

## Fluxo obrigatório

1. Ler `17_Portal_Vivo/data/posts.json` e
   `17_Portal_Vivo/data/publication-history.json`.
2. Abrir e conferir a fonte original. Para afirmações técnicas, priorizar artigo,
   diretriz, órgão oficial ou documento primário. Não usar agregador como única
   sustentação quando a fonte primária estiver disponível.
3. Verificar duplicidade por DOI, PMID, URL canônica, título e ideia central.
4. Separar fato, interpretação e incerteza. Não extrapolar o desfecho e não
   inventar número ausente.
5. Converter para português claro no formato Turbo TEMI:
   impacto clínico, gancho de prova, âncora visual, 2 a 5 pontos e ressalva.
6. Rotular preprint, acesso, desenho e revisão clínica pendente quando aplicável.
7. Criar o JSON conforme `references/post-schema.md` em uma pasta temporária.
8. Validar antes de alterar o feed:

   `python3 .codex/skills/antigravity-publicar-portal/scripts/publish_portal.py validate --input ARQUIVO.json`

9. Publicar somente quando o usuário tiver pedido publicação:

   `python3 .codex/skills/antigravity-publicar-portal/scripts/publish_portal.py publish --input ARQUIVO.json`

10. Executar `python3 -m unittest tests.test_portal_vivo -v`, os testes
    relacionados e o builder público. Revisar o diff antes de versionar.
11. Usar o fluxo seguro do GitHub do projeto e verificar a página pública.

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
ou reprodução não autorizada de figura do artigo.
