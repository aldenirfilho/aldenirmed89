# 🏥 Enciclopédia Médica Intensiva & Medicina Interna

> Plataforma médica educacional, interativa e **continuamente alimentada**, focada em **Medicina Intensiva**, **Clínica Médica avançada**, **emergência**, **enfermaria**, **POCUS** e **preparação para provas de título (TEMI/AMIB e R3)**.

🌐 **Site público:** https://aldenirfilho.github.io/antigravity-consultas/
👤 **Autoria/curadoria médica:** Dr. Aldenir Rocha — CRM-CE 16587 · RQE Clínica Médica 11846 · Mestre em Ciências da Saúde (UFC)

---

## 🎯 O que é este projeto

Um **acervo clínico vivo** que transforma material bruto (artigos, diretrizes, PDFs, DOCX, aulas, análises de IA) em **páginas didáticas, originais e seguras para publicação**, conectadas entre si por raciocínio clínico — não em capítulos isolados, mas em uma **rede de decisões**.

Serve a **três públicos** ao mesmo tempo:

| Público | Uso |
|---|---|
| 🩺 **O autor (plantão/UTI)** | Consulta rápida à beira-leito, condutas, doses, checklists |
| 🎓 **Estudantes e residentes** | Estudo estruturado, flashcards, questões TEMI/R3, mnemônicos |
| 🌍 **Comunidade médica** | Fonte de pesquisa aberta com potencial de monetização futura |

### Princípios editoriais
- **Prático** — feito para decisão real (prescrição, diferencial, fluxo de emergência).
- **Didático** — tabelas, algoritmos, flashcards, checklists, mnemônicos, questões comentadas.
- **TDAH-friendly** — blocos curtos, leitura visual, hierarquia clara, recuperação rápida.
- **Original e seguro** — sem cópia literal de fonte protegida; reescrita autoral.
- **Atualizável** — estrutura preparada para receber conteúdo de forma contínua.

---

## 🧱 Arquitetura real (modelo de 2 camadas)

O projeto é **estático puro** (HTML/CSS/JS), publicado no GitHub Pages. Não exige Node nem build obrigatório.

```
┌──────────────────────────────────────────────────────────────┐
│  CAMADA 1 — FONTE CANÔNICA (Markdown-first)                    │
│  Conteúdo clínico em .md com frontmatter YAML.                 │
│  É a "verdade" de cada tema. Vive em 01_UpDown_Hub/.           │
└──────────────────────────────────────────────────────────────┘
                          │  (revisão médica obrigatória)
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  CAMADA 2 — SITE ESTÁTICO PÚBLICO                              │
│  HTML/CSS/JS + apps interativos + dashboards + calculadoras.   │
│  Montado e publicado pelo workflow .github/workflows/.         │
└──────────────────────────────────────────────────────────────┘
```

> ⚠️ **O deploy é montado a partir da RAIZ do repositório** por
> `.github/workflows/deploy-seguro.yml`, que copia uma *allowlist* de pastas
> públicas para uma pasta temporária `site/` e a publica. A pasta `site/` **não
> deve ser versionada** (é regenerada a cada push).

### Fluxo de produção (pipeline oficial)

```
Material bruto (PDF/DOCX/aula/IA)
      └─▶ Biblioteca IA Engine        ← acervo indexado
            └─▶ Prompt UpDown          ← transformação autoral
                  └─▶ .md canônico     ← fonte da verdade
                        └─▶ REVISÃO MÉDICA (obrigatória)  🛡️
                              └─▶ HTML público + apps + cards
                                    └─▶ linkagem no hub + Mapa Vivo
```

---

## 🗂️ Mapa de pastas (o que é cada coisa)

| Pasta | Função | Público? |
|---|---|---|
| `index.html` | Homepage / central de comando | ✅ |
| `06_Infra_Site_E_Assets/` | **CSS, JS e data da homepage** (home-landing.*) | ✅ (assets) |
| `assets/` · `css/` · `js/` | Assets globais compartilhados | ✅ (assets) |
| `data/` | Manifests que dirigem o site: `connections.json` (Mapa Vivo D3), `topics.json`, `route_aliases.json`, `site_manifest.json` | ✅ (dados) |
| `01_UpDown_Hub/` | **UpDown Hub** — conteúdo .md canônico + leitores | ✅ |
| `02_Biblioteca_IA_Engine/` | Acervo de documentos (PDF/DOCX) com busca | ✅ |
| `03_Calculadoras_E_Apps/` | Hub de calculadoras de plantão | ✅ |
| `05_Midia_E_Feed/` | Feed de cards visuais (PWA, service worker) | ✅ |
| `01_Modulos_Clinicos/` | Módulos clínicos em HTML (legados/originais) | ✅ |
| `02_Banco_Questoes_TEMI/` | Banco de questões TEMI/R3 (motor) | ✅ |
| `questoes/` | Wrapper público de questões (redireciona p/ banco TEMI) | ✅ |
| `les-autoanticorpos/` | Módulo LES — autoanticorpos | ✅ |
| `apps/` · `biblioteca/` · `updown/` | Wrappers de rota amigável/legado (redirects) | ✅ |
| `imagens/` | Galeria visual / infográficos | ✅ |
| — | — | — |
| `00_INBOX_ATUALIZACAO/` | **Bastidor**: entradas de IA, rascunhos, kits | 🔒 NÃO |
| `99_ARQUIVO_HISTORICO/` | Backups e histórico | 🔒 NÃO (gitignored) |
| `_SUPORTE_PROJETO/` · `docs_projeto/` | Documentação interna | 🔒 NÃO |
| `scripts_admin/` | Scripts utilitários (sync, validação) | 🔒 NÃO |
| `ANTIGRAVITY_INSTRUCTIONS.md` | **Manual operacional único do agente** | 🔒 NÃO |

---

## 🛡️ Regras de segurança INVIOLÁVEIS

1. **Nunca expor dados de pacientes.** Todo conteúdo é anonimizado.
2. **Nunca publicar bastidores** — prompts internos, instruções do agente, pastas `_private/`. O workflow já remove esses arquivos do artefato público.
3. **Nunca apagar/mover** PDF, DOCX, MD, HTML, PNG, JSON ou ZIP sem autorização explícita do autor.
4. **Nenhum HTML clínico vai ao ar sem revisão médica** do Dr. Aldenir.
5. **Apoio cognitivo, não prescrição.** Toda dose/diluição exige checagem dupla no protocolo institucional local.
6. **Sem cópia literal** de fonte protegida por direitos autorais — reescrita autoral sempre.

---

## 🤖 Para o agente Antigravity / Gemini

Antes de qualquer alteração no repositório, **leia `ANTIGRAVITY_INSTRUCTIONS.md`** (manual operacional único, com o plano de manutenção em etapas, portões de autorização e regras de segurança). Esse arquivo substitui e consolida os antigos `ANTIGRAVITY_AUDIT_MAP.md` e `ANTIGRAVITY_TASK_QUEUE.md`.

---

## 📜 Licença e aviso

Conteúdo educacional autoral. **Não substitui julgamento clínico individual.** Os autores não se responsabilizam por eventos adversos decorrentes do uso. Diretrizes de referência: AMIB, Surviving Sepsis Campaign, AHA/ASA, EULAR/ACR, ADA (sempre verificar a versão vigente).
