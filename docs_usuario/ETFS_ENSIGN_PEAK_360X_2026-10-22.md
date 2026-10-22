# ETFs da Ensign Peak — Projeto 360X

Edição 1.2 do dossiê, corte em **22/10/2026**. Página: `ecossistema/auditoria-religiosa-360/dossie-igreja-mormon.html#etfs`.

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

- **12 iShares:** resposta histórica oficial da API do gestor com `asOfDate=20260630` e data conferida na resposta. Incluem ações e dois fundos de dívida corporativa. Setores foram somados por rótulo original, sem normalização; pesos de mercado e nocionais permanecem separados quando fornecidos.
- **VOO:** tabela oficial Vanguard com cabeçalhos de 30/06/2026 recuperada pela extração indexada do motor de pesquisa; não foi baixado CSV histórico. A ficha PDF de setembro não fundamenta os percentuais de junho.
- **16 fundos restantes:** composições posteriores a junho, tratadas como **proxies temporais**. Invesco: setores de 30/09 e componentes de 21/10; State Street: captura direta de 21/10; Vanguard/Avantis/Harbor: datas específicas de setembro/outubro em cada registro.
- Os 13 fundos com a mesma data representam **55,513906% do valor dos ETFs**. Os 16 com aproximação posterior representam **44,486094%**. Isso não significa cobertura integral dos componentes ou validação independente do gestor.

Cada fundo no JSON inclui fontes primárias com URL, título, data do dado e consulta; categorias nativas; componentes com natureza do instrumento; limitações; nomes dos arquivos de evidência e SHA-256. Não são publicados caminhos locais privados nem PDFs integrais.

## Lacunas que permanecem abertas

- **BKLN:** a API setorial fornece apenas `Corporate 100%`. Essa categoria ampla de crédito não é um setor econômico dos devedores. `sectors` permanece vazio e a cobertura setorial é zero. A carteira completa e as maiores linhas são confirmadas para 21/10, incluindo fundo monetário; não são ações de empresas.
- **SRLN:** os 38 rótulos são setores/indústrias de crédito do gestor. A captura de 21/10 informa 88,28% Loans, 6,82% Bonds, 4,83% CLO Debt e 0,08% Cash. O mandato não autoriza classificá-lo como 100% empréstimos. O rótulo literal `Technology: Semiconductor` foi conservado, com a impossibilidade de reproduzir o vínculo de cada devedor explicitada.
- **IJH/IJR:** há linhas sem peso de mercado; somas de 100,05%/99,87% e medidas nocionais não foram normalizadas nem fundidas. Cobertura setorial total não confirmada.
- **VTIP:** distribuição por emissor Treasury/Agency/Other, principalmente TIPS dos EUA; dez títulos individuais não recuperados para a data da ficha. Não se inventa lista de empresas.
- **HGER:** categorias e exposições a commodities, sem lista de empresas. Medidas brutas de swaps e colateral da página podem exceder 100% e não constituem alocação de capital. Não se somam ou multiplicam como se fossem participações acionárias.
- Top 10 por fundo é uma lista parcial de instrumentos. Caixa, classes de uma mesma companhia e diversos títulos de um devedor não equivalem a empresas independentes. Não se fez ranking global com essas listas truncadas.
- As taxonomias GICS, outros setores de ações, indústrias bancárias, crédito e categorias de futuros permanecem separadas. Não há gráfico setorial consolidado dos 29 fundos.

## Arquivos e reprodução

- `data/etfs-ensign-peak-2026-q2.json`: dados completos, fontes, datas e hashes.
- `data/etfs-ensign-peak-2026-q2-resumo.csv`: 29 valores de cotas e metadados.
- `etfs-ensign-peak.css` e `etfs-ensign-peak.js`: fontes da interface, sincronizadas com os blocos incorporados ao HTML. Não há consulta ao vivo, CDN ou dependência de rede para os dados incorporados.
- `scripts_admin/build_ensign_peak_etfs.py --research-dir PATH`: concilia as três notas de pesquisa estruturadas, escreve o JSON/CSV e atualiza a seção do HTML. A execução falha diante de CUSIP faltante/duplicado ou divergência dos valores imutáveis.
- `tests/test_ensign_peak_etfs.py`: testa exaustividade, reconciliação financeira, datas, mandatos e limites entre ações, dívida pública, crédito e derivativos. As cinco regressões anteriores de setores devem continuar passando.

Números JSON de campos monetários podem usar notação exponencial equivalente (`e0`) para evitar falso positivo do scanner editorial. A leitura JSON mantém os mesmos valores numéricos. Não se alteraram os controles de segurança.

## Publicação e reversão

Atualização e publicação expressamente autorizadas pelo proprietário em 22/10/2026. Redação e revisão técnica assistidas por IA; não se afirma revisão humana, contábil ou jurídica independente concluída. O índice de transparência mantém **31/100**: nossa análise dos fundos não aumenta a divulgação financeira da Igreja.

Validação local não demonstra deploy. Conferir o workflow seguro, o SHA e a página pública após publicação. Reversão: reverter o commit desta edição; bases e classificações anteriores permanecem preservadas.
