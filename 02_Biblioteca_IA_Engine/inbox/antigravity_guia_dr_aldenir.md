**GOOGLE ANTIGRAVITY**

_Guia de Atalhos de Teclado + Casos de Uso Médico_

Dr. Aldenir Rocha • CRM-CE 16587 • Intensivista / Clínica Médica • Hospital Regional Norte & Santa Casa de Sobral

**🤖 Agente IA** **✏️ Editor** **🗺️ Navegação** **💻 Terminal** **🌿 Git** **🏥 Casos UTI**

|   |   |   |   |
|---|---|---|---|
|**Versão Antigravity** 1.22.x (2026)|**Sistema Operacional** Mac — Cmd \| Win/Lin — Ctrl|**Plataforma IA** Gemini 3 Pro · Claude Sonnet · GPT-OSS|**Elaborado em** Maio 2026 \| Sobral / CE|

## **⚡ Top 5 — Atalhos Essenciais (Aprenda Primeiro)**

_Domine estes 5 atalhos e você terá coberto 80% do uso diário do Antigravity:_

|**ATALHO**|**CATEGORIA**|**AÇÃO**|
|---|---|---|
|**Cmd + L**|**Agente**|Toggle painel do agente|
|**Cmd + I**|**Agente**|Comando inline (código/terminal)|
|**Cmd + E**|**Agente**|Alternar Editor ↔ Manager View|
|**Cmd + Shift + P**|**Navegação**|Command Palette (tudo aqui)|
|**Ctrl + `**|**Terminal**|Abrir/fechar terminal integrado|

**💡 DICA TDAH** Comece pelo Cmd+L (painel agente). Pratique por 3 dias usando SOMENTE este atalho. Só então incorpore o próximo. A repetição espaçada funciona melhor para memorização com TDAH grave.

**🤖 AGENTE IA**

### **Tabela de Atalhos**

|**#**|**ATALHO**|**AÇÃO**|**DESCRIÇÃO**|
|---|---|---|---|
|**01**|**Cmd + L**|**Toggle painel do agente**|Abre/fecha o chat de IA no Editor View. Atalho mais usado do Antigravity.|
|**02**|**Cmd + I**|**Comando inline**|Edição ou completion por linguagem natural direto na linha de código ou no terminal.|
|**03**|**Cmd + E**|**Editor ↔ Manager View**|Alterna entre Editor View e Agent Manager (Mission Control).|
|**04**|**Cmd + K**|**Mission Control**|Ativa painel de orquestração de múltiplos agentes paralelos.|
|**05**|**Cmd + Shift + M**|**Abrir Manager View**|Alternativa direta para o Agent Manager — 'Mission Control'.|
|**06**|**Tab**|**Aceitar sugestão IA**|Aceita autocomplete, import suggestion ou jump suggestion gerado pelo agente.|
|**07**|**Esc**|**Rejeitar / Cancelar agente**|Cancela sugestão inline ou interrompe tarefa em andamento.|
|**08**|**Cmd + Z**|**Desfazer ação do agente**|Reverte mudanças geradas pela IA até o ponto anterior no histórico do chat.|
|**09**|**Cmd + Shift + P**|**Command Palette**|Lista todos os comandos disponíveis — workflows, agente e extensões.|
|**10**|**/ (no chat)**|**Acionar workflow**|Digitar / no chat lista e executa workflows salvos (ex: /revisao-clinica).|
|**11**|**@ (no chat)**|**Adicionar contexto**|Inclui arquivos, pastas ou MCP servers como contexto da tarefa.|

### **🏥 Casos de Uso — UTI / Clínica Médica / TEMI**

_Como aplicar estes atalhos no seu fluxo clínico e de estudos:_

|**ATALHO**|**CASO DE USO CLÍNICO / UTI**|
|---|---|
|**Cmd+L**|Pressione Cmd+L e pergunte: 'Como calcular dose de norepinefrina para PAM alvo 65 mmHg em paciente de 80 kg?' O agente aciona a calculadora vasoativa integrada no RespiraCrit.|
|**Cmd+I**|Com o cursor na função calcularDose(), pressione Cmd+I e escreva: 'validar range fisiológico 0.01–3 mcg/kg/min e adicionar aviso se >1 mcg/kg/min'. Agente edita na hora.|
|**Cmd+E**|Inicie 3 agentes paralelos no Manager: um buscando guideline Surviving Sepsis 2024, outro codando calculadora de SOFA, terceiro gerando flashcard TEMI sobre sepse.|
|**/workflow**|Digite /teste-temi no chat para o agente gerar questão estilo AMIB sobre ventilação protetora (PCV-VG, ARDSnet, PROSEVA) com gabarito e pearl clínica.|
|**@contexto**|Digite @ e inclua o arquivo protocolo-sepse.md no contexto antes de pedir ao agente para atualizar o bundle com as recomendações mais recentes.|

**✏️ EDITOR**

### **Tabela de Atalhos**

|**#**|**ATALHO**|**AÇÃO**|**DESCRIÇÃO**|
|---|---|---|---|
|**12**|**Cmd + Shift + F**|**Busca global no projeto**|Busca texto em todos os arquivos do workspace — suporta regex.|
|**13**|**Cmd + Shift + G**|**Gerar testes**|Workflow de geração automática de testes para o arquivo atual.|
|**14**|**Cmd + Shift + D**|**Gerar documentação**|Gera docstrings/JSDoc automáticos para funções e classes selecionadas.|
|**15**|**Cmd + Shift + E**|**Explicar seleção**|Envia código selecionado ao agente para explicação detalhada.|
|**16**|**Cmd + Shift + O**|**Otimizar arquivo**|Agente revisa e otimiza o arquivo atual quanto a performance e legibilidade.|
|**17**|**Cmd + Alt + R**|**Sugestões de refatoração**|Agente propõe melhorias arquiteturais no código selecionado.|
|**18**|**Cmd + S**|**Salvar e formatar**|Salva o arquivo e aciona Format on Save (Black, Prettier etc.).|

### **🏥 Casos de Uso — UTI / Clínica Médica / TEMI**

_Como aplicar estes atalhos no seu fluxo clínico e de estudos:_

|**ATALHO**|**CASO DE USO CLÍNICO / UTI**|
|---|---|
|**Cmd+Shift+F**|Busque 'norepinefrina' em todos os arquivos do RespiraCrit para garantir consistência de unidade (mcg/kg/min) em todas as calculadoras.|
|**Cmd+Shift+G**|Após criar a calculadora de PaO2/FiO2, acione Cmd+Shift+G para o agente gerar testes cobrindo: SARA leve (<300), moderada (<200) e grave (<100).|
|**Cmd+Shift+E**|Selecione a fórmula de Cockcroft-Gault, pressione Cmd+Shift+E e peça: 'explique em PT-BR e cite a referência original (Cockcroft 1976)'.|
|**Cmd+Shift+D**|Selecione a função calcularEscoreFisher() e acione Cmd+Shift+D para gerar docstring com: parâmetros, retorno, referência radiológica e exemplo de uso.|
|**Cmd+S**|Configure Format on Save com Black (Python) para garantir que todo código do projeto TEMI-prep seja formatado automaticamente ao salvar.|

**🗺️ NAVEGAÇÃO**

### **Tabela de Atalhos**

|**#**|**ATALHO**|**AÇÃO**|**DESCRIÇÃO**|
|---|---|---|---|
|**19**|**Cmd + ,**|**Configurações**|Abre Antigravity Settings em qualquer surface (editor ou manager).|
|**20**|**Cmd + P**|**Abrir arquivo rápido**|Fuzzy finder — localiza qualquer arquivo do projeto por nome parcial.|
|**21**|**Cmd + \**|**Split editor (dividir tela)**|Abre segunda coluna de edição — ideal para comparar dois arquivos.|
|**22**|**Cmd + B**|**Toggle sidebar / File Explorer**|Abre/fecha o painel lateral com o explorador de arquivos.|
|**23**|**Cmd + W**|**Fechar aba atual**|Fecha o arquivo/aba ativa sem fechar o workspace inteiro.|
|**24**|**Cmd + Shift + K**|**Deletar linha inteira**|Remove a linha do cursor sem precisar selecionar — 3x mais rápido.|
|**25**|**Cmd + G**|**Ir para linha**|Salta direto para qualquer número de linha do arquivo.|

### **🏥 Casos de Uso — UTI / Clínica Médica / TEMI**

_Como aplicar estes atalhos no seu fluxo clínico e de estudos:_

|**ATALHO**|**CASO DE USO CLÍNICO / UTI**|
|---|---|
|**Cmd+P**|Abra rapidamente o arquivo escala-burch-wartofsky.ts sem usar o mouse — essencial durante plantão quando cada segundo conta.|
|**Cmd+\**|Abra o guideline PDF do AMIB em uma coluna e o arquivo de questões TEMI na outra — revisão simultânea sem Alt+Tab.|
|**Cmd+B**|Feche o sidebar durante sessão de leitura do RespiraCrit para ter tela cheia do código — minimiza distração (TDAH).|
|**Cmd+Shift+P**|Abra a Command Palette e busque 'Switch Persona' para alternar o agente entre modo 'intensivista' e modo 'professor TEMI'.|
|**Cmd+G**|Vá diretamente à linha 347 do arquivo protocolo-vm.ts para editar o parâmetro de PEEP sem ter que rolar o arquivo.|

**💻 TERMINAL**

### **Tabela de Atalhos**

|**#**|**ATALHO**|**AÇÃO**|**DESCRIÇÃO**|
|---|---|---|---|
|**26**|**Ctrl + `**|**Toggle terminal integrado**|Abre/fecha o terminal — suporta múltiplos terminais em paralelo.|
|**27**|**Cmd + I**|**Sugestão de comando shell**|No terminal, Cmd+I solicita comando ao agente em linguagem natural.|

### **🏥 Casos de Uso — UTI / Clínica Médica / TEMI**

_Como aplicar estes atalhos no seu fluxo clínico e de estudos:_

|**ATALHO**|**CASO DE USO CLÍNICO / UTI**|
|---|---|
|**Ctrl+`**|Abra o terminal, rode 'python calcular_dose.py --peso 75 --norepinefrina 0.3' para testar sua calculadora sem sair do IDE.|
|**Cmd+I (term)**|No terminal, pressione Cmd+I e escreva: 'comando para renomear todos os arquivos PDF de plantão de 2024 seguindo o padrão AAAA-MM-DD_plantao.pdf'.|
|**Ctrl+`**|Abra 2 terminais paralelos: um rodando o servidor Next.js do RespiraCrit, outro para rodar testes pytest enquanto você continua editando.|

**🌿 GIT**

### **Tabela de Atalhos**

|**#**|**ATALHO**|**AÇÃO**|**DESCRIÇÃO**|
|---|---|---|---|
|**28**|**Cmd + Shift + G**|**Painel Source Control**|Abre o painel de controle de versão — commits, diffs, branches.|
|**29**|**✨ (ícone no Git)**|**AI Commit Message**|Clique no ícone ✨ no painel Git para o agente gerar mensagem de commit automática.|
|**30**|**Cmd + Enter**|**Commit rápido**|Após digitar mensagem no Source Control, commita com atalho de teclado.|

### **🏥 Casos de Uso — UTI / Clínica Médica / TEMI**

_Como aplicar estes atalhos no seu fluxo clínico e de estudos:_

|**ATALHO**|**CASO DE USO CLÍNICO / UTI**|
|---|---|
|**Cmd+Shift+G**|Abra o Source Control antes de cada sessão TEMI para garantir que o banco de questões foi comitado — nunca perca conteúdo por falta de backup.|
|**✨ AI Commit**|Clique em ✨ para o agente gerar: 'feat(calculadoras): adicionar validação fisiológica PaO2/FiO2 conforme ARDSnet NEJM 2000' automaticamente.|
|**Cmd+Enter**|Após revisar o diff do protocolo atualizado, execute Cmd+Enter para commitar a nova versão do bundle de sepse antes do próximo plantão.|

**🛡️ SEGURANÇA — REGRAS INEGOCIÁVEIS (LGPD + CFM)**

**⚠️ NUNCA habilitar 'Non-Workspace File Access'**

Esta opção permite que o agente acesse credentials, chaves SSH e dados fora do workspace. Mantenha DESABILITADA.

**⚠️ Dados de pacientes: SOMENTE anonimizados**

Iniciais + idade + comorbidades. NUNCA: CPF, nome completo, prontuário completo, RG ou dados que identifiquem o paciente (LGPD Art.11, CFM 2.314/2022).

**⚠️ Permissões: Allow / Ask / Deny**

Configure 'Ask' para comandos de terminal, instalação de pacotes e edição de arquivos. Configure 'Deny' para: rm -rf, ~/.ssh, arquivos .env.

**⚠️ Workspace dedicado**

Sempre abra o Antigravity em ~/Documents/Antigravity-Workspaces/<projeto>. NUNCA em ~/ ou ~/Downloads.

**⚠️ Backup obrigatório antes de missões longas**

Antes de delegar tarefas que tocam múltiplos arquivos, faça git commit ou backup manual. O agente pode sobrescrever arquivos.

**⚠️ Browser Allow Lists**

Restrinja o agente a domínios médicos confiáveis: pubmed.ncbi.nlm.nih.gov, uptodate.com, amib.org.br, bvsalud.org.

**⚡ Workflows & Comandos Especiais de Chat**

### **Comandos @ e / no Painel de Chat**

_No painel do agente (Cmd+L), você pode usar estes comandos especiais:_

|**COMANDO**|**FUNÇÃO**|
|---|---|
|**@arquivo.ts**|Inclui um arquivo específico como contexto da tarefa. O agente pode ler e editar o arquivo referenciado.|
|**@pasta/**|Inclui toda uma pasta no contexto. Útil para projetos maiores como o RespiraCrit completo.|
|**@MCP-PubMed**|Conecta o MCP do PubMed ao contexto para o agente buscar artigos científicos durante a tarefa.|
|**/revisao-clinica**|Workflow: audita código gerado por IA contra critérios clínicos — fórmulas, ranges, disclaimer médico e LGPD.|
|**/teste-temi**|Workflow: gera questão estilo AMIB sobre o tema especificado, com gabarito, justificativas e pearl clínica.|
|**/organiza-pasta**|Workflow: mapeia estrutura de arquivos e propõe reorganização — AGUARDA aprovação antes de mover qualquer coisa.|
|**/plantao-resumo**|Workflow: converte notas .md do plantão em tabela estruturada com pendências, intercorrências e procedimentos.|
|**/commit-medico**|Workflow: verifica diff, detecta dados sensíveis, sugere mensagem Conventional Commits em PT-BR e aguarda confirmação.|

## **🧠 Estratégia de Memorização para TDAH**

Semana 1: Cmd+L (agente) + Cmd+I (inline). Semana 2: adicione Cmd+E (swap view) + Cmd+K (mission control). Semana 3: Ctrl+` (terminal) + Cmd+Shift+G (git). Use Pomodoro de 25 min: nos primeiros 5 min de cada sessão, teste um atalho novo antes de começar a tarefa principal.