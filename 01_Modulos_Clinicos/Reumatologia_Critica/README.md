# 🧬 Reumatologia Crítica — Emergências & Diagnósticos Difíceis

Mini-plataforma estática, offline e plugável do Antigravity Consultas para
plantão, raciocínio mecanístico e preparação Turbo TEMI.

## Modos de uso

- **Plantão 60 s:** parte da síndrome e do órgão ameaçado.
- **Emergências:** 19 cards com primeira hora, exames decisivos e armadilhas.
- **Diagnóstico difícil:** comparadores de mecanismo e mimetizadores.
- **Produtos didáticos:** conceitos, mnemônicos, alertas e scores com limites.
- **Turbo TEMI:** flashcards, casos, questões e sprint de 12 minutos.

## Contrato plugável

O catálogo está em `data/catalog.js` e expõe:

- `window.ANTIGRAVITY_CRITICAL_MODULE`;
- `window.ANTIGRAVITY_RHEUMATOLOGY`;
- evento `antigravity:rheumatology-ready`.

A interface é compartilhada com Hematologia Crítica. Novos conteúdos entram
como objetos nas coleções do catálogo, sem reescrever o motor.

## Segurança e privacidade

- Não coleta dados de pacientes.
- Não usa nuvem, telemetria, API ou conexão de rede em tempo de execução.
- Preferências e progresso ficam apenas no `localStorage` do dispositivo.
- Critérios classificatórios aparecem separados de diagnóstico e prognóstico.
- Conteúdo permanece `em-revisao-medica` até homologação do Dr. Aldenir.
