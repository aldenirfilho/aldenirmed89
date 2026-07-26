# Protocolo de contenção e resposta a incidentes

Versão 1.0.0 · 25 de julho de 2026

Este roteiro atende suspeitas de erro clínico, dado pessoal, segredo, fraude,
plágio, uso indevido, direito autoral, publicidade irregular, difamação,
credencial falsa ou falha técnica com impacto editorial.

## 1. Conter

- Suspender a próxima publicação.
- Classificar o item como `quarantine` ou `restricted-owner`.
- Remover da navegação pública ou substituir por aviso neutro quando o risco for
  relevante e a retirada puder ser feita com segurança.
- Se houver credencial exposta, revogá-la/rotacioná-la no provedor correto.
- Não apagar evidências nem ampliar publicamente uma acusação ainda não
  verificada.

## 2. Preservar

- Registrar URL, data, versão e commit.
- Calcular hash dos arquivos envolvidos.
- Guardar capturas e logs estritamente necessários em local privado.
- Registrar quem detectou, como detectou e quais ações imediatas ocorreram.
- Evitar copiar dados pessoais para issues públicas.

## 3. Avaliar

Classificar impacto e urgência:

- **Crítico:** risco clínico imediato, segredo ativo, dado sensível amplo ou
  fraude em curso.
- **Alto:** erro material, direito de uso plausivelmente violado, credencial
  profissional não comprovada ou acusação reputacional.
- **Moderado:** informação desatualizada, atribuição incompleta ou falha de
  transparência.
- **Baixo:** ortografia, layout, link ou metadado sem mudança de sentido.

Definir quais revisões são necessárias: clínica, editorial, privacidade,
segurança, propriedade intelectual ou jurídica.

## 4. Corrigir

- Aplicar a menor mudança que elimine o risco.
- Atualizar fonte, data, versão e registro editorial.
- Para erro material público, acrescentar nota de correção clara.
- Para conteúdo de terceiro, restaurar atribuição ou retirar até autorização.
- Para dado pessoal, remover cópias públicas e revisar retenção/cache.
- Retestar o artefato completo antes da republicação.

## 5. Comunicar

- Responder pelo Centro da Tripulação, sem expor manifestante ou dados sensíveis.
- Confirmar recebimento, protocolo e estado da apuração.
- Comunicar somente fatos verificados e o necessário para reduzir dano.
- Não prometer resultado, prazo impossível ou conclusão jurídica automática.
- Escalar a autoridade/profissional competente quando exigido pelo contexto.

## 6. Encerrar e aprender

- Documentar causa, correção, testes e versão restaurada.
- Atualizar checklist, regra do gate ou teste para evitar recorrência.
- Registrar decisão sobre publicação, arquivamento ou retirada.
- Incluir no feed público apenas a nota aprovada e proporcional.
- Manter evidência privada pelo tempo necessário e legítimo.

## Canais

- Manifestação geral:
  `../18_Centro_Tripulacao/index.html?canal=manifestacao#manifestacao`
- Correção:
  `../18_Centro_Tripulacao/index.html?canal=correcao#manifestacao`
- Possível uso indevido:
  `../18_Centro_Tripulacao/index.html?canal=uso-indevido#manifestacao`

O e-mail institucional só deve ser divulgado depois de configurado e testado.

