# OCR local — componentes de terceiros

Esta pasta mantém os arquivos necessários para executar OCR no próprio
dispositivo, sem enviar imagens a uma API externa.

## Tesseract.js

- Projeto: `naptha/tesseract.js`
- Versão: 7.0.0
- Licença: Apache-2.0
- Arquivos: `tesseract.min.js` e `worker.min.js`
- Licença integral: `LICENSE-tesseract-js.md`

## Tesseract.js Core

- Projeto: `naptha/tesseract.js-core`
- Versão: 6.1.2
- Licença: Apache-2.0
- Arquivo: `tesseract-core-lstm.wasm.js`
- Licença integral: `LICENSE-tesseract-core.txt`

## Dados de idioma

- Pacotes: `@tesseract.js-data/por` e `@tesseract.js-data/eng`
- Versão: 1.0.0, conjunto `4.0.0_best_int`
- Arquivos: `lang/por.traineddata.gz` e `lang/eng.traineddata.gz`
- Origem: dados de treinamento compatíveis com Tesseract distribuídos pelos
  pacotes oficiais do ecossistema Tesseract.js.

Os arquivos são servidos pela mesma origem do Card Feed e podem ser armazenados
pelo service worker para reutilização offline. O texto reconhecido é uma camada
de apoio: deve ser conferido contra a imagem original antes de orientar estudo
ou decisão clínica.
