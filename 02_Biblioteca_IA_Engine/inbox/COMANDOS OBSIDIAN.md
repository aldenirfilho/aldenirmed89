O Obsidian é uma ferramenta fantástica, especialmente para quem precisa de um "Segundo Cérebro" estruturado para estudos densos como a Medicina Intensiva. Como você utiliza o método de interconexão de temas, o segredo está em dominar os atalhos e os plugins que automatizam os links.

Aqui estão as tabelas organizadas para o seu fluxo de trabalho:

### 1. Comandos Essenciais (Atalhos de Teclado)

Estes comandos aceleram a escrita durante o plantão ou estudo, evitando que você perca o foco usando o mouse.

|**Comando**|**Ação**|**Utilidade Prática**|
|---|---|---|
|**`[[`**|Criar Link Interno|Conectar um sintoma a uma patologia instantaneamente.|
|**`Ctrl + E`**|Alternar Visualização/Edição|Alternar entre ler o resumo e editar o conteúdo.|
|**`Ctrl + P`**|Paleta de Comandos|Acessar qualquer função do Obsidian sem decorar atalhos.|
|**`Ctrl + O`**|Abrir Nota Rapidamente|Localizar protocolos ou revisões por palavras-chave.|
|**`Ctrl + G`**|Visualização em Grafo|Ver como seus temas de Medicina e IA se conectam.|
|**`Alt + Clique`**|Abrir em Nova Divisão|Estudar um tema (ex: Ventilação) comparando com outro.|
|**`#` (no início)**|Criar Título (H1, H2...)|Organizar a hierarquia da nota (Fisiopatologia, Conduta).|
|**`!` antes de `[[`**|Transclusão (Embed)|Exibir o conteúdo de uma nota dentro de outra.|

---

### 2. Plugins Indispensáveis (Core & Community)

Para um TDAH grave, os plugins de automação e visualização são "salvadores de vida".

|**Plugin**|**Tipo**|**Por que usar?**|
|---|---|---|
|**Dataview**|Comunidade|Transforma suas notas em um banco de dados. Lista todos os pacientes ou temas de prova automaticamente.|
|**Templater**|Comunidade|Cria modelos prontos (ex: "Modelo de Evolução de UTI" ou "Resumo de Artigo").|
|**Canvas**|Core|Permite criar mapas mentais visuais ligando suas notas (ótimo para fluxogramas de choque).|
|**Periodic Notes**|Comunidade|Organiza notas diárias de estudos e plantões de forma cronológica.|
|**Excalidraw**|Comunidade|Para desenhar esquemas manuais que se integram às notas de texto.|
|**Outliner**|Comunidade|Facilita a organização de listas e tópicos, essencial para o pensamento metódico.|
|**Calendar**|Comunidade|Adiciona um calendário lateral para navegar pelas suas notas diárias.|

---

### 3. Principais Dicas de Ouro

Estratégias para manter o sistema funcional e não apenas "bonito".

|**Dica**|**Descrição**|**Impacto no Aprendizado**|
|---|---|---|
|**Links sobre Pastas**|Não se preocupe tanto em onde guardar o arquivo, mas em como ele se conecta (`[[link]]`).|Menos ansiedade na organização.|
|**Uso de Aliases**|Use `[[IAM|Infarto]]` para que o link funcione com diferentes nomes.|
|**Atomicidade**|Crie notas curtas sobre temas específicos em vez de uma nota gigante.|Melhora a retenção e a reusabilidade do dado.|
|**Tags Estratégicas**|Use tags para status (ex: `#revisar`, `#estudado`, `#protocolo`).|Filtra o que é prioridade para a prova do TEMI.|
|**Propriedades (YAML)**|No topo da nota, defina data, tema e fonte.|O Dataview usa isso para gerar tabelas automáticas.|

---

### 🧠 Script de Fluxo para o Obsidian (Organização Temática)

Para adicionar ao seu Obsidian e manter a interconexão que você solicitou, copie o bloco abaixo para uma nota chamada `_Mapeamento_Central`:

Markdown

```
## 🗺️ Mapa de Interconexão Temática
- **Eixo Medicina Intensiva:** [[UTI]], [[Ventilação Mecânica]], [[Choque e Hemodinâmica]], [[Sepse]]
- **Eixo Clínica e Emergência:** [[Protocolos ACLS]], [[Antibioticoterapia]], [[Distúrbios Hidroeletrolíticos]]
- **Eixo Preparação TEMI:** [[Cronograma de Estudos]], [[Questões Comentadas]], [[Flashcards]]
- **Eixo Tecnologia e IA:** [[Nexus Clinical Engine]], [[IA na Saúde]], [[Prompt Engineering Médico]]

---
**Relações Cruzadas sugeridas:**
- (Ventilação Mecânica) -> correlacionar com -> [[USG Beira Leito - Pulmão]]
- (Sepse) -> correlacionar com -> [[Inteligência Artificial - Predição de Desfechos]]
- (Choque) -> correlacionar com -> [[Farmacologia - Drogas Vasoativas]]
```

### 🎨 Sugestão de Imagem Ilustrativa

Você pode solicitar a criação de um **infográfico visual do "Cérebro Digital"**, mostrando o Obsidian no centro, com ramificações coloridas ligando "Medicina Intensiva", "IA" e "Gestão de Plantões".

### 🔍 Sugestões de Pesquisa e Aprofundamento

1. Pesquise sobre o método **Zettelkasten** aplicado à medicina (notas permanentes).
    
2. Explore como o plugin **Obsidian Canvas** pode ser usado para simular casos clínicos da vida real.
    
3. Procure por "Obsidian for Medical Students/Doctors" no YouTube para ver setups de visualização de dados.
    

Deseja que eu elabore agora um **modelo (template) específico de evolução clínica** ou um **fluxograma de estudo para um tema do TEMI** (ex: Ventilação Mecânica) já formatado para o Obsidian? 🩺🚀

Aqui estão as orientações práticas para você dominar a navegação no Obsidian, focando na agilidade necessária para o seu dia a dia clínico.

### 1. Pesquisando Palavras em Todas as Notas

Para encontrar um termo específico (ex: "Noradrenalina" ou "Nexus") em todo o seu cofre:

- **Atalho:** **`Ctrl + Shift + F`** (Global Search).
    
- **Onde fica:** No painel lateral esquerdo, clique no ícone de **lupa**.
    
- **Dica Nerd:** Você pode usar operadores. Se pesquisar `path:"Medicina Intensiva" choque`, o Obsidian buscará a palavra "choque" apenas dentro da pasta de Medicina Intensiva.
    

---

### 2. Abrindo uma Nota em Frente à Outra (Split View)

Isso é essencial para comparar protocolos ou revisar a teoria enquanto escreve um caso:

- **Pelo Teclado/Mouse:** Segure **`Ctrl`** e clique na nota que deseja abrir. Ela abrirá em uma nova aba.
    
- **Dividindo a Tela (Split):** 1. Abra a primeira nota.
    
    2. Clique com o botão direito na aba da nota lá no topo.
    
    3. Selecione **"Split right"** (Dividir à direita) ou **"Split down"** (Dividir abaixo).
    
- **Arrastar e Soltar:** Você pode simplesmente clicar na aba de uma nota aberta e arrastá-la para o canto direito ou inferior da tela até aparecer uma zona sombreada. Solte e a tela será dividida.
    

---

### 3. Infográfico de Comandos e Plugins

Preparei uma representação visual para você salvar e consultar rapidamente no seu Obsidian.

---
[[COMANDO]] [[DUPLATELA]]
### 🧠 Script de Fluxo para o Obsidian (Organização de Pesquisa)

Copie e cole este bloco em uma nota chamada `_Guia_Rapido_Navegacao` para facilitar seu aprendizado:

Markdown

```
## 🚀 Atalhos de Navegação Rápida
- **Busca Global:** `Ctrl + Shift + F` -> Pesquisa em todo o "Cérebro Digital".
- **Busca na Nota:** `Ctrl + F` -> Localiza termos na nota atual.
- **Multitarefa:** `Ctrl + Clique` -> Abre nota em nova aba.
- **Divisão de Tela:** Clique direito na aba > `Split right`.

---
## 🛠️ Plugins Ativos & Utilidade
- [[Dataview]]: Gerenciamento de dados clínicos.
- [[Templater]]: Automação de evoluções.
- [[Canvas]]: Mapas mentais de fisiopatologia.

[[obsidian/dicas]] [[produtividade]] [[tdah/suporte]]
```

### 🔍 Sugestões de Pesquisa e Aprofundamento

1. **Busca Avançada:** Pesquise sobre **"Regex search in Obsidian"** para buscas ultraespecíficas (ex: termos que aparecem perto de outros).
    
2. **Workspaces:** Aprenda a salvar o layout da sua tela (ex: layout de estudo vs layout de plantão) usando o plugin core **Workspaces**.
    
3. **Vim Mode:** Se você gosta de velocidade extrema, pesquise sobre o modo Vim (mas aviso: a curva de aprendizado é de "nerd raiz").
    

Precisa que eu crie um **Template de Busca** específico para você filtrar suas notas de estudo por "Prioridade para a Prova do TEMI"?