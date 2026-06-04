Esta é uma estrutura de **Arquitetura de Conhecimento** projetada especificamente para o Obsidian, focada em alta performance para a prova de título (TEMI) e prática clínica real.

O segredo aqui não são pastas rígidas, mas **Mapas de Conteúdo (MOCs)**.

---

## 1. Estrutura de Pastas (O Esqueleto)

No Obsidian, crie estas 5 pastas principais para manter o "caos" sob controle:

1. `00_Inbox` (Para notas rápidas e rascunhos)
    
2. `10_MOCs` (Mapas de Conteúdo - Os índices de cada grande área)
    
3. `20_Atlas_Clinico` (Onde vive o conhecimento teórico e prático)
    
4. `30_Projetos_IA` (Espaço para o Nexus e estudos de IA)
    
5. `90_Assets` (Imagens, PDFs e anexos)
    

---

## 2. O Mapa de Conexões (MOC Principal)

Copie e cole este conteúdo em uma nota chamada `Main Hub`. Ele será o seu ponto de partida.

Markdown

```
---
owner: Aldenir Rocha
objetivo: Titulação TEMI & Prática Intensiva
tags: [hub, medicina_intensiva, TEMI, IA]
---

# 🧠 Segundo Cérebro: Medicina Intensiva & Nexus

## 🚑 Grandes Eixos de Estudo
- [[MOC_Medicina_Intensiva]]: Fisiopatologia, Ventilação, Choque.
- [[MOC_Clinica_Medica]]: Nefro, Cardio, Infecto, Gastro.
- [[MOC_Emergencia]]: Protocolos de balcão e sala vermelha.
- [[MOC_POCUS]]: Guia prático de Ultrassom à beira leito.

## 🏆 Preparação TEMI 2026
- [[TEMI_Cronograma_Teorico]]: Cronograma por peso de prova.
- [[TEMI_Simulados_e_Questoes]]: Banco de erros e revisões.
- [[TEMI_Prova_Pratica]]: Checklist de procedimentos e comunicação.

## 🤖 Nexus & IA na Medicina
- [[IA_Engenharia_de_Prompts_Clinicos]]
- [[IA_Data_Science_em_Saude]]
- [[Nexus_Clinical_Engine_Blueprint]]

---
## 🔗 Conexões Transversais Sugeridas
- [HDA Varicosa] -> [[MOC_Medicina_Intensiva]] (Choque) + [[MOC_POCUS]] (Avaliação VCI)
- [Cetoacidose] -> [[MOC_Clinica_Medica]] (Endocrino) + [[MOC_Emergencia]]
```

---

## 3. Plano Temático para a TEMI (Teórica e Prática)

Crie a nota `TEMI_Cronograma_Teorico` e insira estes tópicos:

### **Eixo 1: Hemodinâmica e Choque**

- **Subtópicos:** [[Choque Séptico]], [[Choque Cardiogênico]], [[Monitorização Hemodinâmica Invasiva vs Não Invasiva]], [[Drogas Vasoativas]].
    
- **Conexão:** [[MOC_POCUS]] (Protocolo RUSH).
    

### **Eixo 2: Ventilação Mecânica (VM)**

- **Subtópicos:** [[Fisiologia Respiratória]], [[VM Básica]], [[SDRA]], [[Desmame Ventilatório]], [[VNI e CNAF]].
    
- **Conexão:** [[MOC_POCUS]] (USG Pulmonar/BLUE Protocol).
    

### **Eixo 3: Infectologia e Sepse**

- **Subtópicos:** [[Novas Definições de Sepse]], [[Antibioticoterapia Empírica]], [[Pneumonia Associada à Ventilação (PAV)]], [[Infecção de Corrente Sanguínea]].
    

### **Eixo 4: Nefrologia e Distúrbios Metabólicos**

- **Subtópicos:** [[IRA na UTI]], [[Métodos Dialíticos Contínuos]], [[Distúrbios Hidroeletrolíticos Graves]], [[Equilíbrio Ácido-Básico (Stewart)]].
    

---

## 4. Plano de Aprendizagem POCUS (Beira Leito)

Crie a nota `MOC_POCUS`. Este esquema é focado em alimentar o Obsidian com imagens e laudos dos seus próprios plantões.

|**Módulo**|**Conteúdo no Obsidian**|**Conexão Prática**|
|---|---|---|
|**Pulmão**|[[BLUE Protocol]], [[Deslizamento Pleural]], [[Linhas B]]|Diagnóstico diferencial de Dispneia|
|**Coração**|[[Janelas Ecocardiográficas]], [[Função de VE]], [[VCI estática/dinâmica]]|Manejo de Choque e Volatilidade|
|**Abdome**|[[Protocolo FAST/e-FAST]], [[Aorta Abdominal]]|Trauma e Emergência Cirúrgica|
|**Vascular**|[[Acesso Venoso Central Guiado]], [[DVT - Trombose Venosa Profunda]]|Segurança do Procedimento|

---

## 5. Abordagem Prática: Como "Alimentar" o Sistema

Como você tem TDAH e uma rotina de plantão intensa, use este método:

1. **Captura:** Viu um caso clínico interessante? Crie uma nota na `00_Inbox` com o nome do caso.
    
2. **Processamento:** Quando tiver tempo (ou entre plantões), arraste para o tema correto no `MOC`.
    
3. **IA como Filtro:** Use a IA para resumir artigos da _Intensive Care Medicine_ ou _NEJM_ e cole o resumo direto na nota temática.
    

---

### 🎨 Sugestão de Imagem

Eu posso gerar para você um **Diagrama de Rede** que ilustra como a **IA (Nexus)** se conecta com a **Monitorização Hemodinâmica** e o **POCUS** para formar uma "Unidade de Decisão Clínica". Deseja que eu gere essa visualização?

---

### 🗂️ Script para Obsidian (Template de Nota Clínica)

Para cada assunto novo que você estudar, use este padrão:

Markdown

```
---
tema: 
subtema: 
tags: [estudo, TEMI, UTI]
status: 🔴 To Do / 🟡 Doing / 🟢 Done
---

# [[Título do Assunto]]

## 📌 Pontos Chave (Resumo em 3 frases)
1. 
2. 

## 📖 Conteúdo Teórico (Resumo Nerd)
- 

## 🛠️ Aplicação Prática (Beira de Leito)
- 

## 🔗 Conexões
- Ver também: [[MOC_Medicina_Intensiva]]
- POCUS relacionado: [[MOC_POCUS]]
```

Qual desses eixos você gostaria de detalhar primeiro para a sua prova do TEMI?