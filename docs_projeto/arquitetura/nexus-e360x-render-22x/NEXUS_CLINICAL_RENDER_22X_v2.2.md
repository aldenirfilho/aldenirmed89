# NEXUS CLINICAL RENDER E360X — Motor 22X

**Versão:** `2.2.0`  
**Classe:** arquitetura pública e desidentificada  
**Entrada:** `CASE-IR` validado  
**Saída:** análise E360X visual, TDAH-friendly, microparticulada e rastreável

## 1. Princípio

Renderizar não é decorar um resumo. É selecionar a representação que conserva
melhor a relação clínica:

| Relação | Componente |
|---|---|
| tempo e mudança | timeline |
| tendência quantitativa | curva ou tabela compacta |
| prioridade | matriz P0–Pn |
| mecanismo | diagrama causal |
| decisão | algoritmo |
| execução | checklist |
| risco | alerta com gatilho |
| aprendizagem | recuperação, predição e discriminação |
| interconexão | TAG# + arestas |

## 2. Cinco níveis de leitura

1. **AGORA:** ameaças, ações imediatas e lacunas que impedem decidir.
2. **DECISÃO:** problema → evidência → ação → alvo → reavaliação → contingência.
3. **22X:** análise canônica completa.
4. **APRENDIZAGEM:** ACRA 1.5, micropartículas e prática ativa.
5. **TAG#:** depósito semântico do caso e conexões U1–U2–U3.

## 3. Os 22 pontos obrigatórios

1. Identificação e corte temporal.
2. Diagnósticos estabelecidos.
3. Hipóteses e grau de certeza.
4. Problemas priorizados P0–Pn.
5. Cronologia e deltas clínicos.
6. Estado atual em uma tela.
7. Exame físico por sistemas.
8. Laboratório e tendências.
9. Imagens, POCUS e achados visuais.
10. Análise crítica e mecanismos.
11. Prescrição reconciliada.
12. Checklist de segurança e dispositivos.
13. Exames solicitados, indicados e pendentes.
14. Condutas realizadas, prescritas e planejadas.
15. Alertas, interações e riscos.
16. Temas de estudo derivados.
17. Pérolas Turbo TEMI.
18. Pendências e responsáveis.
19. Ações urgentes e janela temporal.
20. Síntese final e passagem de plantão.
21. Nome semântico sugerido.
22. **Depósito TAG# do caso analisado.**

O ponto 22 deve conter:

- TAG# nuclear;
- Top 5 TAG#;
- TAG# causal/fisiopatológica;
- TAG# de ameaça e segurança;
- TAG# diagnóstica e de monitorização;
- TAG# terapêutica e farmacológica;
- TAG# didática/TEMI;
- TAG# estrutural e de proveniência;
- arestas propostas, com origem, relação, destino e evidência.

## 4. Contrato de decisão

Cada P0–Pn deve renderizar, quando aplicável:

```text
PROBLEMA
→ EVIDÊNCIA DO CASO
→ INTERPRETAÇÃO
→ AÇÃO
→ JUSTIFICATIVA
→ ALVO
→ PRAZO DE REAVALIAÇÃO
→ RISCO
→ ALTERNATIVA
→ CONTINGÊNCIA
```

Fatos, inferências, divergências, ausências e sugestões não podem ser fundidos.

## 5. RENDER-9

A saída é bloqueada se falhar em qualquer gate:

1. identidade e deduplicação;
2. fonte e corte temporal;
3. fidelidade ao `CASE-IR`;
4. cronologia;
5. completude dos 22 pontos;
6. segurança clínica e incerteza;
7. legibilidade TDAH-friendly;
8. adequação visual e acessibilidade;
9. privacidade, proveniência e revisão humana.

## 6. Densidade visual

- A primeira tela deve responder: **o que ameaça, o que fazer, quando rever**.
- Uma micropartícula deve ensinar uma decisão principal.
- Texto contínuo maior que seis linhas deve ser convertido em componente, salvo
  quando a proveniência integral exigir transcrição.
- Emojis funcionam como âncoras semânticas, nunca como evidência.
- Cor nunca é o único canal de prioridade.
- O visual obrigatório V3 exige imagem clínica válida e leitura independente.
- O transcript integral permanece em canal próprio; não é comprimido nem
  confundido com a tela assistencial.

## 7. ACRA 1.5

Onze painéis, apresentados depois de AGORA e DECISÃO:

1. âncora do caso;
2. conflito principal;
3. raciocínio fisiopatológico;
4. reconhecimento de padrões;
5. decisão imediata;
6. prescrição e execução;
7. monitorização;
8. falhas e armadilhas;
9. cenário alternativo;
10. recuperação ativa;
11. transferência e revisão espaçada.

## 8. Saídas derivadas

O renderizador pode gerar, sem duplicar o nó-tema:

- passagem de plantão;
- flash clínico;
- timeline;
- algoritmo;
- checklist;
- questão comentada;
- flashcard ocultável;
- imagem didática;
- micropartícula;
- ACRA;
- dashboard;
- apostila.

Toda derivação aponta para `case_ir_id`, fontes e revisão que a originaram.

