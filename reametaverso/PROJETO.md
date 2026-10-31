# Especificação editorial e funcional

## Direção visual
Gótico contemporâneo, arquitetura monumental de pedra com vidro e bronze, azul profundo, dourado discreto, luz acolhedora e natureza. Sem estética infantil de jogo de plataformas. Tipografia editorial, blocos curtos e navegação sem efeitos obrigatórios.

## Escolas
| Escola | Vocação | Território narrativo |
|---|---|---|
| Sabedoria | Leitura, memória, discernimento | Biblioteca dos Horizontes |
| Criação | Arte, invenção, expressão | Ateliês da Aurora |
| Tecnologia | Ciência, IA, autonomia | Observatório das Possibilidades |
| Natureza | Vida, preservação, equilíbrio | Jardins do Permanecer |
| Cuidado | Acolhimento, escuta, convivência | Claustros do Encontro |
| Coragem | Discernimento, preparo, perseverança | Fortaleza dos Recomeços |

Todas são afinidades voluntárias, combináveis e revisáveis. Não existem rankings morais ou classificação por diagnóstico. O Tempo das Essências é o centro ficcional de encontro das escolas.

## Arquitetura técnica da implementação entregue
- index.html: apresentação, cartões de escolas, atlas, Tempo das Essências, galeria, manifesto, Selo A e convite ao grimório.
- escolas/{sabedoria,criacao,tecnologia,natureza,cuidado,coragem}.html: seis páginas próprias, com três práticas opcionais cada.
- assets/data.js: dados editoriais e ordem das dez obras.
- assets/content.json: cópia legível dos dados, não carregada pelo navegador.
- assets/app.js: interações locais, atlas, diálogos, notas, exportação, exclusão confirmada, modo foco e menu móvel.
- assets/styles.css: visual responsivo, impressão e preferência de movimento reduzido.
- assets/images/: imagens completas, miniaturas e recortes WebP.
- tests/ e docs/: verificações, limites do ambiente e prévias.

## Privacidade
Não incluir dados de pacientes, endereços pessoais, informações financeiras, credenciais ou dados de saúde do autor. Nenhum destes dados integra o pacote. O grimório utiliza apenas armazenamento local, sem serviço remoto.

## Recursos deliberadamente ausentes
Não simular cadastro, comunidade, pagamento, emissão de certificados ou chat com IA. Essas funções exigiriam projetos próprios, consentimento, backend e testes adicionais. O site atual não oferece esses serviços.

## Implantação
A alteração está isolada em pasta e ramificação próprias. Não substituir a página inicial existente, não mudar domínio e não publicar automaticamente. A versão completa deve ser importada do pacote aprovado antes de integrar à produção.
