/* Gerado por scripts_admin/build_sepsis_acra_bundle.py. Não editar. */
(function registerSepsisAcraBundle(root) {
  "use strict";

  const bundle = {
  "artifactCount": 10,
  "artifactSchemaVersion": "1.0",
  "contentSha256": "9b36dd5dbb20ab7000472d764349a4b1e7d8013a615b81f1355bbf4dc50959f6",
  "entries": [
    {
      "artifact": {
        "actions": [
          {
            "contextComponentIds": [
              "a01-component-m4",
              "a01-component-m5"
            ],
            "id": "a01-action-review",
            "kind": "review",
            "label": "Revisar erros",
            "prompt": "Revise as respostas incorretas e converta cada erro em um gatilho de reconhecimento de deterioração.",
            "requiresPreview": true
          },
          {
            "contextComponentIds": [
              "a01-component-m1",
              "a01-component-m2"
            ],
            "id": "a01-action-deepen",
            "kind": "deepen",
            "label": "Aprofundar disfunção orgânica",
            "prompt": "Relacione cada sistema orgânico aos dados clínicos seriados que podem revelar piora precoce.",
            "requiresPreview": true
          },
          {
            "contextComponentIds": [
              "a01-component-m2",
              "a01-component-m3"
            ],
            "id": "a01-action-compare",
            "kind": "compare",
            "label": "Comparar sepse e mimetizadores",
            "prompt": "Compare sepse, hemorragia, tromboembolismo e causa cardíaca, destacando pistas convergentes, discordantes e testes que mudam conduta.",
            "requiresPreview": true
          }
        ],
        "components": [
          {
            "id": "a01-component-m0",
            "text": "Deterioração aguda + infecção possível + nova disfunção orgânica = trate a hipótese de sepse como tempo-dependente enquanto testa alternativas. Reconheça a ameaça fisiológica primeiro; o escore organiza risco, mas não autoriza esperar.",
            "title": "M0 · Essência em 30 segundos",
            "tone": "danger",
            "type": "callout"
          },
          {
            "id": "a01-component-m1",
            "items": [
              {
                "id": "a01-step-deterioracao",
                "text": "Compare com o basal: estado mental, frequência respiratória, oxigenação, pressão, perfusão, diurese e temperatura. Uma tendência desfavorável pode ser mais informativa que um valor isolado.",
                "title": "Detecte a mudança"
              },
              {
                "id": "a01-step-abcde",
                "text": "Avalie via aérea, respiração, circulação, estado neurológico e exposição em paralelo à investigação. Corrija ameaças imediatas e peça ajuda proporcional à gravidade.",
                "title": "Estabilize pelo ABCDE"
              },
              {
                "id": "a01-step-infeccao",
                "text": "Procure foco provável, dispositivos, procedimentos, imunossupressão, exposições e antimicrobianos prévios. Obtenha hemoculturas assim que possível e idealmente antes do antimicrobiano, sem criar atraso inseguro ao tratamento indicado.",
                "title": "Teste a hipótese infecciosa"
              },
              {
                "id": "a01-step-disfuncao",
                "text": "Integre consciência, oxigenação, perfusão, pressão, diurese, função renal/hepática, coagulação, plaquetas e lactato em tendência. Nenhum marcador isolado define todo o quadro.",
                "title": "Mapeie disfunção orgânica"
              },
              {
                "id": "a01-step-mimetizadores",
                "text": "Hemorragia, tromboembolismo, síndrome coronariana, arritmia, insuficiência adrenal, anafilaxia, pancreatite, intoxicação e causas metabólicas podem coexistir ou simular sepse.",
                "title": "Mantenha mimetizadores ativos"
              },
              {
                "id": "a01-step-escalada",
                "text": "Defina responsável, local de cuidado, frequência de reavaliação e gatilhos de UTI. Registre hipótese, incertezas, intervenções e resposta fisiológica.",
                "title": "Escale e reavalie"
              }
            ],
            "title": "M1 · Mecanismo e sequência",
            "type": "numberedSteps"
          },
          {
            "columns": [
              {
                "id": "a01-column-sinais",
                "label": "Pistas dominantes"
              },
              {
                "id": "a01-column-risco",
                "label": "Risco cognitivo"
              },
              {
                "id": "a01-column-conduta",
                "label": "Próximo passo seguro"
              }
            ],
            "id": "a01-component-m2",
            "rows": [
              {
                "cells": [
                  "Infecção plausível, deterioração e nova disfunção orgânica.",
                  "Esperar febre, hipotensão ou escore completo para agir.",
                  "ABCDE, investigação e tratamento tempo-dependente em paralelo, com escalada conforme gravidade."
                ],
                "id": "a01-row-sepse",
                "label": "Sepse possível ou provável"
              },
              {
                "cells": [
                  "Foco provável, fisiologia preservada e ausência atual de lesão orgânica.",
                  "Confundir estado atual com garantia de estabilidade futura.",
                  "Tratar conforme síndrome, definir monitorização e explicitar sinais de deterioração."
                ],
                "id": "a01-row-infeccao",
                "label": "Infecção sem disfunção aparente"
              },
              {
                "cells": [
                  "Dados discordantes com infecção ou pista forte de causa não infecciosa.",
                  "Ancorar em sepse e perder hemorragia, embolia, isquemia ou toxicidade.",
                  "Investigar e tratar hipóteses perigosas em paralelo; coexistência é possível."
                ],
                "id": "a01-row-mimetizador",
                "label": "Mimetizador tempo-dependente"
              },
              {
                "cells": [
                  "Quadro inicial inespecífico e informação incompleta.",
                  "Usar um exame negativo precoce como encerramento diagnóstico.",
                  "Reavaliação seriada com prazo, responsável e gatilhos objetivos de escalada."
                ],
                "id": "a01-row-incerteza",
                "label": "Incerteza persistente"
              }
            ],
            "title": "M2 · Decisão segura diante da deterioração",
            "type": "comparisonTable"
          },
          {
            "id": "a01-component-m3",
            "items": [
              {
                "content": [
                  {
                    "text": "Pessoa adulta internada por doença crônica passa a ficar sonolenta, taquipneica e oligúrica. Não há febre documentada. O primeiro movimento é reconhecer deterioração e executar ABCDE, não aguardar um rótulo.",
                    "type": "paragraph"
                  },
                  {
                    "items": [
                      "Compare sinais atuais com o basal.",
                      "Acione ajuda e monitorização compatíveis com a instabilidade.",
                      "Procure ameaças reversíveis imediatas."
                    ],
                    "type": "bulletList"
                  }
                ],
                "id": "a01-case-entrada",
                "initiallyOpen": true,
                "label": "1 · A mudança que não pode ser banalizada"
              },
              {
                "content": [
                  {
                    "text": "Há tosse recente, necessidade crescente de oxigênio, creatinina acima do basal e perfusão periférica lenta. Infecção pulmonar com disfunção orgânica torna-se provável, embora causas cardíacas e tromboembólicas ainda precisem ser testadas.",
                    "type": "paragraph"
                  },
                  {
                    "items": [
                      "Localize o foco e obtenha amostras sem atraso inseguro.",
                      "Mapeie a disfunção órgão por órgão.",
                      "Declare dados que favorecem e que enfraquecem cada hipótese."
                    ],
                    "type": "bulletList"
                  }
                ],
                "id": "a01-case-hipoteses",
                "label": "2 · Infecção e disfunção entram no mesmo quadro"
              },
              {
                "content": [
                  {
                    "text": "A pressão ainda não é profundamente baixa, mas consciência, oxigenação, diurese e perfusão pioram. A decisão segura é intensificar suporte, investigação e tratamento, solicitar avaliação crítica e definir destino de maior vigilância.",
                    "type": "paragraph"
                  }
                ],
                "id": "a01-case-decisao",
                "label": "3 · Escalada não depende de um único escore"
              },
              {
                "content": [
                  {
                    "text": "Após as primeiras intervenções, registre tendência de perfusão, oxigenação, consciência, diurese e lactato quando indicado. Se a resposta for inadequada, reabra foco, adequação terapêutica, mimetizadores e necessidade de UTI.",
                    "type": "paragraph"
                  }
                ],
                "id": "a01-case-reavaliacao",
                "label": "4 · Feche o ciclo"
              }
            ],
            "title": "M3 · Caso sintético progressivo",
            "type": "accordion"
          },
          {
            "id": "a01-component-m4",
            "items": [
              {
                "id": "a01-pitfall-febre",
                "text": "Erro: febre pode faltar. Correção: valorize deterioração, infecção plausível e disfunção orgânica.",
                "title": "Sem febre, sem sepse",
                "tone": "danger"
              },
              {
                "id": "a01-pitfall-escore",
                "text": "Erro: usar triagem como teste de exclusão. Correção: trate ameaça fisiológica e tendência clínica.",
                "title": "Escore baixo tranquiliza",
                "tone": "warning"
              },
              {
                "id": "a01-pitfall-lactato",
                "text": "Erro: um lactato não exclui sepse nem toda hipoperfusão. Correção: integre órgãos, perfusão e evolução.",
                "title": "Lactato normal encerra o caso",
                "tone": "warning"
              },
              {
                "id": "a01-pitfall-ancoragem",
                "text": "Erro: abandonar mimetizadores perigosos. Correção: investigue causas concorrentes em paralelo.",
                "title": "Tudo é sepse",
                "tone": "danger"
              }
            ],
            "title": "M4 · Armadilhas de plantão",
            "type": "cards"
          },
          {
            "id": "a01-component-m5",
            "questions": [
              {
                "correctOptionId": "a01-option-escore-clinica",
                "feedback": "Escores apoiam reconhecimento e prognóstico, mas não devem funcionar como teste isolado de exclusão nem atrasar resposta à deterioração.",
                "id": "a01-question-escore",
                "options": [
                  {
                    "id": "a01-option-escore-alta",
                    "label": "Sepse está excluída"
                  },
                  {
                    "id": "a01-option-escore-clinica",
                    "label": "A clínica e a disfunção orgânica mantêm prioridade"
                  },
                  {
                    "id": "a01-option-escore-espera",
                    "label": "Aguardar o escore subir"
                  }
                ],
                "prompt": "Paciente deteriora com infecção provável, mas um escore de triagem está baixo. Qual interpretação é mais segura?"
              },
              {
                "correctOptionId": "a01-option-definicao-orgao",
                "feedback": "Sepsis-3 define sepse como disfunção orgânica ameaçadora à vida causada por resposta desregulada do hospedeiro à infecção.",
                "id": "a01-question-definicao",
                "options": [
                  {
                    "id": "a01-option-definicao-febre",
                    "label": "Febre isolada"
                  },
                  {
                    "id": "a01-option-definicao-cultura",
                    "label": "Cultura positiva isolada"
                  },
                  {
                    "id": "a01-option-definicao-orgao",
                    "label": "Infecção e nova disfunção orgânica"
                  }
                ],
                "prompt": "Qual combinação melhor sustenta a hipótese operacional de sepse?"
              },
              {
                "correctOptionId": "a01-option-mimetizador-paralelo",
                "feedback": "Sepse e outras emergências podem coexistir. O método seguro preserva hipóteses concorrentes e busca o dado que muda conduta.",
                "id": "a01-question-mimetizador",
                "options": [
                  {
                    "id": "a01-option-mimetizador-ignorar",
                    "label": "Ignorar até tratar a sepse"
                  },
                  {
                    "id": "a01-option-mimetizador-paralelo",
                    "label": "Investigar e tratar em paralelo quando plausíveis"
                  },
                  {
                    "id": "a01-option-mimetizador-impossivel",
                    "label": "Assumir que não coexistem"
                  }
                ],
                "prompt": "Ao suspeitar de sepse, o que fazer com mimetizadores tempo-dependentes?"
              }
            ],
            "title": "M5 · Recuperação ativa",
            "type": "quiz"
          },
          {
            "id": "a01-component-m6",
            "items": [
              {
                "details": "Faça a sequência sem olhar e identifique onde costuma atrasar.",
                "id": "a01-resume-d0",
                "initiallyChecked": false,
                "label": "D0 · Recite: deterioração, ABCDE, infecção, órgãos, mimetizadores, escalada"
              },
              {
                "details": "Explique em voz alta por que cada alternativa errada é insegura.",
                "id": "a01-resume-d1",
                "initiallyChecked": false,
                "label": "D1 · Refaça as três questões"
              },
              {
                "details": "Inclua hipótese principal, dois mimetizadores e gatilho de UTI.",
                "id": "a01-resume-d7",
                "initiallyChecked": false,
                "label": "D7 · Reconstrua o caso em 90 segundos"
              },
              {
                "details": "Compare fluxos de reconhecimento, escalada e reavaliação com a prática do serviço.",
                "id": "a01-resume-d14",
                "initiallyChecked": false,
                "label": "D14 · Audite um protocolo local"
              },
              {
                "details": "Treine comunicação em alça fechada e registro das incertezas.",
                "id": "a01-resume-d30",
                "initiallyChecked": false,
                "label": "D30 · Simule uma deterioração sem febre"
              }
            ],
            "title": "M6 · Retomada espaçada",
            "type": "checklist"
          },
          {
            "current": 7,
            "id": "a01-component-progress",
            "label": "M0–M6 concluídos",
            "title": "Percurso ACRA",
            "total": 7,
            "type": "progress"
          },
          {
            "id": "a01-component-sources",
            "sourceIds": [
              "a01-source-ssc2026",
              "a01-source-sepsis3"
            ],
            "title": "Diretriz e definição",
            "type": "sources"
          },
          {
            "actionIds": [
              "a01-action-review",
              "a01-action-deepen",
              "a01-action-compare"
            ],
            "id": "a01-component-followup",
            "title": "Próximas ações em modo de prévia",
            "type": "followupActions"
          }
        ],
        "critical": [
          {
            "id": "a01-critical-escopo",
            "severity": "danger",
            "text": "Em paciente real, estabilização ABCDE, avaliação médica à beira-leito, protocolo institucional, microbiologia local e julgamento clínico têm prioridade. Este ACRA não diagnostica sepse nem prescreve tratamento autonomamente.",
            "title": "Apoio educacional — não substitui protocolo assistencial"
          },
          {
            "id": "a01-critical-seguranca",
            "severity": "warning",
            "text": "Nenhum escore, biomarcador ou teste diagnóstico isolado confirma ou exclui sepse. Ferramentas como SOFA apoiam avaliação e estratificação, mas não devem atrasar resposta à deterioração. Procure simultaneamente infecção, disfunção orgânica e diagnósticos alternativos tempo-dependentes.",
            "title": "Sepse é diagnóstico clínico"
          },
          {
            "id": "a01-critical-revisao",
            "severity": "info",
            "text": "O cenário é inteiramente sintético, sem dados identificáveis de paciente. Conteúdo local destinado ao estudo TEMI; revisão clínica humana final e adaptação às condições do serviço permanecem necessárias.",
            "title": "Caso sintético e revisão médica"
          }
        ],
        "id": "a01-acra-sepse-reconhecimento-v1",
        "mode": "tutorial",
        "sources": [
          {
            "id": "a01-source-ssc2026",
            "publisher": "Society of Critical Care Medicine",
            "title": "Surviving Sepsis Campaign: Adult Guidelines 2026",
            "url": "https://www.sccm.org/survivingsepsiscampaign/guidelines-and-resources/surviving-sepsis-campaign-adult-guidelines"
          },
          {
            "id": "a01-source-sepsis3",
            "publisher": "JAMA",
            "title": "The Third International Consensus Definitions for Sepsis and Septic Shock (Sepsis-3)",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26903338/"
          }
        ],
        "subtitle": "Deterioração aguda · ameaça fisiológica · infecção possível · disfunção orgânica",
        "summary": "Micropartícula ACRA para reconhecer sepse antes que um escore tranquilize indevidamente: detectar deterioração, executar ABCDE, procurar infecção e disfunção orgânica, manter mimetizadores perigosos no radar e escalar cuidado. É apoio educacional e não realiza diagnóstico nem prescrição autônoma.",
        "title": "Pense, pode ser sepse",
        "version": "1.0"
      },
      "sha256": "0b7a8934b51669d4ddc7e0f36f7f62590e0a63344f9bcdb1cc25fa508e1c8148",
      "source": "acra/acra-sepse-01-pense-pode-ser-sepse.json"
    },
    {
      "artifact": {
        "actions": [
          {
            "contextComponentIds": [
              "a02-component-m4",
              "a02-component-m5"
            ],
            "id": "a02-action-review",
            "kind": "review",
            "label": "Revisar erros do relógio",
            "prompt": "Reabra as questões e transforme cada erro em uma frase operacional de plantão.",
            "requiresPreview": true
          },
          {
            "contextComponentIds": [
              "a02-component-m2",
              "a02-component-m3"
            ],
            "id": "a02-action-compare",
            "kind": "compare",
            "label": "Comparar os três perfis",
            "prompt": "Compare choque séptico ou sepse provável/definida, possível sem choque e baixa probabilidade sem choque, incluindo janela, investigação e trava de segurança.",
            "requiresPreview": true
          },
          {
            "contextComponentIds": [
              "a02-component-m1",
              "a02-component-sources"
            ],
            "id": "a02-action-verify",
            "kind": "verify",
            "label": "Verificar adaptação local",
            "prompt": "Confronte o raciocínio temporal com protocolo institucional, resistência local, estoque, vias de administração e fluxo de liberação.",
            "requiresPreview": true
          }
        ],
        "components": [
          {
            "id": "a02-component-m0",
            "text": "O relógio depende de duas perguntas: há choque? Qual é a probabilidade de sepse? Choque séptico possível/provável/definido ou sepse provável/definida sem choque: antimicrobiano imediato, idealmente até 1 hora. Possível sem choque: investigação rápida e limite de 3 horas se a preocupação persistir. Baixa probabilidade sem choque: diferir com vigilância ativa.",
            "title": "M0 · Essência em 30 segundos",
            "tone": "danger",
            "type": "callout"
          },
          {
            "id": "a02-component-m1",
            "items": [
              {
                "id": "a02-step-gravidade",
                "text": "Reconheça choque, hipoperfusão e disfunção orgânica em paralelo ao ABCDE. Instabilidade reduz a tolerância a atraso diagnóstico e terapêutico.",
                "title": "Classifique a gravidade agora"
              },
              {
                "id": "a02-step-probabilidade",
                "text": "Use foco, síndrome, imagem, microbiologia prévia, exposições e alternativas plausíveis. Registre se a hipótese é definida/provável, possível ou de baixa probabilidade.",
                "title": "Declare a probabilidade de sepse"
              },
              {
                "id": "a02-step-janela",
                "text": "Choque séptico ou sepse provável/definida pede início imediato, idealmente em até 1 hora. Sepse possível sem choque permite investigação rápida, com decisão até 3 horas se a preocupação persistir.",
                "title": "Aplique a janela correspondente"
              },
              {
                "id": "a02-step-amostras",
                "text": "Culturas apropriadas antes do antimicrobiano aumentam rendimento quando obtidas prontamente; não espere indefinidamente se isso atrasar tratamento necessário.",
                "title": "Colete amostras sem criar atraso inseguro"
              },
              {
                "id": "a02-step-escolha",
                "text": "Integre foco, gravidade, resistência prévia, epidemiologia local, alergias e função orgânica. Evite tanto cobertura insuficiente quanto expansão sem justificativa.",
                "title": "Escolha cobertura proporcional"
              },
              {
                "id": "a02-step-reavaliacao",
                "text": "Revise hipótese, culturas, imagem, controle de foco e resposta clínica. Interrompa antimicrobiano quando infecção deixar de ser provável e estreite cobertura quando dados permitirem.",
                "title": "Reavalie e desescale quando possível"
              }
            ],
            "title": "M1 · Mecanismo e sequência",
            "type": "numberedSteps"
          },
          {
            "columns": [
              {
                "id": "a02-column-quando",
                "label": "Quando iniciar"
              },
              {
                "id": "a02-column-investigar",
                "label": "Investigação paralela"
              },
              {
                "id": "a02-column-trava",
                "label": "Trava de segurança"
              }
            ],
            "id": "a02-component-m2",
            "rows": [
              {
                "cells": [
                  "Imediatamente, idealmente em até 1 hora após reconhecimento.",
                  "Culturas, foco, imagem e controle de foco sem atrasar estabilização e antimicrobiano.",
                  "Não esperar confirmação microbiológica ou um escore completar."
                ],
                "id": "a02-row-choque",
                "label": "Choque séptico ou sepse provável/definida"
              },
              {
                "cells": [
                  "Investigue rapidamente; se a preocupação persistir, iniciar em até 3 horas do reconhecimento.",
                  "História, exame, exames focais e mimetizadores em uma janela delimitada.",
                  "Não transformar investigação rápida em espera aberta e sem responsável."
                ],
                "id": "a02-row-possivel",
                "label": "Sepse possível sem choque"
              },
              {
                "cells": [
                  "Pode diferir enquanto procura diagnóstico alternativo.",
                  "Monitorização clínica e revisão programada da probabilidade.",
                  "Diferimento exige prazo, responsável e gatilhos de mudança; não é abandono."
                ],
                "id": "a02-row-baixa",
                "label": "Baixa probabilidade de infecção"
              }
            ],
            "title": "M2 · Perfil clínico × relógio seguro",
            "type": "comparisonTable"
          },
          {
            "id": "a02-component-m3",
            "items": [
              {
                "content": [
                  {
                    "text": "Pessoa adulta apresenta hipotensão persistente, perfusão ruim e síndrome infecciosa plausível. Classificação operacional: choque séptico provável. Antimicrobiano é iniciado imediatamente, idealmente dentro de 1 hora, em paralelo ao suporte, culturas oportunas e busca do foco.",
                    "type": "paragraph"
                  },
                  {
                    "items": [
                      "Não aguarde imagem definitiva se houver atraso inseguro.",
                      "Documente horário do reconhecimento e da administração.",
                      "Acione controle de foco desde o início quando indicado."
                    ],
                    "type": "bulletList"
                  }
                ],
                "id": "a02-case-choque",
                "initiallyOpen": true,
                "label": "1 · Hipotensão, hipoperfusão e foco provável"
              },
              {
                "content": [
                  {
                    "text": "Pessoa está hemodinamicamente estável, mas apresenta foco convincente e nova disfunção orgânica. A hipótese é provável, não apenas possível; a estratégia continua sendo início imediato, idealmente em até 1 hora, junto à investigação.",
                    "type": "paragraph"
                  }
                ],
                "id": "a02-case-provavel",
                "label": "2 · Sepse provável sem choque"
              },
              {
                "content": [
                  {
                    "text": "Pessoa sem choque apresenta taquicardia e alteração laboratorial inespecífica; infecção e causa não infecciosa são igualmente plausíveis. A equipe delimita investigação rápida e decide até 3 horas: se a preocupação com sepse persistir, administra; se a probabilidade cair, difere com monitorização.",
                    "type": "paragraph"
                  },
                  {
                    "items": [
                      "Escreva a probabilidade inicial.",
                      "Defina qual dado pode mudá-la.",
                      "Marque horário e responsável pela reavaliação."
                    ],
                    "type": "bulletList"
                  }
                ],
                "id": "a02-case-possivel",
                "label": "3 · Infecção possível e mimetizador plausível"
              },
              {
                "content": [
                  {
                    "text": "A revisão posterior confronta culturas, imagem, foco, resposta e diagnósticos alternativos. Cobertura é ajustada, estreitada ou suspensa conforme a informação acumulada e o protocolo do serviço.",
                    "type": "paragraph"
                  }
                ],
                "id": "a02-case-revisao",
                "label": "4 · O relógio não termina na primeira dose"
              }
            ],
            "title": "M3 · Três casos sintéticos, três relógios",
            "type": "accordion"
          },
          {
            "id": "a02-component-m4",
            "items": [
              {
                "id": "a02-pitfall-universal",
                "text": "Erro: ignorar probabilidade e ausência de choque. Correção: use a estrutura estratificada da diretriz.",
                "title": "Uma hora para qualquer suspeita",
                "tone": "danger"
              },
              {
                "id": "a02-pitfall-espera",
                "text": "Erro: transformar até 3 horas em espera passiva. Correção: prazo, responsável e pergunta diagnóstica explícita.",
                "title": "Investigação sem limite",
                "tone": "warning"
              },
              {
                "id": "a02-pitfall-cultura",
                "text": "Erro: atrasar tratamento indicado. Correção: colher prontamente, sem atraso inseguro.",
                "title": "Esperar cultura a qualquer custo",
                "tone": "danger"
              },
              {
                "id": "a02-pitfall-sem-revisao",
                "text": "Erro: não revisar diagnóstico e espectro. Correção: stewardship, controle de foco e desescalada seriada.",
                "title": "Primeira dose encerra o raciocínio",
                "tone": "warning"
              }
            ],
            "title": "M4 · Armadilhas do relógio",
            "type": "cards"
          },
          {
            "id": "a02-component-m5",
            "questions": [
              {
                "correctOptionId": "a02-option-choque-imediato",
                "feedback": "Choque séptico exige antimicrobiano imediato, idealmente em até 1 hora, sem atrasar suporte e controle de foco.",
                "id": "a02-question-choque",
                "options": [
                  {
                    "id": "a02-option-choque-imediato",
                    "label": "Imediatamente, idealmente até 1 hora"
                  },
                  {
                    "id": "a02-option-choque-tres",
                    "label": "Sempre aguardar 3 horas"
                  },
                  {
                    "id": "a02-option-choque-cultura",
                    "label": "Somente após cultura positiva"
                  }
                ],
                "prompt": "Em choque séptico provável, qual janela é mais consistente com a diretriz?"
              },
              {
                "correctOptionId": "a02-option-possivel-janela",
                "feedback": "A janela diagnóstica deve ser ativa e limitada. Persistindo preocupação com sepse, o antimicrobiano deve ser administrado em até 3 horas.",
                "id": "a02-question-possivel",
                "options": [
                  {
                    "id": "a02-option-possivel-universal",
                    "label": "Aplicar uma hora de forma automática"
                  },
                  {
                    "id": "a02-option-possivel-janela",
                    "label": "Investigar rápido e decidir até 3 horas"
                  },
                  {
                    "id": "a02-option-possivel-dias",
                    "label": "Esperar vários dias sem monitorização"
                  }
                ],
                "prompt": "Na sepse possível sem choque, qual estratégia é mais segura?"
              },
              {
                "correctOptionId": "a02-option-baixa-ativo",
                "feedback": "Diferimento seguro é uma estratégia ativa: prazo, responsável, sinais de alarme e revisão da probabilidade.",
                "id": "a02-question-baixa",
                "options": [
                  {
                    "id": "a02-option-baixa-abandono",
                    "label": "Encerrar monitorização"
                  },
                  {
                    "id": "a02-option-baixa-ativo",
                    "label": "Vigiar, investigar alternativas e reavaliar"
                  },
                  {
                    "id": "a02-option-baixa-infeccao",
                    "label": "Confirmar que infecção é impossível"
                  }
                ],
                "prompt": "Quando a probabilidade de infecção é baixa, diferir antimicrobiano significa o quê?"
              }
            ],
            "title": "M5 · Recuperação ativa",
            "type": "quiz"
          },
          {
            "id": "a02-component-m6",
            "items": [
              {
                "details": "Choque séptico ou sepse provável/definida, possível sem choque e baixa probabilidade sem choque.",
                "id": "a02-resume-d0",
                "initiallyChecked": false,
                "label": "D0 · Diga as três categorias do relógio"
              },
              {
                "details": "Recupere as janelas sem consultar a tabela.",
                "id": "a02-resume-d1",
                "initiallyChecked": false,
                "label": "D1 · Refaça as três questões"
              },
              {
                "details": "Registre gravidade, probabilidade, janela e próxima reavaliação.",
                "id": "a02-resume-d7",
                "initiallyChecked": false,
                "label": "D7 · Classifique três cenários do plantão"
              },
              {
                "details": "Identifique onde fluxo, resistência e stewardship exigem adaptação.",
                "id": "a02-resume-d14",
                "initiallyChecked": false,
                "label": "D14 · Compare com protocolo e antibiograma local"
              },
              {
                "details": "Declare probabilidade, relógio, amostras, cobertura e plano de revisão.",
                "id": "a02-resume-d30",
                "initiallyChecked": false,
                "label": "D30 · Simule decisão em 90 segundos"
              }
            ],
            "title": "M6 · Retomada espaçada",
            "type": "checklist"
          },
          {
            "current": 7,
            "id": "a02-component-progress",
            "label": "M0–M6 concluídos",
            "title": "Percurso ACRA",
            "total": 7,
            "type": "progress"
          },
          {
            "id": "a02-component-sources",
            "sourceIds": [
              "a02-source-ssc2026",
              "a02-source-timing2026"
            ],
            "title": "Diretriz e ferramenta oficial",
            "type": "sources"
          },
          {
            "actionIds": [
              "a02-action-review",
              "a02-action-compare",
              "a02-action-verify"
            ],
            "id": "a02-component-followup",
            "title": "Próximas ações em modo de prévia",
            "type": "followupActions"
          }
        ],
        "critical": [
          {
            "id": "a02-critical-escopo",
            "severity": "danger",
            "text": "Seleção, dose, infusão, alergias, função renal/hepática, interações, foco, resistência local e controle de foco exigem avaliação individual e protocolo institucional. Este ACRA não emite prescrição autônoma.",
            "title": "Apoio educacional — não prescreve antimicrobiano"
          },
          {
            "id": "a02-critical-seguranca",
            "severity": "warning",
            "text": "No choque séptico ou na sepse provável/definida, inicie imediatamente, idealmente em até 1 hora. Na sepse possível sem choque, faça investigação rápida e, se a preocupação persistir, administre em até 3 horas. Baixa probabilidade sem choque permite diferimento com monitorização e reavaliação documentadas.",
            "title": "Uma hora não é regra cega para todos"
          },
          {
            "id": "a02-critical-revisao",
            "severity": "info",
            "text": "Os três cenários são sintéticos e não contêm dados identificáveis. Conteúdo local para treino TEMI; revisão médica final e adaptação à epidemiologia e aos fluxos do serviço permanecem obrigatórias.",
            "title": "Cenários sintéticos e revisão médica"
          }
        ],
        "id": "a02-acra-sepse-relogio-antimicrobiano-v1",
        "mode": "tutorial",
        "sources": [
          {
            "id": "a02-source-ssc2026",
            "publisher": "Society of Critical Care Medicine",
            "title": "Surviving Sepsis Campaign: Adult Guidelines 2026",
            "url": "https://www.sccm.org/survivingsepsiscampaign/guidelines-and-resources/surviving-sepsis-campaign-adult-guidelines"
          },
          {
            "id": "a02-source-timing2026",
            "publisher": "Society of Critical Care Medicine",
            "title": "SSC Adult Antibiotic Timing Framework Infographic 2026",
            "url": "https://www.sccm.org/SCCM/media/SCCM/PDFs/SSC-Adult-Antibiotic-Timing-Framework-Infographic-2026.pdf"
          }
        ],
        "subtitle": "Choque · probabilidade de sepse · investigação rápida · reavaliação",
        "summary": "Micropartícula ACRA para aplicar o tempo do antimicrobiano por gravidade e probabilidade: início imediato, idealmente em até 1 hora, no choque séptico ou na sepse provável/definida; investigação rápida e limitada no caso possível sem choque; diferimento monitorado quando a probabilidade de infecção é baixa e não há choque. Não substitui protocolo, infectologia, microbiologia local ou prescrição médica.",
        "title": "O relógio do antimicrobiano",
        "version": "1.0"
      },
      "sha256": "7771e3ea89ea140061967dc589ceb983233acf9c6b8469e2c4dcdc1e9d52bd55",
      "source": "acra/acra-sepse-02-relogio-antimicrobiano.json"
    },
    {
      "artifact": {
        "actions": [
          {
            "contextComponentIds": [
              "a03-component-m4",
              "a03-component-m5"
            ],
            "id": "a03-action-review",
            "kind": "review",
            "label": "Revisar armadilhas",
            "prompt": "Revise as armadilhas e formule uma pergunta de controle de foco para cada uma.",
            "requiresPreview": true
          },
          {
            "contextComponentIds": [
              "a03-component-m1",
              "a03-component-m2"
            ],
            "id": "a03-action-deepen",
            "kind": "deepen",
            "label": "Aprofundar anatomia",
            "prompt": "Relacione coleção, perfuração, obstrução e dispositivo às equipes e aos métodos que podem resolver cada foco.",
            "requiresPreview": true
          },
          {
            "contextComponentIds": [
              "a03-component-m2",
              "a03-component-m3"
            ],
            "id": "a03-action-verify",
            "kind": "verify",
            "label": "Verificar logística local",
            "prompt": "Confira contatos, disponibilidade de imagem, cirurgia, radiologia intervencionista, endoscopia e transporte no protocolo institucional.",
            "requiresPreview": true
          }
        ],
        "components": [
          {
            "id": "a03-component-m0",
            "text": "Se há material infectado, tecido desvitalizado, perfuração, obstrução ou dispositivo infectado, pergunte: o que precisa ser drenado, removido, desbridado, reparado ou descomprimido? Antimicrobiano compra tempo; anatomia não resolvida pode sustentar o choque.",
            "title": "M0 · Essência em 30 segundos",
            "tone": "danger",
            "type": "callout"
          },
          {
            "id": "a03-component-m1",
            "items": [
              {
                "id": "a03-step-suspeitar",
                "text": "Considere resposta inadequada, piora após melhora transitória, bacteremia persistente, coleção, obstrução, isquemia, necrose, perfuração ou dispositivo potencialmente infectado.",
                "title": "Suspeite de foco não controlado"
              },
              {
                "id": "a03-step-anatomia",
                "text": "Use exame e imagem direcionados pela síndrome. A pergunta não é apenas onde começou, mas qual estrutura mantém inóculo, pressão, tecido desvitalizado ou comunicação anormal.",
                "title": "Localize a anatomia"
              },
              {
                "id": "a03-step-equipe",
                "text": "Cirurgia, radiologia intervencionista, endoscopia, urologia ou outra equipe deve participar enquanto a ressuscitação ocorre. Transferência pode integrar o controle de foco.",
                "title": "Acione cedo quem pode resolver"
              },
              {
                "id": "a03-step-escolha",
                "text": "Compare efetividade, invasividade, velocidade, risco anestésico, chance de acesso e necessidade de material microbiológico. A opção menos invasiva só é melhor se tiver probabilidade adequada de funcionar.",
                "title": "Escolha a abordagem apropriada"
              },
              {
                "id": "a03-step-executar",
                "text": "Faça suporte, antimicrobiano, correções essenciais e logística em paralelo. Quando o foco específico requer intervenção, use como objetivo controle precoce, idealmente em até 6 horas se viável; não espere normalização completa se o próprio foco impede estabilização.",
                "title": "Execute sem atraso indevido"
              },
              {
                "id": "a03-step-confirmar",
                "text": "Documente achado, material removido, permeabilidade do dreno e resposta clínica. Persistência de choque exige reavaliar drenagem incompleta, novo foco, complicação ou diagnóstico alternativo.",
                "title": "Confirme a eficácia"
              }
            ],
            "title": "M1 · Mecanismo e sequência",
            "type": "numberedSteps"
          },
          {
            "columns": [
              {
                "id": "a03-column-problema",
                "label": "Problema a resolver"
              },
              {
                "id": "a03-column-acao",
                "label": "Modalidade possível"
              },
              {
                "id": "a03-column-falha",
                "label": "Como reconhecer falha"
              }
            ],
            "id": "a03-component-m2",
            "rows": [
              {
                "cells": [
                  "Reduzir inóculo e pressão em cavidade infectada.",
                  "Drenagem percutânea, endoscópica ou cirúrgica conforme anatomia e recurso.",
                  "Dreno sem débito esperado, coleção residual ou resposta fisiológica inadequada."
                ],
                "id": "a03-row-colecao",
                "label": "Coleção fechada"
              },
              {
                "cells": [
                  "Interromper contaminação e remover/reparar tecido inviável.",
                  "Abordagem cirúrgica ou endoscópica selecionada pela equipe responsável.",
                  "Contaminação persistente, nova coleção ou disfunção orgânica em progressão."
                ],
                "id": "a03-row-perfuracao",
                "label": "Perfuração, isquemia ou necrose"
              },
              {
                "cells": [
                  "Restabelecer drenagem urinária, biliar ou de outra estrutura.",
                  "Descompressão por via apropriada ao sítio e à estabilidade.",
                  "Drenagem ineficaz, obstrução residual ou sinais infecciosos persistentes."
                ],
                "id": "a03-row-obstrucao",
                "label": "Sistema obstruído"
              },
              {
                "cells": [
                  "Eliminar biofilme e fonte contínua quando o dispositivo é provável foco.",
                  "Remoção ou troca conforme tipo, indicação, acesso alternativo e protocolo.",
                  "Bacteremia persistente, sinais locais ou recidiva sem outra fonte."
                ],
                "id": "a03-row-dispositivo",
                "label": "Dispositivo infectado"
              }
            ],
            "title": "M2 · Foco provável × ação anatômica",
            "type": "comparisonTable"
          },
          {
            "id": "a03-component-m3",
            "items": [
              {
                "content": [
                  {
                    "text": "Pessoa adulta apresenta choque, dor abdominal e imagem com coleção pós-operatória. Suporte e antimicrobiano foram iniciados, mas o foco é anatomicamente controlável; radiologia intervencionista e cirurgia são acionadas já na avaliação inicial.",
                    "type": "paragraph"
                  },
                  {
                    "items": [
                      "Defina se há drenagem percutânea segura e efetiva.",
                      "Antecipe acesso, hemoderivados, transporte e suporte durante o procedimento.",
                      "Registre o que tornaria necessária outra abordagem."
                    ],
                    "type": "bulletList"
                  }
                ],
                "id": "a03-case-entrada",
                "initiallyOpen": true,
                "label": "1 · Choque abdominal"
              },
              {
                "content": [
                  {
                    "text": "Após antimicrobiano e suporte, a pressão melhora transitoriamente, porém perfusão e necessidade de vasopressor voltam a piorar. A equipe evita atribuir tudo à vasoplegia e prioriza o controle anatômico.",
                    "type": "paragraph"
                  }
                ],
                "id": "a03-case-resposta",
                "label": "2 · Melhora parcial não prova resolução"
              },
              {
                "content": [
                  {
                    "text": "O procedimento obtém material purulento para microbiologia e posiciona dreno. A equipe documenta volume, aspecto, permeabilidade, limitações e se existe componente não acessado.",
                    "type": "paragraph"
                  },
                  {
                    "items": [
                      "Resultado técnico não equivale automaticamente a sucesso clínico.",
                      "Integre débito do dreno, imagem quando indicada e evolução orgânica."
                    ],
                    "type": "bulletList"
                  }
                ],
                "id": "a03-case-procedimento",
                "label": "3 · Drenagem realizada"
              },
              {
                "content": [
                  {
                    "text": "Se o choque persiste, reabra o caso: dreno mal posicionado ou obstruído, coleção loculada, perfuração não reparada, segundo foco, antimicrobiano inadequado, complicação do procedimento ou diagnóstico concorrente.",
                    "type": "paragraph"
                  }
                ],
                "id": "a03-case-falha",
                "label": "4 · Persistência após intervenção"
              }
            ],
            "title": "M3 · Caso sintético progressivo",
            "type": "accordion"
          },
          {
            "id": "a03-component-m4",
            "items": [
              {
                "id": "a03-pitfall-antibiotico",
                "text": "Erro: responder à anatomia não resolvida apenas com mais antimicrobiano. Correção: procurar foco controlável.",
                "title": "Escalar espectro indefinidamente",
                "tone": "danger"
              },
              {
                "id": "a03-pitfall-perfeito",
                "text": "Erro: ignorar que o foco mantém o choque. Correção: otimizar o essencial e organizar intervenção em paralelo.",
                "title": "Esperar estabilidade perfeita",
                "tone": "warning"
              },
              {
                "id": "a03-pitfall-menos-invasivo",
                "text": "Erro: escolher uma técnica incapaz de resolver a anatomia. Correção: efetividade e segurança vêm antes do rótulo.",
                "title": "Menos invasivo sempre é melhor",
                "tone": "warning"
              },
              {
                "id": "a03-pitfall-realizado",
                "text": "Erro: não verificar resultado. Correção: confirmar drenagem, anatomia residual e resposta clínica.",
                "title": "Procedimento realizado = foco resolvido",
                "tone": "danger"
              }
            ],
            "title": "M4 · Armadilhas do controle de foco",
            "type": "cards"
          },
          {
            "id": "a03-component-m5",
            "questions": [
              {
                "correctOptionId": "a03-option-colecao-paralelo",
                "feedback": "Quando um diagnóstico anatômico específico requer controle, prefira intervenção precoce, idealmente em até 6 horas se médica e logisticamente praticável, junto à ressuscitação; a modalidade não é automática.",
                "id": "a03-question-colecao",
                "options": [
                  {
                    "id": "a03-option-colecao-espectro",
                    "label": "Apenas ampliar antimicrobiano"
                  },
                  {
                    "id": "a03-option-colecao-paralelo",
                    "label": "Suporte e controle de foco em paralelo"
                  },
                  {
                    "id": "a03-option-colecao-esperar",
                    "label": "Esperar normalização completa"
                  }
                ],
                "prompt": "Choque persiste com coleção abdominal drenável. Qual princípio é mais seguro?"
              },
              {
                "correctOptionId": "a03-option-modalidade-efetiva",
                "feedback": "A abordagem apropriada é a que tem chance suficiente de resolver o problema anatômico com risco aceitável naquele contexto.",
                "id": "a03-question-modalidade",
                "options": [
                  {
                    "id": "a03-option-modalidade-menor",
                    "label": "Escolher sempre a menos invasiva"
                  },
                  {
                    "id": "a03-option-modalidade-efetiva",
                    "label": "Equilibrar efetividade, anatomia, risco e recurso"
                  },
                  {
                    "id": "a03-option-modalidade-antibiotico",
                    "label": "Evitar ambas se há antimicrobiano"
                  }
                ],
                "prompt": "Como comparar drenagem percutânea e cirurgia?"
              },
              {
                "correctOptionId": "a03-option-sucesso-confirmar",
                "feedback": "Sucesso técnico precisa ser confrontado com permeabilidade, resolução anatômica e evolução fisiológica; falha exige reabertura diagnóstica.",
                "id": "a03-question-sucesso",
                "options": [
                  {
                    "id": "a03-option-sucesso-feito",
                    "label": "Apenas registrar que foi feito"
                  },
                  {
                    "id": "a03-option-sucesso-confirmar",
                    "label": "Confirmar função, anatomia residual e resposta"
                  },
                  {
                    "id": "a03-option-sucesso-parar",
                    "label": "Suspender toda reavaliação"
                  }
                ],
                "prompt": "Após colocar um dreno, qual dado melhor fecha o ciclo de segurança?"
              }
            ],
            "title": "M5 · Recuperação ativa",
            "type": "quiz"
          },
          {
            "id": "a03-component-m6",
            "items": [
              {
                "details": "Suspeitar, localizar, acionar, escolher, executar e confirmar.",
                "id": "a03-resume-d0",
                "initiallyChecked": false,
                "label": "D0 · Recite os seis verbos do controle de foco"
              },
              {
                "details": "Explique a trava de segurança de cada resposta.",
                "id": "a03-resume-d1",
                "initiallyChecked": false,
                "label": "D1 · Refaça as três questões"
              },
              {
                "details": "Coleção, perfuração/necrose, obstrução e dispositivo.",
                "id": "a03-resume-d7",
                "initiallyChecked": false,
                "label": "D7 · Mapeie quatro focos controláveis"
              },
              {
                "details": "Identifique contatos, recursos, transferência e gargalos fora do horário comercial.",
                "id": "a03-resume-d14",
                "initiallyChecked": false,
                "label": "D14 · Revise o fluxo institucional"
              },
              {
                "details": "Liste cinco causas antes de apenas ampliar antimicrobiano.",
                "id": "a03-resume-d30",
                "initiallyChecked": false,
                "label": "D30 · Simule falha após drenagem"
              }
            ],
            "title": "M6 · Retomada espaçada",
            "type": "checklist"
          },
          {
            "current": 7,
            "id": "a03-component-progress",
            "label": "M0–M6 concluídos",
            "title": "Percurso ACRA",
            "total": 7,
            "type": "progress"
          },
          {
            "id": "a03-component-sources",
            "sourceIds": [
              "a03-source-ssc2026"
            ],
            "title": "Diretriz oficial",
            "type": "sources"
          },
          {
            "actionIds": [
              "a03-action-review",
              "a03-action-deepen",
              "a03-action-verify"
            ],
            "id": "a03-component-followup",
            "title": "Próximas ações em modo de prévia",
            "type": "followupActions"
          }
        ],
        "critical": [
          {
            "id": "a03-critical-escopo",
            "severity": "danger",
            "text": "Drenagem, cirurgia, desbridamento, retirada de dispositivo e transferência dependem de anatomia, estabilidade, risco, competência, recursos e decisão multidisciplinar. Este ACRA não realiza indicação ou prescrição autônoma.",
            "title": "Apoio educacional — não indica procedimento"
          },
          {
            "id": "a03-critical-seguranca",
            "severity": "warning",
            "text": "Antimicrobiano e suporte não substituem uma intervenção necessária. A SSC 2026 sugere, de forma condicional e com certeza muito baixa, controle precoce, idealmente em até 6 horas do diagnóstico de sepse ou choque séptico que exija controle; viabilidade, modalidade e momento continuam individualizados.",
            "title": "Estabilizar e controlar o foco são trilhos paralelos"
          },
          {
            "id": "a03-critical-revisao",
            "severity": "info",
            "text": "O cenário abdominal é inteiramente sintético e não contém dados identificáveis. Conteúdo local para treino TEMI; revisão clínica humana e adequação à cirurgia, radiologia intervencionista e fluxos do serviço permanecem obrigatórias.",
            "title": "Caso sintético e revisão médica"
          }
        ],
        "id": "a03-acra-sepse-controle-foco-v1",
        "mode": "tutorial",
        "sources": [
          {
            "id": "a03-source-ssc2026",
            "publisher": "Society of Critical Care Medicine",
            "title": "Surviving Sepsis Campaign: Adult Guidelines 2026",
            "url": "https://www.sccm.org/survivingsepsiscampaign/guidelines-and-resources/surviving-sepsis-campaign-adult-guidelines"
          }
        ],
        "subtitle": "Anatomia · equipe certa · intervenção · confirmação de eficácia",
        "summary": "Micropartícula ACRA para reconhecer quando a persistência da sepse depende de controle de foco: localizar a anatomia, acionar precocemente a equipe capaz de intervir, escolher a abordagem efetiva e menos invasiva apropriada e confirmar se o foco foi realmente controlado. Não indica procedimento nem substitui avaliação multidisciplinar.",
        "title": "Antibiótico não drena pus",
        "version": "1.0"
      },
      "sha256": "3bff76659512bb71b39cb90e0509a3f6f41b7db5fd21163935136834f6e39eb8",
      "source": "acra/acra-sepse-03-antibiotico-nao-drena-pus.json"
    },
    {
      "artifact": {
        "actions": [
          {
            "contextComponentIds": [
              "a04-component-m4",
              "a04-component-m5"
            ],
            "id": "a04-action-review",
            "kind": "review",
            "label": "Revisar armadilhas",
            "prompt": "Reabra M4 e explique em uma frase por que cada armadilha pode causar sobrecarga ou atraso do tratamento correto.",
            "requiresPreview": true
          },
          {
            "contextComponentIds": [
              "a04-component-m1",
              "a04-component-m2"
            ],
            "id": "a04-action-compare",
            "kind": "compare",
            "label": "Comparar os três conceitos",
            "prompt": "Compare necessidade, responsividade e tolerância e dê um exemplo em que apenas uma ou duas dessas condições estejam presentes.",
            "requiresPreview": true
          },
          {
            "contextComponentIds": [
              "a04-component-m1",
              "a04-component-sources"
            ],
            "id": "a04-action-deepen",
            "kind": "deepen",
            "label": "Aprofundar a evidência",
            "prompt": "Revise a recomendação SSC 2026 sobre fluidos e medidas dinâmicas e compare seus limites com a estratégia personalizada do ANDROMEDA-SHOCK-2.",
            "requiresPreview": true
          }
        ],
        "components": [
          {
            "id": "a04-component-m0",
            "text": "Antes de cada ciclo, responda: há hipoperfusão que o fluido pode corrigir? Uma manobra dinâmica aumenta volume sistólico/débito? Pulmão, sistema venoso e ventrículos toleram expansão? Defina o benefício esperado e o sinal de parada antes de intervir.",
            "title": "M0 · Essência em 30 segundos",
            "tone": "warning",
            "type": "callout"
          },
          {
            "id": "a04-component-m1",
            "items": [
              {
                "id": "a04-step-threat",
                "text": "Avalie perfusão, pressão confiável, oxigenação, consciência, pele, diurese e tendência do lactato; procure hemorragia, vasoplegia, disfunção cardíaca e obstrução sem atrasar suporte tempo-dependente.",
                "title": "Reconheça a ameaça e trate em paralelo"
              },
              {
                "id": "a04-step-need",
                "text": "Identifique perda, baixa pré-carga efetiva ou outro mecanismo em que elevar retorno venoso possa melhorar fluxo. Pressão baixa sozinha não diferencia vasoplegia, bomba, tanque ou obstrução.",
                "title": "Pergunta 1 — há necessidade plausível?"
              },
              {
                "id": "a04-step-response",
                "text": "Quando válida, use elevação passiva das pernas ou pequena prova acompanhada por mudança de volume sistólico, débito ou variável dinâmica apropriada. Medidas estáticas isoladas têm baixo poder decisório.",
                "title": "Pergunta 2 — há responsividade dinâmica?"
              },
              {
                "id": "a04-step-tolerance",
                "text": "Procure congestão pulmonar e venosa, piora de oxigenação, pressões de enchimento elevadas, disfunção de VD/VE e pressão abdominal. Um paciente pode ser responsivo e, ainda assim, ter margem de segurança pequena.",
                "title": "Pergunta 3 — há tolerância?"
              },
              {
                "id": "a04-step-cycle",
                "text": "A SSC 2026 sugere pelo menos 30 mL/kg de cristaloide IV nas primeiras 3 horas na hipoperfusão induzida por sepse ou choque séptico, mas a recomendação é condicional: individualize o volume e reavalie frequentemente, sem completar o número cegamente.",
                "title": "Faça um ciclo por vez, individualizado"
              },
              {
                "id": "a04-step-stop",
                "text": "Repita somente com ganho relevante e tolerância preservada. Sem resposta ou com dano, suspenda expansão, reclassifique o fenótipo e considere vasopressor, correção da bomba/obstrução ou nenhuma nova intervenção.",
                "title": "Pare, pivote ou repita conscientemente"
              }
            ],
            "title": "M1 · Mecanismo: fluido como fármaco",
            "type": "numberedSteps"
          },
          {
            "columns": [
              {
                "id": "a04-column-question",
                "label": "Dado que ajuda"
              },
              {
                "id": "a04-column-limit",
                "label": "O que não prova"
              },
              {
                "id": "a04-column-conduct",
                "label": "Próxima decisão"
              }
            ],
            "id": "a04-component-m2",
            "rows": [
              {
                "cells": [
                  "Hipoperfusão, perdas e contexto compatível com baixa pré-carga efetiva.",
                  "Que toda hipotensão seja déficit de volume.",
                  "Diferenciar tanque, vasoplegia, bomba e obstrução."
                ],
                "id": "a04-row-need",
                "label": "Necessidade"
              },
              {
                "cells": [
                  "Aumento mensurável de fluxo após manobra dinâmica válida.",
                  "Que o fluido seja necessário, seguro ou capaz de melhorar desfecho.",
                  "Confirmar tolerância e definir alvo clínico antes do ciclo."
                ],
                "id": "a04-row-response",
                "label": "Responsividade"
              },
              {
                "cells": [
                  "Pulmão, oxigenação, sistema venoso, VD/VE e abdome sem sinais relevantes de sobrecarga.",
                  "Que a expansão possa continuar sem limite.",
                  "Vigiar toxicidade durante e após cada intervenção."
                ],
                "id": "a04-row-tolerance",
                "label": "Tolerância"
              },
              {
                "cells": [
                  "Melhora coerente de fluxo e perfusão, não apenas de pressão.",
                  "Que lactato ou PAM isolados representem perfusão restaurada.",
                  "Documentar resposta, dano e novo fenótipo; então decidir."
                ],
                "id": "a04-row-benefit",
                "label": "Benefício real"
              }
            ],
            "title": "M2 · Decisão segura: três perguntas, três respostas",
            "type": "comparisonTable"
          },
          {
            "id": "a04-component-m3",
            "items": [
              {
                "content": [
                  {
                    "text": "Pessoa adulta com provável pneumonia, PAM reduzida, enchimento capilar lento e oligúria. A equipe inicia suporte e quer administrar volume apenas porque a pressão está baixa.",
                    "type": "paragraph"
                  },
                  {
                    "items": [
                      "Recupere: quais mecanismos além de baixa pré-carga explicam a hipotensão?",
                      "Decida: qual variável mostrará ganho de fluxo/perfusão e qual sinal fará parar?"
                    ],
                    "type": "bulletList"
                  }
                ],
                "id": "a04-case-stage-1",
                "initiallyOpen": true,
                "label": "1 · Entrada: hipotensão e hipoperfusão"
              },
              {
                "content": [
                  {
                    "text": "A elevação passiva das pernas, tecnicamente válida, aumenta o volume sistólico estimado. Não há congestão importante e a oxigenação permanece estável. Um pequeno ciclo individualizado é realizado segundo protocolo local.",
                    "type": "paragraph"
                  },
                  {
                    "items": [
                      "A resposta dinâmica apoia capacidade de elevar fluxo; não prova segurança ilimitada.",
                      "Reavalie imediatamente perfusão, débito e sinais de intolerância."
                    ],
                    "type": "bulletList"
                  }
                ],
                "id": "a04-case-stage-2",
                "initiallyOpen": false,
                "label": "2 · Primeira janela de oportunidade"
              },
              {
                "content": [
                  {
                    "text": "Após melhora inicial, nova manobra já não aumenta fluxo. Surgem crepitações, piora da oxigenação, congestão venosa e dilatação de VD. A PAM continua limítrofe.",
                    "type": "paragraph"
                  },
                  {
                    "items": [
                      "Mais fluido agora tem baixa probabilidade de benefício e risco crescente.",
                      "Reabra vasoplegia, disfunção de VD, ventilação, obstrução e adequação do vasopressor."
                    ],
                    "type": "bulletList"
                  }
                ],
                "id": "a04-case-stage-3",
                "initiallyOpen": false,
                "label": "3 · A fisiologia muda"
              },
              {
                "content": [
                  {
                    "text": "A equipe interrompe expansão, ajusta suporte conforme o fenótipo reavaliado, procura causas reversíveis e define nova checagem em minutos. O acerto foi mudar de estratégia quando benefício e tolerância desapareceram.",
                    "type": "paragraph"
                  },
                  {
                    "items": [
                      "Registre: indicação, intervenção, variável de resposta, toxicidade e decisão subsequente.",
                      "Não transforme a melhora do primeiro ciclo em permissão para repetir o segundo."
                    ],
                    "type": "bulletList"
                  }
                ],
                "id": "a04-case-stage-4",
                "initiallyOpen": false,
                "label": "4 · Resolução do dilema"
              }
            ],
            "title": "M3 · Caso sintético progressivo",
            "type": "accordion"
          },
          {
            "id": "a04-component-m4",
            "items": [
              {
                "id": "a04-trap-hypotension",
                "text": "Erro: ignorar vasoplegia, falência cardíaca ou obstrução. Correção: classificar mecanismo e perfusão antes de escolher a intervenção.",
                "title": "Hipotensão = hipovolemia",
                "tone": "danger"
              },
              {
                "id": "a04-trap-responsive",
                "text": "Erro: confundir capacidade de aumentar fluxo com necessidade clínica e tolerância. Correção: exigir as três perguntas separadamente.",
                "title": "Responsivo = deve receber fluido",
                "tone": "warning"
              },
              {
                "id": "a04-trap-recommendation",
                "text": "Erro: tratar a sugestão condicional de 30 mL/kg como ordem automática apesar da mudança fisiológica. Correção: considerar contexto e reavaliar benefício e dano com frequência.",
                "title": "Recomendação inicial em piloto automático",
                "tone": "warning"
              },
              {
                "id": "a04-trap-static",
                "text": "Erro: usar VCI, PVC, lactato ou pressão isoladamente. Correção: integrar variáveis dinâmicas, perfusão, congestão e contexto.",
                "title": "Um marcador estático decide tudo",
                "tone": "info"
              }
            ],
            "title": "M4 · Armadilhas que produzem sobrecarga",
            "type": "cards"
          },
          {
            "id": "a04-component-m5",
            "questions": [
              {
                "correctOptionId": "a04-option-responsive-capacity",
                "feedback": "Responsividade dinâmica informa potencial de aumento de fluxo. A decisão de expandir ainda depende de hipoperfusão potencialmente reversível, risco de dano, alvo e reavaliação.",
                "id": "a04-question-responsive",
                "options": [
                  {
                    "id": "a04-option-responsive-auto",
                    "label": "Indica bolus repetidos automaticamente"
                  },
                  {
                    "id": "a04-option-responsive-capacity",
                    "label": "Apoia capacidade de aumentar fluxo, mas exige necessidade e tolerância"
                  },
                  {
                    "id": "a04-option-responsive-none",
                    "label": "Não tem utilidade clínica"
                  }
                ],
                "prompt": "Uma manobra dinâmica válida aumenta o volume sistólico. Qual interpretação é mais segura?"
              },
              {
                "correctOptionId": "a04-option-congestion-stop",
                "feedback": "Ausência de ganho e perda de tolerância mudam a relação benefício–dano. Pare o fluido cego e procure vasoplegia, falência cardíaca, obstrução e outras causas.",
                "id": "a04-question-congestion",
                "options": [
                  {
                    "id": "a04-option-congestion-continue",
                    "label": "Continuar até completar um volume predefinido"
                  },
                  {
                    "id": "a04-option-congestion-stop",
                    "label": "Interromper expansão e reclassificar a fisiologia"
                  },
                  {
                    "id": "a04-option-congestion-lactate",
                    "label": "Usar apenas o lactato para decidir"
                  }
                ],
                "prompt": "Após benefício inicial, não há nova resposta dinâmica e surgem congestão e piora da oxigenação. O melhor princípio é:"
              },
              {
                "correctOptionId": "a04-option-loop-three",
                "feedback": "A recomendação se aplica à hipoperfusão induzida por sepse ou ao choque séptico, tem baixa certeza e exige consideração das características do paciente, do contexto e reavaliação frequente contra sub ou sobrerressuscitação.",
                "id": "a04-question-loop",
                "options": [
                  {
                    "id": "a04-option-loop-number",
                    "label": "Ordem rígida que dispensa reavaliação"
                  },
                  {
                    "id": "a04-option-loop-three",
                    "label": "Recomendação condicional, individualizada e reavaliada"
                  },
                  {
                    "id": "a04-option-loop-pressure",
                    "label": "Regra aplicável a qualquer hipotensão"
                  }
                ],
                "prompt": "Como interpretar a sugestão SSC 2026 de pelo menos 30 mL/kg de cristaloide IV nas primeiras 3 horas?"
              }
            ],
            "title": "M5 · Recuperação ativa",
            "type": "quiz"
          },
          {
            "id": "a04-component-m6",
            "items": [
              {
                "details": "Necessidade, responsividade e tolerância; acrescente um marcador de benefício e um de dano.",
                "id": "a04-resume-d0",
                "initiallyChecked": false,
                "label": "D0 · Diga sem olhar as três perguntas"
              },
              {
                "details": "Explique por que responsividade não equivale a indicação automática de fluido.",
                "id": "a04-resume-d1",
                "initiallyChecked": false,
                "label": "D1 · Refazer as três questões"
              },
              {
                "details": "Marque o ponto exato em que o benefício terminou e a toxicidade começou.",
                "id": "a04-resume-d7",
                "initiallyChecked": false,
                "label": "D7 · Reconstruir o caso em 90 segundos"
              },
              {
                "details": "Tanque, vasoplegia, bomba e obstrução; diga qual dado mudaria a conduta em cada um.",
                "id": "a04-resume-d14",
                "initiallyChecked": false,
                "label": "D14 · Comparar quatro mecanismos de hipotensão"
              },
              {
                "details": "Declare indicação, alvo, teste, intervenção, reavaliação e critério de parada conforme protocolo local.",
                "id": "a04-resume-d30",
                "initiallyChecked": false,
                "label": "D30 · Simular um ciclo hemodinâmico"
              }
            ],
            "title": "M6 · Retomada espaçada",
            "type": "checklist"
          },
          {
            "current": 7,
            "id": "a04-component-progress",
            "label": "ACRA 04 · M0–M6",
            "title": "Percurso concluído",
            "total": 7,
            "type": "progress"
          },
          {
            "id": "a04-component-sources",
            "sourceIds": [
              "a04-source-ssc2026",
              "a04-source-hemodynamic-guide",
              "a04-source-andromeda2"
            ],
            "title": "Fontes oficiais e estudo primário",
            "type": "sources"
          },
          {
            "actionIds": [
              "a04-action-review",
              "a04-action-compare",
              "a04-action-deepen"
            ],
            "id": "a04-component-followup",
            "title": "Próximas ações sugeridas",
            "type": "followupActions"
          }
        ],
        "critical": [
          {
            "id": "a04-critical-educational-scope",
            "severity": "danger",
            "text": "Este ACRA não prescreve volume, solução ou velocidade. Instabilidade exige ABCDE, tratamento simultâneo da causa, monitorização, julgamento clínico e protocolo institucional com supervisão médica.",
            "title": "Apoio educacional — não é protocolo assistencial"
          },
          {
            "id": "a04-critical-stop-blind-fluid",
            "severity": "warning",
            "text": "A SSC 2026 sugere pelo menos 30 mL/kg de cristaloide IV nas primeiras 3 horas para hipoperfusão induzida por sepse ou choque séptico, com baixa certeza. Volume inicial deve considerar paciente e contexto, com reavaliação frequente para evitar sub ou sobrerressuscitação.",
            "title": "30 mL/kg é recomendação condicional, não piloto automático"
          },
          {
            "id": "a04-critical-synthetic-review",
            "severity": "info",
            "text": "O cenário é fictício e não contém dados de paciente. Conteúdo local para estudo TEMI; requer revisão clínica humana final e não está integrado ao fluxo assistencial da plataforma.",
            "title": "Caso sintético em revisão médica"
          }
        ],
        "id": "acra-sepse-04-fluido-beneficio-ou-dano-v1",
        "mode": "tutorial",
        "sources": [
          {
            "id": "a04-source-ssc2026",
            "publisher": "Society of Critical Care Medicine",
            "title": "Surviving Sepsis Campaign: Adult Guidelines 2026",
            "url": "https://www.sccm.org/survivingsepsiscampaign/guidelines-and-resources/surviving-sepsis-campaign-adult-guidelines"
          },
          {
            "id": "a04-source-hemodynamic-guide",
            "publisher": "Society of Critical Care Medicine",
            "title": "Surviving Sepsis Campaign 2026 Adult Hemodynamic Quick Guide",
            "url": "https://sccm.org/SCCM/media/SCCM/PDFs/SSC-Adult-Quick-Guide-Infographic-2026.pdf"
          },
          {
            "id": "a04-source-andromeda2",
            "publisher": "JAMA",
            "title": "ANDROMEDA-SHOCK-2: Personalized Hemodynamic Management in Septic Shock",
            "url": "https://jamanetwork.com/journals/jama/fullarticle/2840823"
          }
        ],
        "subtitle": "Necessidade · Responsividade · Tolerância · Reavaliação",
        "summary": "Micropartícula ACRA para tratar fluido como intervenção com indicação, alvo, resposta e toxicidade. O treino separa três perguntas que não são sinônimas — o paciente precisa de volume, consegue aumentar fluxo e tolera a expansão — sem transformar recomendação inicial ou marcador isolado em prescrição automática.",
        "title": "Fluido: benefício ou dano",
        "version": "1.0"
      },
      "sha256": "fd0460ebb7a296ac668b7700cb50635f9320c7ac357c2a7d457e98e668404b95",
      "source": "acra/acra-sepse-04-fluido-beneficio-ou-dano.json"
    },
    {
      "artifact": {
        "actions": [
          {
            "contextComponentIds": [
              "a05-component-m1",
              "a05-component-m4"
            ],
            "id": "a05-action-review",
            "kind": "review",
            "label": "Revisar barreiras de segurança",
            "prompt": "Reabra M1 e descreva o início periférico, os limites da evidência, a vigilância e a reavaliação do acesso em linguagem operacional.",
            "requiresPreview": true
          },
          {
            "contextComponentIds": [
              "a05-component-m2",
              "a05-component-m3"
            ],
            "id": "a05-action-compare",
            "kind": "compare",
            "label": "Comparar pressão e perfusão",
            "prompt": "Compare PAM corrigida com perfusão restaurada e liste dados que obrigam reabrir tanque, bomba, obstrução e foco.",
            "requiresPreview": true
          },
          {
            "contextComponentIds": [
              "a05-component-m6",
              "a05-component-sources"
            ],
            "id": "a05-action-verify",
            "kind": "verify",
            "label": "Verificar protocolo local",
            "prompt": "Confirme no protocolo institucional vigente concentração, preparo, titulação, vigilância e manejo de extravasamento antes de aplicar qualquer vasopressor na prática.",
            "requiresPreview": true
          }
        ],
        "components": [
          {
            "id": "a05-component-m0",
            "text": "No choque séptico, não espere acesso central para iniciar noradrenalina periférica sob protocolo e vigilância locais. A SSC não define duração, dose, calibre ou sítio periférico. Alvo inicial geral: PAM 65 mmHg; em adultos com 65 anos ou mais, a faixa inicial sugerida é 60–65 mmHg.",
            "title": "M0 · Essência em 30 segundos",
            "tone": "danger",
            "type": "callout"
          },
          {
            "id": "a05-component-m1",
            "items": [
              {
                "id": "a05-step-recognize",
                "text": "Integre PAM confiável, pressão diastólica, consciência, pele, enchimento capilar, diurese, lactato em tendência e fluxo. Corrija erro de manguito ou linha antes de perseguir um número falso.",
                "title": "Reconheça choque e confirme a medida"
              },
              {
                "id": "a05-step-parallel",
                "text": "Antimicrobiano, controle do foco, fluido individualizado e vasopressor não precisam ocorrer em fila. Na instabilidade grave, noradrenalina pode começar enquanto necessidade, responsividade e tolerância ao fluido são avaliadas.",
                "title": "Trate em paralelo"
              },
              {
                "id": "a05-step-peripheral",
                "text": "Não atrase noradrenalina até o acesso central. A diretriz não estabelece duração, dose, calibre nem localização anatômica da via periférica; aplique critérios institucionais de seleção, patência, vigilância, transição e extravasamento.",
                "title": "Use a via periférica dentro do protocolo local"
              },
              {
                "id": "a05-step-target",
                "text": "Para adultos em geral, a SSC recomenda PAM inicial de 65 mmHg em vez de metas maiores. Para adultos com 65 anos ou mais, sugere faixa inicial de 60–65 mmHg. Depois, individualize por perfusão, efeitos adversos e contexto; pressão corrigida não garante fluxo restaurado.",
                "title": "Separe os dois alvos iniciais de PAM"
              },
              {
                "id": "a05-step-escalate",
                "text": "Com necessidade crescente de noradrenalina, reavalie causa, tanque, bomba e obstrução e considere vasopressina. Se a PAM seguir inadequada apesar de ambas, adrenalina pode ser considerada conforme diretriz e contexto.",
                "title": "Escale sem automatismo"
              },
              {
                "id": "a05-step-reassess",
                "text": "Cheque resposta e toxicidade em minutos, vigie a via conforme protocolo e reavalie qual acesso é mais adequado se o suporte persistir. A SSC não define duração ou dose periférica nem um corte universal para transição ou adição de outro vasopressor.",
                "title": "Reavalie perfusão, acesso e necessidade"
              }
            ],
            "title": "M1 · Mecanismo: da ameaça à escalada",
            "type": "numberedSteps"
          },
          {
            "columns": [
              {
                "id": "a05-column-signal",
                "label": "Situação"
              },
              {
                "id": "a05-column-risk",
                "label": "Risco de erro"
              },
              {
                "id": "a05-column-action",
                "label": "Resposta segura"
              }
            ],
            "id": "a05-component-m2",
            "rows": [
              {
                "cells": [
                  "Atrasar noradrenalina até obter acesso central.",
                  "Prolongar hipotensão e hipoperfusão.",
                  "Iniciar por via periférica sob protocolo e vigilância locais; reavaliar a estratégia de acesso em paralelo."
                ],
                "id": "a05-row-no-central",
                "label": "Choque e acesso central indisponível"
              },
              {
                "cells": [
                  "Cobrir o acesso ou esperar nova hipotensão.",
                  "Extravasamento e lesão tecidual.",
                  "Interromper, avaliar e ativar imediatamente o protocolo local."
                ],
                "id": "a05-row-site",
                "label": "Dor, edema ou palidez no sítio"
              },
              {
                "cells": [
                  "Declarar ressuscitação concluída.",
                  "Perder baixo fluxo, falência cardíaca, obstrução ou foco persistente.",
                  "Reclassificar fisiologia, fluxo, foco, ventilação e metabolismo."
                ],
                "id": "a05-row-perfusion",
                "label": "PAM atingida, perfusão ainda ruim"
              },
              {
                "cells": [
                  "Aplicar automaticamente a mesma meta elevada a todas as idades.",
                  "Exposição vasopressora sem benefício e perda da recomendação específica ao idoso.",
                  "Adultos em geral: 65 mmHg; com 65 anos ou mais: faixa sugerida de 60–65 mmHg; depois individualizar."
                ],
                "id": "a05-row-age-target",
                "label": "Alvo inicial conforme idade"
              },
              {
                "cells": [
                  "Usar um corte universal ou somar fármacos sem auditoria.",
                  "Polifarmácia vasopressora sem tratar o mecanismo.",
                  "Reavaliar causas e considerar vasopressina; adrenalina se PAM seguir inadequada."
                ],
                "id": "a05-row-escalation",
                "label": "Noradrenalina em escalada"
              }
            ],
            "title": "M2 · Decisão segura: pressão é começo, não desfecho",
            "type": "comparisonTable"
          },
          {
            "id": "a05-component-m3",
            "items": [
              {
                "content": [
                  {
                    "text": "Pessoa adulta com provável infecção pulmonar, PAM 52 mmHg, extremidades moteadas e alteração do sensório. Há acesso periférico cuja seleção e vigilância atendem ao protocolo local; o acesso central ainda não está disponível.",
                    "type": "paragraph"
                  },
                  {
                    "items": [
                      "A equipe inicia ABCDE, antimicrobiano e ressuscitação individualizada sem colocar as intervenções em fila.",
                      "Noradrenalina periférica pode ser iniciada sem esperar acesso central; a SSC não define duração, dose, calibre ou sítio dessa via."
                    ],
                    "type": "bulletList"
                  }
                ],
                "id": "a05-case-stage-1",
                "initiallyOpen": true,
                "label": "1 · Entrada: choque antes do acesso central"
              },
              {
                "content": [
                  {
                    "text": "A PAM chega ao alvo inicial, mas o enchimento capilar permanece lento e a diurese não melhora. O sítio periférico está íntegro.",
                    "type": "paragraph"
                  },
                  {
                    "items": [
                      "Não confunda pressão com perfusão restaurada.",
                      "Reavalie volume efetivo, débito, VD/VE, obstrução, foco e tendência metabólica."
                    ],
                    "type": "bulletList"
                  }
                ],
                "id": "a05-case-stage-2",
                "initiallyOpen": false,
                "label": "2 · A pressão melhora"
              },
              {
                "content": [
                  {
                    "text": "Apesar da correção de fatores reversíveis, a necessidade de noradrenalina aumenta. Não há mais responsividade a fluido e há margem de tolerância estreita.",
                    "type": "paragraph"
                  },
                  {
                    "items": [
                      "A diretriz apoia considerar vasopressina como estratégia adicional, sem corte universal de dose.",
                      "Se a PAM continuar inadequada com noradrenalina e vasopressina, adrenalina pode ser considerada após nova auditoria."
                    ],
                    "type": "bulletList"
                  }
                ],
                "id": "a05-case-stage-3",
                "initiallyOpen": false,
                "label": "3 · Necessidade vasopressora cresce"
              },
              {
                "content": [
                  {
                    "text": "A equipe mantém vigilância segundo protocolo, reavalia a estratégia de acesso porque a necessidade persiste, documenta resposta e efeitos adversos e desescala conforme o choque resolve.",
                    "type": "paragraph"
                  },
                  {
                    "items": [
                      "Toda escalada deve vir acompanhada de nova explicação fisiológica.",
                      "A decisão de manter ou mudar a via segue contexto e protocolo local; não há duração ou dose periférica definida pela SSC."
                    ],
                    "type": "bulletList"
                  }
                ],
                "id": "a05-case-stage-4",
                "initiallyOpen": false,
                "label": "4 · Segurança e saída"
              }
            ],
            "title": "M3 · Caso sintético progressivo",
            "type": "accordion"
          },
          {
            "id": "a05-component-m4",
            "items": [
              {
                "id": "a05-trap-wait",
                "text": "Erro: manter choque hipotensivo enquanto se prepara um procedimento. Correção: início periférico sob protocolo e vigilância locais quando indicado.",
                "title": "Esperar o central",
                "tone": "danger"
              },
              {
                "id": "a05-trap-hidden",
                "text": "Erro: atribuir à diretriz um calibre, sítio, dose ou duração que ela não define. Correção: reconhecer a incerteza e seguir barreiras institucionais de segurança.",
                "title": "Transformar prática local em regra SSC",
                "tone": "danger"
              },
              {
                "id": "a05-trap-pressure",
                "text": "Erro: declarar sucesso com perfusão ainda ruim. Correção: integrar fluxo, pele, consciência, diurese, lactato em tendência e causa.",
                "title": "Tratar apenas a PAM",
                "tone": "warning"
              },
              {
                "id": "a05-trap-dose",
                "text": "Erro: adicionar fármaco por um número rígido sem contexto. Correção: reavaliar mecanismo, tendência, efeitos adversos e recomendação vigente.",
                "title": "Inventar limiar universal",
                "tone": "warning"
              }
            ],
            "title": "M4 · Armadilhas de alto risco",
            "type": "cards"
          },
          {
            "id": "a05-component-m5",
            "questions": [
              {
                "correctOptionId": "a05-option-central-bridge",
                "feedback": "A SSC sugere início periférico em vez de esperar o acesso central, mas informa dados insuficientes para recomendar duração, dose, calibre ou localização anatômica. As barreiras práticas são definidas localmente.",
                "id": "a05-question-central",
                "options": [
                  {
                    "id": "a05-option-central-wait",
                    "label": "Esperar o central antes de qualquer vasopressor"
                  },
                  {
                    "id": "a05-option-central-bridge",
                    "label": "Iniciar por via periférica sob protocolo e vigilância locais"
                  },
                  {
                    "id": "a05-option-central-fluid",
                    "label": "Substituir vasopressor por bolus cegos"
                  }
                ],
                "prompt": "Paciente em choque séptico não tem acesso central. Qual princípio é mais fiel à SSC 2026?"
              },
              {
                "correctOptionId": "a05-option-map-reassess",
                "feedback": "Para adultos com 65 anos ou mais, a SSC sugere faixa inicial de 60–65 mmHg. É recomendação distinta do alvo inicial geral de 65 mmHg; ambos exigem avaliação de perfusão e contexto.",
                "id": "a05-question-map",
                "options": [
                  {
                    "id": "a05-option-map-finish",
                    "label": "Exatamente 80 mmHg para todos"
                  },
                  {
                    "id": "a05-option-map-reassess",
                    "label": "60–65 mmHg, com reavaliação e individualização"
                  },
                  {
                    "id": "a05-option-map-volume",
                    "label": "Não utilizar qualquer alvo de pressão"
                  }
                ],
                "prompt": "Em adulto de 71 anos com choque séptico, qual faixa inicial de PAM a SSC 2026 sugere em vez de faixas maiores?"
              },
              {
                "correctOptionId": "a05-option-escalation-vaso",
                "feedback": "Vasopressina é considerada com escalada de noradrenalina; adrenalina pode ser adicionada se a PAM continuar inadequada. Não há autorização para corte universal ou automatismo.",
                "id": "a05-question-escalation",
                "options": [
                  {
                    "id": "a05-option-escalation-vaso",
                    "label": "Considerar vasopressina; adrenalina se PAM seguir inadequada"
                  },
                  {
                    "id": "a05-option-escalation-dose",
                    "label": "Aplicar sempre o mesmo limiar universal de dose"
                  },
                  {
                    "id": "a05-option-escalation-ignore",
                    "label": "Somar fármacos sem reavaliar o choque"
                  }
                ],
                "prompt": "A necessidade de noradrenalina cresce apesar da correção de causas reversíveis. Qual sequência geral é compatível com a diretriz?"
              }
            ],
            "title": "M5 · Recuperação ativa",
            "type": "quiz"
          },
          {
            "id": "a05-component-m6",
            "items": [
              {
                "details": "Não atrasar pelo central; dados insuficientes para duração, dose, calibre ou localização; aplicar protocolo local.",
                "id": "a05-resume-d0",
                "initiallyChecked": false,
                "label": "D0 · Recite a fronteira da evidência periférica"
              },
              {
                "details": "Explique por que acesso central e tratamento do choque devem ser organizados em paralelo.",
                "id": "a05-resume-d1",
                "initiallyChecked": false,
                "label": "D1 · Refazer as três questões"
              },
              {
                "details": "Diga o que interrompe imediatamente e onde localizar o protocolo institucional, sem inventar dose de antídoto.",
                "id": "a05-resume-d7",
                "initiallyChecked": false,
                "label": "D7 · Simular extravasamento"
              },
              {
                "details": "Adultos em geral: 65 mmHg; adultos com 65 anos ou mais: faixa sugerida de 60–65 mmHg; depois contextualizar.",
                "id": "a05-resume-d14",
                "initiallyChecked": false,
                "label": "D14 · Comparar os dois alvos iniciais de PAM"
              },
              {
                "details": "Noradrenalina, consideração de vasopressina e adrenalina, sempre com reavaliação e sem limiar universal inventado.",
                "id": "a05-resume-d30",
                "initiallyChecked": false,
                "label": "D30 · Reconstruir a escada vasopressora"
              }
            ],
            "title": "M6 · Retomada espaçada",
            "type": "checklist"
          },
          {
            "current": 7,
            "id": "a05-component-progress",
            "label": "ACRA 05 · M0–M6",
            "title": "Percurso concluído",
            "total": 7,
            "type": "progress"
          },
          {
            "id": "a05-component-sources",
            "sourceIds": [
              "a05-source-ssc2026",
              "a05-source-hemodynamic-guide"
            ],
            "title": "Fontes oficiais",
            "type": "sources"
          },
          {
            "actionIds": [
              "a05-action-review",
              "a05-action-compare",
              "a05-action-verify"
            ],
            "id": "a05-component-followup",
            "title": "Próximas ações sugeridas",
            "type": "followupActions"
          }
        ],
        "critical": [
          {
            "id": "a05-critical-educational-scope",
            "severity": "danger",
            "text": "Este ACRA não fornece concentração, dose, titulação, duração ou preparo de vasopressores. Use monitorização contínua, bomba apropriada, protocolo institucional, farmácia/enfermagem e supervisão médica; choque exige ABCDE e tratamento simultâneo da causa.",
            "title": "Apoio educacional — não é prescrição"
          },
          {
            "id": "a05-critical-peripheral-safety",
            "severity": "warning",
            "text": "A SSC 2026 sugere iniciar vasopressor por via periférica em vez de esperar acesso central, mas considera insuficientes os dados para recomendar duração, dose, calibre ou localização anatômica do acesso. Seleção, vigilância, transição e manejo de extravasamento seguem protocolo local.",
            "title": "A via periférica tem uma fronteira de evidência"
          },
          {
            "id": "a05-critical-synthetic-review",
            "severity": "info",
            "text": "O cenário é fictício e não contém dados de paciente. Conteúdo local para estudo TEMI, pendente de revisão clínica humana final e sem integração ao sistema assistencial.",
            "title": "Caso sintético em revisão médica"
          }
        ],
        "id": "acra-sepse-05-vasopressor-sem-atraso-v1",
        "mode": "tutorial",
        "sources": [
          {
            "id": "a05-source-ssc2026",
            "publisher": "Society of Critical Care Medicine",
            "title": "Surviving Sepsis Campaign: Adult Guidelines 2026",
            "url": "https://www.sccm.org/survivingsepsiscampaign/guidelines-and-resources/surviving-sepsis-campaign-adult-guidelines"
          },
          {
            "id": "a05-source-hemodynamic-guide",
            "publisher": "Society of Critical Care Medicine",
            "title": "Surviving Sepsis Campaign 2026 Adult Hemodynamic Quick Guide",
            "url": "https://sccm.org/SCCM/media/SCCM/PDFs/SSC-Adult-Quick-Guide-Infographic-2026.pdf"
          }
        ],
        "subtitle": "Pressão útil · Perfusão · Acesso periférico seguro · Escalada racional",
        "summary": "Micropartícula ACRA para iniciar noradrenalina periférica sem esperar acesso central no choque séptico, sob protocolo e vigilância locais, reconhecer os limites da evidência sobre essa via e escalar vasopressina ou adrenalina com reavaliação fisiológica — sem doses ou prescrição autônoma.",
        "title": "Vasopressor sem atraso",
        "version": "1.0"
      },
      "sha256": "ae5270a1aa80b70f5421a0312075311f70fd4a614dd7010b77153b87666e4c8f",
      "source": "acra/acra-sepse-05-vasopressor-sem-atraso.json"
    },
    {
      "artifact": {
        "actions": [
          {
            "contextComponentIds": [
              "a06-component-m1",
              "a06-component-m3"
            ],
            "id": "a06-action-review",
            "kind": "review",
            "label": "Revisar a linha temporal",
            "prompt": "Reabra o caso e explique quais forças mudaram depois da intubação e quais causas reversíveis não podem ser perdidas.",
            "requiresPreview": true
          },
          {
            "contextComponentIds": [
              "a06-component-m2",
              "a06-component-m4"
            ],
            "id": "a06-action-compare",
            "kind": "compare",
            "label": "Comparar fenótipos",
            "prompt": "Compare vasoplegia, baixa pré-carga responsiva, VD/obstrutivo e perfil misto usando pistas, limites e próximo dado útil.",
            "requiresPreview": true
          },
          {
            "contextComponentIds": [
              "a06-component-m1",
              "a06-component-sources"
            ],
            "id": "a06-action-deepen",
            "kind": "deepen",
            "label": "Aprofundar coração–pulmão",
            "prompt": "Revise como sedação, pressão positiva, PEEP e auto-PEEP podem alterar retorno venoso, pós-carga do VD e pressão arterial no choque.",
            "requiresPreview": true
          }
        ],
        "components": [
          {
            "id": "a06-component-m0",
            "text": "Fenótipo é uma fotografia com hora: vasoplegia, baixa pré-carga, bomba, VD/obstrução e perfis mistos podem coexistir e mudar após fluido, vasopressor, sedação ou ventilação. Após cada intervenção relevante, repita pressão, perfusão, fluxo, pulmão e congestão antes de repetir a mesma terapia.",
            "title": "M0 · Essência em 30 segundos",
            "tone": "warning",
            "type": "callout"
          },
          {
            "id": "a06-component-m1",
            "items": [
              {
                "id": "a06-step-t0",
                "text": "Baixa pressão diastólica, pulso amplo, vasodilatação e necessidade de vasopressor apoiam vasoplegia, mas registre também fluxo, perfusão, volume efetivo, VD/VE, pulmão e incertezas.",
                "title": "T0 — descreva antes de rotular"
              },
              {
                "id": "a06-step-intervention",
                "text": "Fluido, noradrenalina, sedação e mudança ventilatória alteram pré-carga, pós-carga, tônus e interação coração–pulmão. Defina antecipadamente qual resposta espera e qual dano fará interromper.",
                "title": "Toda intervenção é um teste fisiológico"
              },
              {
                "id": "a06-step-intubation",
                "text": "A pressão intratorácica positiva pode reduzir retorno venoso e elevar pós-carga do VD; sedativos podem reduzir tônus. Hipotensão abrupta também exige excluir tubo/circuito, auto-PEEP, pneumotórax e outras causas mecânicas.",
                "title": "T1 — reabra o diagnóstico após intubação"
              },
              {
                "id": "a06-step-rv",
                "text": "Integre dilatação/disfunção de VD, desvio septal, pressões venosas, congestão sistêmica, hipoxemia, ventilação de alta pressão e baixo fluxo. Nenhum achado isolado confirma TEP ou define tratamento.",
                "title": "Reconheça falência de VD e congestão"
              },
              {
                "id": "a06-step-pivot",
                "text": "Quando VD/obstrução e congestão dominam, suspenda volume cego, revise ventilador e causas mecânicas, trate a etiologia e sustente pressão/fluxo conforme avaliação completa e protocolo local.",
                "title": "Pivote para o componente dominante"
              },
              {
                "id": "a06-step-loop",
                "text": "Registre horário, intervenção, achados convergentes e discordantes, hipótese dominante, risco imediato e momento da próxima reavaliação. O rótulo antigo perde validade quando a fisiologia muda.",
                "title": "Documente uma nova fotografia"
              }
            ],
            "title": "M1 · Mecanismo: por que o choque muda",
            "type": "numberedSteps"
          },
          {
            "columns": [
              {
                "id": "a06-column-clues",
                "label": "Pistas convergentes"
              },
              {
                "id": "a06-column-trap",
                "label": "Armadilha"
              },
              {
                "id": "a06-column-pivot",
                "label": "Próximo dado/ação"
              }
            ],
            "id": "a06-component-m2",
            "rows": [
              {
                "cells": [
                  "Tônus baixo, pressão diastólica reduzida e hipotensão apesar de volume avaliado.",
                  "Corrigir PAM e assumir que a perfusão normalizou.",
                  "Noradrenalina sem atraso e reavaliação de fluxo, foco e perfusão."
                ],
                "id": "a06-row-vasoplegic",
                "label": "Vasoplégico"
              },
              {
                "cells": [
                  "Manobra dinâmica positiva com ganho de fluxo e tolerância preservada.",
                  "Confundir VCI ou hipotensão isolada com indicação de volume.",
                  "Ciclo pequeno, alvo explícito e nova avaliação de dano."
                ],
                "id": "a06-row-preload",
                "label": "Baixa pré-carga responsiva"
              },
              {
                "cells": [
                  "VD disfuncional, congestão, hipoxemia, alta pressão ventilatória ou baixo fluxo.",
                  "Rotular como distributivo e repetir fluido cegamente.",
                  "Excluir causa mecânica, revisar ventilador e definir etiologia."
                ],
                "id": "a06-row-rv",
                "label": "VD/obstrutivo"
              },
              {
                "cells": [
                  "Resposta parcial, sinais discordantes e mudança após intervenção.",
                  "Forçar uma única etiqueta durante toda a evolução.",
                  "Tratar componente dominante e marcar reavaliação seriada."
                ],
                "id": "a06-row-mixed",
                "label": "Misto e dinâmico"
              }
            ],
            "title": "M2 · Decisão segura por perfil dominante",
            "type": "comparisonTable"
          },
          {
            "id": "a06-component-m3",
            "items": [
              {
                "content": [
                  {
                    "text": "Pessoa adulta com pneumonia, vasodilatação, pressão diastólica baixa e PAM reduzida. Avaliação inicial não mostra congestão relevante; noradrenalina é iniciada enquanto o tratamento etiológico e a avaliação de fluido ocorrem em paralelo.",
                    "type": "paragraph"
                  },
                  {
                    "items": [
                      "Hipótese dominante agora: vasoplegia, sem excluir componentes mistos.",
                      "Registre dados basais de perfusão, VD/VE, pulmão e tolerância."
                    ],
                    "type": "bulletList"
                  }
                ],
                "id": "a06-case-stage-1",
                "initiallyOpen": true,
                "label": "1 · T0: predomínio vasoplégico"
              },
              {
                "content": [
                  {
                    "text": "Após sedação e ventilação com pressão positiva, ocorre hipotensão abrupta, aumento das pressões de via aérea e piora da oxigenação. Repetir simplesmente o tratamento do T0 seria ancoragem.",
                    "type": "paragraph"
                  },
                  {
                    "items": [
                      "Faça checagem imediata de tubo/circuito e causas mecânicas tempo-dependentes.",
                      "Considere redução de retorno venoso, aumento da pós-carga do VD e perda de tônus pela sedação."
                    ],
                    "type": "bulletList"
                  }
                ],
                "id": "a06-case-stage-2",
                "initiallyOpen": false,
                "label": "2 · Intubação muda as forças"
              },
              {
                "content": [
                  {
                    "text": "A reavaliação mostra VD dilatado e hipocinético, congestão venosa e baixo fluxo. Não há resposta dinâmica favorável a volume. Vasoplegia pode persistir, mas já não explica tudo.",
                    "type": "paragraph"
                  },
                  {
                    "items": [
                      "Novo perfil dominante: misto com falência de VD/possível componente obstrutivo.",
                      "Dilatação do VD não confirma TEP; integre história, ventilação, pulmão e testes apropriados."
                    ],
                    "type": "bulletList"
                  }
                ],
                "id": "a06-case-stage-3",
                "initiallyOpen": false,
                "label": "3 · Nova fotografia: VD e congestão"
              },
              {
                "content": [
                  {
                    "text": "A equipe interrompe expansão cega, revisa PEEP, auto-PEEP e mecânica, procura pneumotórax e TEP, sustenta perfusão e trata a causa identificada conforme protocolo.",
                    "type": "paragraph"
                  },
                  {
                    "items": [
                      "O objetivo não é tratar o nome do fenótipo, mas o mecanismo confirmado.",
                      "Nova reavaliação verifica se VD, fluxo, congestão e perfusão responderam."
                    ],
                    "type": "bulletList"
                  }
                ],
                "id": "a06-case-stage-4",
                "initiallyOpen": false,
                "label": "4 · Conduta muda com a hipótese"
              },
              {
                "content": [
                  {
                    "text": "O paciente pode voltar a ter vasoplegia dominante, desenvolver disfunção de VE ou recuperar tolerância. Por isso, cada rótulo recebe horário, evidência, limite e prazo de validade.",
                    "type": "paragraph"
                  },
                  {
                    "items": [
                      "Fenótipo não é identidade permanente.",
                      "Intervenção sem reavaliação transforma uma hipótese útil em dano por inércia."
                    ],
                    "type": "bulletList"
                  }
                ],
                "id": "a06-case-stage-5",
                "initiallyOpen": false,
                "label": "5 · Aprendizado transferível"
              }
            ],
            "title": "M3 · Caso sintético progressivo",
            "type": "accordion"
          },
          {
            "id": "a06-component-m4",
            "items": [
              {
                "id": "a06-trap-label",
                "text": "Erro: repetir a terapia inicial apesar de novas forças. Correção: atribuir horário, evidência e prazo de validade à hipótese.",
                "title": "Fenótipo como rótulo fixo",
                "tone": "danger"
              },
              {
                "id": "a06-trap-distributive",
                "text": "Erro: ignorar TEP, pneumotórax, auto-PEEP, tamponamento ou falência biventricular. Correção: reabrir diagnóstico quando o choque é desproporcional.",
                "title": "Infecção = tudo distributivo",
                "tone": "danger"
              },
              {
                "id": "a06-trap-fluid",
                "text": "Erro: não avaliar pressão intratorácica, VD, sedação e obstrução. Correção: checagem mecânica e fisiológica antes de expandir.",
                "title": "Hipotensão pós-intubação = fluido",
                "tone": "warning"
              },
              {
                "id": "a06-trap-echo",
                "text": "Erro: usar VD dilatado ou fração de ejeção isolada como prescrição. Correção: integrar fluxo, contexto, qualidade da imagem e tendência.",
                "title": "Um achado define a terapia",
                "tone": "warning"
              }
            ],
            "title": "M4 · Armadilhas de ancoragem",
            "type": "cards"
          },
          {
            "id": "a06-component-m5",
            "questions": [
              {
                "correctOptionId": "a06-option-change-reopen",
                "feedback": "A intubação altera pré-carga, pós-carga do VD e tônus e pode revelar emergências mecânicas. A fisiologia deve ser reavaliada imediatamente.",
                "id": "a06-question-change",
                "options": [
                  {
                    "id": "a06-option-change-repeat",
                    "label": "Repetir automaticamente a terapia do T0"
                  },
                  {
                    "id": "a06-option-change-reopen",
                    "label": "Reabrir tubo/circuito, mecânica, VD, obstrução e perfusão"
                  },
                  {
                    "id": "a06-option-change-label",
                    "label": "Manter o rótulo distributivo até o fim"
                  }
                ],
                "prompt": "Choque inicialmente vasoplégico piora abruptamente após intubação. Qual princípio vem primeiro?"
              },
              {
                "correctOptionId": "a06-option-rv-integrate",
                "feedback": "O achado sugere sobrecarga/falência de VD, mas não é específico. Integre ventilação, TEP, pressões, cronicidade, pulmão, pericárdio e exames confirmatórios.",
                "id": "a06-question-rv",
                "options": [
                  {
                    "id": "a06-option-rv-confirm",
                    "label": "Sim, confirma e prescreve sozinho"
                  },
                  {
                    "id": "a06-option-rv-integrate",
                    "label": "Não; apoia sobrecarga do VD e exige integração etiológica"
                  },
                  {
                    "id": "a06-option-rv-fluid",
                    "label": "Indica sempre mais volume"
                  }
                ],
                "prompt": "VD dilatado e disfuncional após intubação confirma TEP e determina uma terapia específica?"
              },
              {
                "correctOptionId": "a06-option-definition-photo",
                "feedback": "O fenótipo hemodinâmico é uma fotografia operacional com limitações. Deve ser atualizado após intervenções ou mudança clínica e não substitui diagnóstico etiológico.",
                "id": "a06-question-definition",
                "options": [
                  {
                    "id": "a06-option-definition-fixed",
                    "label": "Classificação permanente que escolhe tratamento"
                  },
                  {
                    "id": "a06-option-definition-photo",
                    "label": "Hipótese fisiológica temporal que organiza a próxima avaliação"
                  },
                  {
                    "id": "a06-option-definition-molecular",
                    "label": "Sinônimo de endótipo molecular comprovado"
                  }
                ],
                "prompt": "Qual definição prática de fenótipo é mais segura?"
              }
            ],
            "title": "M5 · Recuperação ativa",
            "type": "quiz"
          },
          {
            "id": "a06-component-m6",
            "items": [
              {
                "details": "Nomeie duas intervenções capazes de mudar pré-carga, pós-carga, tônus ou bomba.",
                "id": "a06-resume-d0",
                "initiallyChecked": false,
                "label": "D0 · Diga por que fenótipo tem horário"
              },
              {
                "details": "Explique por que deterioração pós-intubação exige auditoria mecânica imediata.",
                "id": "a06-resume-d1",
                "initiallyChecked": false,
                "label": "D1 · Refazer as três questões"
              },
              {
                "details": "Vasoplegia inicial, intervenção, deterioração, dados de VD/congestão e pivô decisório.",
                "id": "a06-resume-d7",
                "initiallyChecked": false,
                "label": "D7 · Reconstruir a linha T0 → T1"
              },
              {
                "details": "Vasoplégico, baixa pré-carga responsiva, VD/obstrutivo e misto; cite uma pista e uma armadilha de cada.",
                "id": "a06-resume-d14",
                "initiallyChecked": false,
                "label": "D14 · Comparar quatro perfis"
              },
              {
                "details": "Declare hipótese dominante, evidências, discordâncias, causa reversível, intervenção e momento de repetir a avaliação.",
                "id": "a06-resume-d30",
                "initiallyChecked": false,
                "label": "D30 · Simulação de reclassificação em 90 segundos"
              }
            ],
            "title": "M6 · Retomada espaçada",
            "type": "checklist"
          },
          {
            "current": 7,
            "id": "a06-component-progress",
            "label": "ACRA 06 · M0–M6",
            "title": "Percurso concluído",
            "total": 7,
            "type": "progress"
          },
          {
            "id": "a06-component-sources",
            "sourceIds": [
              "a06-source-ssc2026",
              "a06-source-hemodynamic-guide"
            ],
            "title": "Fontes oficiais",
            "type": "sources"
          },
          {
            "actionIds": [
              "a06-action-review",
              "a06-action-compare",
              "a06-action-deepen"
            ],
            "id": "a06-component-followup",
            "title": "Próximas ações sugeridas",
            "type": "followupActions"
          }
        ],
        "critical": [
          {
            "id": "a06-critical-educational-scope",
            "severity": "danger",
            "text": "Este ACRA não seleciona fluido, vasopressor, inotrópico ou ajuste ventilatório. Choque após intubação exige ABCDE, monitorização, busca imediata de causas reversíveis e decisão da equipe conforme protocolo institucional.",
            "title": "Apoio educacional — não é protocolo assistencial"
          },
          {
            "id": "a06-critical-obstruction",
            "severity": "warning",
            "text": "Procure prontamente desconexão ou problema do tubo, pneumotórax hipertensivo, auto-PEEP, pressão intratorácica excessiva, hipovolemia, falência de VD, TEP, tamponamento e sedação. Não atribua toda hipotensão à sepse nem administre volume às cegas.",
            "title": "Deterioração pós-intubação é emergência fisiológica"
          },
          {
            "id": "a06-critical-synthetic-review",
            "severity": "info",
            "text": "O cenário é fictício, sem dados identificáveis. Os fenótipos são rótulos operacionais didáticos, não classificação validada; conteúdo local pendente de revisão clínica humana final.",
            "title": "Caso sintético em revisão médica"
          }
        ],
        "id": "acra-sepse-06-fenotipo-muda-conduta-muda-v1",
        "mode": "tutorial",
        "sources": [
          {
            "id": "a06-source-ssc2026",
            "publisher": "Society of Critical Care Medicine",
            "title": "Surviving Sepsis Campaign: Adult Guidelines 2026",
            "url": "https://www.sccm.org/survivingsepsiscampaign/guidelines-and-resources/surviving-sepsis-campaign-adult-guidelines"
          },
          {
            "id": "a06-source-hemodynamic-guide",
            "publisher": "Society of Critical Care Medicine",
            "title": "Surviving Sepsis Campaign 2026 Adult Hemodynamic Quick Guide",
            "url": "https://sccm.org/SCCM/media/SCCM/PDFs/SSC-Adult-Quick-Guide-Infographic-2026.pdf"
          }
        ],
        "subtitle": "Vasoplegia inicial · Intubação · VD · Congestão · Reclassificação seriada",
        "summary": "Micropartícula ACRA para acompanhar um choque séptico inicialmente vasoplégico que, após intubação, passa a exibir falência de ventrículo direito e congestão. O fenótipo é uma hipótese fisiológica temporal para orientar a próxima avaliação — nunca um rótulo fixo, diagnóstico etiológico ou prescrição automática.",
        "title": "Fenótipo muda, conduta muda",
        "version": "1.0"
      },
      "sha256": "30d24aadcf239d8fef33fc16a470fc547b5bd393a3b9322fa0001bae20515f4c",
      "source": "acra/acra-sepse-06-fenotipo-muda-conduta-muda.json"
    },
    {
      "artifact": {
        "actions": [
          {
            "contextComponentIds": [
              "a07-component-m2",
              "a07-component-m3",
              "a07-component-m4"
            ],
            "id": "a07-action-review",
            "kind": "review",
            "label": "Revisar extrapolações",
            "prompt": "Reabra o caso e identifique toda passagem indevida entre descrição, prognóstico, predição e prescrição.",
            "requiresPreview": true
          },
          {
            "contextComponentIds": [
              "a07-component-m1",
              "a07-component-m3"
            ],
            "id": "a07-action-compare",
            "kind": "compare",
            "label": "Comparar SENECA e CTS",
            "prompt": "Compare dados de entrada, finalidade de pesquisa, validação e limitações clínicas dos fenótipos SENECA e dos CTS.",
            "requiresPreview": true
          },
          {
            "contextComponentIds": [
              "a07-component-m2",
              "a07-component-m5"
            ],
            "id": "a07-action-deepen",
            "kind": "deepen",
            "label": "Aprofundar predição",
            "prompt": "Explique como interação tratamento-subgrupo, validação prospectiva e utilidade clínica transformam hipótese em decisão.",
            "requiresPreview": true
          }
        ],
        "components": [
          {
            "id": "a07-component-m0",
            "text": "Pergunta-mãe: o rótulo apenas descreve um grupo ou já prediz, de modo prospectivamente validado, qual intervenção melhora desfecho? SENECA e CTS organizam heterogeneidade; hoje não devem comandar prescrição individual.",
            "title": "M0 · Essência em 30 segundos",
            "tone": "warning",
            "type": "callout"
          },
          {
            "id": "a07-component-m1",
            "items": [
              {
                "id": "a07-step-describe",
                "text": "Um algoritmo agrupa pessoas por características clínicas ou moleculares semelhantes. O cluster resume padrões da coorte; não é uma nova etiologia nem uma certeza biológica individual.",
                "title": "1 · Descrever"
              },
              {
                "id": "a07-step-prognosis",
                "text": "O grupo pode apresentar mortalidade ou disfunção diferente. Isso estima risco em determinada população, mas não informa automaticamente qual tratamento modifica esse risco.",
                "title": "2 · Associar a prognóstico"
              },
              {
                "id": "a07-step-predict",
                "text": "Para escolher terapia, é preciso mostrar interação reproduzível entre subtipo e efeito do tratamento, com classificação válida no tempo clínico útil e confirmação prospectiva.",
                "title": "3 · Demonstrar predição de efeito"
              },
              {
                "id": "a07-step-prescribe",
                "text": "A prescrição exige benefício clínico, segurança, teste operacional, população aplicável e regra decisória validada. Sem essa cadeia, use fisiologia, foco, microbiologia e recomendações vigentes.",
                "title": "4 · Só então prescrever"
              }
            ],
            "title": "M1 · Mecanismo: da semelhança ao benefício causal",
            "type": "numberedSteps"
          },
          {
            "columns": [
              {
                "id": "a07-column-claim",
                "label": "O que responde"
              },
              {
                "id": "a07-column-proof",
                "label": "Evidência necessária"
              },
              {
                "id": "a07-column-limit",
                "label": "Limite prático"
              }
            ],
            "id": "a07-component-m2",
            "rows": [
              {
                "cells": [
                  "Quais padrões coexistem nesta coorte?",
                  "Agrupamento robusto, estabilidade e validação externa.",
                  "Não define causa nem terapia."
                ],
                "id": "a07-row-descriptive",
                "label": "Descritivo"
              },
              {
                "cells": [
                  "Quem apresenta maior risco de determinado desfecho?",
                  "Discriminação, calibração e validação na população-alvo.",
                  "Risco maior não revela qual intervenção ajuda."
                ],
                "id": "a07-row-prognostic",
                "label": "Prognóstico"
              },
              {
                "cells": [
                  "O efeito de uma intervenção difere entre subgrupos?",
                  "Interação tratamento-subgrupo pré-especificada e confirmada.",
                  "Análise exploratória pode gerar hipótese, não conduta."
                ],
                "id": "a07-row-predictive",
                "label": "Preditivo"
              },
              {
                "cells": [
                  "A regra melhora desfechos quando usada para decidir?",
                  "Ensaio prospectivo, teste disponível, segurança e utilidade clínica.",
                  "SENECA e CTS ainda não atingem esse nível para rotina."
                ],
                "id": "a07-row-prescriptive",
                "label": "Prescritivo"
              }
            ],
            "title": "M2 · Quatro níveis que não podem ser confundidos",
            "type": "comparisonTable"
          },
          {
            "id": "a07-component-m3",
            "items": [
              {
                "content": [
                  {
                    "text": "Pessoa adulta com choque séptico, disfunção renal e pulmonar. Alguém sugere: “parece SENECA δ; vamos escolher a terapia pelo fenótipo”.",
                    "type": "paragraph"
                  },
                  {
                    "items": [
                      "Interrompa a passagem direta de rótulo para prescrição.",
                      "Pergunte qual classificador validado foi aplicado e qual ensaio demonstrou benefício guiado por ele."
                    ],
                    "type": "bulletList"
                  }
                ],
                "id": "a07-case-1",
                "initiallyOpen": true,
                "label": "1 · O atalho sedutor"
              },
              {
                "content": [
                  {
                    "text": "O estudo original derivou quatro fenótipos clínicos α, β, γ e δ. Uma validação externa encontrou subtipos semelhantes, porém com distribuição variável entre coortes. Isso apoia heterogeneidade e reprodutibilidade parcial, não prescrição automática.",
                    "type": "paragraph"
                  }
                ],
                "id": "a07-case-2",
                "label": "2 · O que SENECA realmente oferece"
              },
              {
                "content": [
                  {
                    "text": "A equipe também presume um CTS por aparência clínica. O framework transcriptômico depende de expressão gênica no sangue e permanece investigacional; não há correspondência simples ou confiável entre aparência e subtipo molecular.",
                    "type": "paragraph"
                  }
                ],
                "id": "a07-case-3",
                "label": "3 · A assinatura molecular presumida"
              },
              {
                "content": [
                  {
                    "text": "Reoriente a decisão para fisiologia atual, perfusão, foco, controle anatômico, microbiologia, farmacocinética e recomendações vigentes. Registre o fenótipo de pesquisa apenas como hipótese educacional ou variável de estudo.",
                    "type": "paragraph"
                  }
                ],
                "id": "a07-case-4",
                "label": "4 · Decisão segura agora"
              }
            ],
            "title": "M3 · Caso sintético progressivo",
            "type": "accordion"
          },
          {
            "id": "a07-component-m4",
            "items": [
              {
                "id": "a07-pitfall-cluster",
                "text": "Erro: tratar um agrupamento estatístico como entidade causal estável. Correção: verificar variáveis de entrada, temporalidade, estabilidade e validação externa.",
                "title": "Cluster = doença nova",
                "tone": "warning"
              },
              {
                "id": "a07-pitfall-risk",
                "text": "Erro: concluir que o grupo de maior risco será o que mais se beneficia. Correção: exigir evidência de interação e utilidade clínica.",
                "title": "Prognóstico = benefício terapêutico",
                "tone": "danger"
              },
              {
                "id": "a07-pitfall-posthoc",
                "text": "Erro: converter análise exploratória em protocolo. Correção: tratar como hipótese até replicação pré-especificada e prospectiva.",
                "title": "Sinal pós-hoc = regra",
                "tone": "danger"
              },
              {
                "id": "a07-pitfall-cts",
                "text": "Erro: presumir assinatura transcriptômica sem ensaio molecular validado. Correção: não usar CTS para decisão assistencial rotineira.",
                "title": "Aparência clínica = CTS",
                "tone": "warning"
              }
            ],
            "title": "M4 · Armadilhas de extrapolação",
            "type": "cards"
          },
          {
            "id": "a07-component-m5",
            "questions": [
              {
                "correctOptionId": "a07-option-1b",
                "feedback": "Risco e resposta ao tratamento são perguntas diferentes. Prescrição por subtipo exige interação validada e demonstração de utilidade clínica.",
                "id": "a07-question-1",
                "options": [
                  {
                    "id": "a07-option-1a",
                    "label": "Sim, risco define benefício"
                  },
                  {
                    "id": "a07-option-1b",
                    "label": "Não; prognóstico não é predição de efeito"
                  },
                  {
                    "id": "a07-option-1c",
                    "label": "Sim, se o cluster tiver nome"
                  }
                ],
                "prompt": "Um subtipo associado a maior mortalidade permite escolher automaticamente tratamento mais agressivo?"
              },
              {
                "correctOptionId": "a07-option-2b",
                "feedback": "Os frameworks são úteis para ciência e estratificação investigacional. Não substituem fisiologia, etiologia, microbiologia ou diretriz.",
                "id": "a07-question-2",
                "options": [
                  {
                    "id": "a07-option-2a",
                    "label": "Selecionar fármaco individual"
                  },
                  {
                    "id": "a07-option-2b",
                    "label": "Organizar pesquisa e compreender heterogeneidade"
                  },
                  {
                    "id": "a07-option-2c",
                    "label": "Substituir avaliação fisiológica"
                  }
                ],
                "prompt": "Qual uso atual é mais seguro para SENECA e CTS?"
              },
              {
                "correctOptionId": "a07-option-3b",
                "feedback": "É necessário demonstrar que usar a regra para decidir melhora desfechos, com teste reprodutível, aplicável e seguro.",
                "id": "a07-question-3",
                "options": [
                  {
                    "id": "a07-option-3a",
                    "label": "Somente uma associação retrospectiva"
                  },
                  {
                    "id": "a07-option-3b",
                    "label": "Ensaio prospectivo e regra operacional validada"
                  },
                  {
                    "id": "a07-option-3c",
                    "label": "A opinião de um único serviço"
                  }
                ],
                "prompt": "O que falta antes de uma classificação se tornar prescritiva?"
              }
            ],
            "title": "M5 · Recuperação ativa",
            "type": "quiz"
          },
          {
            "id": "a07-component-m6",
            "items": [
              {
                "details": "Diga a pergunta respondida por cada nível sem consultar o quadro.",
                "id": "a07-resume-d0",
                "initiallyChecked": false,
                "label": "D0 · recite: descritivo, prognóstico, preditivo, prescritivo"
              },
              {
                "details": "Use as palavras interação, validação e causalidade.",
                "id": "a07-resume-d1",
                "initiallyChecked": false,
                "label": "D1 · explique por que maior risco não prova benefício"
              },
              {
                "details": "Substitua o rótulo pela decisão fisiológica e etiológica imediata.",
                "id": "a07-resume-d7",
                "initiallyChecked": false,
                "label": "D7 · reconstrua o caso do atalho terapêutico"
              },
              {
                "details": "Diferencie dados clínicos de expressão gênica e declare o limite prescritivo comum.",
                "id": "a07-resume-d14",
                "initiallyChecked": false,
                "label": "D14 · compare SENECA e CTS"
              },
              {
                "details": "Responda: quando um biomarcador ou fenótipo pode mudar tratamento?",
                "id": "a07-resume-d30",
                "initiallyChecked": false,
                "label": "D30 · faça uma defesa oral de 90 segundos"
              }
            ],
            "title": "M6 · Retomada espaçada",
            "type": "checklist"
          },
          {
            "current": 7,
            "id": "a07-component-progress",
            "label": "M0–M6 concluídos",
            "title": "Percurso ACRA 07",
            "total": 7,
            "type": "progress"
          },
          {
            "id": "a07-component-sources",
            "sourceIds": [
              "a07-source-seneca",
              "a07-source-validation",
              "a07-source-cts"
            ],
            "title": "Fontes primárias",
            "type": "sources"
          },
          {
            "actionIds": [
              "a07-action-review",
              "a07-action-compare",
              "a07-action-deepen"
            ],
            "id": "a07-component-followup",
            "title": "Próximas ações sugeridas",
            "type": "followupActions"
          }
        ],
        "critical": [
          {
            "id": "a07-critical-educational",
            "severity": "danger",
            "text": "Este ACRA ensina leitura crítica de fenótipos de pesquisa. Não substitui avaliação fisiológica, diretriz, microbiologia, protocolo institucional ou julgamento clínico e não prescreve terapia por cluster.",
            "title": "Apoio educacional — não é protocolo assistencial"
          },
          {
            "id": "a07-critical-no-prescription",
            "severity": "warning",
            "text": "Associação com desfecho ou resposta observada em análise exploratória não demonstra benefício causal no paciente classificado à beira-leito. Aplicação prescritiva exige ensaio prospectivo, teste disponível e válido, regra reproduzível e benefício clínico confirmado.",
            "title": "SENECA e CTS não são seletores terapêuticos validados"
          },
          {
            "id": "a07-critical-synthetic",
            "severity": "info",
            "text": "O cenário é fictício e não contém dados identificáveis. Conteúdo local para estudo TEMI; revisão clínica humana final permanece obrigatória antes de qualquer integração ou uso institucional.",
            "title": "Caso sintético em revisão médica"
          }
        ],
        "id": "acra-sepse-07-v1",
        "mode": "tutorial",
        "sources": [
          {
            "id": "a07-source-seneca",
            "publisher": "JAMA",
            "title": "Derivation, Validation, and Potential Treatment Implications of Novel Clinical Phenotypes for Sepsis",
            "url": "https://pubmed.ncbi.nlm.nih.gov/31104070/"
          },
          {
            "id": "a07-source-validation",
            "title": "Clinical subtypes in critically ill patients with sepsis: validation and parsimonious classifier model development",
            "url": "https://pubmed.ncbi.nlm.nih.gov/39905513/"
          },
          {
            "id": "a07-source-cts",
            "publisher": "Nature Medicine",
            "title": "A consensus blood transcriptomic framework for sepsis",
            "url": "https://www.nature.com/articles/s41591-025-03964-5"
          }
        ],
        "subtitle": "Fenótipo de pesquisa não é receita individual",
        "summary": "Micropartícula ACRA para distinguir classificação descritiva, associação prognóstica, predição validada de efeito e prescrição. Os fenótipos SENECA e os subtipos transcriptômicos de consenso (CTS) ajudam a estudar heterogeneidade da sepse, mas não autorizam selecionar tratamento individual fora de estudo ou protocolo validado.",
        "title": "SENECA e CTS sem extrapolação",
        "version": "1.0"
      },
      "sha256": "cb4375897f9a1d19d60a9e50ba39347ac4c0f940b27327e83778237d6d962b43",
      "source": "acra/acra-sepse-07-seneca-cts-sem-extrapolacao.json"
    },
    {
      "artifact": {
        "actions": [
          {
            "contextComponentIds": [
              "a08-component-m1",
              "a08-component-m2"
            ],
            "id": "a08-action-review",
            "kind": "review",
            "label": "Revisar os oito domínios",
            "prompt": "Percorra a auditoria e descreva uma causa reversível, um teste útil e uma armadilha em cada domínio.",
            "requiresPreview": true
          },
          {
            "contextComponentIds": [
              "a08-component-m3",
              "a08-component-m4"
            ],
            "id": "a08-action-verify",
            "kind": "verify",
            "label": "Verificar o caso",
            "prompt": "Reavalie o caso sintético, identifique o foco ineficaz, a alteração ventilatória e os dados que faltam antes de qualquer resgate.",
            "requiresPreview": true
          },
          {
            "contextComponentIds": [
              "a08-component-m1",
              "a08-component-m5"
            ],
            "id": "a08-action-deepen",
            "kind": "deepen",
            "label": "Aprofundar refratariedade",
            "prompt": "Estude como vasoplegia, baixo fluxo, obstrução, ventilação e metabolismo interagem no choque persistente.",
            "requiresPreview": true
          }
        ],
        "components": [
          {
            "id": "a08-component-m0",
            "text": "Quando o vasopressor sobe, não pergunte primeiro “qual resgate acrescentar?”. Pergunte “o que ainda não expliquei?”. Rode oito domínios em circuito fechado, trate o reversível e documente resposta e incerteza.",
            "title": "M0 · Essência em 30 segundos",
            "tone": "danger",
            "type": "callout"
          },
          {
            "id": "a08-component-m1",
            "items": [
              {
                "id": "a08-step-diagnosis",
                "text": "Reabra a hipótese: sepse isolada, choque misto ou mimetizador? Procure hemorragia, anafilaxia, crise adrenal, intoxicação, isquemia, TEP, tamponamento e pneumotórax conforme contexto.",
                "title": "1 · Diagnóstico"
              },
              {
                "id": "a08-step-source",
                "text": "Confirme anatomia, drenagem, descompressão, desbridamento ou retirada de dispositivo quando indicados. Controle incompleto mantém a agressão apesar de antimicrobiano.",
                "title": "2 · Foco"
              },
              {
                "id": "a08-step-antimicrobial",
                "text": "Revise coleta, início, espectro, exposição, alergias, função renal e hepática, terapia renal, obesidade, interações e resultados microbiológicos com infectologia e farmácia quando disponíveis.",
                "title": "3 · Antimicrobiano"
              },
              {
                "id": "a08-step-volume",
                "text": "Separe necessidade, responsividade e tolerância. Hipotensão não autoriza bolus cego; procure resposta dinâmica, perfusão e sinais pulmonares, venosos, direitos, renais e abdominais de congestão.",
                "title": "4 · Volume e tolerância"
              },
              {
                "id": "a08-step-vasoplegia",
                "text": "Confirme pressão e infusão, acesso, equipo e bomba; avalie tônus vascular, pressão diastólica e perfusão. Otimize a estratégia vasopressora apoiada antes de considerar terapia fora de padrão.",
                "title": "5 · Vasoplegia"
              },
              {
                "id": "a08-step-pump",
                "text": "Avalie função do VE e VD, ritmo, isquemia, valvas e pericárdio. Pressão inadequada pode refletir baixo fluxo, vasoplegia ou ambos; inotrópico não deve ser inferido pela fração de ejeção isolada.",
                "title": "6 · Bomba"
              },
              {
                "id": "a08-step-pressure",
                "text": "Procure auto-PEEP, pressão intratorácica excessiva, pneumotórax, TEP, tamponamento e hipertensão intra-abdominal. A ventilação pode reduzir retorno venoso e sobrecarregar o VD.",
                "title": "7 · Ventilação, tubos e pressões"
              },
              {
                "id": "a08-step-metabolism",
                "text": "Investigue acidemia, cálcio ionizado, glicemia, temperatura e múltiplas causas de lactato. Corrija mecanismo e causa; um valor isolado não é ordem automática de fluido ou bicarbonato.",
                "title": "8 · Metabolismo"
              }
            ],
            "title": "M1 · Mecanismo: auditoria dos oito domínios",
            "type": "numberedSteps"
          },
          {
            "columns": [
              {
                "id": "a08-column-hidden",
                "label": "O que pode estar oculto"
              },
              {
                "id": "a08-column-check",
                "label": "Verificação imediata"
              },
              {
                "id": "a08-column-error",
                "label": "Erro a evitar"
              }
            ],
            "id": "a08-component-m2",
            "rows": [
              {
                "cells": [
                  "Medição incorreta, infusão falha, vasoplegia, baixo fluxo ou obstrução.",
                  "Curva e manguito, acesso/equipo, perfusão e avaliação cardiovascular focal.",
                  "Somar fármacos sem confirmar entrega e fisiologia."
                ],
                "id": "a08-row-pressure",
                "label": "PAM continua inadequada"
              },
              {
                "cells": [
                  "Hipoperfusão, catecolaminas, depuração reduzida, convulsão ou outros mecanismos.",
                  "Tendência, perfusão periférica, débito, fígado, drogas e contexto metabólico.",
                  "Tratar o número com volume indiscriminado."
                ],
                "id": "a08-row-lactate",
                "label": "Lactato persiste"
              },
              {
                "cells": [
                  "Auto-PEEP, pressão elevada, pneumotórax, falência do VD ou hipovolemia relativa.",
                  "Ventilador, ausculta, pressões, POCUS integrado e exame do tórax.",
                  "Atribuir toda deterioração à sepse."
                ],
                "id": "a08-row-hypoxemia",
                "label": "Piora após intubação"
              },
              {
                "cells": [
                  "Foco não controlado, espectro ou exposição inadequados, nova infecção ou mimetizador.",
                  "Imagem, cultura, procedimento, dispositivos e revisão farmacológica.",
                  "Trocar antimicrobiano sem rever anatomia e diagnóstico."
                ],
                "id": "a08-row-fever",
                "label": "Inflamação e choque persistem"
              }
            ],
            "title": "M2 · Sinal de refratariedade × pergunta que falta",
            "type": "comparisonTable"
          },
          {
            "id": "a08-component-m3",
            "items": [
              {
                "content": [
                  {
                    "text": "Pessoa adulta com choque atribuído a infecção abdominal. A pressão segue inadequada apesar de vasopressor em escalada. A primeira tarefa é confirmar medição, acesso, entrega da infusão e sinais de perfusão enquanto a auditoria começa.",
                    "type": "paragraph"
                  }
                ],
                "id": "a08-case-1",
                "initiallyOpen": true,
                "label": "1 · Vasopressor em escalada"
              },
              {
                "content": [
                  {
                    "text": "A tomografia prévia mostrava coleção; o dreno tem débito mínimo e posição incerta. O problema pode ser anatômico, não resistência farmacológica. Acione a equipe de controle do foco e verifique eficácia do procedimento.",
                    "type": "paragraph"
                  }
                ],
                "id": "a08-case-2",
                "label": "2 · O foco não fechou"
              },
              {
                "content": [
                  {
                    "text": "Após intubação, há hiperinsuflação dinâmica, pressão intratorácica elevada e sinais de sobrecarga do VD. Revise ventilador e pressões, exclua obstrução e pneumotórax e reclassifique o choque antes de novo fluido.",
                    "type": "paragraph"
                  }
                ],
                "id": "a08-case-3",
                "label": "3 · A ventilação mudou a fisiologia"
              },
              {
                "content": [
                  {
                    "text": "Acidemia importante pode reduzir resposta cardiovascular, mas deve ser explicada por ventilação, perfusão, rim, metabolismo e drogas. Corrija causas reversíveis e só então discuta terapia não padrão com equipe experiente, justificativa, monitorização e critérios de interrupção.",
                    "type": "paragraph"
                  }
                ],
                "id": "a08-case-4",
                "label": "4 · Acidemia e decisão de resgate"
              }
            ],
            "title": "M3 · Caso sintético progressivo",
            "type": "accordion"
          },
          {
            "id": "a08-component-m4",
            "items": [
              {
                "id": "a08-pitfall-dose",
                "text": "Erro: chamar de vasoplegia refratária sem procurar baixo fluxo, obstrução, falha de infusão ou diagnóstico alternativo. Correção: classificar a fisiologia seriada.",
                "title": "Dose alta = diagnóstico fechado",
                "tone": "danger"
              },
              {
                "id": "a08-pitfall-fluid",
                "text": "Erro: ignorar mecanismos não hipovolêmicos e tolerância. Correção: integrar tendência, perfusão, resposta dinâmica e congestão.",
                "title": "Lactato = mais fluido",
                "tone": "danger"
              },
              {
                "id": "a08-pitfall-antibiotic",
                "text": "Erro: esquecer dreno obstruído, coleção residual, prótese, obstrução ou tecido necrótico. Correção: confirmar controle do foco.",
                "title": "Escalar antibiótico sem anatomia",
                "tone": "warning"
              },
              {
                "id": "a08-pitfall-rescue",
                "text": "Erro: usar intervenção não padrão sem alvo, plausibilidade, governança ou stop rule. Correção: tratar reversíveis e documentar o racional.",
                "title": "Resgate antes da auditoria",
                "tone": "danger"
              }
            ],
            "title": "M4 · Armadilhas no choque persistente",
            "type": "cards"
          },
          {
            "id": "a08-component-m5",
            "questions": [
              {
                "correctOptionId": "a08-option-1b",
                "feedback": "Confirme pressão, infusão e perfusão; depois percorra os oito domínios enquanto mantém estabilização e tratamento apoiado.",
                "id": "a08-question-1",
                "options": [
                  {
                    "id": "a08-option-1a",
                    "label": "Adicionar resgate experimental"
                  },
                  {
                    "id": "a08-option-1b",
                    "label": "Confirmar entrega e auditar causas reversíveis"
                  },
                  {
                    "id": "a08-option-1c",
                    "label": "Dar volume por hipotensão isolada"
                  }
                ],
                "prompt": "Qual é a primeira resposta cognitiva diante de vasopressor em escalada?"
              },
              {
                "correctOptionId": "a08-option-2b",
                "feedback": "Use lactato em tendência e no contexto. Hipoperfusão é possível, mas catecolaminas, depuração e outros mecanismos também importam.",
                "id": "a08-question-2",
                "options": [
                  {
                    "id": "a08-option-2a",
                    "label": "Sim, sempre"
                  },
                  {
                    "id": "a08-option-2b",
                    "label": "Não; existem múltiplos mecanismos"
                  },
                  {
                    "id": "a08-option-2c",
                    "label": "Não tem qualquer relevância"
                  }
                ],
                "prompt": "Lactato persistente significa necessariamente hipovolemia?"
              },
              {
                "correctOptionId": "a08-option-3a",
                "feedback": "A mudança temporal sugere mecanismo ventilatório ou cardiopulmonar potencialmente reversível. Reavalie tubos, pressões, tórax e função do VD.",
                "id": "a08-question-3",
                "options": [
                  {
                    "id": "a08-option-3a",
                    "label": "Revisar ventilador, pressões e VD"
                  },
                  {
                    "id": "a08-option-3b",
                    "label": "Assumir progressão infecciosa"
                  },
                  {
                    "id": "a08-option-3c",
                    "label": "Ignorar auto-PEEP"
                  }
                ],
                "prompt": "Piora hemodinâmica imediatamente após intubação deve levar primeiro a quê?"
              }
            ],
            "title": "M5 · Recuperação ativa",
            "type": "quiz"
          },
          {
            "id": "a08-component-m6",
            "items": [
              {
                "details": "Diagnóstico, foco, antimicrobiano, volume/tolerância, vasoplegia, bomba, ventilação/pressões e metabolismo.",
                "id": "a08-resume-d0",
                "initiallyChecked": false,
                "label": "D0 · recite os oito domínios"
              },
              {
                "details": "Faça a lista sem consultar e marque a lacuna.",
                "id": "a08-resume-d1",
                "initiallyChecked": false,
                "label": "D1 · escolha um reversível por domínio"
              },
              {
                "details": "Explique auto-PEEP, retorno venoso, VD e choque misto.",
                "id": "a08-resume-d7",
                "initiallyChecked": false,
                "label": "D7 · reconstrua a deterioração pós-intubação"
              },
              {
                "details": "Explique por que cada alternativa errada pode atrasar a correção causal.",
                "id": "a08-resume-d14",
                "initiallyChecked": false,
                "label": "D14 · refaça as três questões"
              },
              {
                "details": "Diga fisiologia, reversíveis, ações em curso, incerteza e próximo checkpoint.",
                "id": "a08-resume-d30",
                "initiallyChecked": false,
                "label": "D30 · simule um briefing de 90 segundos"
              }
            ],
            "title": "M6 · Retomada espaçada",
            "type": "checklist"
          },
          {
            "current": 7,
            "id": "a08-component-progress",
            "label": "M0–M6 concluídos",
            "title": "Percurso ACRA 08",
            "total": 7,
            "type": "progress"
          },
          {
            "id": "a08-component-sources",
            "sourceIds": [
              "a08-source-ssc",
              "a08-source-hemodynamic"
            ],
            "title": "Diretriz e guia oficial",
            "type": "sources"
          },
          {
            "actionIds": [
              "a08-action-review",
              "a08-action-verify",
              "a08-action-deepen"
            ],
            "id": "a08-component-followup",
            "title": "Próximas ações sugeridas",
            "type": "followupActions"
          }
        ],
        "critical": [
          {
            "id": "a08-critical-educational",
            "severity": "danger",
            "text": "Choque persistente é emergência. Este ACRA não substitui ressuscitação simultânea, equipe experiente, monitorização adequada, diretriz ou protocolo institucional e não oferece prescrição autônoma de terapias de resgate.",
            "title": "Apoio educacional — não é protocolo assistencial"
          },
          {
            "id": "a08-critical-reversible",
            "severity": "warning",
            "text": "Não existe um único limiar universal que explique refratariedade. Foco não controlado, terapia anti-infecciosa inadequada, congestão, falência ventricular, obstrução, auto-PEEP, acidemia e diagnósticos alternativos podem coexistir e exigem busca dirigida.",
            "title": "Escalada pressora não define a causa"
          },
          {
            "id": "a08-critical-synthetic",
            "severity": "info",
            "text": "O cenário é fictício e não contém dados identificáveis. Conteúdo local para estudo TEMI; revisão clínica humana final permanece obrigatória antes de integração ou uso institucional.",
            "title": "Caso sintético em revisão médica"
          }
        ],
        "id": "acra-sepse-08-v1",
        "mode": "tutorial",
        "sources": [
          {
            "id": "a08-source-ssc",
            "publisher": "Society of Critical Care Medicine",
            "title": "Surviving Sepsis Campaign: Adult Guidelines 2026",
            "url": "https://www.sccm.org/survivingsepsiscampaign/guidelines-and-resources/surviving-sepsis-campaign-adult-guidelines"
          },
          {
            "id": "a08-source-hemodynamic",
            "publisher": "Society of Critical Care Medicine",
            "title": "Quick Guide for Resuscitation and Hemodynamic Support",
            "url": "https://sccm.org/SCCM/media/SCCM/PDFs/SSC-Adult-Quick-Guide-Infographic-2026.pdf"
          }
        ],
        "subtitle": "Oito domínios para procurar causas reversíveis",
        "summary": "Micropartícula ACRA para enfrentar vasopressor em escalada sem usar um resgate experimental como atalho. Audite diagnóstico, foco, antimicrobiano, volume e tolerância, vasoplegia, bomba, ventilação e pressões, e metabolismo; corrija causas reversíveis, reavalie a fisiologia e só discuta intervenção não padrão sob governança clínica.",
        "title": "Choque refratário: explique antes de resgatar",
        "version": "1.0"
      },
      "sha256": "527beb6c174509ccde12d3e717ce699317a40903286530ced529456fe502a3ca",
      "source": "acra/acra-sepse-08-choque-refratario-explicar-antes-resgatar.json"
    },
    {
      "artifact": {
        "actions": [
          {
            "contextComponentIds": [
              "a09-component-m1",
              "a09-component-m2",
              "a09-component-m4"
            ],
            "id": "a09-action-review",
            "kind": "review",
            "label": "Revisar hard stops",
            "prompt": "Recupere as contraindicações e advertências críticas do documento regulatório e relacione cada uma a uma ação de segurança.",
            "requiresPreview": true
          },
          {
            "contextComponentIds": [
              "a09-component-m3",
              "a09-component-m5"
            ],
            "id": "a09-action-verify",
            "kind": "verify",
            "label": "Verificar reconciliação",
            "prompt": "No caso sintético, revise exposição serotonérgica, G6PD, hipersensibilidade, hemólise e limitações da oximetria.",
            "requiresPreview": true
          },
          {
            "contextComponentIds": [
              "a09-component-m0",
              "a09-component-m2"
            ],
            "id": "a09-action-compare",
            "kind": "compare",
            "label": "Comparar evidência e regulação",
            "prompt": "Compare plausibilidade fisiológica, sinal substituto, benefício clínico, indicação regulatória e governança off-label.",
            "requiresPreview": true
          }
        ],
        "components": [
          {
            "id": "a09-component-m0",
            "text": "Fisiologia plausível + aumento de PAM não provam sobrevida nem segurança. Antes de qualquer fronteira: audite o choque, esgote medidas apoiadas, confirme status off-label, procure hard stops, defina alvo mensurável e estabeleça stop rules — sem automatismo.",
            "title": "M0 · Essência em 30 segundos",
            "tone": "danger",
            "type": "callout"
          },
          {
            "id": "a09-component-m1",
            "items": [
              {
                "id": "a09-step-standard",
                "text": "Confirme diagnóstico, foco, antimicrobiano, perfusão, volume e tolerância, vasopressores apoiados, função cardíaca, ventilação, pressões e metabolismo. A intervenção de fronteira nunca substitui correção causal.",
                "title": "1 · Proteja o cuidado apoiado"
              },
              {
                "id": "a09-step-evidence",
                "text": "Registre que a indicação FDA do produto citado é metemoglobinemia, não choque. A SSC 2026 considera insuficiente a evidência para emitir recomendação sobre azul de metileno intravenoso no choque; estudos pequenos e desfechos fisiológicos não sustentam rotina nem esquema universal.",
                "title": "2 · Classifique evidência e regulação"
              },
              {
                "id": "a09-step-safety",
                "text": "Confirme deficiência de G6PD e hipersensibilidade, contraindicações do rótulo citado; avalie separadamente os alertas sobre síndrome serotoninérgica com serotonérgicos/opioides, hemólise, interferência na oximetria, gestação, função renal e hepática e demais advertências da bula vigente. Não presuma segurança pela urgência.",
                "title": "3 · Faça triagem de contraindicações e riscos"
              },
              {
                "id": "a09-step-governance",
                "text": "Se a discussão permanecer, envolva intensivista sênior, farmácia e especialistas pertinentes; confirme protocolo institucional, responsabilidade decisória, consentimento conforme política local, rastreabilidade e plano de farmacovigilância.",
                "title": "4 · Exija governança"
              },
              {
                "id": "a09-step-target",
                "text": "Declare qual falha fisiológica se pretende testar, em qual janela e por quais medidas válidas. Planeje pressão, perfusão, ritmo, estado neurológico, hemólise e métodos alternativos de oxigenação quando a oximetria estiver interferida.",
                "title": "5 · Defina alvo e monitorização antes"
              },
              {
                "id": "a09-step-stop",
                "text": "Ausência de resposta predefinida, toxicidade, síndrome serotoninérgica, hemólise, hipersensibilidade ou nova explicação do choque exigem interrupção e reavaliação. Este ACRA não define dose, duração ou autorização para uso.",
                "title": "6 · Defina interrupção antes de começar"
              }
            ],
            "title": "M1 · Mecanismo: firewall de decisão não prescritivo",
            "type": "numberedSteps"
          },
          {
            "columns": [
              {
                "id": "a09-column-known",
                "label": "O que sabemos"
              },
              {
                "id": "a09-column-unknown",
                "label": "O que não sabemos"
              },
              {
                "id": "a09-column-barrier",
                "label": "Barreira de segurança"
              }
            ],
            "id": "a09-component-m2",
            "rows": [
              {
                "cells": [
                  "O rótulo FDA citado indica metemoglobinemia adquirida.",
                  "Não há indicação aprovada nesse rótulo para choque séptico.",
                  "Marcar explicitamente off-label e conferir regra local e bula vigente."
                ],
                "id": "a09-row-regulatory",
                "label": "Status regulatório"
              },
              {
                "cells": [
                  "Há plausibilidade vasopressora e sinais fisiológicos em estudos limitados.",
                  "A SSC 2026 considera insuficiente a evidência para emitir recomendação sobre o uso intravenoso no choque; benefício clínico líquido, população ideal e esquema permanecem incertos.",
                  "Não converter aumento de PAM em benefício de sobrevida."
                ],
                "id": "a09-row-outcome",
                "label": "Efeito observado"
              },
              {
                "cells": [
                  "A bula contém alerta máximo para síndrome serotoninérgica com serotonérgicos e opioides.",
                  "Suspender uma droga imediatamente pode não eliminar risco por meia-vida e exposição acumulada.",
                  "Reconciliação completa com farmácia; não improvisar washout."
                ],
                "id": "a09-row-interaction",
                "label": "Interações"
              },
              {
                "cells": [
                  "Deficiência de G6PD é contraindicação do produto citado pelo risco de hemólise.",
                  "Status desconhecido não equivale a ausência de risco.",
                  "Verificar história, exames disponíveis e bula; monitorar hemólise quando aplicável."
                ],
                "id": "a09-row-g6pd",
                "label": "G6PD e hemólise"
              },
              {
                "cells": [
                  "O corante pode subestimar a saturação na oximetria de pulso.",
                  "Queda aparente de SpO₂ pode ser artefato ou deterioração real.",
                  "Correlacionar clínica e método alternativo de oxigenação conforme bula e contexto."
                ],
                "id": "a09-row-monitor",
                "label": "Monitorização"
              }
            ],
            "title": "M2 · Evidência, risco e decisão segura",
            "type": "comparisonTable"
          },
          {
            "id": "a09-component-m3",
            "items": [
              {
                "content": [
                  {
                    "text": "Pessoa adulta com vasoplegia extrema e vasopressores em escalada. Surge a proposta de azul de metileno para aumentar a pressão. Antes de discutir o fármaco, a equipe precisa provar que diagnóstico, foco, entrega de infusões e fisiologia foram reavaliados.",
                    "type": "paragraph"
                  }
                ],
                "id": "a09-case-1",
                "initiallyOpen": true,
                "label": "1 · A proposta de fronteira"
              },
              {
                "content": [
                  {
                    "text": "O prontuário mostra antidepressivo serotonérgico crônico e opioide em uso. A bula FDA alerta para síndrome serotoninérgica grave ou fatal nessa combinação. Pausar uma dose agora não cria segurança imediata; meia-vida e exposição prévia importam.",
                    "type": "paragraph"
                  }
                ],
                "id": "a09-case-2",
                "label": "2 · A reconciliação muda tudo"
              },
              {
                "content": [
                  {
                    "text": "O status de G6PD é desconhecido. O produto citado é contraindicado na deficiência de G6PD pelo risco de hemólise. A incerteza deve ser declarada; urgência não transforma ausência de informação em teste negativo.",
                    "type": "paragraph"
                  }
                ],
                "id": "a09-case-3",
                "label": "3 · Mais um dado ausente"
              },
              {
                "content": [
                  {
                    "text": "Com hard stops e evidência insuficiente, este ACRA não produz um esquema de uso. A equipe volta à auditoria causal e ao cuidado apoiado, documenta a discussão e, se necessário, busca governança institucional e parecer farmacológico.",
                    "type": "paragraph"
                  }
                ],
                "id": "a09-case-4",
                "label": "4 · Decisão de não automatizar"
              }
            ],
            "title": "M3 · Caso sintético progressivo",
            "type": "accordion"
          },
          {
            "id": "a09-component-m4",
            "items": [
              {
                "id": "a09-pitfall-map",
                "text": "Erro: usar um desfecho fisiológico substituto como benefício clínico. Correção: avaliar perfusão, órgãos, toxicidade e desfechos centrados no paciente.",
                "title": "PAM subiu = paciente melhorou",
                "tone": "danger"
              },
              {
                "id": "a09-pitfall-label-dose",
                "text": "Erro: transportar esquema de metemoglobinemia para indicação off-label. Correção: não extrapolar e não criar posologia sem protocolo validado.",
                "title": "Dose da bula = dose do choque",
                "tone": "danger"
              },
              {
                "id": "a09-pitfall-medication",
                "text": "Erro: esquecer antidepressivos, opioides, linezolida, dextrometorfano e outras exposições relevantes. Correção: reconciliação farmacológica completa.",
                "title": "Lista curta de medicamentos",
                "tone": "warning"
              },
              {
                "id": "a09-pitfall-spo2",
                "text": "Erro: ignorar interferência do corante na oximetria. Correção: correlacionar exame e método alternativo sem deixar de investigar hipoxemia real.",
                "title": "SpO₂ caiu = hipoxemia certa",
                "tone": "warning"
              },
              {
                "id": "a09-pitfall-offlabel",
                "text": "Erro: usar rótulos extremos. Correção: separar legalidade local, qualidade da evidência, risco, governança e excepcionalidade clínica.",
                "title": "Off-label = proibido ou comprovado",
                "tone": "info"
              }
            ],
            "title": "M4 · Armadilhas da fronteira",
            "type": "cards"
          },
          {
            "id": "a09-component-m5",
            "questions": [
              {
                "correctOptionId": "a09-option-1b",
                "feedback": "O rótulo citado indica metemoglobinemia adquirida. Uso no choque é off-label e não recebe posologia neste ACRA.",
                "id": "a09-question-1",
                "options": [
                  {
                    "id": "a09-option-1a",
                    "label": "Choque séptico"
                  },
                  {
                    "id": "a09-option-1b",
                    "label": "Metemoglobinemia adquirida"
                  },
                  {
                    "id": "a09-option-1c",
                    "label": "Qualquer vasoplegia"
                  }
                ],
                "prompt": "Qual é a indicação aprovada no rótulo FDA citado para o azul de metileno?"
              },
              {
                "correctOptionId": "a09-option-2a",
                "feedback": "A deficiência de G6PD é contraindicação do produto citado devido ao risco de anemia hemolítica. Hipersensibilidade grave também é contraindicação.",
                "id": "a09-question-2",
                "options": [
                  {
                    "id": "a09-option-2a",
                    "label": "Deficiência de G6PD"
                  },
                  {
                    "id": "a09-option-2b",
                    "label": "Taquicardia isolada"
                  },
                  {
                    "id": "a09-option-2c",
                    "label": "Lactato elevado isolado"
                  }
                ],
                "prompt": "Qual achado é hard stop no rótulo FDA citado?"
              },
              {
                "correctOptionId": "a09-option-3b",
                "feedback": "Pressão pode melhorar sem benefício em perfusão, órgãos ou sobrevida e com toxicidade. Evidência de desfecho clínico e segurança continua necessária.",
                "id": "a09-question-3",
                "options": [
                  {
                    "id": "a09-option-3a",
                    "label": "Sim, sempre"
                  },
                  {
                    "id": "a09-option-3b",
                    "label": "Não; é desfecho substituto"
                  },
                  {
                    "id": "a09-option-3c",
                    "label": "Dispensa monitorização"
                  }
                ],
                "prompt": "Aumento de PAM após uma terapia off-label demonstra benefício clínico?"
              }
            ],
            "title": "M5 · Recuperação ativa",
            "type": "quiz"
          },
          {
            "id": "a09-component-m6",
            "items": [
              {
                "details": "Cuidado padrão, evidência/regulação, hard stops, governança e stop rules.",
                "id": "a09-resume-d0",
                "initiallyChecked": false,
                "label": "D0 · diga cinco barreiras antes da fronteira"
              },
              {
                "details": "G6PD, hipersensibilidade, serotonérgicos/opioides, hemólise e oximetria.",
                "id": "a09-resume-d1",
                "initiallyChecked": false,
                "label": "D1 · recite os alertas críticos da bula"
              },
              {
                "details": "Explique por que pausar uma dose não apaga exposição nem interação.",
                "id": "a09-resume-d7",
                "initiallyChecked": false,
                "label": "D7 · reconstrua o caso farmacológico"
              },
              {
                "details": "Liste perfusão, órgãos, eventos adversos e desfechos centrados no paciente.",
                "id": "a09-resume-d14",
                "initiallyChecked": false,
                "label": "D14 · diferencie PAM de benefício clínico"
              },
              {
                "details": "Declare off-label, incerteza, hard stops, responsáveis, monitorização e interrupção sem prescrever dose.",
                "id": "a09-resume-d30",
                "initiallyChecked": false,
                "label": "D30 · faça um briefing de governança"
              }
            ],
            "title": "M6 · Retomada espaçada",
            "type": "checklist"
          },
          {
            "current": 7,
            "id": "a09-component-progress",
            "label": "M0–M6 concluídos",
            "title": "Percurso ACRA 09",
            "total": 7,
            "type": "progress"
          },
          {
            "id": "a09-component-sources",
            "sourceIds": [
              "a09-source-ssc",
              "a09-source-fda"
            ],
            "title": "Diretriz e documento regulatório",
            "type": "sources"
          },
          {
            "actionIds": [
              "a09-action-review",
              "a09-action-verify",
              "a09-action-compare"
            ],
            "id": "a09-component-followup",
            "title": "Próximas ações sugeridas",
            "type": "followupActions"
          }
        ],
        "critical": [
          {
            "id": "a09-critical-educational",
            "severity": "danger",
            "text": "Este ACRA não autoriza nem recomenda administrar azul de metileno no choque. Qualquer discussão excepcional depende de otimização do cuidado padrão, equipe experiente, farmácia clínica, protocolo e governança locais, avaliação individual e documentação.",
            "title": "Off-label e educacional — não é prescrição"
          },
          {
            "id": "a09-critical-hard-stops",
            "severity": "danger",
            "text": "O rótulo FDA citado contraindica o produto em deficiência de G6PD e hipersensibilidade. Em blocos distintos, alerta para síndrome serotoninérgica grave ou fatal com fármacos serotonérgicos e opioides, risco de hemólise e possível subestimação da saturação pela oximetria de pulso. Revise a bula vigente e todo o prontuário farmacológico.",
            "title": "Hard stops regulatórios e farmacológicos"
          },
          {
            "id": "a09-critical-synthetic",
            "severity": "info",
            "text": "O cenário é fictício e não contém dados identificáveis. Conteúdo local para estudo TEMI; revisão clínica humana final permanece obrigatória antes de integração ou uso institucional.",
            "title": "Caso sintético em revisão médica"
          }
        ],
        "id": "acra-sepse-09-v1",
        "mode": "tutorial",
        "sources": [
          {
            "id": "a09-source-ssc",
            "publisher": "Society of Critical Care Medicine",
            "title": "Surviving Sepsis Campaign: Adult Guidelines 2026",
            "url": "https://www.sccm.org/survivingsepsiscampaign/guidelines-and-resources/surviving-sepsis-campaign-adult-guidelines"
          },
          {
            "id": "a09-source-fda",
            "publisher": "U.S. Food and Drug Administration",
            "title": "FDA label — PROVAYBLUE (methylene blue), revised January 2024",
            "url": "https://www.accessdata.fda.gov/drugsatfda_docs/label/2024/204630s021lbl.pdf"
          }
        ],
        "subtitle": "Azul de metileno: governança antes de sedução fisiológica",
        "summary": "Micropartícula ACRA para enquadrar, sem prescrever, a discussão excepcional de azul de metileno na vasoplegia. Choque séptico não é indicação aprovada no rótulo FDA citado; a SSC 2026 considera insuficiente a evidência para emitir recomendação sobre azul de metileno intravenoso no choque, e melhora pressórica não equivale a benefício em desfechos. O artefato organiza barreiras de segurança, governança, alvo, monitorização e interrupção; não fornece dose.",
        "title": "Fronteira terapêutica e segurança off-label",
        "version": "1.0"
      },
      "sha256": "e3a1c336b7f5ceb94df79613199dfaaaf40349b7cf2b1e5d9ae92fff01d4027c",
      "source": "acra/acra-sepse-09-fronteira-off-label-seguranca.json"
    },
    {
      "artifact": {
        "actions": [
          {
            "contextComponentIds": [
              "a10-component-m2",
              "a10-component-m3",
              "a10-component-m4"
            ],
            "id": "a10-action-review",
            "kind": "review",
            "label": "Revisar riscos de transição",
            "prompt": "Reabra o caso e liste déficits, medicamentos duvidosos, riscos imediatos e pendências sem circuito fechado.",
            "requiresPreview": true
          },
          {
            "contextComponentIds": [
              "a10-component-m1",
              "a10-component-m2"
            ],
            "id": "a10-action-verify",
            "kind": "verify",
            "label": "Verificar plano mínimo",
            "prompt": "Confirme se cada domínio tem avaliação, ação, responsável, prazo e sinal de alarme antes da transição.",
            "requiresPreview": true
          },
          {
            "contextComponentIds": [
              "a10-component-m0",
              "a10-component-m5",
              "a10-component-m6"
            ],
            "id": "a10-action-deepen",
            "kind": "deepen",
            "label": "Aprofundar pós-sepse",
            "prompt": "Estude deficiência física, cognitiva e emocional pós-doença crítica e como a reabilitação multiprofissional pode ser individualizada.",
            "requiresPreview": true
          }
        ],
        "components": [
          {
            "id": "a10-component-m0",
            "text": "Alta não é desfecho; é transferência de risco. Compare com o basal, torne cada déficit visível, associe intervenção + responsável + prazo + gatilho de retorno e reconcilie cada medicamento.",
            "title": "M0 · Essência em 30 segundos",
            "tone": "info",
            "type": "callout"
          },
          {
            "id": "a10-component-m1",
            "items": [
              {
                "id": "a10-step-baseline",
                "text": "Registre mobilidade, autonomia, cognição, comunicação, alimentação, trabalho, sono e saúde emocional antes da doença. Sem referência, um novo déficit pode parecer normal.",
                "title": "1 · Reconstrua o basal"
              },
              {
                "id": "a10-step-medication",
                "text": "Para cada fármaco, escreva indicação atual, continuidade ou suspensão, duração quando aplicável, ajuste por função renal/hepática, interação, monitorização e quem revisará. Retire duplicidades e heranças da UTI sem indicação.",
                "title": "2 · Reconcilie medicamentos"
              },
              {
                "id": "a10-step-function",
                "text": "Avalie força, mobilidade, equilíbrio, atividades diárias, dispneia e risco de queda. Mobilização e reabilitação devem ser graduais, seguras e coordenadas com fisioterapia e terapia ocupacional.",
                "title": "3 · Meça função física"
              },
              {
                "id": "a10-step-swallow",
                "text": "Após intubação prolongada, procure tosse, voz molhada, engasgo, fadiga alimentar e ingestão insuficiente. Defina consistência e via somente após avaliação adequada; coordene fonoaudiologia e nutrição.",
                "title": "4 · Proteja deglutição e nutrição"
              },
              {
                "id": "a10-step-brain",
                "text": "Rastreie cognição, memória, atenção, delirium residual, ansiedade, depressão, sintomas traumáticos e sono. Diferencie déficit novo, doença prévia, medicamento e fator social.",
                "title": "5 · Avalie cérebro e emoção"
              },
              {
                "id": "a10-step-transition",
                "text": "Entregue resumo compreensível, lista de problemas, resultados pendentes, dispositivos, contatos, sinais de alarme e consultas. Cada pendência precisa de responsável nominal e checkpoint verificável.",
                "title": "6 · Feche a transição"
              }
            ],
            "title": "M1 · Mecanismo: da estabilização à reconstrução",
            "type": "numberedSteps"
          },
          {
            "columns": [
              {
                "id": "a10-column-assess",
                "label": "O que avaliar"
              },
              {
                "id": "a10-column-plan",
                "label": "Plano mínimo seguro"
              },
              {
                "id": "a10-column-escalate",
                "label": "Quando escalar"
              }
            ],
            "id": "a10-component-m2",
            "rows": [
              {
                "cells": [
                  "Indicação, duplicidade, duração, função orgânica, interação e adesão.",
                  "Lista única com mudança explicada e profissional responsável pela revisão.",
                  "Evento adverso, erro de lista, fármaco sem indicação ou monitorização ausente."
                ],
                "id": "a10-row-medication",
                "label": "Medicamentos"
              },
              {
                "cells": [
                  "Força, transferência, marcha, equilíbrio, fadiga e atividades diárias.",
                  "Meta funcional graduada, equipamento necessário e plano de reabilitação.",
                  "Queda, nova dispneia, intolerância desproporcional ou ausência de cuidador seguro."
                ],
                "id": "a10-row-physical",
                "label": "Função física"
              },
              {
                "cells": [
                  "Engasgo, voz, tosse, fadiga, hidratação, ingestão e perda ponderal.",
                  "Avaliação apropriada, via e consistência definidas, metas e seguimento.",
                  "Aspiração suspeita, incapacidade de manter hidratação ou ingestão insuficiente."
                ],
                "id": "a10-row-swallow",
                "label": "Deglutição e nutrição"
              },
              {
                "cells": [
                  "Atenção, memória, orientação, planejamento e diferença em relação ao basal.",
                  "Rastreio, apoio do cuidador, revisão de drogas e reavaliação programada.",
                  "Alteração aguda, risco de segurança, incapacidade de gerir medicações ou autocuidado."
                ],
                "id": "a10-row-cognition",
                "label": "Cognição"
              },
              {
                "cells": [
                  "Ansiedade, humor, sintomas traumáticos, sono, sofrimento familiar e trabalho.",
                  "Escuta, rastreio, orientação, encaminhamento e rede de apoio.",
                  "Ideação suicida, sofrimento intenso, insônia incapacitante ou risco social."
                ],
                "id": "a10-row-emotional",
                "label": "Saúde emocional e sono"
              }
            ],
            "title": "M2 · Domínio, ação e gatilho de escalada",
            "type": "comparisonTable"
          },
          {
            "id": "a10-component-m3",
            "items": [
              {
                "content": [
                  {
                    "text": "Pessoa adulta sobreviveu a sepse, ventilação prolongada e internação extensa. Está hemodinamicamente estável e a equipe considera alta rápida. Antes da transição, compare autonomia, cognição e alimentação atuais com o basal.",
                    "type": "paragraph"
                  }
                ],
                "id": "a10-case-1",
                "initiallyOpen": true,
                "label": "1 · O aparente sucesso"
              },
              {
                "content": [
                  {
                    "text": "A pessoa precisa de ajuda para levantar, esquece orientações, está ansiosa e tosse ao ingerir líquidos. Estabilidade vital não significa prontidão funcional; fisioterapia, fonoaudiologia, nutrição e avaliação cognitivo-emocional entram no plano.",
                    "type": "paragraph"
                  }
                ],
                "id": "a10-case-2",
                "label": "2 · Déficits que estavam invisíveis"
              },
              {
                "content": [
                  {
                    "text": "A prescrição contém medicamentos iniciados na UTI sem indicação de continuidade documentada e há divergência com a lista domiciliar. Farmácia e equipe assistente reconciliam indicação, duração, ajuste, monitorização e suspensão.",
                    "type": "paragraph"
                  }
                ],
                "id": "a10-case-3",
                "label": "3 · A lista de medicações diverge"
              },
              {
                "content": [
                  {
                    "text": "A alta só fecha quando paciente e cuidador compreendem o plano, demonstram manejo seguro, recebem sinais de alarme e sabem quem responde por cada pendência e quando ocorrerá a próxima avaliação.",
                    "type": "paragraph"
                  }
                ],
                "id": "a10-case-4",
                "label": "4 · Transição em circuito fechado"
              }
            ],
            "title": "M3 · Caso sintético progressivo",
            "type": "accordion"
          },
          {
            "id": "a10-component-m4",
            "items": [
              {
                "id": "a10-pitfall-alive",
                "text": "Erro: usar mortalidade como único desfecho. Correção: medir função, cognição, emoção, nutrição, autonomia e qualidade da transição.",
                "title": "Sobreviveu = recuperou",
                "tone": "danger"
              },
              {
                "id": "a10-pitfall-baseline",
                "text": "Erro: normalizar déficit novo. Correção: reconstruir capacidade prévia com paciente, família e registros.",
                "title": "Sem comparar com o basal",
                "tone": "warning"
              },
              {
                "id": "a10-pitfall-medications",
                "text": "Erro: perpetuar sedativos, protetores, insulina, anti-hipertensivos ou outros fármacos sem indicação revisada. Correção: reconciliação item a item.",
                "title": "Copiar a prescrição da UTI",
                "tone": "danger"
              },
              {
                "id": "a10-pitfall-dysphagia",
                "text": "Erro: ignorar disfagia pós-extubação e risco de aspiração. Correção: avaliação apropriada antes de liberalizar via ou consistência.",
                "title": "Tosse ao beber = detalhe",
                "tone": "danger"
              },
              {
                "id": "a10-pitfall-vague",
                "text": "Erro: deixar pendência sem dono nem data. Correção: responsável, checkpoint, canal de contato e gatilho de retorno.",
                "title": "Acompanhar depois",
                "tone": "warning"
              }
            ],
            "title": "M4 · Armadilhas da recuperação",
            "type": "cards"
          },
          {
            "id": "a10-component-m5",
            "questions": [
              {
                "correctOptionId": "a10-option-1b",
                "feedback": "A comparação com o basal torna visíveis déficits físicos, cognitivos e emocionais adquiridos e orienta metas individualizadas.",
                "id": "a10-question-1",
                "options": [
                  {
                    "id": "a10-option-1a",
                    "label": "A média da enfermaria"
                  },
                  {
                    "id": "a10-option-1b",
                    "label": "O estado basal da própria pessoa"
                  },
                  {
                    "id": "a10-option-1c",
                    "label": "A alta da UTI"
                  }
                ],
                "prompt": "Qual é a referência mais útil para reconhecer novo déficit após sepse?"
              },
              {
                "correctOptionId": "a10-option-2b",
                "feedback": "Circuito fechado exige tarefa explícita, dono, checkpoint e escalada se o plano falhar.",
                "id": "a10-question-2",
                "options": [
                  {
                    "id": "a10-option-2a",
                    "label": "Escrever “acompanhar”"
                  },
                  {
                    "id": "a10-option-2b",
                    "label": "Responsável, prazo, ação e gatilho"
                  },
                  {
                    "id": "a10-option-2c",
                    "label": "Entregar uma lista extensa"
                  }
                ],
                "prompt": "O que fecha uma pendência de transição com segurança?"
              },
              {
                "correctOptionId": "a10-option-3a",
                "feedback": "Disfagia pós-extubação pode causar aspiração e ingestão inadequada. Via e consistência precisam de avaliação apropriada e plano multiprofissional.",
                "id": "a10-question-3",
                "options": [
                  {
                    "id": "a10-option-3a",
                    "label": "Possível disfagia que exige avaliação"
                  },
                  {
                    "id": "a10-option-3b",
                    "label": "Achado irrelevante"
                  },
                  {
                    "id": "a10-option-3c",
                    "label": "Autorização para dieta livre"
                  }
                ],
                "prompt": "Tosse e voz molhada após extubação prolongada devem ser tratadas como quê?"
              }
            ],
            "title": "M5 · Recuperação ativa",
            "type": "quiz"
          },
          {
            "id": "a10-component-m6",
            "items": [
              {
                "details": "Basal, medicamentos, função física, deglutição/nutrição, cérebro/emoção e transição.",
                "id": "a10-resume-d0",
                "initiallyChecked": false,
                "label": "D0 · recite os seis domínios da reconstrução"
              },
              {
                "details": "Para três fármacos, declare indicação, duração, monitorização e responsável.",
                "id": "a10-resume-d1",
                "initiallyChecked": false,
                "label": "D1 · faça uma reconciliação fictícia"
              },
              {
                "details": "Identifique sinais, risco, profissional acionado e condição para transição segura.",
                "id": "a10-resume-d7",
                "initiallyChecked": false,
                "label": "D7 · reconstrua o caso de disfagia"
              },
              {
                "details": "Cada uma deve ter ação, responsável, prazo e gatilho de escalada.",
                "id": "a10-resume-d14",
                "initiallyChecked": false,
                "label": "D14 · transforme três pendências em circuito fechado"
              },
              {
                "details": "Resuma basal, déficits, medicações, reabilitação, alertas e próximo contato.",
                "id": "a10-resume-d30",
                "initiallyChecked": false,
                "label": "D30 · simule alta em 90 segundos"
              }
            ],
            "title": "M6 · Retomada espaçada",
            "type": "checklist"
          },
          {
            "current": 7,
            "id": "a10-component-progress",
            "label": "M0–M6 concluídos",
            "title": "Percurso ACRA 10",
            "total": 7,
            "type": "progress"
          },
          {
            "id": "a10-component-sources",
            "sourceIds": [
              "a10-source-ssc"
            ],
            "title": "Diretriz oficial",
            "type": "sources"
          },
          {
            "actionIds": [
              "a10-action-review",
              "a10-action-verify",
              "a10-action-deepen"
            ],
            "id": "a10-component-followup",
            "title": "Próximas ações sugeridas",
            "type": "followupActions"
          }
        ],
        "critical": [
          {
            "id": "a10-critical-educational",
            "severity": "danger",
            "text": "Este ACRA não substitui avaliação médica, multiprofissional, farmacêutica ou protocolo de transição. Déficits, destino, suporte familiar, acesso e seguimento precisam ser individualizados e documentados.",
            "title": "Apoio educacional — não substitui plano individual"
          },
          {
            "id": "a10-critical-redflags",
            "severity": "warning",
            "text": "Febre, hipotensão, dispneia, dor torácica, oligúria, alteração neurológica, incapacidade de deglutir ou declínio agudo exigem reavaliação de infecção recorrente, evento tromboembólico, aspiração, toxicidade medicamentosa e outras emergências.",
            "title": "Não atribua toda piora à recuperação"
          },
          {
            "id": "a10-critical-synthetic",
            "severity": "info",
            "text": "O cenário é fictício e não contém dados identificáveis. Conteúdo local para estudo TEMI; revisão clínica humana final permanece obrigatória antes de integração ou uso institucional.",
            "title": "Caso sintético em revisão médica"
          }
        ],
        "id": "acra-sepse-10-v1",
        "mode": "tutorial",
        "sources": [
          {
            "id": "a10-source-ssc",
            "publisher": "Society of Critical Care Medicine",
            "title": "Surviving Sepsis Campaign: Adult Guidelines 2026",
            "url": "https://www.sccm.org/survivingsepsiscampaign/guidelines-and-resources/surviving-sepsis-campaign-adult-guidelines"
          }
        ],
        "subtitle": "Reconstrução funcional, cognitiva e emocional após sepse",
        "summary": "Micropartícula ACRA para transformar alta da UTI ou hospital em transição segura. Compare o estado atual ao basal, reconcilie medicamentos, avalie mobilidade, cognição, saúde emocional, deglutição e nutrição, organize reabilitação e atribua responsáveis e checkpoints. Novos sintomas não devem ser automaticamente chamados de síndrome pós-sepse.",
        "title": "Sobreviver não é voltar ao basal",
        "version": "1.0"
      },
      "sha256": "574a58882d12d01eb9f333d40875e17d557f6a04a4bfa514cc881e88abcf7019",
      "source": "acra/acra-sepse-10-sobreviver-nao-voltar-basal.json"
    }
  ],
  "schemaVersion": "antigravity-sepsis-acra-bundle-v1"
};

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach((key) => deepFreeze(value[key]));
    return Object.freeze(value);
  }

  Object.defineProperty(root, "SEPSE_ACRA_BUNDLE", {
    configurable: false,
    enumerable: true,
    value: deepFreeze(bundle),
    writable: false
  });
})(globalThis);
