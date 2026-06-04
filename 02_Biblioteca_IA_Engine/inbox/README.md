# 📦 Antigravity Config Pack — Dr. Aldenir Rocha
**CRM-CE 16587 | Intensivista | Sobral/CE | Maio 2026**

---

## 🚀 INSTALAÇÃO EM 3 PASSOS

### Passo 1 — Copiar rules e workflows globais
```bash
# No terminal do Antigravity, a partir da pasta raiz do pacote:
cp -r .agent ~/Documents/Antigravity-Workspaces/.agent
```

### Passo 2 — Copiar projetos
```bash
cp -r projetos/ ~/Documents/Antigravity-Workspaces/
```

### Passo 3 — Abrir no Antigravity
```
Antigravity → Open Folder → ~/Documents/Antigravity-Workspaces/
```

---

## 📁 ESTRUTURA DO PACOTE

```
antigravity-dr-aldenir/
│
├── 📂 .agent/                          ← CONFIGURAÇÕES GLOBAIS
│   ├── 📂 rules/
│   │   ├── 00-identidade-global.md     ← Quem é o Dr. Aldenir + TDAH
│   │   ├── 01-seguranca-global.md      ← LGPD + CFM + privacidade
│   │   └── 02-qualidade-codigo-global.md ← Padrões Python/TS/JS
│   │
│   ├── 📂 workflows/                   ← COMANDOS /nome NO CHAT
│   │   ├── revisao-clinica.md          ← /revisao-clinica
│   │   ├── teste-temi.md               ← /teste-temi [tema]
│   │   ├── plantao-resumo.md           ← /plantao-resumo
│   │   ├── commit-medico.md            ← /commit-medico
│   │   ├── organiza-pasta.md           ← /organiza-pasta
│   │   ├── nova-calculadora.md         ← /nova-calculadora [nome]
│   │   ├── maratona-temi.md            ← /maratona-temi [tema] [N]
│   │   └── alerta-golpe.md             ← /alerta-golpe [texto]
│   │
│   └── 📂 skills/
│       └── calculo-clinico/
│           └── SKILL.md                ← Fórmulas UTI (carregado sob demanda)
│
└── 📂 projetos/                        ← WORKSPACES DE PROJETO
    ├── 📂 RespiraCrit/
    │   └── .agent/rules/respiracrit.md ← Stack, módulos, UI, segurança
    ├── 📂 TEMI-Prep/
    │   └── .agent/rules/temi-prep.md   ← Blueprint, formato JSON, referências
    ├── 📂 Plantao-Tools/
    │   └── .agent/rules/plantao-tools.md ← Anonimização, estrutura de arquivos
    └── 📂 Financeiro/
        └── .agent/rules/financeiro.md  ← Alta segurança, detector de golpes
```

---

## ⚡ WORKFLOWS — REFERÊNCIA RÁPIDA

| Comando | O que faz | Quando usar |
|---------|-----------|-------------|
| `/revisao-clinica` | Audita código: fórmulas, LGPD, disclaimer, UX | Antes de todo commit médico |
| `/teste-temi [tema]` | Gera questão estilo AMIB com gabarito | Durante estudo TEMI |
| `/maratona-temi [tema] [N]` | Sessão de N questões com score ao vivo | Simulado intensivo |
| `/plantao-resumo` | Converte notas em tabela estruturada | Após cada plantão |
| `/commit-medico` | Verifica segurança + gera mensagem de commit | Antes de todo git commit |
| `/organiza-pasta` | Mapeia e propõe reorganização (só leitura primeiro) | Organização de arquivos |
| `/nova-calculadora [nome]` | Scaffold completo de calculadora clínica | Novo módulo RespiraCrit |
| `/alerta-golpe [texto]` | Analisa proposta financeira em busca de golpes | Qualquer proposta recebida |

---

## 🛡️ REGRAS GLOBAIS ATIVAS (sempre)

| Arquivo | O que controla |
|---------|---------------|
| `00-identidade-global.md` | Perfil TDAH, idioma PT-BR, formato de resposta |
| `01-seguranca-global.md` | LGPD, CFM, .gitignore, browser allow list |
| `02-qualidade-codigo-global.md` | Python type hints, TS estrito, testes obrigatórios |

---

## 🧠 LEMBRETE TDAH — COMO USAR

1. **Abra o projeto** certo no Explorer (cada projeto tem suas próprias rules)
2. **Use Planning Mode** para qualquer tarefa com > 2 arquivos
3. **Leia o Plan Artifact** antes de aprovar — corrija ali, não no código
4. **Execute `/revisao-clinica`** antes de qualquer commit médico
5. **Execute `/commit-medico`** em vez de commitar manualmente
6. **Use `/alerta-golpe`** SEMPRE que receber proposta financeira, mesmo de conhecidos

---

## 📞 Contato de Referência

**Dr. Aldenir Rocha**
CRM-CE 16587 | RQE Clínica Médica 11846
Hospital Regional Norte & Santa Casa de Misericórdia — Sobral/CE
Mestre em Ciências da Saúde — UFC

---
*Pacote gerado com Claude (Anthropic) — Maio 2026*
*Ferramenta de apoio educacional e produtividade — não substitui julgamento clínico*
