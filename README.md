# 🧙‍♂️🚀 AldenirMed89 — Enciclopédia Médica Intensiva

> Plataforma médica educacional, interativa e **continuamente alimentada**, focada em **Medicina Intensiva**, **Clínica Médica avançada**, **emergência**, **enfermaria**, **POCUS** e **preparação para provas de título (TEMI/AMIB e R3)**.

🌐 **Site público:** https://aldenirfilho.github.io/aldenirmed89/
👤 **Autoria/curadoria médica:** Dr. Aldenir Rocha — CRM-CE 16587 · RQE Clínica Médica 11846 · Mestre em Ciências da Saúde (UFC)

## ♿ Acesso rápido e manutenção

- [🍎 Instalar no Mac pelo Safari, sem bloqueio do Gatekeeper](docs_usuario/ACESSO_DOCK_MAC/)
- [🪟 Baixar o acesso rápido para Windows](downloads/Antigravity-Consultas-Windows.zip)
- [📘 Instalar no Windows sem privilégios administrativos](docs_usuario/ACESSO_WINDOWS/)
- [📱 Baixar os ícones para iPhone](downloads/Antigravity-Consultas-iPhone-Icones.zip)
- [📘 Adicionar o AldenirMed89 à Tela de Início do iPhone](docs_usuario/ACESSO_IPHONE/)
- [🧭 Alimentar cada seção e bloco do site, passo a passo](docs_usuario/ALIMENTAR_CONTEUDO_SITE/)
- [🔄 Alimentar Feed, Biblioteca, módulos e apps com segurança](docs_usuario/OPERACAO_CONTINUA/)
- [📚 Abrir a central HTML de guias](docs_usuario/)
- [🩸 Abrir Hematologia Crítica](01_Modulos_Clinicos/Hematologia_Critica/index.html)
- [🧬 Abrir Reumatologia Crítica](01_Modulos_Clinicos/Reumatologia_Critica/index.html)
- [🧠 Abrir Delirium na UTI e Enfermaria](01_Modulos_Clinicos/Delirium_UTI/index.html)
- [🧪 Log consolidado da homologação do Delirium](docs_usuario/HOMOLOGACAO_DELIRIUM_UTI_2026-07-25.md)

O controle **☀️ Visualização clara** ativa a **Visualização Clara**: fundo branco real, tipografia
azul-marinho de alto contraste e acentos aeroespaciais preservados. Ela funciona
na página inicial, no modo offline, na página 404 e nos **16 módulos acessíveis
pela Home**: **UpDown Hub**, **Biblioteca IA**, **Calculadoras UTI**,
**RespiraSense ICU**, **RespiraCrit**, **Simulador TEMI**, **Card Feed Médico**,
**Ebooks**, **Questões Comentadas**, **Transcrições**, **POCUS**, **RenalDose**,
**SAPS 3**, **Hematologia Crítica**, **Reumatologia Crítica** e **Delirium
UTI/Enfermaria**. As três PWAs
instaláveis — **AldenirMed89**, **Card Feed Médico** e **RespiraSense ICU** — e os
atalhos de Mac, Windows e iPhone que abrem a plataforma também recebem a
preferência. A impressão e a exportação para PDF usam uma folha branca
otimizada.

Nos aplicativos destacados pela página inicial e pelo Hub de Apps, o mesmo
estado global acompanha **RespiraCrit**, **Vasoativas**, **RenalDose**,
**SAPS 3**, **Vasculites Decision**, o **Hub de Calculadoras** e as calculadoras
de **sódio/disnatremia** e **bicarbonato/albumina**. Gráficos e curvas são
redesenhados com cores próprias para o fundo branco; fórmulas, regras clínicas
e dados permanecem inalterados. Documentos, imagens e arquivos para download
mantêm sua aparência e resolução nativas.

O painel **♿** reúne o mesmo controle, texto ampliado, alto contraste, redução
de movimento, instalação PWA e os pacotes de acesso rápido. As preferências
ficam somente no navegador, sem conta, nuvem ou telemetria, e podem variar
entre aparelhos ou perfis.

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

O projeto é **estático puro** (HTML/CSS/JS), publicado no GitHub Pages. Não exige
Node no navegador; o CI usa scripts Python para gerar catálogos, validar e montar
um artefato público por allowlist.

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
| `03_Calculadoras_UTI/` | Hub de calculadoras de plantão | ✅ |
| `03_Calculadoras_E_Apps/` | Alias legado para calculadoras | ✅ |
| `04_Ebooks_Intensiva_Clinica/` | Ebooks, manuais e guias longos de Terapia Intensiva e Clínica Médica Interna | ✅ |
| `05_Midia_E_Feed/` | Feed de cards visuais (PWA, service worker) | ✅ |
| `07_Questoes_Comentadas/` | Questões comentadas, simulados, casos clínicos, OSCE, CSV e Anki | ✅ |
| `08_Transcricoes/` | Transcrições de aulas, vídeos, podcasts, reuniões e discussões clínicas | ✅ |
| `09_POCUS_Hub/` | POCUS/USG beira-leito: aulas, vídeos, artigos, imagens, modelos, dicas e links | ✅ |
| `01_Modulos_Clinicos/` | Módulos clínicos em HTML, incluindo **Hematologia Crítica**, **Reumatologia Crítica** e **Delirium UTI/Enfermaria** (emergências, diagnóstico difícil, scores e Turbo TEMI) | ✅ |
| `questoes/` | Banco de questões TEMI/R3 — rota canônica | ✅ |
| `02_Banco_Questoes_TEMI/` | Alias legado com redirect para `questoes/` | ✅ |
| `les-autoanticorpos/` | Módulo LES — autoanticorpos | ✅ |
| `apps/` · `biblioteca/` · `updown/` | Wrappers de rota amigável/legado (redirects) | ✅ |
| `imagens/` | Galeria visual / infográficos | ✅ |
| — | — | — |
| `00_INBOX_ATUALIZACAO/` | **Bastidor**: entradas de IA, rascunhos, kits | 🔒 NÃO |
| `99_ARQUIVO_HISTORICO/` | Backups e histórico | 🔒 NÃO (gitignored) |
| `_SUPORTE_PROJETO/` · `docs_projeto/` | Documentação interna | 🔒 NÃO |
| `scripts_admin/` | Scripts utilitários (sync, validação) | 🔒 NÃO |
| `ANTIGRAVITY_INSTRUCTIONS.md` | **Manual operacional único do agente** | 🔒 NÃO |

### Alimentação contínua dos novos diretórios

Cada hub usa `inbox/` como **staging local privado e ignorado pelo Git**. Depois
dos gates de LGPD, licença e revisão clínica, copie somente a versão aprovada para
`public/`. A pasta `links/` recebe links externos revisados. Em seguida, rode o
scanner do próprio diretório para atualizar `data/catalogo.json`.

Formatos aceitos: PDF, EPUB/MOBI/AZW3, DOC/DOCX/RTF/Pages, XLS/XLSX/Numbers, CSV/TSV, MD/Markdown, PPT/PPTX/Keynote, TXT/SRT/VTT, HTML/HTM, APKG/Anki, imagens, vídeos, áudios e compactados.

```bash
for d in 04_Ebooks_Intensiva_Clinica 07_Questoes_Comentadas 08_Transcricoes 09_POCUS_Hub; do
  (cd "$d" && bash scan_inbox.sh)
done
```

> O nome `scan_inbox.sh` foi preservado por compatibilidade, mas o scanner atual
> lê somente `public/`. Consulte o
> [`Guia de inserção segura`](08_Documentacao_Projeto/GUIA_INSERCAO_SEGURA_DOCUMENTOS.md)
> antes de adicionar qualquer documento.

---

## 🛡️ Regras de segurança INVIOLÁVEIS

1. **Nunca expor dados de pacientes.** Todo conteúdo é anonimizado.
2. **Nunca versionar/publicar bastidores** — `inbox/`, prompts internos,
   instruções do agente e pastas `_private/`. O workflow e o portão bloqueiam
   esses arquivos no artefato público.
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
