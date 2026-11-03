# Reametaverso

**Magia para imaginar. Tempo para viver.**

Site original de Aldenir Rocha de Oliveira Filho, no Projeto 360X. Versão de 31/10/2026.

## Estado real da entrega

O site completo foi construído: 7 páginas HTML, 6 escolas, atlas interativo, galeria das 10 imagens aprovadas, grimório local, exportação TXT, modo foco e layout responsivo.

**Nesta ramificação estão salvos o código JavaScript, o CSS, os dados editoriais, o gerador das sete páginas, a especificação e o importador.** Os arquivos binários das imagens não foram transferidos pelo conector. Esta ramificação não é uma publicação em produção.

**O pacote completo e pronto para abrir, com todos os HTMLs e imagens, está no arquivo `Reametaverso_Site_Completo_v1.zip` entregue na conversa.** Uma cópia privada também foi salva no OneDrive do titular com o nome `Reametaverso_Site_Completo_v1_20261031.zip`.

SHA-256 do pacote: `0275d2c57300542f1a79d4bd7f62eeba8a71f141872ac849c1ea5e7f89c9270d`.
Tamanho: 9.228.082 bytes, 51 arquivos.

## Abrir o pacote completo

Descompacte o ZIP e abra `reametaverso/index.html`, mantendo as pastas ao lado do arquivo. Não é necessário instalar bibliotecas. Para persistência previsível das notas, prefira servidor local ou HTTPS:

```sh
cd reametaverso
python3 -m http.server 8080
```

Abra `http://localhost:8080`.

## Completar os arquivos deste repositório

1. Faça checkout da ramificação `codex/reametaverso-site-20261031`.
2. Obtenha o ZIP completo entregue na conversa, sem descompactar.
3. Confira que você não fez alterações próprias na pasta `reametaverso/`. Faça backup caso tenha alterado.
4. Na raiz do repositório, execute:

```sh
python3 reametaverso/importar_site.py /caminho/Reametaverso_Site_Completo_v1.zip --replace
```

`--replace` permite atualizar os arquivos de código já presentes nesta pasta. O importador verifica SHA-256 e caminhos seguros, extrai somente arquivos de `reametaverso/`, não toca na página inicial do AldenirMed89, não usa rede, não executa scripts do ZIP e não faz commit ou push automaticamente.

Depois de conferir o resultado:

```sh
git add reametaverso
git commit -m "feat: adiciona páginas geradas e imagens do Reametaverso"
git push origin codex/reametaverso-site-20261031
```

A importação completa pode substituir este README pela documentação de uso incluída no ZIP.

## Gerar as páginas a partir do código salvo

Com Python 3 e Node.js disponíveis, execute:

```sh
python3 reametaverso/gerar_site.py
```

O gerador usa `assets/data.js` e escreve `index.html`, as seis páginas em `escolas/`, `assets/content.json`, o favicon e `.nojekyll`. Ele não faz rede, não publica o site e não gera as ilustrações. As imagens precisam ser importadas do pacote completo. A estrutura não requer Node.js em produção: o resultado é HTML, CSS e JavaScript estáticos.

## Recursos

- Sabedoria, Criação, Tecnologia, Natureza, Cuidado e Coragem, com páginas e três convites opcionais por escola.
- Atlas selecionável por pontos ou nomes.
- Galeria com filtros, ampliação, Escape e setas do teclado.
- Grimório de livre escolha: notas até 3.000 caracteres, exportação TXT e confirmação antes da exclusão.
- Modos Explorar, Criar e Pausar.
- Modo foco e respeito à preferência de movimento reduzido.
- Manifesto, Selo A conceitual e informações de privacidade.
- Sem dependências de execução, fontes externas, cadastro, pagamentos ou serviços de IA.

## Verificações e limites

A implementação completa passou por 40 verificações de interface em Chromium com DOM local, imagens embutidas e Storage simulado. Foram conferidos links de 7 páginas e sintaxe JavaScript. Larguras: 320, 390, 768, 1024 e 1440 pixels.

A política do ambiente bloqueou navegação HTTP/file://: hospedagem e persistência nativa do navegador não foram validadas. Um teste suplementar de armazenamento bloqueado não foi concluído e não conta como aprovado. Consulte `docs/QA.md` no pacote.

Uma cópia local do gerador portátil foi executada e suas sete páginas coincidiram com os HTMLs do pacote. Os arquivos de origem no GitHub ainda precisam de verificação final após importar as imagens e publicar no ambiente escolhido.

## Privacidade e natureza do projeto

O site não utiliza analytics, publicidade, login, API de IA, pagamentos ou envio das notas a servidor. O grimório usa armazenamento local. O provedor de hospedagem pode manter registros técnicos próprios.

Universo ficcional e cultural. As escolas não são diagnósticos nem classificações de caráter. O Selo A é uma proposta conceitual, sem certificações emitidas. Não há alegação de efeitos sobrenaturais verificáveis.

Nenhum arquivo anterior do repositório foi substituído, nenhum segredo foi incluído e nenhuma configuração de produção foi alterada. A licença pública de reutilização da identidade, textos e obras permanece a definir pelo titular.
