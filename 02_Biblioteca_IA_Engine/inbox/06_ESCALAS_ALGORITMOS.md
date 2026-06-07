# 📊 Escalas e Algoritmos — AVC Agudo

## 1. NIHSS

Avalia gravidade neurológica: consciência, perguntas, comandos, olhar, campo visual, face, força, ataxia, sensibilidade, linguagem, disartria e negligência.

**Uso prático:** comunicação, decisão, evolução e prognóstico.  
**Pegadinha:** NIHSS baixo não exclui déficit incapacitante, especialmente afasia, hemianopsia, circulação posterior.

## 2. ASPECTS

Escala tomográfica para sinais precoces de isquemia no território da artéria cerebral média.

- Começa em 10.
- Perde pontos conforme áreas acometidas.
- Ajuda a estimar core isquêmico em TC inicial.

## 3. mRS — Modified Rankin Scale

Mede incapacidade funcional. Importante para:

- estado prévio;
- prognóstico;
- definição de metas;
- desfechos de estudos.

## 4. ICH Score

Componentes clássicos:

- Glasgow.
- Volume do hematoma.
- Hemorragia intraventricular.
- Localização infratentorial.
- Idade.

**Uso:** estimar gravidade; nunca usar isoladamente para negar cuidado.

## 5. ABCD2

Risco após AIT:

- Age.
- Blood pressure.
- Clinical features.
- Duration.
- Diabetes.

**Limitação:** não substitui investigação etiológica e imagem vascular.

---

# Algoritmo rápido — AVC isquêmico

```mermaid
flowchart TD
A[Suspeita de AVC] --> B[ABCDE + glicemia + último visto bem]
B --> C[NIHSS + PA + anticoagulantes]
C --> D[TC sem contraste]
D --> E{Hemorragia?}
E -- Sim --> H[Protocolo HIC/HSA + UTI/neurocirurgia]
E -- Não --> F{Janela e elegível para IVT?}
F -- Sim --> G[Trombólise IV]
F -- Não --> I[Imagem avançada/conduta clínica]
G --> J{Suspeita/LVO?}
I --> J
J -- Sim --> K[Angio-TC + acionar trombectomia]
J -- Não --> L[Unidade AVC/UTI + prevenção complicações]
```

# Algoritmo rápido — HIC

```mermaid
flowchart TD
A[HIC na TC] --> B[ABCDE + PA + anticoagulantes]
B --> C[Volume/localização/IVH/hidrocefalia]
C --> D{Anticoagulado?}
D -- Sim --> E[Reversão urgente]
D -- Não --> F[Controle PA + UTI se grave]
E --> F
F --> G{Cerebelar/deterioração/hidrocefalia?}
G -- Sim --> H[Neurocirurgia/DVE/descompressão]
G -- Não --> I[Monitorização + TC se piora]
```
