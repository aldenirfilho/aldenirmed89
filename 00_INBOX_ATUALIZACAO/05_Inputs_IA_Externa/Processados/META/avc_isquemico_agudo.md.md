Pronto. Arquitetura montada e primeiro artigo já transformado em enciclopédia interativa, TDAH-friendly, com foco total em UTI, emergência e prova TEMI.

## 🏗️ Como eu arquitetei

Pensei a enciclopédia como um sistema vivo, não um PDF estático:

- **Homepage** com navegação por ícones (🧠📊💉), cards curtos, muito espaço em branco
- **Linguagem**: frases de 8-12 palavras, negrito nos gatilhos, emojis como âncoras visuais
- **Estrutura fixa** para todo artigo: definição → epidemiologia → etiologias → fisiopatologia → clínica → diagnóstico → prevenção → tratamento → farmacologia → metas → prescrição → bundles → escalas → mnemônicos → flashcards → questões → pegadinhas → insights → pesquisas → referências → mensagem final
- **Atualização contínua**: cada seção puxa diretrizes mais recentes (AHA/ASA 2026, SBAVC, UpToDate abril/2026) e marca data de revisão
- **Produtos derivados automáticos**: flashcards Anki, checklists de bolso, questões comentadas estilo TEMI, bundles para prontuário eletrônico
- **Renderização Google Antigravity**: HTML semântico, Tailwind leve, acordeões, tabelas responsivas

Você enviou o UpToDate "Avaliação inicial e tratamento do AVC agudo". Eu extraí, cruzei com diretrizes atuais e gerei:

📄 **[Enciclopédia interativa – AVC Agudo (HTML)](container:///mnt/data/avc_agudo_enciclopedia.html)**

📝 **[Versão Markdown para edição](container:///mnt/data/avc_enciclopedia.md)**

---

## 🧠 Preview do conteúdo – AVC AGUDO

### 🧠 Definição
AVC = déficit neurológico súbito por isquemia (~85%) ou hemorragia (~15%). Tempo é cérebro: cada minuto sem fluxo = 1,9 milhão de neurônios perdidos.

### 📊 Epidemiologia
2ª causa de morte no Brasil. 1 em 4 pessoas terá AVC. Na UTI, responde por ~10% das admissões neurológicas. Fatores chave: HAS, FA, DM, idade.

### 🚨 Clínica – BE-FAST
Balance, Eyes, Face, Arm, Speech, Time. Hemorragia grita com cefaleia explosiva, vômitos e rebaixamento.

### 🔍 Diagnóstico
1. ABC + glicemia capilar **agora**
2. NIHSS em <10 min
3. TC sem contraste <20 min porta-imagem
4. Se janela <4,5h ou suspeita LVO → angio-TC

### 💉 Tratamento (o que mudou)
- **<4,5h**: trombólise IV
  - Tenecteplase 0,25 mg/kg bolus, máx 25 mg **OU**
  - Alteplase 0,9 mg/kg, máx 90 mg
- **LVO**: trombectomia 0-6h, até 24h se critérios DAWN/DEFUSE
- **Sem reperfusão**: AAS 300 mg após 24h
- **Hemorragia**: PA <140, reverter anticoagulação, avaliar cirurgia

Tenecteplase virou classe I na diretriz 2026 por ser bolus único, não inferior à alteplase e reduzir porta-agulha.

### 💊 Farmacologia beira-leito
- Labetalol 10-20 mg IV ou nicardipina para PA
- Reversão varfarina: PCC 4F + vit K 10 mg
- DOAC: idarucizumabe (dabigatrana), andexanet (Xa)

### 🎯 Metas na UTI
- Pré-trombólise PA <185/110, pós <180/105
- Hemorragia PA <140/90
- Glicemia 140-180, temp <37,5°C, SpO₂ >94%, cabeceira 30°

### 📦 Bundle CODE STROKE
Hora última vez bem? Glicemia? NIHSS? TC? Contraindicações? PA ok? Droga pronta? UTI avisada? Documentar porta-agulha <60 min.

### 📏 Escalas
- **Cincinnati/FAST**: 1 item alterado = 72% prob AVC, 3 itens >85%
- **NIHSS**: escala padrão, validada, quantitativa de 0 a 42

### 🧠 Mnemônicos
- **BE-FAST** para reconhecer
- **4,5 TNK 0,25 max 25** para dose
- **HEMORRAGIA = dor + vômito + coma**

### ❓ Questões TEMI comentadas
1. FA + NIHSS 14 + PA 190/105 há 2h → baixar PA primeiro, depois trombólise
2. Hemorragia lobar em idoso normotenso → angiopatia amiloide
3. Pós-TNK PA 185/100 → nicardipina, manter <180/105

### ⚠️ Pegadinhas
Hipoglicemia <50 mimetiza AVC. NIHSS zero não exclui LVO. Não dar O₂ se não hipóxico. Não baixar PA agressivo antes da reperfusão.

### 🔬 Pesquisas em andamento
A diretriz AHA/ASA 2026 incorpora nova evidência sobre escolha de trombolítico, elegibilidade para trombectomia e manejo de hiperglicemia. TIMELESS testa TNK em janela estendida. Unidades móveis de AVC já reduzem tempo no Brasil.

---

## 📚 Referências integradas
- UpToDate 2026 – Avaliação inicial e tratamento do AVC agudo (Oliveira-Filho, Mullen)
- AHA/ASA 2026 Guideline for Early Management of AIS
- SBAVC – Diretrizes brasileiras endovascular
- Medway 2026 – atualização tenecteplase

## 💬 Mensagem final
Na UTI, AVC não é diagnóstico, é corrida contra relógio. Você não precisa decorar tudo, precisa ter o checklist na mão e a dose na ponta da língua. Cada minuto que você ganha é um paciente que volta a falar, andar e viver.

Quer que eu já gere o próximo artigo (ex: sepse, choque, ventilação mecânica) no mesmo formato, ou prefere que eu converta este em flashcards Anki e cards para Instagram médico?