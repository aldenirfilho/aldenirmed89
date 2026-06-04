# RespiraSense ICU — Versão HTML plugável 🫁🚀

Esta pasta contém uma conversão estática do app **RespiraSense ICU PRO V2** para uso direto em GitHub Pages/Antigravity.

## Arquivos

```text
respirasense-icu/
├── index.html                 # página principal do módulo
├── styles.css                 # layout dark Apple-like responsivo
├── app.js                     # motor clínico convertido para JavaScript
├── manifest.webmanifest       # instalação como web app/PWA simples
├── integration-snippet.html   # card/link para colar na homepage
└── README_ANTIGRAVITY.md      # este arquivo
```

## Como plugar na página principal

1. Copie a pasta `respirasense-icu` para a raiz do projeto da Enciclopédia.
2. Na homepage principal (`index.html`), cole o conteúdo de `integration-snippet.html` no bloco de módulos/calculadoras.
3. O link usado pelo card é:

```html
<a href="./respirasense-icu/index.html">RespiraSense ICU</a>
```

## O que foi preservado do app original

- PBW e alvos de VT por peso predito.
- P/F, S/F, ROX, gradiente A–a, CaO₂, índice de oxigenação.
- Análise ácido-base com compensações aproximadas.
- Ânion gap, AG corrigido, delta ratio e HCO₃ corrigido.
- Mecânica ventilatória: VT/PBW, ΔP, complacência estática/dinâmica, resistência, VM e potência mecânica simplificada.
- Recomendações por gravidade: Emergência, Alto, Moderado, Desmame, Baixo, OK.
- CBAF/HFNC com ROX.
- VNI/CPAP/BiPAP com alerta de contraindicação/falha.
- VM invasiva com metas protetoras, pronação, bloqueio e ECMO como discussão.
- Simulador de curvas pressão/fluxo/volume com modelo de 1 compartimento.
- Checklist de assincronias.
- Painel de fórmulas e tabelas.
- Snapshot anônimo em `localStorage` + exportação JSON.

## Diferenças importantes da versão HTML

- Não usa Streamlit.
- Não usa Python no navegador.
- Não usa SQLite.
- O histórico é salvo no navegador via `localStorage`, adequado para estudo/simulação, não para prontuário ou produção hospitalar.
- Para produção clínica real, migrar para backend seguro: autenticação, HTTPS, PostgreSQL, logs, backup, controle de acesso e LGPD.

## Prompt para o Antigravity

Cole este comando no Antigravity dentro do projeto:

```text
Integre a pasta ./respirasense-icu como módulo oficial da Enciclopédia Médica Intensiva. Adicione um card/link na homepage principal apontando para ./respirasense-icu/index.html. Preserve o design responsivo e mantenha tags de busca: UTI, ventilação mecânica, gasometria, SARA, ARDS, CBAF, HFNC, VNI, TEMI, calculadora. Não remover avisos de segurança clínica. Garanta que todos os caminhos funcionem em GitHub Pages.
```

## Segurança

Este módulo é educacional/pesquisa. Não substitui julgamento clínico nem protocolo institucional. Não salve identificadores de paciente.
