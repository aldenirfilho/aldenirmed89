# Dossiê Igreja Mórmon — Auditoria Religiosa 360X

Edição 1.3 — 22/10/2026. Rota: `ecossistema/auditoria-religiosa-360/dossie-igreja-mormon.html`.

## Conteúdo e perímetros

- HTML autocontido, sem dependências de CDN, fontes externas ou rastreamento. Carteira pesquisável, dados dos 29 ETFs e interface incorporados; funciona como arquivo baixado, sem consulta ao vivo.
- Filing Ensign Peak CIK 1454984, accession 0001454984-26-000004: 30/06/2026, protocolado 14/08/2026. Total US$ 60.816.389.385; 1.724 linhas. Soma reconciliada exatamente. Valores em dólares.
- CSV completo extraído da tabela SEC renderizada; o XML bruto retornou 403 no ambiente de pesquisa. Não é cópia binária do filing. Capa e tabela originais estão citadas.
- Percentuais por título/emissor usam apenas o total 13F. Alphabet A+C agregadas no ranking. Classificação editorial por instrumento: 29 ETFs identificados por whitelist de emissores = 2,002698%; outros títulos = 97,997302%. Método no JSON.
- Classificação ampliada v1.1: 96,281806% por rótulos Nasdaq em 1.537 linhas; ETFs separados 2,002698% / 29 linhas; sem setor ou em revisão 1,715496% / 158 linhas. Não é GICS, setor SEC ou análise completa dos subjacentes. Mapeamento parcial da edição 1.0 preservado como histórico.
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

## Classificação setorial ampliada — edição 1.1

Os 57,0753497% anteriormente abertos (US$ 34.711.166.918) foram particionados em 53,3571552 pontos percentuais do 13F com setor Nasdaq (US$ 32.449.895.275), 2,0026984 pp em ETFs (US$ 1.217.968.868) e 1,7154961 pp sem setor ou em revisão (US$ 1.043.302.775). Somente este bloco era residual; denominador de todas as parcelas continua US$ 60.816.389.385. 96,994331% do bloco original foi organizado em setores ou fundos; 3,005669% do bloco segue sem setor. A cobertura por quantidade com rótulo é 1.537/1.724, diferente da cobertura por valor.

Fonte setorial: endpoint público Nasdaq Stock Screener consultado em 22/10/2026. Campo asOf nulo; não existe prova de que o setor era este em 30/06. A taxonomia é a do fornecedor, não GICS. Alphabet/Meta em Tecnologia, Tesla em Industriais, P&G/Mastercard em Consumo discricionário. GE Aerospace vem como Technology / Consumer Electronics/Appliances: excluída do agregado por conflito material com a atividade oficial de aviação (0,654466% do 13F), sem atribuir silenciosamente outro setor. Rótulo bruto e fonte preservados. Não se afirma adequação econômica certificada dos demais rótulos.

Snapshot original: 6.999 referências; SHA-256 `367528fadd0708386d37b70afda898ef65338ecd1b2fc2b3dc048b60912259d6`. Snapshot público reduzido: 1.715 referências relevantes com symbol/name/sector/industry/url, inclusive candidatos colidentes e tickers manuais; preços excluídos. Mesmo algoritmo aplicado ao snapshot completo e reduzido deve produzir resultado idêntico.

Identidades: igualdade por nome normalizado, expansão de abreviações, revisão de colisões e concordância setor/indústria. 68 aliases de identidade atual revisados com fontes primárias. Isso não confirma historicamente todos os CUSIPs nem todas as classes; tickers são referências atuais. Não se aceitou fuzzy matching. FIRST BANCORP bloqueado automaticamente e resolvido manualmente como FBP/CUSIP 318672706 via holdings do Harbor AESB e documento SEC. BDCs mantêm rótulo financeiro do emissor, sem decomposição dos ativos. Berkshire (setor vazio), Ferguson/Miscellaneous, MSDL, ET e AVB permanecem com limites explícitos. GE é a exclusão por conflito de atividade.

Arquivos adicionados:

- `data/ensign-peak-2026-q2-setores.csv`: todas as 1.724 posições enriquecidas, motivo, método e fonte.
- `data/setores-2026-q2.json`: totais, setores, resíduos, regras de normalização, hashes e posições.
- `data/nasdaq-setores-snapshot-2026-10-22.json`: subconjunto do snapshot do provedor utilizado.
- `data/revisao-identidades-setores-2026-q2.json`: fontes primárias para aliases e pendências de revisão individual.

Reprodução offline a partir da raiz do repositório:

```sh
python3 scripts_admin/classify_ensign_peak_sectors.py \
  --holdings ecossistema/auditoria-religiosa-360/data/ensign-peak-2026-q2.csv \
  --nasdaq ecossistema/auditoria-religiosa-360/data/nasdaq-setores-snapshot-2026-10-22.json \
  --reviews ecossistema/auditoria-religiosa-360/data/revisao-identidades-setores-2026-q2.json \
  --output /tmp/ensign-peak-setores-reproducao
```

A tabela HTML incorpora os dados, pesquisa, filtros e fontes por posição. Há distribuição de toda a carteira e tabela específica dos 57,08% restantes, com valores, percentual do 13F e percentual interno do bloco residual; denominadores explícitos. O índice de transparência da Igreja continua 31/100: enriquecimento independente não é aumento de divulgação institucional. Simulador e demais perímetros do dossiê preservados. Publicação adicional explicitamente autorizada pelo pedido de atualização do usuário. Reverter os commits da edição 1.1 restaura a versão anterior.


## Componentes dos ETFs — edição 1.3

A seção `#etfs` detalha os 29 fundos que somam US$ 1.217.968.868 (2,0026984% do 13F). O agregado usa cinco classes/mandatos dos veículos: 23 de ações, dois de crédito com empréstimos, dois de títulos corporativos, VTIP de dívida pública ligada à inflação e HGER de commodities/derivativos. Isso não é decomposição setorial homogênea dos subjacentes.

A revisão pesquisou os 16 fundos que na edição 1.2 tinham apenas aproximações posteriores. Há agora **21 com componentes e categorias em 30/06 (73,486176% do valor das cotas)**, **dois parciais (1,434496%)**, VEA e VWO, e **seis sem campo confirmado em junho (25,079328%)**. Os componentes de junho cobrem 23 fundos e 74,920672% do valor das cotas; essa proporção não demonstra cobertura integral dos ativos internos. Novas confirmações completas: SRLN, KRE, SPYG, SPYV, XLU, XLY, VXF e VTIP.

VEA/VWO têm componentes de junho e setores amplos ICB de setembro; subindústrias literais de junho aparecem separadas. Os 16 resultados, fontes e lacunas estão no quadro estático `#etf-historical-search`. BKLN mantém o quadro principal posterior e recebe um quadro próprio de **31/05**, com 30 categorias de empréstimos (93,14% do NAV), 17 de bonds (3,79%) e balanço 106,04% − 6,04% = 100%. Maio não foi classificado como junho nem multiplicado pelas cotas do 13F.

Relatórios State Street usam valor/NAV para pesos editoriais declarados; a API Vanguard conserva o campo nativo `percentOfFunds`. Pesos nocionais, caixa/colateral e derivativos não viram participações acionárias. Não se alteraram o 13F, a classificação das posições diretas, o simulador ou o índice 31/100. Atualização histórica e publicação expressamente autorizadas em 22/10/2026; revisão técnica assistida por IA, sem alegar revisão humana independente.

Método completo, fontes, arquivos, limites e reprodução: [ETFS_ENSIGN_PEAK_360X_2026-10-22.md](ETFS_ENSIGN_PEAK_360X_2026-10-22.md).
