# 🧭 Motor de Busca 360X — guia de operação

> Bastidor (não publicado). Como o AldenirMed 360X e o Complexo 360X chegam ao Google, ao Bing e às plataformas de busca com IA.

## O que roda sozinho a cada publicação

| Peça | Onde | Para quem |
|---|---|---|
| JSON-LD (WebSite, Organization, Person, WebPage/MedicalWebPage, BreadcrumbList, Periodical) | todas as páginas indexáveis do `site/` | Google, Bing, IA |
| Meta description, Open Graph, Twitter, robots com prévia grande | só onde faltava | Google, WhatsApp, Facebook, X |
| `noindex` em componentes, snippets, offline, admin e diagnóstico | `noindexPatterns` | evita páginas finas no índice |
| `sitemap_index.xml` → `sitemap.xml` + `sitemap-jornal-360.xml` (PDFs com data da edição) | raiz do site | Search Console, Bing |
| `jornal-360/feed.xml` (RSS) | Jornal Diário 360 | leitores de feed, agregadores |
| `llms.txt` | raiz do site | ChatGPT, Perplexity, Claude e afins |
| `complexo-360x/` | página-mapa por tema | descoberta cruzada entre os sites 360X |
| IndexNow (job `deploy`) | só URLs alteradas no push | Bing, Copilot, DuckDuckGo via Bing, Yandex, Naver, Seznam, Yep |

Código: `seo_360x.py` (chamado por `build_public_site.py`), `seo_360x_config.json`, `build_complexo_360x.py`, `indexnow_submit.py`. Testes: `tests/test_seo_360x.py`.

## ✅ Uma vez só (depende da sua conta — ~15 min)

1. **Google Search Console** → Adicionar propriedade → **Prefixo do URL** → `https://aldenirfilho.github.io/aldenirmed89/`.
   - Método **Tag HTML**: copie só o valor `content="…"` e cole em `verification.google-site-verification` de `seo_360x_config.json`. Merge → publicar → **Verificar**.
   - Domínio inteiro (`github.io`) não é seu; só o prefixo funciona.
2. **Sitemaps** (no Search Console): enviar `sitemap_index.xml`.
3. **Inspeção de URL** → "Solicitar indexação" para: home, `complexo-360x/`, `jornal-360/`.
4. **Bing Webmaster Tools** → **Importar do Google Search Console** (verifica e traz o sitemap). O IndexNow já cobre os avisos seguintes.
5. *(Opcional)* Yandex Webmaster: token em `verification.yandex-verification`.

## 📰 Jornal Diário 360 no Google Notícias

- Não existe mais inscrição manual: o Google Notícias avalia sites elegíveis de forma automática, sem garantia de inclusão.
- Desde março/2025 o Publisher Center não cria nem personaliza páginas de publicação; o Google usa o favicon e o nome do site.
- O que ajuda: página HTML própria por edição (hoje cada edição é PDF), data visível, autoria e política de correções (as duas últimas já existem).

## 🔁 Rotina (5 min/semana)

- Search Console → **Páginas**: ver "Descoberta, mas não indexada" e "Rastreada, mas não indexada".
- Search Console → **Melhorias**: breadcrumbs e dados estruturados sem erro.
- Bing → **IndexNow**: envios aceitos (HTTP 200/202).

## 🧯 Limites honestos

- Sitemap, JSON-LD e IndexNow **aceleram a descoberta**; **não garantem** indexação nem posição.
- O Google **não usa IndexNow**. Para ele: sitemap + inspeção de URL + links de sites já indexados.
- `robots.txt` em `/aldenirmed89/` não vale para o host; o efetivo seria `aldenirfilho.github.io/robots.txt` (repositório `aldenirfilho.github.io`, que não existe hoje).
- Desde 2025 o Google não mostra mais resultado de checagem (ClaimReview) nem caixa de busca nos sitelinks; não use esses tipos esperando destaque.
- Dados estruturados **não afirmam credenciais profissionais**: alegações exigem registro verificado no gate editorial.

## Trocar a chave IndexNow

Gere 32 caracteres hex (`python3 -c "import secrets;print(secrets.token_hex(16))"`), troque `indexnow.key` e faça merge. O próximo deploy publica o novo arquivo-chave e reenvia todas as URLs.
