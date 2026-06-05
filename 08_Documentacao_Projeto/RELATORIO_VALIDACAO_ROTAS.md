# 🚦 Relatório de Validação de Rotas e Manifests

**Data da Auditoria:** 2026-06-04  
**Raiz do Repositório:** `/Users/aldenirfilho/Library/Mobile Documents/iCloud~md~obsidian/Documents/Comando Central/Antigravity_Consultas`  

## 1. Resumo Geral

| Métrica | Total |
| :--- | :--- |
| Rotas / Fontes Auditadas | 52 |
| ✅ Links Íntegros | 52 |
| 🚨 Links Quebrados (404) | 0 |

## 🎉 2. Status de Integridade

### ✅ Todas as rotas e destinos canônicos mapeados estão presentes no disco local! Nenhuma falha estrutural de 404 foi identificada.

## 📂 3. Inventário Completo de Rotas Auditadas

| Elemento Mapeado | Caminho Físico no Repositório | Status no Disco |
| :--- | :--- | :--- |
| Hub: home | `index.html` | ✅ OK |
| Hub: updown | `01_UpDown_Hub/index.html` | ✅ OK |
| Hub: biblioteca | `02_Biblioteca_IA_Engine/index.html` | ✅ OK |
| Hub: imagens | `05_Midia_E_Feed/index.html` | ✅ OK |
| Hub: apps | `03_Calculadoras_E_Apps/index.html` | ✅ OK |
| Hub: mapa | `data/connections.json` | ✅ OK |
| Hub: questoes | `02_Banco_Questoes_TEMI/index.html` | ✅ OK |
| Rota Canônica: home | `index.html` | ✅ OK |
| Rota Canônica: updown | `01_UpDown_Hub/index.html` | ✅ OK |
| Rota Canônica: biblioteca | `02_Biblioteca_IA_Engine/index.html` | ✅ OK |
| Rota Canônica: calculadoras | `03_Calculadoras_E_Apps/index.html` | ✅ OK |
| Rota Canônica: feed | `05_Midia_E_Feed/index.html` | ✅ OK |
| Rota Canônica: questoes_temi | `02_Banco_Questoes_TEMI/index.html` | ✅ OK |
| Rota Canônica: ebooks | `04_Ebooks_Intensiva_Clinica/index.html` | ✅ OK |
| Rota Canônica: questoes_comentadas | `07_Questoes_Comentadas/index.html` | ✅ OK |
| Rota Canônica: transcricoes | `08_Transcricoes/index.html` | ✅ OK |
| Rota Canônica: pocus | `09_POCUS_Hub/index.html` | ✅ OK |
| Rota Canônica: respirasense | `01_Modulos_Clinicos/Ventilacao_Mecanica/respirasense/index.html` | ✅ OK |
| Rota Canônica: respiracrit | `01_Modulos_Clinicos/Ventilacao_Mecanica/respiracrit.html` | ✅ OK |
| Rota Canônica: mapa | `data/connections.json` | ✅ OK |
| Legada (destino): 07_Estudos_Markdown/index.html -> 01_UpDown_Hub/index.html | `01_UpDown_Hub/index.html` | ✅ OK |
| Legada (destino): 05_Biblioteca_IA/index.html -> 02_Biblioteca_IA_Engine/index.html | `02_Biblioteca_IA_Engine/index.html` | ✅ OK |
| Legada (destino): 03_Calculadoras_UTI/index.html -> 03_Calculadoras_E_Apps/index.html | `03_Calculadoras_E_Apps/index.html` | ✅ OK |
| Legada (destino): 06_Card_Feed_Medico/index.html -> 05_Midia_E_Feed/index.html | `05_Midia_E_Feed/index.html` | ✅ OK |
| Fonte de Dados: updownRegistry | `01_UpDown_Hub/registry.json` | ✅ OK |
| Fonte de Dados: bibliotecaManifest | `02_Biblioteca_IA_Engine/data/biblioteca_documentos_manifest.json` | ✅ OK |
| Fonte de Dados: feedCards | `05_Midia_E_Feed/data/cards.json` | ✅ OK |
| Fonte de Dados: homeManifest | `06_Infra_Site_E_Assets/data/home-manifest.json` | ✅ OK |
| Módulo: UpDown Hub | `01_UpDown_Hub/index.html` | ✅ OK |
| Módulo: Biblioteca IA | `02_Biblioteca_IA_Engine/index.html` | ✅ OK |
| Módulo: Calculadoras UTI | `03_Calculadoras_E_Apps/index.html` | ✅ OK |
| Módulo: Card Feed Médico | `05_Midia_E_Feed/index.html` | ✅ OK |
| Módulo: Banco TEMI | `02_Banco_Questoes_TEMI/index.html` | ✅ OK |
| Módulo: Ebooks Intensiva & Clínica | `04_Ebooks_Intensiva_Clinica/index.html` | ✅ OK |
| Módulo: Questões Comentadas | `07_Questoes_Comentadas/index.html` | ✅ OK |
| Módulo: Transcrições | `08_Transcricoes/index.html` | ✅ OK |
| Módulo: POCUS Hub | `09_POCUS_Hub/index.html` | ✅ OK |
| Módulo: RespiraSense ICU | `01_Modulos_Clinicos/Ventilacao_Mecanica/respirasense/index.html` | ✅ OK |
| Módulo: RespiraCrit | `01_Modulos_Clinicos/Ventilacao_Mecanica/respiracrit.html` | ✅ OK |
| Alias 'index.html' (Home publica principal.) | `index.html` | ✅ OK |
| Alias 'updown/index.html' (Wrapper legado redireciona para o Hub UpDown canonico.) | `01_UpDown_Hub/index.html` | ✅ OK |
| Alias 'biblioteca/index.html' (Wrapper publico da Biblioteca IA Engine.) | `02_Biblioteca_IA_Engine/index.html` | ✅ OK |
| Alias 'questoes/index.html' (Wrapper de questoes aponta para Banco TEMI (corrigido do antigo UpDown).) | `02_Banco_Questoes_TEMI/index.html` | ✅ OK |
| Alias 'imagens/index.html' (Galeria visual publica ativa; rota propria.) | `imagens/index.html` | ✅ OK |
| Alias 'apps/index.html' (Hub publico de apps ativo; rota propria.) | `apps/index.html` | ✅ OK |
| Alias 'calculadoras/index.html' (Rota amigavel para calculadoras -> destino canonico novo.) | `03_Calculadoras_E_Apps/index.html` | ✅ OK |
| Alias 'card-feed/index.html' (Rota amigavel para Card Feed -> destino canonico novo.) | `05_Midia_E_Feed/index.html` | ✅ OK |
| Alias 'mapa' (JSON canonico do Mapa Vivo.) | `data/connections.json` | ✅ OK |
| Alias '07_Estudos_Markdown/index.html' (Pasta legada redireciona para UpDown Hub canonico.) | `01_UpDown_Hub/index.html` | ✅ OK |
| Alias '05_Biblioteca_IA/index.html' (Pasta legada redireciona para Biblioteca IA Engine canonica.) | `02_Biblioteca_IA_Engine/index.html` | ✅ OK |
| Alias '03_Calculadoras_UTI/index.html' (Pasta legada redireciona para Calculadoras E Apps canonico.) | `03_Calculadoras_E_Apps/index.html` | ✅ OK |
| Alias '06_Card_Feed_Medico/index.html' (Pasta legada redireciona para Midia E Feed canonico.) | `05_Midia_E_Feed/index.html` | ✅ OK |
