# UTI 360X Gestão — aplicativo demonstrável 0.2.0

Desenvolvimento: 03/11/2026. Produto do projeto Auditoria UTI / AldenirMed89.

## Abrir agora
Abra `UTI360X_Gestao_Offline.html` em navegador com JavaScript habilitado. O aplicativo é web, não um instalador nativo `.app`, `.exe` ou `.apk`. Não requer conta.

1. Clique em **Carregar exemplo sintético**, em uma sessão vazia.
2. Abra **Carteira de compras → Analisar** para testar bloqueios e alertas.
3. Use **Salvar sessão** antes de fechar. Recarregar perde entradas não exportadas.

## Funcionalidades
Catálogo de 140 itens com filtros e fontes; até 300 compras e 300 referências locais por sessão; importação CSV com prévia; classificação ABC; triagem em lote; parâmetros editáveis; orçamento de 10/20/30 leitos; relatórios HTML imprimíveis; sessão JSON; Excel original incorporado; tema claro/escuro; texto ampliado; modo foco; estrutura comercial demonstrável.

CSV: seis ou nove colunas conforme modelo. Data AAAA-MM-DD. Valores 1234,56 ou 1234.56; 1.234 é ambíguo e será recusado. Campos vazios não viram zero. O relatório é página estática imprimível, não laudo ou certificação.

## Limites dos dados
Base histórica de 22/10/2026; 140 itens, 35 observações e 32 itens com preço herdado. Não houve atualização de mercado. Sem sincronização BPS/PNCP. Referências importadas começam pendentes; restauração invalida confirmações.

Limiares 10%/25%, mínimo de três referências, janela de 365 dias e dispersão máxima de três vezes são critérios internos, não limites legais. A própria compra não compõe a amostra. Resultados não comprovam superfaturamento, dano, regularidade ou economia.

## Privacidade
Não inserir dados de pacientes. Use identificadores comerciais autorizados. Sem analytics, envio de dados ou armazenamento automático. Entradas ficam na memória do navegador; arquivos exportados precisam ser protegidos pelo usuário. Sem criptografia de exportação ou controle multiusuário.

## Instalação web
O pacote contém manifesto e service worker para implantação em HTTPS ou localhost; a instalação depende do navegador. Abrir o HTML offline não instala PWA. Para teste técnico: `python3 -m http.server 8765 --bind 127.0.0.1` na pasta do pacote. O cache atua apenas no caminho da aplicação e não salva entradas de negócio.

## Monetização
Checkout desligado. Nenhum produto em provedor, cobrança, assinatura ou receita foi criado. Preços propostos não foram validados. Sem paywall ou servidor de licenças. Não vender como ferramenta clínica certificada ou auditora infalível.

O código está em branch de repositório público, mas não foi integrado ao site. Revisão editorial humana, licença, direitos, segurança, suporte e validação comercial permanecem pendentes.

## Desenvolvimento
Da raiz do repositório:
```
node --test scripts_admin/uti360x_commercial/tests/core.test.cjs
python3 scripts_admin/uti360x_commercial/build.py --out scripts_admin/uti360x_commercial/package
python3 scripts_admin/uti360x_commercial/tests/browser.py
```
O builder copia dados e Excel do painel existente, sem rede, revalidação de preços ou alteração da versão anterior. Testes no navegador usam somente entradas sintéticas. PWA e meios de pagamento exigem testes de implantação separados.
