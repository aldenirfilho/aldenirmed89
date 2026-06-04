# Integração — Banco de Questões Padrão TEMI / AVC Agudo 🏆🧠

## Objetivo
Adicionar ao hub principal uma página chamada **Banco de Questões Padrão TEMI**, vinculada ao módulo AVC Agudo e conectada semanticamente a temas correlacionados.

## Caminho recomendado
Coloque a página aqui:

```txt
temas/avc-agudo/banco-questoes-padrao-temi/index.html
```

## Arquivos de dados
Copie para a pasta `/data` do hub:

```txt
data/qbank.temi.avc-agudo.json
data/connections.qbank.avc-agudo.json
```

## Inserir link na homepage
Use o snippet:

```html
<a href="temas/avc-agudo/banco-questoes-padrao-temi/index.html" class="btn primary">
  🏆 Banco de Questões Padrão TEMI
</a>
```

## Inserir link no módulo AVC
No arquivo:

```txt
temas/avc-agudo/index.html
```

adicione:

```html
<a href="./banco-questoes-padrao-temi/index.html" class="btn primary">
  🏆 Banco de Questões Padrão TEMI
</a>
```

## Como a linkagem automática funciona
Cada questão contém:

```json
"related": ["trombolise-avc", "hipertensao-emergencia", "neuroimagem-avc"]
```

O HTML cruza esses slugs com o objeto `topicRegistry`.

Quando um novo tema for criado, basta atualizar o registro:

```json
"trombolise-avc": {
  "title": "Trombólise no AVC",
  "path": "../../trombolise-avc/index.html",
  "status": "ativo"
}
```

O chip da questão passa a ser um link real.

## Integração com grafo do hub
O arquivo:

```txt
data/connections.qbank.avc-agudo.json
```

pode ser incorporado ao grafo geral do projeto. Cada conexão segue o padrão:

```json
{
  "source": "TEMI-AVC-001",
  "sourceType": "question",
  "target": "codigo-avc-10-minutos",
  "targetType": "topic",
  "relation": "aborda",
  "autoLink": true
}
```

## Regra para novos bancos
Para cada novo tema, criar:
- `data/qbank.temi.<slug>.json`
- `data/connections.qbank.<slug>.json`
- `temas/<slug>/banco-questoes-padrao-temi/index.html`

## Segurança
Material educacional para médicos. Adaptar à diretriz local, julgamento clínico e disponibilidade de rede.
