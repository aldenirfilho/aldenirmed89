# RespiraSense ICU — Upgrade Antigravity v3 🫁⚡

Versão HTML/PWA pronta para inserir no projeto `antigravity-consultas` e publicar via GitHub Pages.

## O que mudou nesta versão

- ✅ PWA instalável no iPhone/Android/Desktop.
- ✅ Service Worker com cache offline.
- ✅ Ícones 192/512 gerados.
- ✅ `module.manifest.json` para integração automática por IA/Antigravity.
- ✅ `homepage-card.html` e `integration-snippet.html` prontos para colar na homepage.
- ✅ `homepage-registry-patch.js` para homepage baseada em array JS.
- ✅ Prompt pronto para o Antigravity em `ANTIGRAVITY_PROMPT_PRONTO.md`.
- ✅ Mantém app 100% estático: HTML/CSS/JS puro, sem servidor.

## Como instalar no repositório

1. Copie a pasta `respirasense-icu/` para a raiz do repositório.
2. Na homepage principal, adicione o card de `homepage-card.html`.
3. Publique no GitHub Pages.
4. Teste o link:

```text
https://aldenirfilho.github.io/antigravity-consultas/respirasense-icu/index.html
```

## Arquivos principais

```text
respirasense-icu/
├── index.html
├── styles.css
├── app.js
├── pwa.js
├── sw.js
├── manifest.webmanifest
├── module.manifest.json
├── homepage-card.html
├── homepage-registry-patch.js
├── ANTIGRAVITY_PROMPT_PRONTO.md
├── README_ANTIGRAVITY_UPGRADE.md
├── HOMEPAGE_PATCH.md
├── integration-snippet.html
├── logo.svg
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

## Segurança e LGPD

- Não use nome, CPF, CNS, prontuário, endereço, telefone ou foto identificável.
- Snapshots ficam no `localStorage` do navegador.
- Exportação JSON deve ser usada apenas com dados anonimizados.
- Para uso hospitalar real: autenticação, logs, banco seguro, governança, validação clínica e avaliação regulatória.

## Próximas melhorias sugeridas

- Integração com banco de questões TEMI por tags.
- Modo “round UTI” com checklist de prescrição e metas do dia.
- Exportação em PDF/print padronizado.
- Versão React/TypeScript com roteamento modular.
- Conector para base de casos anonimizados e validação prospectiva silenciosa.
