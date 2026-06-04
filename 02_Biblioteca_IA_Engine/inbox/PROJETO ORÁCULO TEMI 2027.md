
Este é um projeto de altíssima complexidade. Não se trata apenas de "estudar", mas de **construir uma máquina de aprendizado e performance para a prova mais temida da Medicina Intensiva**.

A chave para o TEMI é a **integração entre Teoria (prova escrita) e Prática (estações simuladas)**. O sistema abaixo foi desenhado para um residente ou intensivista em rotina pesada, com um método que funciona **mesmo em dias com apenas 15 minutos disponíveis**.

Chamaremos este projeto de: **PROJETO ORÁCULO TEMI 2027**.

---

### PARTE 1: A ESTRUTURA FÍSICA DE PASTAS (O REPOSITÓRIO)

Crie este diretório raiz no seu computador e no **OneDrive / Google Drive** (backup automático).

```text
📁 PROJETO_ORACULO_TEMI_2027
│
├── 📁 01_PAINEL_DE_CONTROLE
│   ├── 📄 Cronograma_Mestre_TEMI_2027.xlsx          (Coração do Projeto - Linkado com todas as abas)
│   ├── 📄 Sistema_Revisao_Espacada_Anki.xlsx        (Controle de revisões 24h/7d/30d)
│   └── 📄 Log_Desempenho_Simulados.docx
│
├── 📁 02_ACERVO_TEMATICO (Conteúdo Estático)
│   ├── 📁 A_CARDIO_INTENSIVISMO
│   │   ├── 📁 ECG_Desafio (Apenas arquivos .png)
│   │   ├── 📁 VM_Cardiogenico (PDFs, algoritmos)
│   │   ├── 📁 USG_POCUS_Coração (Imagens destacadas .png / links YouTube)
│   │   └── 📁 Artigos_Uptodate_NEJM (PDFs salvos)
│   ├── 📁 B_VENTILACAO_MECANICA
│   │   ├── 📁 Curvas_Ventilador (Imagens interpretação)
│   │   ├── 📁 Modos_Ventilatorios (Resumos 1 pág .docx)
│   │   └── 📁 Asincronias (Vídeos/Gifs)
│   ├── 📁 C_USG_BEIRA_LEITO_POCUS
│   │   ├── 📁 E-FAST
│   │   ├── 📁 PULMAO (Perfil A/B/C)
│   │   ├── 📁 VCI_E_VOLUME
│   │   └── 📁 DIAFRAGMA
│   ├── 📁 D_NEFRO_INTENSIVA
│   ├── 📁 E_INFECTO_CHOQUE
│   ├── 📁 F_NEUROINTENSIVISMO
│   └── 📁 G_NUTRICAO_MISC
│
├── 📁 03_ESTOQUE_DE_QUESTOES (Ataque Ativo)
│   ├── 📁 Banco_TEMI_Anteriores (Provas 2017-2026 em PDF)
│   ├── 📁 AMIB_Questoes_Comentadas (Print screens organizados)
│   ├── 📁 Erros_Classicos (Cards de memorização - "NÃO CONFUNDA...")
│   └── 📁 Simulados_Semanais (Arquivos .docx com gabarito comentado próprio)
│
├── 📁 04_INTELIGENCIA_ARTIFICIAL (Assistentes)
│   ├── 📁 GPT_4o (Respostas salvas em .docx)
│   ├── 📁 Claude_3.5_Sonnet (Explicações de fisiologia complexa)
│   ├── 📁 Grok_DeepSearch (Pesquisas no PubMed/X.com)
│   └── 📁 Qwen_LongDoc (Resumos de Guidelines extensas)
│
├── 📁 05_PLANO_ACAO_PRATICA (ESTACOES)
│   ├── 📁 Roteiros_Voice_Over (Scripts para treinar fala - "Paciente com...")
│   ├── 📁 Checklists_AMIB (Avaliação das estações)
│   ├── 📁 Simulacao_Boneco (Fotos da passagem de cateter/VM)
│   └── 📁 Prescricoes_Modelo (Evoluções prontas para cópia na prova prática)
│
├── 📁 06_DEPOSITO_DIARIO (O Ponto de Mutação)
│   ├── 📄 DUVIDAS_DO_DIA.docx (Alimentação Contínua)
│   ├── 📁 Evolucoes_Reais_Plantao (Anonimizadas - Padrões de prescrição)
│   ├── 📁 ECG_Do_Dia.png
│   └── 📁 USG_Do_Dia.mp4
│
└── 📁 07_SISTEMA_DE_REVISAO_RAPIDA
    ├── 📁 Cards_Memorizadores (.png com fontes grandes)
    ├── 📁 Algoritmos_Mentais (.pdf fluxograma)
    └── 📁 Top_10_Atualizacoes_2026 (O que mudou no Surviving Sepsis, etc.)
```

---

### PARTE 2: O PAINEL DE CONTROLE (CRONOGRAMA_MESTRE_TEMI_2027.xlsx)

Este arquivo Excel não é uma planilha; é um **motor de busca e repetição**. Crie as seguintes abas (guias):

| **Aba no Excel** | **Função Estratégica** |
| :--- | :--- |
| **1. VISÃO 30.000 PÉS** | Macro-temas por Mês (Ex: Fev-Março = Cardio/VM; Abril = USG/Sepse). |
| **2. METAS SEMANAIS** | **Item mais importante**. Define o foco da semana (Ex: Semana 12: Asma Grave + Curva de Fluxo + Modo VCV vs PCV). |
| **3. RASTREADOR DIÁRIO** | Checklist clicável: Li 1 Uptodate? Fiz 10 Questões? Fiz 5 min de USG? Revisei os Erros de ontem? |
| **4. REPETIÇÃO ESPAÇADA** | Aqui você cola links para os arquivos da pasta `02_ACERVO`. A fórmula calcula quando você deve REVER aquele PDF. |
| **5. GLOSSÁRIO DE ERROS** | Coluna A: "Erro Grosseiro" (Ex: Dobutamina na Estenose Aórtica Grave). Coluna B: "Por que?" (1 linha só). |

---

### PARTE 3: A ROTINA DIÁRIA MODULAR (O MÉTODO 15/45/90)

A maior falha nos cronogramas de estudo é achar que todo dia é igual. Com plantão, não é. Use o **Método das Camadas**:

| Camada | Tempo Disp. | Atividade | Local de Salvamento |
| :--- | :--- | :--- | :--- |
| **CAMADA 1: SOBREVIVÊNCIA** | **15 min** | **"Snippet do Dia"** : Abrir a pasta `07_SISTEMA_DE_REVISAO_RAPIDA`. Ver **3 Cards PNG** e **1 ECG**. | Pasta `06_DEPOSITO_DIARIO` (Salvar ECG do dia). |
| **CAMADA 2: PADRÃO** | **45-60 min** | **Teoria + Questões** : 20min ler PDF Uptodate (Foco fraco) -> 30min Fazer 5 questões da AMIB -> 10min Escrever 1 Card de Erro. | Pasta `03_ESTOQUE_DE_QUESTOES` / Pasta `02_ACERVO`. |
| **CAMADA 3: IMERSÃO (Folga)** | **3h-4h** | **Simulação + Produção** : 1h30 Simulado Teórico (Papel). 1h Gravar vídeo narrando uma Estação Prática (ex: Choque Indiferenciado). | Pasta `05_PLANO_ACAO_PRATICA`. |

---

### PARTE 4: O SISTEMA DE ALIMENTAÇÃO CONTÍNUA (A INTELIGÊNCIA DO PROJETO)

Este é o segredo para não estagnar. O aprendizado para o TEMI acontece **no Plantão**. A pasta `06_DEPOSITO_DIARIO` é sagrada.

**Exemplo de Rotina Pós-Plantão (10 min):**
1.  Você atendeu uma **Pancreatite Grave**.
2.  Durante o plantão, você teve dúvida: "Posso usar Ringer Lactato ou só Plasmalyte?".
3.  **Ação:** Tire um print da prescrição (anonimizada). Salve como `.PNG` em `06_DEPOSITO_DIARIO/Evolucoes_Reais_Plantao/`.
4.  **Ação:** Abra o Word `DUVIDAS_DO_DIA.docx` e escreva **apenas a pergunta**: *"Ringer Lactato na Pancreatite Grave - AMIB 2024?"*.
5.  **Automatização via IA (ChatGPT/Grok):** Quando tiver tempo, cole essa pergunta no Grok (DeepSearch) e peça: *"Grok, pesquise no Uptodate e no Guideline AMIB 2026 sobre Ringer Lactato na reposição volêmica da pancreatite aguda grave. Resuma em 1 parágrafo e me dê o PMID do artigo principal."*
6.  **Resultado:** Salve a resposta do Grok em `04_INTELIGENCIA_ARTIFICIAL/Grok_DeepSearch/Pancreatite_Fluidos.docx`.

### PARTE 5: PLANO DE AÇÃO ESPECÍFICO PARA A PROVA PRÁTICA (O "SCRIPT")

A prova prática do TEMI reprova quem não tem **Roteiro Mental**. A pasta `05_PLANO_ACAO_PRATICA` resolve isso.

**Arquivo: ROTEIRO_VOZ_EM_OFF_CHOQUE.docx**
Conteúdo que você deve **gravar com sua própria voz e ouvir dirigindo**:

> *"Paciente com PAM 55... Pego o Probe Cardíaco. Janela Subxifoide. Derrame? Não. Pego Janela Apical 4 Câmaras. VD dilatado? Não. Colapsando? Sim... É choque obstrutivo? Não... PAM baixa, colapsabilidade >50%... É Hipovolêmico. Prova: Vou pedir cristaloide 500ml em 15 min e reavaliar VCI."*

**Arquivo: ALGORITMO_VISUAL_VM.png**
Crie um PNG simples no Paint ou Canva:
[Imagem: Paciente em VM] -> Sat O2 Caindo -> 1. Checar Tubo (Cuff/Gasometria) -> 2. USG Pulmão (Pneumo? Atelectasia?) -> 3. Curva de Fluxo (Auto-PEEP?) -> Ação.

### PARTE 6: ESTRATÉGIA AVANÇADA DE FONTES E ATUALIZAÇÕES

A pasta `02_ACERVO_TEMATICO` não pode ser um "cemitério de PDFs". Use a **Regra dos 3 Links** para cada tema:

1.  **Link do Uptodate:** Visão Geral (Confiança).
2.  **Link do PubMed/NEJM:** O **Paper Original** que mudou a conduta (Ex: ANDROMEDA-SHOCK, CLOVERS, PROSEVA).
3.  **Link da AMIB:** O que a **Banca TEMI** realmente considera como gabarito (às vezes diferente do paper).

### PARTE 7: MODELOS DE DOCUMENTOS PARA BAIXAR E PREENCHER

Abaixo está a estrutura para você gerar os arquivos iniciais.

#### Modelo 1: `Cronograma_Mestre_TEMI_2027.xlsx` (Aba METAS SEMANAIS)

| Semana | Data Início | Tema Principal (Uptodate) | Estudo de Caso (Prática) | Imagem Obrigatória (USG/ECG) | Questões Alvo (AMIB) | Check |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **S01** | 01/01/27 | **Choque: Definições e Monitorização** | Como montar droga vasoativa (Noradrenalina) | **ECG:** Alterações da Hipercalemia | 10 Questões Cap. 1 | ☐ |
| **S02** | 08/01/27 | **Ventilação Mecânica Protetora** | Ajuste Inicial do Ventilador | **Curva:** Auto-PEEP | 10 Questões Cap. 2 | ☐ |
| **S03** | 15/01/27 | **IRA e Terapia Renal Substitutiva** | Indicações de Emergência Dialítica | **USG:** Hidronefrose | 10 Questões Cap. 3 | ☐ |

#### Modelo 2: `Card_Memorizador_PNG` (Descritivo para criação)

**Título:** FATORES DE RISCO PARA DELIRIUM (Mnemônico I WATCH DEATH)
**Fundo:** Preto.
**Fonte:** Amarela/Neon (Impact).
**Conteúdo:**
> **I** nfection
> **W** ithdrawal (Álcool/Benzo)
> **A** cute Metabolic
> **T** rauma (Dor)
> **C** NS Pathology
> **H** ypoxia
> **D** eficiency (B12/Tiamina)
> **E** ndocrine
> **A** cute Vascular
> **T** oxins
> **H** eavy Metals

*(Este card ficará salvo em `07_SISTEMA_DE_REVISAO_RAPIDA/Cards_Memorizadores/DELIRIUM.png`)*

#### Modelo 3: `Estrutura_Resposta_IA_Padrao.docx` (Para colar no GPT/Claude)

Salve este texto como um bloco de notas para usar sempre que perguntar algo à IA.

> **CONTEXTO:** Sou Médico Intensivista estudando para a Prova de Título AMIB/TEMI 2027.
> **CONSULTA:** [INSIRA SUA DÚVIDA AQUI]
> **FORMATO DE RESPOSTA DESEJADO:**
> 1. **"O que cai na Prova?"** (Foco AMIB, não só guidelines soltos).
> 2. **"Pérola do Plantão"** (Dica prática de 1 linha).
> 3. **"Armadilha da Estação Prática"** (O que NÃO falar para o examinador).
> 4. **Referência:** (Se possível, PMID do artigo mais recente da NEJM ou ICM).

### PARTE 8: O MÉTODO DE REVISÃO PARA DIAS "LIXO" (Pós-Plantão Noturno)

Nesses dias, seu cérebro está frito para ler PDFs. Faça apenas isso:

1.  Abra a pasta `01_PAINEL_DE_CONTROLE`.
2.  Abra o arquivo `Sistema_Revisao_Espacada_Anki.xlsx`.
3.  Filtre a coluna por **"REVISÃO ATRASADA"**.
4.  **NÃO LEIA.** Apenas passe o olho nos **TÍTULOS** dos links da coluna "Link do Arquivo".
5.  Se algum título te causar estranheza ("Nossa, não lembro disso..."), clique e leia **APENAS O PRIMEIRO PARÁGRAFO**.
6.  Feche o computador e durma.

**Conclusão Estratégica:**
Este projeto não é sobre ter **mais material**, é sobre ter um **fluxo de trabalho cerebral externo**. O segredo está na pasta **`06_DEPOSITO_DIARIO`**. Se você alimentar essa pasta com **1 dúvida por dia de plantão**, em 6 meses você terá revisado exatamente o que a banca cobra na prática.