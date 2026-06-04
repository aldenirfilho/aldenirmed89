# Integração do Card Feed Médico com a Enciclopédia Antigravity 🖼️🧠

## 1. Objetivo

Integrar o projeto **GPT Card Feed Médico** como um novo módulo da Enciclopédia Médica Intensiva já hospedada em:

```text
https://aldenirfilho.github.io/antigravity-consultas/
```

Novo módulo sugerido:

```text
06_Card_Feed_Medico/
```

URL final esperada:

```text
https://aldenirfilho.github.io/antigravity-consultas/06_Card_Feed_Medico/
```

A função do módulo é servir como **feed visual de revisão contínua** para imagens/cards gerados por IA:

- cards de UTI;
- mapas visuais TEMI;
- wallpapers 1080×1920;
- imagens educativas para familiares/pacientes;
- cards de IA/Obsidian/Antigravity;
- resumos visuais de artigos e diretrizes.

---

## 2. Estrutura de pastas a inserir no repositório

Copiar a pasta abaixo para a raiz do repositório `antigravity-consultas`:

```text
06_Card_Feed_Medico/
├── index.html
├── manifest.webmanifest
├── sw.js
├── data/
│   ├── cards.json
│   └── themes.json
└── assets/
    └── cards/
        ├── uti-geral/
        ├── temi/
        ├── vm-sdra/
        ├── sepse-choque/
        ├── nefro-aki-trs/
        ├── endocrino-diabetes/
        ├── neuro-uti/
        ├── cardio-hemodinamica/
        ├── infectologia/
        ├── farmaco-doses/
        ├── pocus/
        ├── familia-paciente/
        ├── ia-produtividade/
        └── juridico-financeiro/
```

Cada subpasta temática tem um `README_upload_aqui.md` explicando o padrão de nomes.

---

## 3. Como o módulo funciona

O app tem duas camadas:

### Camada 1 — repositório GitHub

Cards públicos e permanentes ficam no arquivo:

```text
06_Card_Feed_Medico/data/cards.json
```

As imagens ficam em:

```text
06_Card_Feed_Medico/assets/cards/<tema>/
```

Exemplo:

```text
06_Card_Feed_Medico/assets/cards/nefro-aki-trs/kdigo_2026_aki_uti_10_passos_1080x1920.png
```

E o card correspondente no JSON:

```json
{
  "id": "kdigo-2026-aki-uti-10-passos",
  "title": "KDIGO 2026 AKI na UTI em 10 passos",
  "theme": "nefro-aki-trs",
  "tags": ["AKI", "KDIGO", "TRS", "UTI", "TEMI"],
  "explanation": "Card para revisão rápida no plantão e prova TEMI.",
  "source": "ChatGPT + curadoria médica",
  "status": "novo",
  "imageUrl": "assets/cards/nefro-aki-trs/kdigo_2026_aki_uti_10_passos_1080x1920.png",
  "createdAt": "2026-05-07"
}
```

### Camada 2 — importação local

O usuário também pode importar imagens localmente pelo navegador.

Essas imagens ficam salvas no navegador via `IndexedDB`.

Importante:
- Elas aparecem no aparelho atual.
- Para migrar para outro aparelho, usar **Exportar backup JSON**.
- Para virar parte oficial da Enciclopédia, a imagem deve ser enviada para `assets/cards/...` e cadastrada em `cards.json`.

---

## 4. Patches na home `index.html`

A home já possui navegação para módulos como TEMI, Calculadoras UTI e Biblioteca IA. O novo módulo deve ser linkado na mesma lógica.

### Patch 1 — adicionar no menu superior

Dentro de:

```html
<nav class="nav">
```

Adicionar:

```html
<a href="06_Card_Feed_Medico/index.html" style="color: #38bdf8;">🖼️ Card Feed</a>
```

### Patch 2 — adicionar no hero

Dentro da área:

```html
<div class="actions">
```

Adicionar:

```html
<a class="btn" href="06_Card_Feed_Medico/index.html">🖼️ Abrir Card Feed</a>
```

### Patch 3 — adicionar card de módulo

Adicionar este bloco próximo aos cards de Biblioteca IA / TEMI / Calculadoras:

```html
<article class="path-card card" style="border-color: rgba(56,189,248,0.42); background: linear-gradient(145deg, rgba(56,189,248,0.10), rgba(0,0,0,0.20));">
  <h3>🖼️ Card Feed Médico</h3>
  <p>
    Feed visual de cards, wallpapers e imagens médicas geradas por IA. Organiza por temas,
    permite revisão rápida no iPhone/iPad/Mac e conecta o acervo visual aos módulos da Enciclopédia.
  </p>
  <ul>
    <li>Banco de imagens por tema.</li>
    <li>Comentários, tags e status de revisão.</li>
    <li>Entrada rápida para cards TEMI, UTI, família e produtividade.</li>
    <li>Preparado para expansão contínua via GitHub Pages.</li>
  </ul>
  <div style="margin-top: 14px;">
    <a class="btn primary" href="06_Card_Feed_Medico/index.html" style="background: linear-gradient(135deg, #38bdf8, #a78bfa); box-shadow: 0 8px 24px rgba(56,189,248,0.25);">Abrir Card Feed →</a>
  </div>
</article>
```

---

## 5. Temas iniciais já definidos

| ID do tema | Nome | Uso |
|---|---|---|
| `uti-geral` | UTI Geral | bundles, segurança, round, checklist |
| `temi` | TEMI | prova, questões, flashcards, pérolas |
| `vm-sdra` | Ventilação Mecânica / SDRA | VM, PEEP, driving pressure, desmame |
| `sepse-choque` | Sepse / Choque | bundle, lactato, DVA, ressuscitação |
| `nefro-aki-trs` | Nefro / AKI / TRS | KDIGO, IRA, diálise, CRRT, SLED |
| `endocrino-diabetes` | Endócrino / Diabetes | CAD, EHH, hipoglicemia, insulina |
| `neuro-uti` | Neuro UTI | AVC, TCE, convulsão, sedação |
| `cardio-hemodinamica` | Cardio / Hemodinâmica | ECG, arritmias, drogas vasoativas |
| `infectologia` | Infectologia | antibiótico, PAV, pneumonia, culturas |
| `farmaco-doses` | Farmacologia / Doses | diluição, mL/h, doses críticas |
| `pocus` | POCUS / USG | ultrassom beira-leito |
| `familia-paciente` | Família / Paciente | orientações visuais simples |
| `ia-produtividade` | IA / Obsidian / Produtividade | fluxos, automação, estudo |
| `juridico-financeiro` | Jurídico / Financeiro | organização pessoal, vida prática |

---

## 6. Padrão de nomes de imagens

Usar nomes sem espaços, sem acento e com tema claro:

```text
kdigo_2026_aki_uti_10_passos_1080x1920.png
diabetes_orientacoes_mae_1080x1920.png
vm_sdra_ventilacao_protetora_1080x1920.png
sepse_choque_refratario_dva_1080x1920.png
pocus_lung_blines_1080x1920.png
```

Evitar:

```text
Imagem do WhatsApp 2026-05-07 às 17.32.png
Captura de Tela 2026-05-07.png
```

---

## 7. Como cadastrar novo card no `cards.json`

Modelo:

```json
{
  "id": "slug-unico-do-card",
  "title": "Título visível do card",
  "theme": "nefro-aki-trs",
  "tags": ["AKI", "KDIGO", "UTI", "TEMI"],
  "explanation": "Explicação curta, prática e didática.",
  "source": "ChatGPT / Claude / guideline / artigo / protocolo",
  "status": "novo",
  "imageUrl": "assets/cards/nefro-aki-trs/nome_da_imagem.png",
  "createdAt": "2026-05-07",
  "related": ["Tema relacionado 1", "Tema relacionado 2"]
}
```

---

## 8. Regras de segurança

- Não subir dados identificáveis de pacientes.
- Não subir foto de rosto, prontuário, CPF, endereço, telefone ou exames com identificação.
- Não publicar prescrição individualizada de paciente real.
- Cards para familiares devem ter linguagem simples e sempre orientar sinais de alerta.
- Cards médicos devem declarar fonte quando envolver guideline, dose, indicação ou contraindicação.

---

## 9. Expansões futuras recomendadas

### Fase 2 — Relação com módulos da Enciclopédia

Adicionar campo:

```json
"links": [
  {"label": "Calculadoras UTI", "url": "../03_Calculadoras_UTI/index.html"},
  {"label": "Banco TEMI", "url": "../02_Banco_Questoes_TEMI/index.html"}
]
```

### Fase 3 — Trilhas de revisão

Adicionar:

```json
"track": "TEMI Nefro",
"difficulty": "hard",
"reviewIntervalDays": 7
```

### Fase 4 — Obsidian

Adicionar:

```json
"obsidianNote": "TEMI/Nefro/KDIGO_AKI_2026.md"
```

### Fase 5 — OCR/Busca avançada

No futuro, cada imagem pode ter um campo:

```json
"ocrText": "Texto extraído da imagem para busca"
```

---

## 10. Checklist final para Antigravity

- [ ] Criar branch `feature/card-feed-medico`.
- [ ] Copiar pasta `06_Card_Feed_Medico/` para raiz do repo.
- [ ] Adicionar link no menu superior da home.
- [ ] Adicionar botão no hero da home.
- [ ] Adicionar card do módulo na seção de módulos.
- [ ] Conferir caminhos relativos.
- [ ] Conferir se `06_Card_Feed_Medico/index.html` abre localmente.
- [ ] Conferir se `data/cards.json` carrega.
- [ ] Conferir se imagens faltantes mostram placeholder, sem quebrar o app.
- [ ] Fazer commit com mensagem: `feat: add medical card feed module`.
- [ ] Publicar no GitHub Pages.
- [ ] Abrir no iPhone e adicionar à Tela de Início.

