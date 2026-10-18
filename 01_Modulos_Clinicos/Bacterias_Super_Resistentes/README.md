# Bactérias super resistentes — MDR, XDR e PDR

Seção independente de Infectologia, estática, sem dependências externas. Conteúdo
essencial permanece no HTML quando JavaScript estiver indisponível. O módulo tem
filtros por mecanismo, busca sem distinção de acento, tabela de doses com fontes por
linha, tema global, impressão e checklist educacional.

Estado editorial: **em revisão médica**. A preparação técnica não equivale a
homologação clínica, aprovação regulatória brasileira ou validação institucional.
Ver `module.manifest.json` e `index.html#revisao`.

## Arquivos e verificação

- `index.html`: definições, cinco mecanismos, dez esquemas de referência e fontes.
- `assets/styles.css`: responsividade, impressão e movimento reduzido.
- `assets/theme-bootstrap.js`: preferência global aplicada antes da renderização.
- `assets/app.js`: filtros, tema, impressão, cópia e checklist.

Checagens focadas: sintaxe JavaScript, referências locais e âncoras; no navegador,
buscar NDM, filtrar CRAB, verificar estado vazio/limpeza, tema claro/escuro, recarga
das marcações, reinício, armazenamento bloqueado, largura móvel e impressão.

Teste de lógica com DOM simulado e sem dependências:

```sh
node tests/amr-module.test.cjs
```

Este teste valida interações e persistência, sem afirmar inspeção visual de um
navegador real ou validação do conteúdo médico.

O teste pertence à pasta raiz `tests/`, excluída do artefato público. O módulo
mantém o modo `public-preview`, com revisão médica pendente e sem revisor clínico
nomeado. No site público, o builder pode injetar o contador agregado do portal;
o checklist e seus valores não são transmitidos.

## Cuidados de manutenção

- Conservar dose total, componentes, intervalo, infusão e limites renais juntos.
- Distinguir a infusão otimizada da diretriz da infusão de bula quando diferirem.
- Não converter `I` moderno em resistência, nem confirmar PDR com painel limitado.
- Não guardar texto livre, dados de pacientes ou exames no checklist.
- A cópia do roteiro usa caixas vazias; marcações antigas não viram prontuário.
- `antigravity:amr:study-checklist:v1` contém somente booleanos de revisão local.
- Qualquer ativação clínica exige revisão humana e registro editorial compatível.

Fontes verificadas em 18/10/2026: IDSA 2026 e tabela de doses, consenso
Magiorakos 2012, EUCAST, OMS 2024, CDC, ANVISA 2023 e bulas profissionais
DailyMed/FDA. Links e limites de contexto estão no módulo.
