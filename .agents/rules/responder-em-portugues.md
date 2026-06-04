# Regra Always On: Responder em Português do Brasil e Diretrizes do Projeto Antigravity Consultas 🩺🚀

Esta regra define as diretrizes obrigatórias de comunicação, segurança e estrutura de desenvolvimento para todo agente ou subagente que operar neste workspace.

---

## 1. 🌐 Idioma e Comunicação
- **Sempre responda em Português do Brasil (PT-BR)**.
- Use linguagem clara, direta, didática e visualmente estruturada.
- **TDAH-Friendly**: Evite blocos de texto longos. Use títulos, tabelas, checklists, bullets e passos numerados para facilitar a leitura rápida.
- **Emojis para Ancoragem**: Use emojis estratégicos para guiar a atenção (ex: 🚨 crítico, ⚠️ atenção, ✅ feito, 📚 referência, 🚀 próximo passo).
- **Terminologia Médica**: Use termos em PT-BR. Se necessário, insira a correspondência em inglês entre parênteses na primeira menção.

---

## 2. 📝 Organização em Markdown
- Estruture suas respostas usando Markdown limpo e organizado.
- Destaque com **negrito** os termos clínicos e de tomada de decisão importantes.
- Sempre que houver tabelas comparativas, use-as em vez de listas longas.
- Toda resposta de encerramento de turno deve incluir uma seção **"🚀 Próximos Passos Sugeridos"** com 3 a 5 opções práticas numeradas.

---

## 3. 💾 Preservação de Arquivos e Modificações
- **Preservação de Conteúdo**: Respeite os arquivos existentes e mantenha o código atual, documentações e históricos intactos.
- **Não apague nem mova arquivos sem confirmação**: Qualquer operação destrutiva (`rm`, `mv` recursivo, alteração drástica de estrutura) exige explicação prévia detalhada dos riscos e a concordância explícita do usuário.
- **Sem refatorações preventivas**: Só altere o código se for estritamente necessário para atender à solicitação ou corrigir um bug identificado.

---

## 4. 🔒 Segurança de Dados e LGPD Médica
- **Dados Fictícios**: Nunca grave ou persista dados reais de pacientes (nomes, CPF, RG, prontuários, contatos). Sempre use mockups ou nomes como `Paciente X` ou `PACIENTE_EXEMPLO_001`.
- **Credenciais**: Jamais exponha arquivos `.env`, `.pem`, `.key` ou chaves de API. Mantenha esses arquivos no `.gitignore`.
- **Limitação de Responsabilidade**: Qualquer ferramenta médica ou calculadora clínica deve vir acompanhada do seguinte aviso obrigatório: 
  > ⚠️ *Ferramenta educacional/de apoio à decisão. Não substitui o julgamento clínico, os protocolos institucionais ou a avaliação médica individual.*

---

## 5. 📂 Padrão do Projeto Antigravity Consultas
- Centralize qualquer documento de consulta ou script nas pastas correspondentes dentro de `Antigravity_Consultas`:
  - `01_Markdown_Guias` para guias e manuais.
  - `02_Codigos_Scripts` para códigos soltos e utilitários.
  - `03_Imagens_Geradas` para fluxogramas e mockups visuais.
  - `04_Historico_Chats` para histórico de conversas catalogadas.
- Priorize interfaces **Mobile First** (especialmente com foco em uso ágil no iPhone durante plantões de UTI e enfermaria).
- Siga as regras específicas de calculadora clínica referenciando diretrizes oficiais (ARDSnet, Surviving Sepsis, AMIB, etc.) quando aplicável.
