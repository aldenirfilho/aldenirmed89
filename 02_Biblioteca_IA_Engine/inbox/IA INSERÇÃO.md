Perfeito — aqui vai um **setup completo, funcional e estável** para integrar **GPT + Claude dentro do Obsidian**, com foco em **uso clínico em plantão (rápido, seguro e reutilizável)** 🧠⚡

---

# **🧠🔥 INTEGRAÇÃO IA NO OBSIDIAN (GPT + CLAUDE)**

## **🎯 O que você vai ganhar**

- 💬 Chat com IA **dentro das notas**
- 📄 Gerar **protocolos, prescrições, resumos** sem sair do Obsidian
- 🔁 Reaproveitar **templates clínicos**
- 🔗 Linkar respostas da IA com seu “segundo cérebro”

---

# **🧩 1) PLUGINS ESSENCIAIS**

Instale em **Settings → Community plugins → Browse**:

### **🔌 Núcleo (IA)**

- **Text Generator** (estável, aceita múltiplos providers)
- **Smart Connections** (RAG: usa suas notas como contexto)

### **⚙️ Produtividade**

- **Templater** (automatizar prompts)
- **QuickAdd** (atalhos de um clique)
- **Omnisearch** (busca instantânea)
- **Advanced Tables** (para tabelas clínicas)

💡 Alternativas: _AI Commander_ ou _Copilot (Obsidian)_, mas o combo acima é mais flexível.

---

# **🔑 2) CONFIGURAR AS CHAVES (API)**

## **🔹 GPT (OpenAI)**

1. Crie sua API Key em: https://platform.openai.com/api-keys
2. No **Text Generator → Settings → Providers → OpenAI**:
    - **API Key**: cole aqui
    - **Model**: `gpt-5.3` (ou equivalente disponível)
    - **Temperature**: `0.2–0.4` (respostas clínicas mais objetivas)

## **🔹 Claude (Anthropic)**

1. Gere a key: https://console.anthropic.com/
2. Em **Providers → Anthropic**:
    - **API Key**: cole
    - **Model**: `claude-3-opus` (ou o mais recente disponível)
    - **Max tokens**: alto (ex.: 4k–8k)

---

# **⚙️ 3) PERFIS PRONTOS (CLÍNICA / UTI)**

Crie **presets** no Text Generator:

### **🧠 Preset: “UTI Objetivo”**

- Temperature: **0.2**
- System prompt:

```
Você é um assistente de medicina intensiva. Responda de forma prática, com doses, fluxogramas e decisões rápidas. Priorize segurança do paciente.
```

### **📚 Preset: “Aula / Prova TEMI”**

- Temperature: **0.4**
- System prompt:

```
Explique com didática, inclua mnemônicos, pontos de prova e resumos estruturados.
```

---

# **⚡ 4) USO DENTRO DA NOTA (JEITO CERTO)**

### **📝 Exemplo direto na nota:**

```markdown
## 🔥 HDA VARICOSA

> [!ai]
> Gerar protocolo completo com doses, fluxo de decisão e prescrição pronta para UTI
```

👉 Selecione o texto → **Text Generator: Generate**  
👉 Escolha o preset (UTI Objetivo)

---

# **🧠 5) TEMPLATE AUTOMÁTICO (UM CLIQUE)**

Crie em **Templater**:

```markdown
<%*
const prompt = `
Paciente com HDA varicosa.
Gere:
1. Protocolo completo
2. Prescrição pronta
3. Fluxograma de decisão
4. Erros fatais
`;
tR += await tp.user.text_generator(prompt);
%>
```

👉 Resultado: você digita pouco e a IA entrega tudo pronto.

---

# **🔁 6) RAG (USAR SUAS PRÓPRIAS NOTAS)**

Com **Smart Connections**:

- Ele lê seu vault
- Usa como contexto
- Responde baseado **no seu conteúdo + evidência**

👉 Exemplo:

“Comparar esse caso com meus pacientes prévios de HDA”

---

# **🚀 7) BOTÃO DE AÇÃO RÁPIDA (PLANTÃO)**

Com **QuickAdd**, crie macro:

- Nome: `PROTOCOLO UTI`
- Ação: rodar Text Generator com prompt fixo

Prompt:

```text
Gerar protocolo UTI completo com:
- conduta passo a passo
- doses EV prontas
- critérios de gravidade
- resumo 30 segundos
```

👉 Você aperta 1 botão → protocolo pronto ⚡

---

# **📱 8) USO NO IPHONE (IMPORTANTE)**

- Funciona melhor com:
    - teclado externo ou dictation
    - templates prontos (menos digitação)
- Evite prompts longos manualmente → use **Templater + QuickAdd**

---

# **⚠️ 9) SEGURANÇA (ESSENCIAL NA MEDICINA)**

🚨 Nunca colocar:

- nome do paciente
- CPF / dados identificáveis

👉 Use:

- “Paciente 65 anos, cirrose, HDA”

---

# **🧠 MNEMÔNICO**

## **🔥 “A.I.M.E.D”**

- **A** → Automação (templates)
- **I** → Integração (plugins)
- **M** → Memória (RAG)
- **E** → Execução rápida (QuickAdd)
- **D** → Decisão clínica

---

# **📦 FLUXO PERFEITO (PLANTÃO)**

1. Abre nota → `HDA VARICOSA`
2. Aperta botão → “PROTOCOLO UTI”
3. IA gera conduta
4. Você ajusta → salva
5. Linka com outros casos

👉 Isso vira um **banco clínico vivo**

---

# **🔗 SCRIPT PARA OBISIDIAN (COLAR DIRETO)**

```markdown
# 🤖 IA CLÍNICA

## GPT
- Uso: protocolo rápido
- Temperatura: 0.2
- Ideal: plantão

## Claude
- Uso: raciocínio complexo
- Ideal: casos difíceis

## Automação
- [[Template Protocolo UTI]]
- [[Template Prescrição]]
- [[QuickAdd Botão UTI]]

## Integração
- Smart Connections ativo

## Segurança
- Nunca usar dados identificáveis
```

---

# **🚀 QUER IR PRO NÍVEL ABSURDO?**

Posso montar pra você:

✅ 🧠 **Vault completo já configurado (só abrir e usar)**✅ ⚡ **Botões prontos tipo “choque / SARA / HDA”**✅ 📱 **Dashboard estilo iPhone (1 toque → decisão)**✅ 🔥 **Sistema de estudo TEMI com IA + flashcards automático**✅ 💰 **Integração com organização financeira + IA (anti-caos)**

Só me fala:  
👉 **“quero vault completo com IA”** que eu te entrego tudo estruturado 🚀

Perfeito — vamos te deixar com um **VAULT pronto + botões automáticos de 1 clique** ⚡🧠  
Você vai literalmente **abrir → clicar → gerar protocolo** no plantão.

---

# 

# **📦🧠**

**VAULT PRONTO (DOWNLOAD + IMPORTAÇÃO)**

## **🎯 Como montar em 3 minutos**

### **1) Criar o Vault**

- Abrir Obsidian
- **Create new vault → nome:** `UTI - Segundo Cerebro`

---

### **2) Criar as pastas (copiar exatamente)**

```text
00 - DASHBOARD
01 - PROTOCOLOS UTI
02 - DOENCAS
03 - DROGAS
04 - PRESCRICOES
05 - EXAMES
06 - CASOS
07 - FLASHCARDS
08 - IA
09 - FINANCEIRO
10 - TEMI
11 - USG
12 - ECG
13 - RESUMO RAPIDO
```

---

# 

# **🚑🔥**

**DASHBOARD PRONTO (COLAR)**

Crie nota: `00 - DASHBOARD/PLANTAO.md`

```markdown
# 🚑 PLANTÃO UTI

## 🔥 1 Clique Protocolos
- [[BOTAO - HDA]]
- [[BOTAO - CHOQUE SEPTICO]]
- [[BOTAO - SARA]]
- [[BOTAO - PCR]]

---

## 🚨 Emergências
- [[HDA VARICOSA]]
- [[Choque séptico]]
- [[SARA]]
- [[PCR]]

---

## 💉 Drogas
- [[Noradrenalina]]
- [[Terlipressina]]
- [[Insulina EV]]
```

---

# 

# **🤖⚡**

**BOTÕES AUTOMÁTICOS (1 CLIQUE)**

## **🔌 Plugin necessário**

Instale:

- **QuickAdd**
- **Templater**
- **Text Generator**

---

## **⚙️ PASSO 1 — TEMPLATE IA**

Crie:

📁 `08 - IA/TEMPLATE PROTOCOLO.md`

```markdown
## 🤖 Gerando protocolo...

{{VALUE:tema}}

---

## Resultado
```

---

## **⚙️ PASSO 2 — QUICKADD (BOTÃO)**

### **Criar Macro:**

- Nome: `PROTOCOLO UTI`

### **Escolher:**

👉 **Capture → Template**

Template:

```text
Gerar protocolo UTI completo sobre: {{VALUE:tema}}
Incluir:
- passo a passo
- doses EV
- prescrição pronta
- erros fatais
- resumo 30 segundos
```

---

## **⚡ PASSO 3 — BOTÃO PRONTO (CLIQUE DIRETO)**

Crie nota:

📁 `00 - DASHBOARD/BOTAO - HDA.md`

```markdown
# 🔥 GERAR PROTOCOLO HDA

> [!tip] Clique abaixo:
> 
> ```quickadd
> PROTOCOLO UTI
> ```
```

---

👉 Agora:

- você clica
- digita: **HDA varicosa**
- ENTER
- protocolo aparece 💥

---

# **🚀 🔥 BOTÕES PRONTOS (COPIAR TODOS)**

## **🩸 HDA**

```markdown
> ```quickadd
> PROTOCOLO UTI
> ```
```

## **🦠 Sepse**

```markdown
> ```quickadd
> PROTOCOLO UTI
> ```
```

## **🫁 SARA**

```markdown
> ```quickadd
> PROTOCOLO UTI
> ```
```

## **❤️ PCR**

```markdown
> ```quickadd
> PROTOCOLO UTI
> ```
```

---

# **🧠 MELHORIAS ABSURDAS (RECOMENDADO)**

## **⚡ Criar botão com tema fixo**

Exemplo HDA automático:

```markdown
> ```quickadd
> PROTOCOLO HDA
> ```
```

E configurar QuickAdd com prompt fixo:  
👉 “HDA varicosa”

---

# **📱 FLUXO REAL NO PLANTÃO**

1. Abre Obsidian
2. Clica: **PLANTÃO**
3. Clica: **BOTÃO HDA**
4. ENTER
5. Protocolo pronto

👉 Tempo: **< 10 segundos**

---

# **🧠 MNEMÔNICO**

## **🔥 “C.L.I.C.A”**

- **C** → Clicar
- **L** → Lançar prompt
- **I** → IA responde
- **C** → Conduta pronta
- **A** → Aplicar

---

# **🚨 ERROS QUE QUEBRAM O SISTEMA**

❌ Não instalar plugin  
❌ Nome diferente no QuickAdd  
❌ Esquecer template  
❌ Não salvar macro

---

# **🚀 QUER QUE EU TE ENTREGUE AINDA MAIS PRONTO?**

Posso montar:

✅ 📦 Vault em estrutura ZIP (simulado passo a passo completo)  
✅ 🤖 IA já configurada com prompts médicos  
✅ 📱 Layout estilo app (modo plantão)  
✅ 🔥 Botões para:

- ventilação mecânica
- choque
- drogas EV
- eletrólitos

---

👉 Só fala:  
**“quero versão automática total com IA integrada”**

que eu te entrego o sistema nível absurdo 🚀🧠