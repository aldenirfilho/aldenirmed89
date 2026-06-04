# Prompt pronto para o Google Antigravity — integrar RespiraSense ICU 🫁🚀

Você está trabalhando no repositório oficial da Enciclopédia Médica Intensiva / antigravity-consultas.

## Objetivo

Integrar o módulo estático `respirasense-icu` à página principal do projeto, mantendo funcionamento em GitHub Pages, sem backend e sem quebrar módulos já existentes.

## Ações obrigatórias

1. Copiar a pasta `respirasense-icu/` para a raiz do projeto.
2. Garantir que `respirasense-icu/index.html` abra corretamente via caminho relativo.
3. Inserir um card na homepage apontando para:

```text
./respirasense-icu/index.html
```

4. Se existir um sistema de cards/módulos por array JSON/JS, registrar o módulo usando `module.manifest.json` ou `homepage-registry-patch.js`.
5. Manter compatibilidade com GitHub Pages.
6. Não remover links ou módulos já existentes.
7. Priorizar layout mobile-first e tema escuro.
8. Validar que os links relativos `../index.html` e `./respirasense-icu/index.html` estão coerentes com a estrutura final.
9. Preservar avisos de segurança clínica.
10. Fazer commit com mensagem sugerida:

```text
feat: add RespiraSense ICU static PWA module
```

## Critérios de aceite

- A homepage exibe o card “RespiraSense ICU”.
- O clique abre a calculadora.
- A calculadora funciona offline após primeiro carregamento.
- O app permite exportar JSON.
- O app mantém snapshots apenas localmente no navegador.
- Nenhum dado clínico identificável é solicitado.

## Observação clínica obrigatória

Este módulo é educacional/pesquisa e não é dispositivo médico aprovado. Não substitui julgamento clínico, protocolo institucional, validação técnica, validação clínica ou aprovação regulatória.
