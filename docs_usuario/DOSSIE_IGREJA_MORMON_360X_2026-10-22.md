# Dossiê Igreja Mórmon — Auditoria Religiosa 360X

Edição 1.0 — 22/10/2026. Rota: `ecossistema/auditoria-religiosa-360/dossie-igreja-mormon.html`.

## Conteúdo e perímetros

- HTML autocontido, sem dependências de CDN, fontes externas ou rastreamento. Carteira pesquisável incorporada; funciona como arquivo baixado.
- Filing Ensign Peak CIK 1454984, accession 0001454984-26-000004: 30/06/2026, protocolado 14/08/2026. Total US$ 60.816.389.385; 1.724 linhas. Soma reconciliada exatamente. Valores em dólares.
- CSV completo extraído da tabela SEC renderizada; o XML bruto retornou 403 no ambiente de pesquisa. Não é cópia binária do filing. Capa e tabela originais estão citadas.
- Percentuais por título/emissor usam apenas o total 13F. Alphabet A+C agregadas no ranking. Classificação editorial por instrumento: 29 ETFs identificados por whitelist de emissores = 2,002698%; outros títulos = 97,997302%. Método no JSON.
- Setores amplos de somente 15 emissores; 57,0753% sem classificação nesta revisão. Não é GICS nem análise completa das exposições dos ETFs.
- US$ 321 bi de ativos e US$ 231 bi de reservas são estimativas independentes The Widow’s Mite Report para fim de 2025 (relatório original, pp. 5–7). São perímetros encaixados, não somáveis ao 13F. Faixas por classe são modeladas, não alocação oficial.
- Despesas sociais de US$ 1,58 bi são autorrelato da Igreja para 2025; incluem bens, serviços e ajuda principalmente a membros, sem monetizar as horas voluntárias.
- Gestão externa é vínculo contratual, não religião individual. Não há composição religiosa global publicada dos profissionais.

## Índice editorial e simulador

O índice é cobertura documental na amostra pública: oito critérios iguais, 0/1/2, soma 5/16 = 31,25% (31/100). Não mede fé, probidade ou legalidade, não faz ranking e não aplica penalidade histórica extra pela SEC. Cada ponto representa 6,25 pontos percentuais; rubrica experimental, sujeita a revisão.

Simulador: base × fração × parcela realizável × câmbio hipotético. Divisão por pesos normalizados, ou alternativas exclusivas não somáveis. Custo unitário = implantação + custo anual × prazo. Usa unidades inteiras e mostra saldo. Custos, câmbio e liquidez são premissas arbitradas editáveis; sem alegação de preços oficiais, viabilidade, número de beneficiários ou preservação efetiva. Inclui validação para campos vazios, negativos, zero indevido e precisão numérica.

## Atualizar com segurança

1. Localizar filing realmente publicado, guardar data do período e do protocolo e conferir emendas. Não presumir trimestre corrente disponível.
2. Extrair todas as linhas, reconciliar soma com a capa; preservar unidade monetária.
3. Atualizar CSV, JSON de metadados, mapeamento setorial e dados incorporados ao HTML no mesmo commit; revisar textos e denominadores.
4. Rever relatório patrimonial independente e relatório social. Não extrapolar taxas de retorno para declarar patrimônio atual.
5. Reexecutar validação de HTML/âncoras, cálculos, simulador, acessibilidade, mobile/desktop e gate editorial; conferir o artefato e a rota pública após deploy.

## Publicação e reversão

Alteração autorizada pelo pedido expresso de criação e publicação neste repositório. Redação e revisão técnica assistidas por IA; auditoria contábil/jurídica independente não realizada. Fontes e limites aparecem na própria página. Originais locais e conteúdo do portal preservados. Reversão: reverter o commit desta integração; não apagar diretórios ou sobrescrever outros módulos.

O builder já inclui `ecossistema`. Há workflows de deploy seguro e rápido; confirmar o SHA publicado e a rota HTTP, não apenas o status de um workflow. A política editorial atual ignora o prefixo deste portal na seleção incremental; por isso a verificação específica deve chamar `scan_file` com registro obrigatório, sem retirar controles canônicos.

## Compatibilidade do verificador editorial

O scanner confundia valores USD com telefones e um nome de empresa energética com tema médico por coexistir com propriedades de largura mínima no CSS. Após conferência dos campos contra a SEC, o CSV usa QUOTE_MINIMAL padrão e valores JSON valueUSD usam notação numérica exponencial equivalente (e0). O literal JSON do emissor usa escape Unicode padrão; o nome decodificado permanece idêntico. Os controles de segurança não foram alterados. A equivalência dos dados decodificados deve ser verificada antes da publicação; não há telefone ou conduta clínica nesses campos.
