# Dossiê de integridade e proteção editorial

Versão 1.0.0 · 25 de julho de 2026  
Identificador editorial: `ATV · TURBO TEMI · ALD 360`

Este documento organiza controles editoriais, clínicos, de privacidade e de
propriedade intelectual do Antigravity Consultas. Ele não é parecer jurídico,
não promete impedir processos, fraude ou cópia e não substitui análise
profissional qualificada quando o caso concreto exigir.

## 1. Princípio central: dúvida não vai ao público

Todo material novo começa em um dos estados:

- `public-approved`: conteúdo geral revisado, com direitos e aprovação
  documentados;
- `public-cited`: conteúdo médico, científico ou factual, com fontes, data,
  revisão humana e limites;
- `restricted-owner`: rascunho, beta, conteúdo pessoal ou administrativo,
  disponível apenas em superfície autenticada;
- `quarantine`: dúvida sobre veracidade, direito de uso, privacidade,
  segurança, difamação, conflito ou credencial;
- `rejected`: publicação recusada.

Somente as duas primeiras classes podem entrar no artefato público. Ausência de
informação equivale a `quarantine`, nunca a aprovação.

## 2. Arquitetura de contenção

1. O repositório preserva fontes, histórico Git e decisões editoriais.
2. O construtor público usa allowlist explícita.
3. Arquivos privados, rascunhos, segredos e dados administrativos não são
   copiados.
4. O gate incremental verifica cada arquivo novo ou modificado.
5. A saída é novamente sanitizada e validada.
6. Conteúdo pessoal permanece no backend com controle por função e políticas
   de linha; GitHub Pages não é usado como cofre.
7. Suspeita relevante interrompe a publicação e abre revisão humana.

## 3. Matriz mínima de riscos

| Risco | Sinal de alerta | Decisão inicial | Evidência para liberar |
|---|---|---|---|
| Segredo ou credencial | senha, token, chave, JWT | bloquear | remoção e rotação quando aplicável |
| Dado pessoal | e-mail, telefone, CPF, cadastro | restringir | finalidade, minimização, base e revisão |
| Dado de paciente | nome, prontuário, imagem identificável | bloquear | anonimização robusta e autorização cabível |
| Direito incerto | imagem/texto sem origem ou licença | quarentena | autoria, licença ou permissão documentada |
| Alegação profissional | CRM, título, especialidade, grau | quarentena | fonte oficial ou documento verificado |
| Conteúdo médico | dose, diagnóstico, score, tratamento | citar/revisar | fonte rastreável, data, população, revisor e limites |
| Publicidade | preço, link de venda, afiliação | revisar | natureza comercial e conflito claramente informados |
| Difamação/fraude | acusação contra pessoa ou empresa | bloquear | análise factual e jurídica proporcional |
| IA | resposta sem conferência ou fonte fabricada | bloquear | revisão humana e referências abertas |
| Beta/pessoal | relato íntimo, reflexão não aprovada | restringir | consentimento consciente e aprovação para publicar |

## 4. Conteúdo clínico e científico

Cada item precisa indicar, conforme o risco:

- finalidade educacional e público-alvo;
- data da pesquisa e da revisão;
- fonte primária, diretriz ou documento oficial;
- população, exclusões, unidade, janela e versão;
- distinção entre evidência, síntese editorial e inferência;
- riscos de atualização, conflito ou aplicação fora do contexto;
- revisão humana identificada no registro editorial;
- alerta de que a ferramenta não substitui avaliação individual, protocolo
  local nem cuidado de emergência.

Fontes nunca legitimam uma conclusão que não sustentam. Citações extensas,
figuras e logotipos de terceiros exigem análise própria de direitos.

## 5. Autoria, atribuição e proveniência

O rodapé global atribui a idealização da plataforma e a responsabilidade
editorial a **Aldenir Rocha de Oliveira Filho**, com as funções declaradas de
editor, criador, codificador, produtor, atualizador e patrocinador independente.

Essa atribuição:

- não reivindica autoria sobre fatos, métodos, ciência ou obras de terceiros;
- não substitui o crédito individual de colaboradores;
- não transforma o selo interno em marca registrada ou certificação;
- não cria exclusividade sobre uma ideia abstrata.

Para obras autorais relevantes, conservar:

- título e descrição;
- autor e contribuidores;
- versão e data;
- arquivo exato e SHA-256;
- commit Git;
- fontes e estado de direitos;
- histórico de correções.

Hash e Git ajudam a demonstrar integridade e cronologia, mas não constituem
prova jurídica absoluta.

## 6. Estado de direitos

Enquanto não houver licença específica, o conteúdo editorial original é
oferecido para leitura gratuita com direitos reservados. Gratuidade não
significa domínio público.

- Links podem ser compartilhados.
- Citações breves devem indicar autor, plataforma, título, versão, data e URL,
  observados os limites legais.
- Reprodução extensa, adaptação, redistribuição ou exploração comercial exigem
  autorização quando não houver licença aplicável.
- Código, fontes, imagens, artigos, logotipos e dependências de terceiros
  preservam os respectivos direitos e licenças.
- Nenhuma licença Creative Commons está ativa por este documento.

## 7. Registros externos opcionais

A Fundação Biblioteca Nacional informa que o registro de obra intelectual é
facultativo e pode servir como meio adicional de documentação de autoria e
titularidade. O INPI mantém o procedimento oficial para busca e pedido de
registro de marca. Esses atos dependem de decisão e protocolo do titular; o
Antigravity apenas organiza materiais e não os executa automaticamente.

## 8. Privacidade

- Coletar somente o necessário para finalidade declarada.
- Evitar dados clínicos identificáveis em manifestações.
- Permitir manifestação anônima quando tecnicamente disponível.
- Manter diretório de usuários restrito ao administrador autorizado.
- Não gravar senha, token ou chave no navegador ou no repositório.
- Separar identidade, credenciais declaradas e verificação por fonte.
- Definir retenção e exclusão antes de ativar produção.
- Registrar acessos administrativos e incidentes sem expor conteúdo sensível.

## 9. Monitoramento contínuo

O fluxo contínuo possui duas vias:

1. **Gate de publicação:** executado em cada pull request e publicação para
   impedir novo conteúdo sem registro editorial.
2. **Radar normativo:** executado diariamente contra fontes oficiais
   allowlisted. Mudança, indisponibilidade ou redirecionamento abre pendência de
   revisão; não publica interpretação jurídica automaticamente.

O histórico público recebe somente atualizações humanas aprovadas, versionadas
e sem conteúdo sensível.

## 10. Fontes oficiais de referência

- Lei nº 9.610/1998:
  <https://www.planalto.gov.br/ccivil_03/leis/l9610.htm>
- Lei nº 13.709/2018:
  <https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm>
- Resolução CFM nº 2.336/2023:
  <https://sistemas.cfm.org.br/normas/visualizar/resolucoes/BR/2023/2336>
- Manual de Publicidade Médica:
  <https://publicidademedica.cfm.org.br/>
- Direitos Autorais · Fundação Biblioteca Nacional:
  <https://www.gov.br/bn/pt-br/atuacao/direitos-autorais-1/direitos-autorais>
- Marcas · INPI:
  <https://www.gov.br/inpi/pt-br/servicos/marcas>
- Creative Commons License Chooser:
  <https://creativecommons.org/chooser/>
- Creative Commons FAQ:
  <https://creativecommons.org/faq/>

## 11. Revisão periódica

Revisar este dossiê sempre que ocorrer:

- alteração relevante em fonte oficial monitorada;
- novo tipo de dado, login, assinatura ou integração;
- novo formato comercial, patrocínio ou afiliação;
- incidente, reclamação, correção material ou notificação de uso indevido;
- mudança de licença, titularidade, marca ou estrutura organizacional;
- criação de módulo clínico de maior risco.

