# 🚀 COMANDO ANTIGRAVITY — Integrar Mini-plataforma Vasculites Decision v2.0

Você está no repositório GitHub Pages:

`aldenirfilho/antigravity-consultas`

## 🎯 Objetivo
Integrar a mini-plataforma **Vasculites Decision** como ferramenta prática de plantão, com páginas separadas para:

- AAV — GPA/MPA/EGPA
- PAN
- GCA/Takayasu
- Crioglobulinemia
- Simulador terapêutico: “qual droga escolher neste caso?”

## 🛡️ Regras críticas
1. **Não apagar** arquivos existentes.
2. **Não mover** rotas antigas sem redirect.
3. Fazer backup lógico antes de alterar `index.html`, `site-index.json`, `data/catalogo.json` ou equivalentes.
4. Validar links relativos após copiar.
5. Manter compatibilidade com GitHub Pages estático.
6. Não inserir dados de pacientes.

## 📥 Entrada sugerida
Copie a pasta inteira:

`mini_plataforma_vasculites_antigravity/`

para:

`00_INBOX_ATUALIZACAO/04_Novos_Projetos/vasculites-decision/`

## 🏛️ Integração final no CORE
Criar pasta canônica:

`03_Calculadoras_E_Apps/vasculites-decision/`

Copiar para dentro dela:

- `index.html`
- `pages/`
- `assets/`
- `data/`
- `README.md`
- `site-index.patch.json`

## 🧩 Comandos de terminal sugeridos

```bash
mkdir -p 00_INBOX_ATUALIZACAO/04_Novos_Projetos/vasculites-decision
cp -R mini_plataforma_vasculites_antigravity/* 00_INBOX_ATUALIZACAO/04_Novos_Projetos/vasculites-decision/

mkdir -p 03_Calculadoras_E_Apps/vasculites-decision
cp -R 00_INBOX_ATUALIZACAO/04_Novos_Projetos/vasculites-decision/* 03_Calculadoras_E_Apps/vasculites-decision/
```

## 🌐 Rota pública esperada

`https://aldenirfilho.github.io/antigravity-consultas/03_Calculadoras_E_Apps/vasculites-decision/`

## 🧠 Atualizar hub global
Adicionar um card no `site-index.json`, `data/catalogo.json` ou arquivo equivalente:

```json
{
  "id": "vasculites-decision-platform",
  "title": "Vasculites Decision",
  "icon": "🧬",
  "theme": "reumatologia-medicina-interna-uti",
  "summary": "Mini-plataforma prática para decisão diagnóstica e terapêutica em vasculites.",
  "tags": ["vasculites", "PAN", "AAV", "GCA", "Takayasu", "crioglobulinemia", "plantão"],
  "path": "03_Calculadoras_E_Apps/vasculites-decision/index.html",
  "version": "2.0"
}
```

## ✅ Testes obrigatórios
1. Abrir `03_Calculadoras_E_Apps/vasculites-decision/index.html` localmente.
2. Testar links:
   - `pages/simulador.html`
   - `pages/aav.html`
   - `pages/pan.html`
   - `pages/gca-takayasu.html`
   - `pages/crioglobulinemia.html`
3. Testar tema claro/escuro.
4. Testar impressão/PDF.
5. Testar simulador com os casos rápidos.
6. Rodar verificação de links relativos.
7. Fazer commit e deploy.

## 🧾 Relatório pós-execução
Criar/atualizar:

`07_Documentacao_Estudos/RELATORIO_INTEGRACAO_VASCULITES_DECISION.md`

Incluindo:

- arquivos copiados;
- rotas criadas;
- cards adicionados;
- testes realizados;
- links quebrados corrigidos;
- pendências clínicas/técnicas.
