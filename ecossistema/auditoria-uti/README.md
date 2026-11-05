# Auditoria UTI — Turbo TEMI 360X

[Painel público](https://aldenirfilho.github.io/aldenirmed89/ecossistema/auditoria-uti/) · [AldenirMed89](../../#auditoria-uti)

## Versão 1.1 — 31/10/2026

Extensão do painel original, sem substituir os seis módulos, as rotas, o catálogo ou o Excel incorporado.

- Importação CSV local com prévia, validação transacional, conversão de embalagens e bloqueio de duplicidades.
- Conferência individual de equivalência: registros importados começam pendentes, nunca automaticamente aprovados.
- Relatório HTML estático de triagem, com parâmetros, fontes, inclusões/exclusões e ressalvas; imprimível pelo navegador.
- Comparação de compra e locação por custo nominal total, incluindo manutenção, consumíveis e valor residual. Sem dupla contagem de depreciação.
- Rascunho local opcional, mediante consentimento, e restauração sem reaproveitar confirmações de equivalência.
- Exportação das lacunas da base incorporada. Correção do limite de data da compra: aceita datas até o dia atual em America/Fortaleza, sem alterar a data histórica dos preços.

## Fluxo recomendado

1. Abra **Fontes e arquivos → Baixar CSV-modelo**.
2. Preencha `sku;data;instituicao;processo;preco_embalagem;unidades_base;url;marca;observacoes`. O SKU precisa existir no catálogo. Datas no formato AAAA-MM-DD; valores 1234,56 ou 1234.56. Um ponto isolado com três casas, como 1.234, é recusado por ambiguidade.
3. Importe e revise a prévia. Uma linha inválida bloqueia toda a importação. Máximo de 300 referências locais e 2 MB por CSV. Arquivos nativos de BPS/PNCP precisam de normalização no modelo; não há conector direto.
4. Em **Auditoria → Conferir referências locais**, abra os documentos e confirme cada equivalência. Depois confirme a equivalência da compra com a amostra elegível.
5. Exporte o relatório e salve a sessão. Na restauração, confira novamente as referências e os cenários. A seção **Orçamento → Compra × locação** exige todos os valores; use zero explícito quando aplicável.

## Limites obrigatórios

A base documental continua sendo a de **22/10/2026**: **140 itens, 35 observações e 32 itens com preço elegível**. Nenhum item tem três referências elegíveis na base incorporada. Esta versão **atualiza o software, não os preços de mercado**. Dados importados não reescrevem o catálogo nem a planilha histórica.

Sem atualização automática BPS/PNCP. Alertas gerenciais não comprovam sobrepreço, superfaturamento, regularidade, dano ou direito a restituição. Os limiares de 10%/25% são editáveis e não constituem limites legais. As fontes e condições comerciais exigem análise profissional independente.

Não inserir dados de pacientes. Processamento local, sem telemetria ou envio dos arquivos importados. O rascunho usa localStorage sem criptografia própria: não ativar em dispositivo compartilhado. Abrir o painel não restaura nem sobrescreve um rascunho anterior. Use **Salvar sessão** para manter uma cópia portátil.

## Desenvolvimento e testes

Fontes editáveis: `assets/auditoria-v11-core.js`, `assets/auditoria-v11.js`, `assets/auditoria-v11.css`. O integrador embute esses arquivos no HTML, mantendo-o autocontido e preservando a política de conteúdo sem conexões de rede.

```sh
python3 scripts_admin/upgrade_auditoria_uti_v11.py
python3 scripts_admin/upgrade_auditoria_uti_v11.py --check
node --test tests/auditoria_uti_v11.test.cjs
# Com Playwright instalado e um servidor local na porta 8765:
python3 tests/auditoria_uti_v11_browser.py
```

O CI verifica cálculos, unidades, limites, importação, sessões, navegação, responsividade e integridade dos dados/Excel. Fixtures são sintéticas e nunca entram na base publicada. Testes não equivalem a certificação de auditoria ou validação clínica.

`integracao.json` registra a importação original v1. `versao.json` registra o HTML v1.1 e hashes. `data/` preserva os documentos originais. `validacao/` contém os registros históricos da criação inicial; resultados da nova suíte ficam nos artefatos do GitHub Actions.

## Próxima etapa técnica

Ampliar a base documental com registros primários comparáveis por CATMAT, apresentação, unidade, configuração, período e condições comerciais; registrar a revisão humana antes de habilitar preços. A importação CSV viabiliza esse trabalho sem simular atualização automática ou preencher lacunas por estimativa.
