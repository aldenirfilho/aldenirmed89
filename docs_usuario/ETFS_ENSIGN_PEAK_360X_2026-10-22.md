# ETFs da Ensign Peak — Projeto 360X

Edição 1.3 do dossiê, corte em **22/10/2026**. Página: `ecossistema/auditoria-religiosa-360/dossie-igreja-mormon.html#etfs`.

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
| Ambos os campos em 30/06/2026 | 21 | 895.038.749 | 73,486176 |
| Apenas componentes em junho: VEA e VWO | 2 | 17.471.710 | 1,434496 |
| Nenhum dos dois campos confirmado em junho | 6 | 305.458.409 | 25,079328 |
| Componentes de junho, incluindo os dois parciais | 23 | 912.510.459 | 74,920672 |

A última linha inclui as duas primeiras; não se soma novamente ao total. A edição 1.2 tinha 13 fundos com ambos os campos em junho. Foram pesquisados individualmente os 16 fundos restantes; o quadro estático `#etf-historical-search` registra fontes, resultado por campo e lacunas.

- **12 iShares:** API histórica oficial com `asOfDate=20260630` e data conferida na resposta. Pesos de mercado e nocionais permanecem separados quando fornecidos.
- **VOO:** tabela oficial Vanguard com cabeçalhos de 30/06/2026 recuperada pela extração indexada; não foi baixado CSV histórico. A ficha PDF de setembro não fundamenta os percentuais de junho.
- **Novos oito com ambos os campos em junho:** SRLN, KRE, SPYG, SPYV, XLU e XLY, a partir dos relatórios financeiros oficiais State Street; VXF, a partir da API histórica e relatório oficial Vanguard; VTIP, a partir da API histórica, com agrupamento editorial explícito dos instrumentos públicos e de liquidez. Categorias e bases nativas são preservadas.
- **VEA e VWO, confirmação parcial:** componentes da API histórica Vanguard em 30/06. Os setores amplos ICB continuam em 30/09. Os agrupamentos literais de 158 e 156 subindústrias da carteira de junho aparecem em quadros próprios e não substituem os setores amplos. Há, respectivamente, 8 e 59 linhas sem peso numérico; não foram estimadas nem confirmadas como zero.
- **PBUS, BKLN, QQQM, KBWB, AVEM e HGER:** as buscas não confirmaram os dois campos na data exata. Mantiveram-se as referências posteriores já publicadas. Solicitar junho em um parâmetro da API Invesco não comprovou a data: a resposta retornou 21/10. A busca incompleta não prova inexistência de documento histórico.

Cada fundo no JSON inclui fontes primárias, datas, categorias nativas, natureza dos instrumentos, limitações e hashes SHA-256. O registro das 16 buscas conserva tentativas, evidências e arquivos localizados; um N-PORT apenas localizado não é apresentado como fonte de pesos extraídos. Não são publicados caminhos privados ou PDFs integrais.

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
- `scripts_admin/build_ensign_peak_etfs.py --research-dir PATH --historical-dir HISTORICAL_PATH`: concilia as três notas originais e as três notas históricas, escreve JSON/CSV e atualiza o HTML com CSS e JavaScript incorporados. O argumento histórico é opcional; a edição 1.3 usa ambas as pastas. A execução falha diante de CUSIP faltante/duplicado ou divergência dos valores imutáveis.
- `tests/test_ensign_peak_etfs.py`: testa exaustividade, reconciliação financeira, datas, mandatos e limites entre ações, dívida pública, crédito e derivativos. As cinco regressões anteriores de setores devem continuar passando. O teste histórico confirma as 16 buscas, os totais 21/2/6, a separação de maio e junho e a distinção entre bases de peso.

Números JSON de campos monetários podem usar notação exponencial equivalente (`e0`) para evitar falso positivo do scanner editorial. A leitura JSON mantém os mesmos valores numéricos. Não se alteraram os controles de segurança.

## Publicação e reversão

Atualização e publicação expressamente autorizadas pelo proprietário em 22/10/2026, incluindo a busca da composição de 30/06 dos 16 fundos antes aproximados e os setores do BKLN. Redação e revisão técnica assistidas por IA; não se afirma revisão humana, contábil ou jurídica independente concluída. O índice de transparência mantém **31/100**: nossa análise dos fundos não aumenta a divulgação financeira da Igreja.

Validação local não demonstra deploy. Conferir o workflow seguro, o SHA e a página pública após publicação. Reversão: reverter o commit desta edição; bases e classificações anteriores permanecem preservadas.
