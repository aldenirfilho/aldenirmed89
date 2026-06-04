# GPT Card Feed Médico — Aldenir Rocha 🧠📲

## Objetivo

Criar um **banco visual em formato de feed** para revisar imagens/cards gerados por IA, especialmente:

- UTI / Medicina Intensiva
- TEMI
- Clínica Médica / R3
- Protocolos de plantão
- Imagens para familiares/pacientes
- Produtividade médica, Obsidian, Antigravity e GitHub

O arquivo principal é:

```text
gpt-card-feed-medico.html
```

Ele funciona como uma página única: abre no navegador, importa imagens, organiza por tema, permite comentários, tags, revisão e backup.

---

## O que esta versão já faz ✅

1. **Importa várias imagens de uma vez**  
   PNG, JPG, JPEG, WEBP etc.

2. **Cria feed de rolagem estilo galeria**  
   Ideal para iPhone/iPad/MacBook.

3. **Sugere tema automaticamente pelo nome do arquivo**  
   Exemplos: KDIGO, AKI, TRS, VM, Sepse, Diabetes, POCUS, TEMI.

4. **Permite editar cada card**
   - título
   - tema
   - tags
   - explicação/comentário
   - notas pessoais
   - fonte/origem
   - status de estudo

5. **Modo revisão**
   - novo
   - revisar
   - aprendendo
   - dominado
   - arquivado

6. **Favoritos**
   Para marcar os cards de maior valor.

7. **Busca e filtros**
   Busca por título, tema, tag, explicação, nota e fonte.

8. **Backup JSON**
   Exporta tudo para um arquivo `.json`, inclusive imagens em Base64/dataURL.

9. **Importação de backup**
   Permite restaurar o acervo em outro navegador/dispositivo.

---

## Estrutura recomendada no iCloud Drive ☁️

Crie uma pasta:

```text
iCloud Drive/GPT_Card_Feed_Medico/
```

Dentro dela:

```text
GPT_Card_Feed_Medico/
├── 00_APP/
│   └── gpt-card-feed-medico.html
├── 01_ENTRADA_IMAGENS_GPT/
│   ├── UTI/
│   ├── TEMI/
│   ├── Diabetes_Familia/
│   ├── Nefro_AKI_TRS/
│   ├── VM_Sepse_Choque/
│   └── IA_Produtividade/
├── 02_BACKUPS_JSON/
├── 03_PROMPTS_OUTRAS_IAS/
├── 04_EXPORTAR_PARA_GITHUB/
└── 99_ARQUIVO/
```

### Rotina prática

1. Gerou uma imagem no ChatGPT.
2. Baixe a imagem.
3. Salve em `01_ENTRADA_IMAGENS_GPT/tema`.
4. Abra `gpt-card-feed-medico.html`.
5. Clique em **Importar imagens**.
6. Edite título/tema/tags/explicação.
7. Ao final, clique em **Exportar backup**.
8. Salve o JSON em `02_BACKUPS_JSON`.

---

## Como abrir no Mac

1. Baixe o arquivo `gpt-card-feed-medico.html`.
2. Salve no iCloud Drive.
3. Dê duplo clique.
4. Abra no Safari, Chrome ou Edge.
5. Importe as imagens.

---

## Como usar no iPhone/iPad

1. Salve o HTML no iCloud Drive.
2. Abra pelo app **Arquivos**.
3. Compartilhe/abra no Safari, quando possível.
4. Use **Importar imagens** e selecione imagens do iCloud/Fotos.
5. Para uso frequente, hospede no GitHub Pages e adicione à Tela de Início.

> Observação: por segurança dos navegadores, um HTML local não consegue vigiar automaticamente uma pasta do iCloud e puxar imagens sozinho. O fluxo seguro é importar manualmente e exportar backup.

---

## Evolução futura sugerida 🚀

### Fase 1 — MVP atual
- HTML único offline-first.
- Importação manual.
- Backup JSON.

### Fase 2 — GitHub Pages
Criar estrutura:

```text
/assets/cards/
/data/cards.json
index.html
```

A página passa a carregar automaticamente cards do `cards.json`.

### Fase 3 — PWA
Adicionar:
- manifest
- service worker
- ícone
- instalação na Tela de Início
- cache offline

### Fase 4 — Obsidian + Antigravity
Cada card passa a ter:
- nota Markdown fonte
- imagem em `/assets`
- metadados JSON
- links para temas correlatos
- trilhas TEMI/R3

### Fase 5 — App nativo
Criar app em Swift/SwiftUI com:
- iCloud Drive real
- CloudKit
- leitura de pasta
- sincronização entre aparelhos
- OCR local
- revisão espaçada mais avançada

---

## Padrão de nome de arquivo recomendado

Use nomes assim:

```text
KDIGO_2026_AKI_UTI_10_passos_1080x1920.png
TEMI_VM_SDRA_PEEP_DrivingPressure_1080x1920.png
Diabetes_Mae_Insulina_Horarios_1080x1920.png
Sepse_Choque_Refratario_DVA_1080x1920.png
POCUS_Lung_USG_B_Lines_1080x1920.png
```

Isso ajuda o app a sugerir tema e tags.

---

## Segurança médica e LGPD ⚠️

- Não inserir imagem com nome, prontuário, CPF, endereço, telefone ou rosto de paciente.
- Não publicar no GitHub material com dados sensíveis.
- Cards médicos públicos devem ser educacionais, não prescrição individualizada.
- Protocolos devem ser adaptados à instituição, farmácia local e julgamento clínico.

---

## Comandos úteis dentro do app

- `Cmd/Ctrl + I`: importar imagens.
- `Cmd/Ctrl + E`: exportar backup.
- Botão **Modo revisão**: mostra cards para revisar.
- Botão **Imprimir/PDF**: gera versão para impressão ou PDF.

---

## Ideia-mãe

Transformar cada imagem boa gerada por IA em um **ativo reutilizável**:

```text
Imagem → Card → Comentário → Revisão → Tema → Obsidian → GitHub/Produto
```

