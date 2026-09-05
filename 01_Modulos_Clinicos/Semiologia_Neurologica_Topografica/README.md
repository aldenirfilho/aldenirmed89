# Semiologia Neurológica Topográfica

Módulo educacional do AldenirMed89 para treinar exame neurológico completo e transformar achados em uma hipótese de localização anatômica antes de discutir etiologia.

## O que o módulo entrega

- radar topográfico em sete gates, do córtex ao músculo;
- checklist de 29 itens para exame neurológico sistemático;
- cronômetro OSCE de oito minutos e modelo de síntese copiável;
- avaliação da linguagem em seis eixos e comparação de oito padrões afásicos;
- comparação entre fraqueza facial supranuclear, nuclear e periférica;
- revisão de pares cranianos, sistema motor, reflexos, sensibilidade, visão, tronco e cerebelo;
- oito casos interativos de recuperação ativa;
- dez pranchas autorais em 16:9 com texto alternativo;
- referências clínicas rastreáveis e limites de uso visíveis.

## Método de uso

1. Exclua instabilidade e reconheça sinais de emergência.
2. Defina o tempo de instalação e a síndrome dominante.
3. Procure sinais corticais, distribuição face–braço–perna e sinais cruzados.
4. Diferencie neurônio motor superior de inferior e procure nível ou território.
5. Teste coordenação, fatigabilidade e padrão proximal-distal.
6. Registre lado, nível, evidências a favor, contradições e próximo teste confirmatório.

O radar e o classificador de afasia organizam o raciocínio, mas não calculam probabilidade, não determinam diagnóstico e não orientam tratamento automatizado.

## Privacidade e funcionamento

O código clínico do módulo é estático e funciona sem backend, `fetch`, conta, telemetria clínica ou envio de respostas. No artefato público, o pipeline geral do AldenirMed89 pode acrescentar o contador agregado de visitas já adotado no portal; ele não integra as ferramentas e nenhum campo de paciente é solicitado. O navegador guarda apenas:

- a preferência visual global do portal;
- IDs dos itens concluídos no checklist;
- alternativas respondidas nos casos educacionais.

Não há campos para nome, prontuário ou achados de paciente. O botão de reinício remove somente o progresso educacional local correspondente.

## Estrutura

```text
Semiologia_Neurologica_Topografica/
├── index.html
├── module.manifest.json
├── README.md
├── assets/
│   ├── app.js
│   ├── styles.css
│   ├── theme-bootstrap.js
│   └── images/
└── data/
    └── content.js
```

`data/content.js` contém as coleções estruturadas expostas em `window.ALDENIR_NEURO_SEMIOLOGY`. `assets/app.js` apenas renderiza essas coleções e controla interações locais. O evento `aldenirmed89:neuro-semiology-ready` sinaliza que a interface terminou de inicializar.

## Acessibilidade

- navegação completa por teclado e link para pular ao conteúdo;
- alvos de toque de pelo menos 44 px e foco de alto contraste;
- temas escuro, claro e contraste global sincronizados com o portal;
- layout responsivo, suporte a ampliação de texto e preferência por movimento reduzido;
- tabelas roláveis, regiões de anúncio e textos alternativos descritivos;
- impressão A4 com seções expansíveis abertas durante a impressão.

## Gate clínico

Versão atual: **prévia educacional em revisão médica**.

Antes de uso institucional ou assistencial, são obrigatórias revisão assinada por neurologia, validação das tarefas de linguagem em português brasileiro, revisão neuroanatômica das dez pranchas, teste em simulação e adaptação aos fluxos locais de emergência.

Déficit neurológico súbito, rebaixamento, primeira crise/estado de mal, cefaleia explosiva, meningismo, fraqueza bulbar/respiratória progressiva ou síndrome medular/cauda equina exigem avaliação emergencial; a interface nunca deve atrasar a via institucional.

## Manutenção

- conteúdo clínico e referências: `data/content.js`;
- avisos de segurança que devem permanecer visíveis: `index.html`;
- lógica de interface sem conteúdo clínico novo: `assets/app.js`;
- tokens visuais, responsividade e impressão: `assets/styles.css`;
- metadados, versão e gate de revisão: `module.manifest.json`.

Ao atualizar o conteúdo, preserve a separação entre descrição sindrômica, hipótese topográfica e etiologia; registre data, versão, fontes e responsável pela revisão.
