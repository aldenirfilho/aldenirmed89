/* Native ETF disclosures remain separate by fund and date. No live requests. */
(() => {
  'use strict';
  const node = document.getElementById('etfs-data');
  if (!node) return;
  const data = JSON.parse(node.textContent);
  const byTicker = new Map(data.funds.map(fund => [fund.ticker, fund]));
  const escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const amount = value => new Intl.NumberFormat('pt-BR', {style:'currency',currency:'USD',maximumFractionDigits:0}).format(value);
  const percent = value => value == null ? 'Não informado' : new Intl.NumberFormat('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:4}).format(value) + '%';
  const date = value => value ? value.split('-').reverse().join('/') : 'Não confirmada';
  const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const table = (rows, caption, firstLabel = 'Categoria original', weightLabel = '% dentro do ETF') => {
    if (!rows || !rows.length) return '<p class="etf-no-data">Distribuição não confirmada nesta pesquisa. Consulte a lacuna abaixo.</p>';
    return '<div class="etf-table-region etf-small-table" role="region" aria-label="' + escape(caption) + '" tabindex="0"><table><caption>' + escape(caption) + '</caption><thead><tr><th scope="col">' + escape(firstLabel) + '</th><th scope="col" class="num">' + escape(weightLabel) + '</th></tr></thead><tbody>' + rows.map(row => '<tr><th scope="row">' + escape(row.name) + '</th><td class="num">' + percent(row.weightPercent) + '</td></tr>').join('') + '</tbody></table></div>';
  };
  const kind = value => ({'Equity':'Ação','Common Stock':'Ação','equity_company':'Ação','Corporate Bonds':'Título de dívida','Fixed Income':'Renda fixa','Cash':'Caixa','Money Market':'Mercado monetário','Money Market Fund, Taxable':'Fundo de mercado monetário','Floating Rate Note':'Nota de juros flutuantes','Loan':'Empréstimo','commodity_future_exposure':'Exposição a commodity'}[value] || value || 'Não informado');
  const componentTable = (rows, caption, weightLabel = '% no ETF') => !rows || !rows.length ? '<p class="etf-no-data">Não há lista confirmada de dez títulos individuais nesta data.</p>' : '<div class="etf-table-region" role="region" aria-label="' + escape(caption) + '" tabindex="0"><table><caption>' + escape(caption) + '</caption><thead><tr><th scope="col">Posição / instrumento</th><th scope="col">Natureza</th><th scope="col" class="num">' + escape(weightLabel) + '</th></tr></thead><tbody>' + rows.map(row => '<tr><th scope="row" class="etf-position-name">' + escape(row.name) + (row.ticker ? '<br><small class="muted">' + escape(row.ticker) + '</small>' : '') + '</th><td class="small">' + escape(kind(row.kind)) + '</td><td class="num">' + percent(row.weightPercent) + '</td></tr>').join('') + '</tbody></table></div>';
  let selected = data.funds[0].ticker;
  const search = document.getElementById('etf-search');
  const group = document.getElementById('etf-group');
  const timing = document.getElementById('etf-timing');
  const picker = document.getElementById('etf-picker');
  function renderList() {
    const query = normalize(search.value.trim());
    const funds = data.funds.filter(fund => (!group.value || fund.mandateCategory === group.value) && (!timing.value || fund.temporalStatus === timing.value) && (!query || normalize([fund.ticker,fund.name,fund.cusip,fund.mandateLabel].join(' ')).includes(query)));
    document.getElementById('etf-count').textContent = funds.length + ' de 29 fundos · valor das cotas em 30/06/2026: ' + amount(funds.reduce((total,fund) => total + fund.ensignPeakValueUSD,0)) + '. Percentuais conservam os denominadores integrais: ETFs e 13F.';
    document.getElementById('etf-fund-rows').innerHTML = funds.length ? funds.map(fund => '<tr><th scope="row" class="etf-name-cell"><button type="button" class="etf-open" data-etf="' + escape(fund.ticker) + '" aria-pressed="' + (fund.ticker === selected) + '">' + escape(fund.ticker) + '</button><br>' + escape(fund.name) + '<br><small class="muted">CUSIP ' + escape(fund.cusip) + '</small></th><td class="num">' + amount(fund.ensignPeakValueUSD) + '</td><td class="num">' + percent(fund.percentOfETFs) + '</td><td class="num">' + percent(fund.percentOf13F) + '</td><td>' + escape(fund.mandateLabel) + '</td><td class="small ' + (fund.temporalStatus === 'historical_same_date' ? 'etf-tag-history' : 'etf-tag-proxy') + '">' + (fund.temporalStatus === 'historical_same_date' ? 'Mesma data: 30/06' : 'Proxy posterior') + '</td></tr>').join('') : '<tr><td colspan="6">Nenhum fundo corresponde à busca.</td></tr>';
  }
  function renderDetail(ticker) {
    const fund = byTicker.get(ticker);
    if (!fund) return;
    selected = ticker;
    picker.value = ticker;
    const historical = fund.temporalStatus === 'historical_same_date';
    const isVOO = fund.ticker === 'VOO';
    const commodity = fund.mandateCategory === 'commodity';
    const government = fund.mandateCategory === 'government';
    const credit = ['loan_credit','corporate_bonds'].includes(fund.mandateCategory);
    const timingText = historical ? (isVOO ? 'Mesma data do 13F: tabela oficial Vanguard em 30/06/2026, recuperada pela extração indexada. Não foi obtido CSV histórico de junho.' : 'Mesma data do 13F: carteira histórica oficial iShares em 30/06/2026, com data conferida na resposta da API.') : 'Proxy temporal posterior: esta composição do fundo não comprova os subjacentes em 30/06/2026 nem que a Ensign Peak conservava as cotas na data posterior.';
    const dates = '<p><strong>Posição Ensign Peak:</strong> 30/06/2026</p><p><strong>Componentes do fundo:</strong> ' + date(fund.holdingsAsOf) + '</p><p><strong>Setores / categorias:</strong> ' + date(fund.sectorAsOf) + '</p>';
    const sources = [];
    const seen = new Set();
    [...fund.identitySources,...fund.holdingsSources].forEach(source => {const key = source.url + '|' + (source.asOf || ''); if (!seen.has(key)) {seen.add(key);sources.push(source);}});
    const assets = fund.assetAllocation || fund.assetBreakdown || fund.assetAllocationDerivedFromHoldings;
    const sourceLinks = '<ol class="etf-source-list">' + sources.map(source => '<li><a href="' + escape(source.url) + '" target="_blank" rel="noopener noreferrer">' + escape(source.title) + '</a>' + (source.asOf ? ' <span class="small">· dado em ' + date(source.asOf) + '</span>' : '') + '<br><span class="small muted">Consulta: ' + date(source.accessedAt || data.accessedAt) + '</span></li>').join('') + '</ol>';
    const sectorsTitle = commodity ? 'Categorias de futuros' : government ? 'Distribuição por emissor' : credit ? 'Setores ou categorias de crédito' : 'Setores / indústrias do gestor';
    const sectorSum = fund.reportedSectorWeightSumPercent == null ? 'Não há distribuição econômica confirmada.' : 'Soma das categorias publicadas: ' + percent(fund.reportedSectorWeightSumPercent) + '. Sem normalização.';
    const componentRows = commodity ? fund.commodityExposures : fund.topHoldings;
    const componentCaption = (commodity ? 'Exposição por commodity — ' + date(fund.commodityExposuresAsOf) : 'Maiores linhas do fundo — ' + date(fund.holdingsAsOf));
    let extras = '';
    if (fund.topCompaniesOrDebtInstruments && JSON.stringify(fund.topCompaniesOrDebtInstruments) !== JSON.stringify(fund.topHoldings)) extras += '<details><summary>Maiores empresas ou títulos de dívida, excluindo caixa</summary><p class="etf-note">Lista por linha de título; não agrega automaticamente empresas do mesmo grupo.</p>' + componentTable(fund.topCompaniesOrDebtInstruments,'Linhas de empresas / dívida, sem caixa — ' + date(fund.holdingsAsOf)) + '</details>';
    if (fund.notionalSectors && fund.notionalSectors.length) extras += '<details><summary>Medida nocional separada</summary><p class="etf-note">A exposição nocional é uma medida diferente do valor de mercado. Estas categorias não são somadas à tabela principal.</p>' + table(fund.notionalSectors,'Exposição nocional — ' + date(fund.sectorAsOf),'Categoria original','% nocional publicado') + '</details>';
    if (assets && assets.length) extras += '<details><summary>Composição por tipo de ativo</summary>' + (fund.assetAllocationDerivedFromHoldings && !fund.assetAllocation && !fund.assetBreakdown ? '<p class="etf-note">Cálculo editorial: ' + escape(fund.assetAllocationMethod) + '</p>' : '') + table(assets,'Tipos de ativos — ' + date(fund.assetAllocationAsOf || fund.assetAllocationDerivedAsOf || fund.holdingsAsOf)) + '</details>';
    if (commodity && fund.instrumentIllustration) extras += '<details><summary>Exemplos de swaps e colateral — ' + date(fund.instrumentIllustrationAsOf) + '</summary><p class="notice"><strong>Medidas brutas, não alocação de capital.</strong> Pernas de swaps e títulos de caução não são somados como uma carteira de 100%, nem convertidos em valores indiretos da Ensign Peak.</p>' + table(fund.instrumentIllustration,'Ilustrações de instrumentos; medidas não somáveis','Instrumento','% bruto publicado') + '</details>';
    const evidence = '<details class="etf-evidence"><summary>Rastreabilidade das capturas e hashes</summary><p class="small">Arquivos brutos foram guardados na pesquisa; publicam-se identificação e SHA-256, sem republicar PDFs integrais ou caminhos privados.</p><ul>' + (fund.evidenceFiles || []).map(file => '<li>' + escape(file.fileName) + '<br><code>' + escape(file.sha256) + '</code></li>').join('') + '</ul></details>';
    document.getElementById('etf-detail').innerHTML = '<span class="tag ' + (historical ? 'filing' : 'estimate') + '">' + (historical ? 'Histórico na mesma data' : 'Aproximação temporal posterior') + '</span><h3 class="etf-detail-title" id="etf-detail-heading" tabindex="-1">' + escape(fund.ticker + ' · ' + fund.name) + '</h3><p class="muted">CUSIP ' + escape(fund.cusip) + ' · ' + escape(fund.mandateLabel) + '</p><div class="etf-detail-meta"><p><strong>' + amount(fund.ensignPeakValueUSD) + '</strong><br><span class="small muted">Cotas no 13F de junho</span></p><p><strong>' + percent(fund.percentOfETFs) + '</strong><br><span class="small muted">dos US$ 1.217.968.868 em ETFs</span></p><p><strong>' + percent(fund.percentOf13F) + '</strong><br><span class="small muted">dos US$ 60.816.389.385 do 13F</span></p></div><div class="etf-timing ' + (historical ? '' : 'proxy') + '"><strong>' + timingText + '</strong><div class="etf-detail-meta">' + dates + '</div></div><div class="etf-detail-grid"><article class="card"><h3>' + sectorsTitle + '</h3><p class="etf-native"><strong>Taxonomia preservada:</strong> ' + escape(fund.sectorTaxonomy) + '</p>' + (fund.sectorMethod ? '<p class="etf-note">Método: ' + escape(fund.sectorMethod) + '</p>' : '') + table(fund.sectors,sectorsTitle + ' — ' + date(fund.sectorAsOf),commodity ? 'Categoria de futuros' : 'Rótulo original',commodity ? '% exposição publicada' : '% publicado') + '<p class="etf-coverage">' + sectorSum + (fund.sectorCoveragePercent == null ? ' Cobertura total não confirmada ou não aplicável.' : '') + '</p></article><article class="card"><h3>' + escape(fund.componentHeading) + '</h3><p class="etf-note">' + (commodity ? 'Exposições da ficha oficial; não representam ações de empresas nem uma partição do valor contábil do fundo.' : government ? 'TIPS são títulos do Tesouro dos EUA ligados à inflação. Os títulos individuais não foram recuperados para esta data.' : credit ? 'Cada linha é um instrumento ou posição de caixa. Devedores podem se repetir em títulos diferentes; não são participações acionárias.' : 'Classes A e C de uma mesma companhia podem aparecer separadamente. Esta lista parcial não é um ranking consolidado dos 29 ETFs.') + '</p>' + componentTable(componentRows,componentCaption,commodity ? '% exposição publicada' : '% no ETF') + '</article></div>' + extras + '<details open><summary>Fontes primárias e datas</summary>' + sourceLinks + '</details><details open><summary>Lacunas e limites deste fundo</summary><ul class="etf-limit-list">' + fund.limitations.map(note => '<li>' + escape(note) + '</li>').join('') + '</ul></details>' + evidence;
    renderList();
  }
  [search,group,timing].forEach(control => control.addEventListener('input',renderList));
  picker.addEventListener('change',() => renderDetail(picker.value));
  document.getElementById('etf-fund-rows').addEventListener('click', event => {const button = event.target.closest('[data-etf]'); if (button) {renderDetail(button.dataset.etf);document.getElementById('etf-detail-heading').focus({preventScroll:true});document.getElementById('etf-selected').scrollIntoView({behavior:'smooth',block:'start'});}});
  renderDetail(selected);
})();
