
# Como editar imagem e PDF dentro do Obsidian 🧩

A ideia central é esta: o Obsidian é excelente para **organizar, visualizar, linkar e anotar** arquivos, mas ele não é, nativamente, um editor completo de imagem ou PDF. Imagens e PDFs entram no seu Vault como **anexos comuns**, e podem ser incorporados às notas com links internos; o próprio Obsidian informa que anexos como imagens e PDFs são arquivos regulares dentro do Vault, acessíveis também pelo sistema de arquivos.  

---

## **1. O que dá para fazer sem plugins**

Você pode colocar uma imagem ou PDF dentro de uma nota assim:

```markdown
![[minha-imagem.png]]

![[meu-artigo.pdf]]
```

No desktop, ao arrastar um arquivo suportado para uma nota, o Obsidian pode incorporá-lo automaticamente; imagens, áudio, vídeo e PDFs estão entre os tipos que podem ser embutidos nas notas.  

  

Também dá para controlar o tamanho visual de uma imagem:

```markdown
![[minha-imagem.png|400]]
```

Ou incorporar um PDF:

```markdown
![[artigo.pdf]]
```

Mas atenção: isso **não edita o arquivo original**. Apenas exibe o arquivo dentro da nota.

---

# **2. Editar imagens dentro do Obsidian 🖼️**

## **Opção A — edição simples com Markdown**

Para apenas **mostrar menor**, **organizar**, **linkar** ou **referenciar** a imagem:

```markdown
![[imagem.png|300]]
```

Você também pode criar uma nota de contexto:

```markdown
# Análise da imagem X

![[imagem.png|500]]

## Observações
- Ponto importante:
- Relação com:
- Fonte:
```

Essa é a forma mais estável e simples.

---
## **Opção B — usar o plugin**

**Image Converter**

Para editar de verdade dentro do Obsidian — cortar, girar, anotar, desenhar, comprimir, redimensionar — o plugin mais direto é o **Image Converter**. A documentação do plugin descreve recursos como anotação e marcação sobre imagens dentro do Obsidian, além de cortar, girar e inverter imagens.  

### **Caminho sugerido**

1. Abra **Settings / Configurações**.
2. Vá em **Community plugins / Plugins da comunidade**.
3. Desative o **Safe mode**, se necessário.
4. Clique em **Browse / Procurar**.
5. Pesquise por **Image Converter**.
6. Instale e ative.
7. Clique com o botão direito sobre uma imagem na nota ou no explorador de arquivos.
8. Use opções como:
    - **Annotate / Markup**
    - **Resize**
    - **Crop**
    - **Rotate**
    - **Compress**
    - **Convert**

Esse caminho é ótimo para screenshots, esquemas, mapas mentais exportados, imagens de livros e imagens de pesquisa.

---


## **Opção C — usar**

**Excalidraw**

**para anotar imagens**

Se o objetivo é **desenhar por cima**, fazer setas, círculos, comentários visuais, esquemas e mapas, o plugin **Excalidraw** é excelente. Ele integra o Excalidraw ao Obsidian, permite guardar e editar arquivos Excalidraw dentro do Vault, incorporar desenhos nas notas e criar links entre desenhos e documentos.  

Fluxo recomendado:

```markdown
# Comentário visual sobre imagem

![[imagem-original.png]]

[[Desenho - análise da imagem.excalidraw]]
```

Use o Excalidraw quando você quiser criar uma **camada de raciocínio visual** sobre a imagem, sem necessariamente alterar a imagem original.

---

# **3. Editar PDFs dentro do Obsidian 📄**

## **O que o Obsidian faz nativamente**

O Obsidian permite **abrir, visualizar e incorporar PDFs** nas notas. Por exemplo:

```markdown
![[livro.pdf]]
```

Também é possível usar o **Canvas** para organizar notas, imagens, PDFs, vídeos, áudio e páginas em um espaço visual maior.  

Mas, nativamente, o Obsidian é mais um **visualizador e organizador** de PDF do que um editor completo.

---

## **Melhor opção para PDF: plugin**

**PDF++**

Para anotar PDFs dentro do Obsidian, o plugin mais forte hoje é o **PDF++**. Ele melhora o visualizador nativo de PDF e permite usar backlinks para transformar seleções de texto em destaques/anotações, além de permitir, opcionalmente, adicionar anotações diretamente ao arquivo PDF.  

### **O que o PDF++ permite fazer**

Com ele, você pode:

|**Recurso**|**Para que serve**|
|---|---|
|Destacar trechos|Marcar textos importantes no PDF|
|Criar links para páginas|Voltar exatamente ao ponto citado|
|Criar notas conectadas ao PDF|Transformar leitura em conhecimento permanente|
|Fazer backlinks para seleções|Relacionar trecho do PDF com ideias próprias|
|Usar cores de destaque|Organizar por tema, argumento ou prioridade|
|Editar o PDF diretamente, com cuidado|Inserir destaques visíveis fora do Obsidian|

O próprio README do PDF++ informa que ele pode anotar PDFs com highlights por meio de links para seleção de texto, adicionar anotações diretamente nos PDFs e melhorar o visualizador/embeds nativos de PDF.  

---

## **Fluxo prático com PDF++**

Depois de instalar o plugin:

1. Coloque o PDF em uma pasta do Vault, por exemplo:

```text
/Anexos/PDFs/
```

2. Crie uma nota para o PDF:

```markdown
# Nome do artigo ou livro

PDF:: [[arquivo.pdf]]
Autor::
Ano::
Tema::
Status:: lendo

## Ideias principais

## Citações conectadas

## Minhas conclusões

## Relações com outras notas
- [[Tema relacionado]]
- [[Autor relacionado]]
- [[Conceito relacionado]]
```

3. Abra o PDF ao lado da nota.
4. Selecione um trecho no PDF.
5. Use o PDF++ para copiar o link da seleção.
6. Cole na sua nota com seu comentário.

Exemplo:

```markdown
## Ideia sobre produtividade

O autor defende que a organização do ambiente reduz a carga cognitiva.  
Fonte: [[artigo.pdf#page=12]]

Minha interpretação:
- Isso se conecta com [[Gestão da atenção]]
- Também dialoga com [[Sistemas de produtividade]]
```

---

# **4. Quando editar fora do Obsidian**

Use um editor externo quando precisar de edição pesada:

|**Tipo de edição**|**Melhor ferramenta**|
|---|---|
|Remover fundo de imagem|Photoshop, GIMP, Photopea, Canva|
|Editar imagem tecnicamente|Photoshop, Affinity Photo, GIMP|
|Preencher formulário PDF|Adobe Acrobat, PDF Expert, Xodo|
|Assinar PDF|Adobe Acrobat, Preview/macOS, Xodo|
|Reordenar páginas de PDF|PDFsam, Acrobat, Preview/macOS|
|OCR avançado|Acrobat, ABBYY, OCRmyPDF|

Fluxo simples:

1. Guarde o arquivo dentro do Vault.
2. Abra com o aplicativo externo.
3. Edite e salve por cima.
4. Volte ao Obsidian.
5. A nota continuará apontando para o mesmo arquivo.

Esse é um fluxo muito bom porque o Obsidian continua sendo o **centro de organização**, enquanto o editor externo faz a edição pesada.

---

# **5. Minha recomendação de setup 🧠**

Para um fluxo forte de estudo, pesquisa e produtividade:

|**Necessidade**|**Solução recomendada**|
|---|---|
|Incorporar imagens e PDFs|Recurso nativo do Obsidian|
|Redimensionar visualmente imagens|Markdown `![[imagem.png\|400]]`|
|Cortar, comprimir e anotar imagens|**Image Converter**|
|Fazer desenhos, setas e mapas visuais|**Excalidraw**|
|Ler, destacar e linkar PDFs|**PDF++**|
|Edição pesada de PDF|Editor externo + arquivo salvo no Vault|
|Organização visual de materiais|**Canvas**|

O cuidado principal: se você ativar edição direta de PDF no PDF++, faça backup, porque a própria documentação alerta que a modificação direta de PDFs exige autorização explícita e deve ser usada com cautela.  

---

# **6. Modelo de pasta recomendado**

```text
📁 Vault
 ├── 📁 00 - Inbox
 ├── 📁 01 - Notas
 ├── 📁 02 - Pesquisas
 ├── 📁 03 - Leituras
 ├── 📁 90 - Anexos
 │    ├── 📁 Imagens
 │    ├── 📁 PDFs
 │    └── 📁 Excalidraw
 └── 📁 99 - Templates
```

Nas configurações do Obsidian, vá em:

```text
Settings → Files & Links → Default location for new attachments
```

E defina algo como:

```text
90 - Anexos
```

O Obsidian permite configurar o local padrão dos anexos em **Settings → Files & Links → Default location for new attachments**.  

---

# **7. Mini-guia decisório**

Use esta lógica:

```text
Quero apenas ver a imagem/PDF na nota?
→ Use ![[arquivo]]

Quero mudar só o tamanho visual da imagem?
→ Use ![[imagem.png|400]]

Quero cortar, girar, comprimir ou desenhar na imagem?
→ Use Image Converter

Quero fazer setas, esquemas e explicações visuais?
→ Use Excalidraw

Quero destacar texto e criar links para trechos do PDF?
→ Use PDF++

Quero assinar, preencher formulário ou alterar páginas do PDF?
→ Use editor externo
```

---

# **Script de fluxo por temas para adicionar ao Obsidian**

```markdown
---
tipo: guia
tema: Obsidian
assunto: Edição de imagens e PDFs
status: permanente
criado: 2026-04-20
tags:
  - obsidian
  - produtividade
  - pdf
  - imagem
  - anexos
  - plugins
  - fluxo-de-trabalho
plugins-relacionados:
  - Image Converter
  - PDF++
  - Excalidraw
  - Canvas
---

# Como editar imagens e PDFs dentro do Obsidian

## 1. Conceito central
O Obsidian organiza imagens e PDFs como anexos dentro do Vault.  
Eles podem ser incorporados em notas, conectados por links internos e integrados a fluxos de pesquisa.

## 2. Fluxo para imagens
- Incorporar imagem: `![[imagem.png]]`
- Redimensionar visualmente: `![[imagem.png|400]]`
- Editar/anotar/cortar: usar [[Plugin - Image Converter]]
- Criar análise visual: usar [[Plugin - Excalidraw]]

## 3. Fluxo para PDFs
- Incorporar PDF: `![[arquivo.pdf]]`
- Criar nota-fonte: [[Template - Nota de PDF]]
- Destacar e linkar trechos: usar [[Plugin - PDF++]]
- Edição pesada: abrir em editor externo e salvar no Vault

## 4. Relações com outras pesquisas
- [[Obsidian - Gestão de anexos]]
- [[Obsidian - Fluxo de leitura acadêmica]]
- [[Obsidian - PDF++]]
- [[Obsidian - Excalidraw]]
- [[Obsidian - Canvas]]
- [[Sistema de produtividade pessoal]]
- [[Pesquisa permanente]]
- [[Zettelkasten]]
- [[PKM - Personal Knowledge Management]]

## 5. Perguntas de conexão
- Este PDF gera quais notas permanentes?
- Esta imagem representa qual conceito?
- Que trecho do PDF deve virar uma nota própria?
- Esta anotação se conecta com qual projeto?
- Este material pertence a uma pesquisa, curso, artigo ou decisão prática?

## 6. Próximas ações
- [ ] Criar pasta `90 - Anexos/Imagens`
- [ ] Criar pasta `90 - Anexos/PDFs`
- [ ] Instalar plugin Image Converter
- [ ] Instalar plugin PDF++
- [ ] Instalar plugin Excalidraw
- [ ] Criar template para notas de PDF
- [ ] Criar template para análise de imagem
```