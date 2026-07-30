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

### Motor visual GPT no fluxo editorial

Quando a tarefa ganhar clareza com uma imagem original, usar a skill `imagegen`
no momento de autoria e publicar somente o arquivo estático final. A geração
entra diretamente na pasta pública do módulo ou da estação, mas nunca contorna
o gate editorial:

1. Gerar uma imagem conceitual original, sem reproduzir figura de artigo,
   marca, paciente, dado identificável, prescrição ou alegação diagnóstica.
2. Evitar texto incorporado à imagem; título, legenda, rótulos e ressalvas ficam
   no HTML acessível. Imagem clínica sintética deve ser rotulada como conceitual
   e não pode simular evidência diagnóstica real sem validação específica.
3. Inspecionar visualmente anatomia, artefatos, texto acidental e aderência ao
   tema. Rejeitar a imagem em caso de ambiguidade clinicamente perigosa.
4. Salvar a versão escolhida em caminho versionado `assets/visuals/`, otimizar
   para web e registrar caminho, dimensões, formato, SHA-256, texto alternativo,
   legenda, resumo do prompt, origem gerada, direitos e revisão pendente em
   `data/visual-assets.json`.
5. Integrar a imagem ao HTML com `width`, `height`, `loading="lazy"`,
   `decoding="async"`, texto alternativo e legenda. Atualizar cache offline,
   manifestos, registro editorial e testes quando aplicável.
6. Não usar chave OpenAI, chamada de geração, upload automático, telemetria ou
   API do motor visual no JavaScript público. O navegador recebe apenas o asset
   revisado; geração e publicação acontecem no fluxo Git auditável.
7. Publicar no site apenas após builder, gate de privacidade, revisão do diff e
   fluxo Git do projeto. “Diretamente” significa integrar no destino público da
   tarefa, sem criar uma galeria paralela e sem ignorar a revisão humana.

### Regra de realidade clínica para imagens POCUS

Em conteúdo didático de POCUS, a imagem que ensina um achado deve representar
ultrassom real, desidentificado e com origem, licença e atribuição documentadas.
Imagem gerada por IA nunca pode ser apresentada como exame real, evidência
diagnóstica ou substituto de aquisição dinâmica.

1. Reservar arte gerada para mapas conceituais, anatomia alegórica, fluxos e
   ambientação. Rotular no próprio HTML como “alegórica”, “conceitual” e
   “não diagnóstica”.
2. Obter ultrassom didático real apenas de fonte pública autorizada ou acervo
   próprio com consentimento e desidentificação verificáveis. Registrar artigo,
   figura, autores, URL, licença, dimensões, bytes e SHA-256.
3. Preservar os pixels clínicos originais. Não usar geração, preenchimento,
   reconstrução ou retoque por IA. Crop ou redimensionamento não diagnóstico só
   é permitido quando a licença autoriza e a versão original continua
   rastreável.
4. Colocar anotações editoriais fora da imagem, em HTML/CSS acessível ou overlay
   determinístico revisável. Não ocultar marcadores, escalas ou limitações
   relevantes da figura-fonte.
5. Tornar cada visual didático autossuficiente no padrão Turbo TEMI:
   **Janela → Veja → Interprete → Armadilha → Próximo passo → Fonte/licença**.
6. Distinguir “imagem real publicada” de “ground truth diagnóstico”: uma figura
   representativa apoia reconhecimento de padrão, mas não valida diagnóstico
   isolado nem substitui vídeo, técnica, contexto hemodinâmico ou supervisão.
7. Manter o módulo em revisão médica e bloquear publicação ativa se identidade,
   direitos, desidentificação, fidelidade do arquivo ou leitura clínica não
   puderem ser confirmados.
