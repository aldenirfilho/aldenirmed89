# ETFs da Ensign Peak — Projeto 360X

Edição 1.4 do dossiê, corte em **22/10/2026**. Página: `ecossistema/auditoria-religiosa-360/dossie-igreja-mormon.html#etfs`.

## O que foi observado

O [13F da SEC, 30/06/2026](https://www.sec.gov/Archives/edgar/data/1454984/000145498426000004/xslForm13F_X02/13FQ22026FINAL.xml) contém 29 linhas de ETFs com valor conjunto de **US$ 1.217.968.868**, ou **2,0026984%** dos US$ 60.816.389.385 declarados. CUSIPs, valores, nomes e linhas foram conciliados com a base anterior; não se alteraram os dados de 1.724 posições.

O agregado abaixo usa o valor das cotas por classe/mandato dos veículos. Não representa uma soma dos setores dos subjacentes nem composição em tipos puros de ativos.

| Classe / mandato | Fundos | Valor das cotas USD | % dos ETFs | % do 13F |
|---|---:|---:|---:|---:|
| Ações | 23 | 916.010.927 | 75,208074 | 1,506191 |
| Crédito com empréstimos sêniores: BKLN e SRLN | 2 | 264.209.993 | 21,692672 | 0,434439 |
| Títulos de dívida corporativa: HYG e IGSB | 2 | 35.556.840 | 2,919355 | 0,058466 |
| Títulos públicos ligados à inflação: VTIP | 1 | 2.009.200 | 0,164963 | 0,003304 |
| Commodities e derivativos: HGER | 1 | 181.908 | 0,014935 | 0,000299 |

## Fontes e datas dos subjacentes

A confirmação é independente para **componentes** e **setores/categorias**. Ter a data correta não significa cobertura integral de todas as linhas nem igualdade entre taxonomias. Os valores abaixo são das cotas Ensign Peak no 13F, não valores reconstruídos dos ativos internos.

| Situação temporal | Fundos | Valor das cotas USD | % dos ETFs |
|---|---:|---:|---:|
| Ambos os campos em 30/06/2026 | 22 | 897.165.598 | 73,660799 |
| Um campo em junho: VEA/VWO componentes; AVEM setores | 3 | 21.241.285 | 1,743992 |
| Nenhum dos dois campos confirmado em junho | 4 | 299.561.985 | 24,595209 |
| Componentes de junho, incluindo VEA e VWO | 24 | 914.637.308 | 75,095294 |
| Categorias de junho, incluindo AVEM | 23 | 900.935.173 | 73,970296 |

As duas últimas linhas são indicadores por campo, sobrepostos às situações temporais; não se somam novamente ao total. A edição 1.2 tinha 13 fundos com ambos os campos em junho. Foram pesquisados individualmente os 16 fundos restantes; o quadro estático `#etf-historical-search` preserva o resultado da primeira rodada (edição 1.3, 21/2/6). A segunda rodada de oito buscas está em `#etf-followup-search` e mostra o estado atual.

- **12 iShares:** API histórica oficial com `asOfDate=20260630` e data conferida na resposta. Pesos de mercado e nocionais permanecem separados quando fornecidos.
- **VOO:** tabela oficial Vanguard com cabeçalhos de 30/06/2026 recuperada pela extração indexada; não foi baixado CSV histórico. A ficha PDF de setembro não fundamenta os percentuais de junho.
- **Oito confirmações da primeira rodada (edição 1.3):** SRLN, KRE, SPYG, SPYV, XLU e XLY, a partir dos relatórios financeiros oficiais State Street; VXF, a partir da API histórica e relatório oficial Vanguard; VTIP, a partir da API histórica, com agrupamento editorial explícito dos instrumentos públicos e de liquidez. Categorias e bases nativas são preservadas.
- **VEA e VWO, confirmação parcial:** componentes da API histórica Vanguard em 30/06. Os setores amplos ICB continuam em 30/09. Os agrupamentos literais de 158 e 156 subindústrias da carteira de junho aparecem em quadros próprios e não substituem os setores amplos. Há, respectivamente, 8 e 59 linhas sem peso numérico; não foram estimadas nem confirmadas como zero.
- **PBUS, BKLN, KBWB e HGER:** os campos principais de junho continuam não confirmados. Referências posteriores preservadas. Um parâmetro de junho na API ou uma busca sem resultado não comprova a composição histórica nem inexistência de documento. QQQM e AVEM receberam os achados específicos abaixo.

Cada fundo no JSON inclui fontes primárias, datas, categorias nativas, natureza dos instrumentos, limitações e hashes SHA-256. O registro das 16 buscas conserva tentativas, evidências e arquivos localizados; um N-PORT apenas localizado não é apresentado como fonte de pesos extraídos. Não são publicados caminhos privados ou PDFs integrais.

## Segunda rodada — edição 1.4

O quadro estático `#etf-followup-search` documenta oito fundos: PBUS, BKLN, QQQM, KBWB, AVEM, HGER, VEA e VWO. O registro anterior de 16 buscas é um retrato da edição 1.3; não foi reescrito como se os novos achados já existissem naquela rodada.

- **QQQM:** [ficha oficial Q2 2026, preservada pelo Internet Archive](https://web.archive.org/web/20260801031657id_/https://www.invesco.com/us-rest/contentdetail?contentId=5b4d8e58e0737710VgnVCM1000006e36b50aRCRD), data interna **30/06**, captura 01/08, rodapé 7/26. Dez maiores participações por emissor somam **47,84%**; nove setores **ICB (Industry Classification Benchmark)** somam **100%**. A referência é a data geral da ficha, 30/06; a tabela setorial não tem cabeçalho temporal próprio. A nota informa que as classificações podem refletir o último pregão do mês anterior; não estabelece data independente dos pesos. O gestor informa 103 posições; não foram extraídas todas. Alphabet Inc permanece em uma linha com 6,29%, sem inventar pesos GOOG/GOOGL ou divisão de classes.
- **AVEM:** [página oficial preservada em 30/07/2026](https://web.archive.org/web/20260730170945id_/https://www.avantisinvestors.com/avantis-investments/avantis-emerging-markets-equity-etf/) contém o objeto `portfolio` com `asOfDate=06/30/2026`. Onze setores inteiros somam **99%**, sem normalização. Os campos específicos `topHoldingsAsOfDate` e `etfHoldingsAsOfDate` indicam **29/07**, por isso essas posições não foram usadas como junho. O quadro principal de maiores posições conserva a data de setembro. Taxonomia formal não declarada pelo gestor.
- **HGER:** [relatório trimestral oficial de oito páginas](https://www.harborcapital.com/static/9bee31957691ab4953865b4bc227dd1d/Commodity_All-Weather_Strategy_ETF_Quarterly_Report.pdf), página 6, traz 20 pesos **Daily Weight %**, data 30/06, soma 100%. O painel `managerReportedCommodityWeightsJune` os conserva separados: a base exata ETF versus índice e o denominador NAV não estão esclarecidos. Não são posições contábeis confirmadas de swaps/colateral, não promovem os campos principais de junho e não foram multiplicados pelas cotas Ensign Peak.
- **VEA/VWO:** não se confirmou quadro **ICB oficial de junho**; referências ICB de setembro preservadas. Em `derived_panels.VEA/VWO`, o **GICS (Global Industry Classification Standard)** foi calculado editorialmente dos pesos conhecidos da API histórica, por correspondência literal de todos os rótulos não vazios ao [mapa MSCI de abril de 2026](https://www.msci.com/index/methodology/latest/GICS), pp. 6–12. Não é um quadro publicado pela Vanguard. Não se normalizou nem imputou peso.

| Painel editorial de junho | Pesos conhecidos mapeados | Pesos conhecidos sem rótulo | Linhas sem peso numérico | Rótulos não vazios mapeados |
|---|---:|---:|---:|---:|
| VEA | 98,06157% | 0,00612% | 8 | 157/157 |
| VWO | 95,09779% | 0,04552% | 59 | 155/155 |

Essas somas são de `percentOfFunds` conhecido das ações, sem reinterpretar o denominador como NAV. Rótulos vazios, linhas sem peso, cobertura por setor, auditoria de subindústrias, páginas da metodologia e hashes são preservados. Não representam composição integral do fundo. A eventual extração indexada de ficha ICB não foi aceita como original binário de junho; a captura VWO localizada tinha data interna de março.

## BKLN: quadro anterior de 31/05, separado de junho

A Schedule of Investments oficial confirma **30 categorias de empréstimos, total de 93,14% do patrimônio líquido**, e **17 categorias de bonds, total de 3,79%**, além da pequena posição acionária. Os rótulos são mantidos por classe; empréstimos não viram ações do devedor. A API posterior `Corporate 100%` continua sendo categoria ampla de crédito, sem setor econômico; `sectors` permanece vazio para o quadro principal de BKLN.

O relatório de maio reconcilia **US$ 7.588.079.662 de investimentos brutos (106,04%)**, mais **−US$ 432.225.877 de outros ativos menos passivos (−6,04%)**, com **US$ 7.155.853.785 de patrimônio líquido (100%)**. Não há normalização artificial dos investimentos brutos para 100%.

O quadro `#etf-bkln-maio` não confirma junho e **não foi multiplicado pelo valor das cotas Ensign Peak de 30/06**. A composição exata de junho permanece uma lacuna.

## Bases e lacunas que permanecem abertas

- **State Street:** percentuais dos maiores componentes calculados como valor da linha dividido pelo patrimônio líquido (NAV) do relatório, com método declarado. Categorias nativas preservam arredondamentos, inclusive o limiar de apresentação de 0,05%. Investimentos, caixa e ajustes do balanço não são fundidos silenciosamente.
- **Vanguard:** o campo nativo `percentOfFunds` não foi renomeado como percentual do NAV. Os setores de VXF vêm do relatório de junho; VTIP conserva 25 TIPS agrupados (99,16872%), MKTLIQ (0,71087%) e US Dollar (0,1204%). A soma 99,99999% não é corrigida artificialmente. TIPS significa título do Tesouro dos EUA protegido da inflação; não é empresa.
- **SRLN:** o relatório de junho preserva empréstimos, bonds, outros instrumentos e liquidez separados, incluindo operações de recompra entre as maiores linhas. O mandato não autoriza chamá-lo de 100% empréstimos nem usar a captura posterior como se fosse de junho.
- **IJH/IJR:** há linhas sem peso de mercado; somas de 100,05%/99,87% e medidas nocionais não foram normalizadas nem fundidas. Cobertura setorial total não confirmada.
- **HGER:** categorias e exposições a commodities, sem lista de empresas. Swaps e colateral podem exceder 100%; não constituem alocação de capital nem valor indireto reconstruído da Ensign Peak.
- Top 10 por fundo é uma lista parcial de instrumentos. Caixa, classes de uma companhia e vários títulos de um devedor não equivalem a empresas independentes. Não se fez ranking global com essas listas truncadas.
- GICS, ICB, subindústrias literais, categorias de crédito e futuros permanecem separados. Não há gráfico setorial consolidado dos 29 fundos nem mudança do mapa de posições diretas.

## Arquivos e reprodução

- `data/etfs-ensign-peak-2026-q2.json`: dados completos, fontes, datas e hashes.
- `data/etfs-ensign-peak-2026-q2-resumo.csv`: 29 valores de cotas e metadados.
- `etfs-ensign-peak.css` e `etfs-ensign-peak.js`: fontes da interface, sincronizadas com os blocos incorporados ao HTML. Não há consulta ao vivo, CDN ou dependência de rede para os dados incorporados.
- `scripts_admin/build_ensign_peak_etfs.py --research-dir PATH --historical-dir HISTORICAL_PATH --followup-dir FOLLOWUP_PATH`: concilia as três notas originais e as três notas históricas, escreve JSON/CSV e atualiza o HTML com CSS e JavaScript incorporados. As duas rodadas são opcionais; a edição 1.4 usa as três pastas. `--followup-dir` exige `--historical-dir` para preservar a primeira rodada. Nenhuma pesquisa anterior é editada. A execução falha diante de CUSIP faltante/duplicado ou divergência dos valores imutáveis.
- `tests/test_ensign_peak_etfs.py`: testa exaustividade, reconciliação financeira, datas, mandatos e limites entre ações, dívida pública, crédito e derivativos. As cinco regressões anteriores de setores devem continuar passando. O teste histórico confirma as 16 buscas, os totais atuais 22/3/4, o retrato anterior 21/2/6, a segunda rodada de oito buscas, os painéis separados e a separação de maio e junho e a distinção entre bases de peso.

Números JSON de campos monetários podem usar notação exponencial equivalente (`e0`) para evitar falso positivo do scanner editorial. A leitura JSON mantém os mesmos valores numéricos. Não se alteraram os controles de segurança.

## Publicação e reversão

Atualização e publicação expressamente autorizadas pelo proprietário em 22/10/2026, incluindo a busca da composição de 30/06, os setores do BKLN e o aprofundamento das lacunas históricas desta segunda rodada. Redação e revisão técnica assistidas por IA; não se afirma revisão humana, contábil ou jurídica independente concluída. O índice de transparência mantém **31/100**: nossa análise dos fundos não aumenta a divulgação financeira da Igreja.

Validação local não demonstra deploy. Conferir o workflow seguro, o SHA e a página pública após publicação. Reversão: reverter o commit desta edição; bases e classificações anteriores permanecem preservadas.
