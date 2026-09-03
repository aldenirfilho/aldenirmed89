(() => {
  'use strict';

  const byId = (id) => document.getElementById(id);
  const num = (id) => {
    const element = byId(id);
    if (!element) return null;
    const value = Number.parseFloat(element.value);
    return Number.isFinite(value) ? value : null;
  };
  const format = (value, digits = 2) => new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(value);
  const render = (id, html, className = '') => {
    const target = byId(id);
    if (!target) return;
    target.className = `result ${className}`.trim();
    target.innerHTML = html;
  };
  const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

  function calculateMaddrey() {
    const ptPatient = num('mdf-pt-patient');
    const ptControl = num('mdf-pt-control');
    const bilirubin = num('mdf-bili');
    if ([ptPatient, ptControl, bilirubin].some((value) => value === null || value < 0)) {
      render('maddrey-result', 'Informe valores válidos em todos os campos.');
      return;
    }
    if (ptPatient < ptControl) {
      render('maddrey-result', 'Revise os dados: o TP do paciente está menor que o controle.');
      return;
    }
    const score = 4.6 * (ptPatient - ptControl) + bilirubin;
    const severe = score >= 32;
    render(
      'maddrey-result',
      `<b>mDF = ${format(score, 1)}</b><br>${severe
        ? 'Faixa grave (≥32). Avalie MELD, diagnóstico e contraindicações antes de considerar corticoide.'
        : 'Abaixo do limiar histórico de 32. O escore isolado não indica corticoide.'}`,
      severe ? 'is-severe' : 'is-ok'
    );
  }

  function calculateMeld() {
    const bilirubinInput = num('meld-bili');
    const inrInput = num('meld-inr');
    const creatinineInput = num('meld-creat');
    const sodiumInput = num('meld-na');
    const dialysis = Boolean(byId('meld-dialysis')?.checked);

    if ([bilirubinInput, inrInput, creatinineInput].some((value) => value === null || value <= 0)) {
      render('meld-result', 'Informe bilirrubina, INR e creatinina com valores maiores que zero.');
      return;
    }
    if (sodiumInput !== null && (sodiumInput < 100 || sodiumInput > 180)) {
      render('meld-result', 'Revise o sódio informado.');
      return;
    }

    const bilirubin = Math.max(1, bilirubinInput);
    const inr = Math.max(1, inrInput);
    const creatinine = dialysis ? 4 : clamp(Math.max(1, creatinineInput), 1, 4);
    const rawMeld = 3.78 * Math.log(bilirubin)
      + 11.2 * Math.log(inr)
      + 9.57 * Math.log(creatinine)
      + 6.43;
    const meld = Math.round(clamp(rawMeld, 6, 40));
    const severe = meld > 20;

    let sodiumLine = '';
    if (sodiumInput !== null) {
      const sodium = clamp(sodiumInput, 125, 137);
      const meldNaRaw = meld + 1.32 * (137 - sodium) - 0.033 * meld * (137 - sodium);
      const meldNa = Math.round(clamp(meldNaRaw, 6, 40));
      sodiumLine = `<br><b>MELD-Na = ${meldNa}</b> <span class="result-note">(Na limitado a 125–137 mEq/L)</span>`;
    }

    render(
      'meld-result',
      `<b>MELD clássico = ${meld}</b>${sodiumLine}<br>${severe
        ? 'MELD >20: HAA grave segundo a diretriz ACG. Integre com diagnóstico, disfunções orgânicas e contraindicações.'
        : 'MELD ≤20: abaixo do limiar contemporâneo de HAA grave, sem excluir risco clínico relevante.'}<br><span class="result-note">Para alocação de transplante, confirme o modelo vigente no sistema local; muitos centros utilizam MELD 3.0.</span>`,
      severe ? 'is-severe' : 'is-ok'
    );
  }

  function calculateAbic() {
    const age = num('abic-age');
    const bilirubin = num('abic-bili');
    const creatinine = num('abic-creat');
    const inr = num('abic-inr');
    if ([age, bilirubin, creatinine, inr].some((value) => value === null || value < 0)) {
      render('abic-result', 'Informe valores válidos em todos os campos.');
      return;
    }
    const score = age * 0.1 + bilirubin * 0.08 + creatinine * 0.3 + inr * 0.8;
    let category = '';
    let className = '';
    if (score < 6.71) {
      category = 'baixo risco na estratificação original';
      className = 'is-ok';
    } else if (score <= 9) {
      category = 'risco intermediário na estratificação original';
    } else {
      category = 'alto risco na estratificação original';
      className = 'is-severe';
    }
    render('abic-result', `<b>ABIC = ${format(score, 2)}</b><br>${category}. Não use isoladamente para indicar prednisolona.`, className);
  }

  function calculateGahs() {
    const age = num('gahs-age');
    const wbc = num('gahs-wbc');
    const urea = num('gahs-urea');
    const inr = num('gahs-inr');
    const bilirubinMgDl = num('gahs-bili');
    if ([age, wbc, urea, inr, bilirubinMgDl].some((value) => value === null || value < 0)) {
      render('gahs-result', 'Informe valores válidos nos cinco campos.');
      return;
    }

    const bilirubinUmol = bilirubinMgDl * 17.1;
    const points = {
      age: age < 50 ? 1 : 2,
      wbc: wbc < 15 ? 1 : 2,
      urea: urea < 5 ? 1 : 2,
      inr: inr < 1.5 ? 1 : (inr <= 2 ? 2 : 3),
      bilirubin: bilirubinUmol < 125 ? 1 : (bilirubinUmol <= 250 ? 2 : 3)
    };
    const score = Object.values(points).reduce((sum, value) => sum + value, 0);
    const highRisk = score >= 9;
    render(
      'gahs-result',
      `<b>GAHS = ${score}/12</b><br>${highRisk
        ? 'GAHS ≥9: maior risco e pior prognóstico. Use como complemento, não como autorização automática para corticoide.'
        : 'GAHS <9: faixa de melhor prognóstico relativo no modelo original.'}<br><span class="result-note">Pontos: idade ${points.age} · leucócitos ${points.wbc} · ureia ${points.urea} · INR ${points.inr} · bilirrubina ${points.bilirubin}.</span>`,
      highRisk ? 'is-severe' : 'is-ok'
    );
  }

  function calculateLille() {
    const age = num('lille-age');
    const albuminGdl = num('lille-albumin');
    const bilirubinDay0MgDl = num('lille-bili0');
    const bilirubinFollowMgDl = num('lille-bili7');
    const pt = num('lille-pt');
    const renal = byId('lille-renal')?.checked ? 1 : 0;

    if ([age, albuminGdl, bilirubinDay0MgDl, bilirubinFollowMgDl, pt].some((value) => value === null || value < 0)) {
      render('lille-result', 'Informe valores válidos em todos os campos.');
      return;
    }

    const albuminGl = albuminGdl * 10;
    const bilirubinDay0Umol = bilirubinDay0MgDl * 17.1;
    const bilirubinFollowUmol = bilirubinFollowMgDl * 17.1;
    const evolution = bilirubinDay0Umol - bilirubinFollowUmol;
    const linear = 3.19
      - 0.101 * age
      + 0.147 * albuminGl
      + 0.0165 * evolution
      - 0.206 * renal
      - 0.0065 * bilirubinDay0Umol
      - 0.0096 * pt;
    const lille = Math.exp(-linear) / (1 + Math.exp(-linear));
    const nonResponder = lille > 0.45;

    render(
      'lille-result',
      `<b>Lille = ${format(lille, 3)}</b><br>${nonResponder
        ? 'Não resposta (>0,45): interrompa o corticoide e reavalie a estratégia.'
        : 'Resposta (≤0,45): pode completar até 28 dias se o tratamento continuar seguro.'}${lille >= 0.56
        ? '<br><span class="result-note">Lille ≥0,56 identifica não resposta particularmente marcada no modelo de estratificação.</span>'
        : ''}`,
      nonResponder ? 'is-severe' : 'is-ok'
    );
  }

  const slides = [
    {
      group: 'diagnostico',
      title: 'Hepatite associada ao álcool',
      subtitle: 'Visão geral e critérios clínicos NIAAA',
      pearl: 'Formas graves podem cursar mortalidade de 1 mês de 20–50%. Estratifique cedo e procure falência orgânica.',
      cards: [
        ['Quando suspeitar?', ['Icterícia recente em pessoa com consumo pesado', 'Mal-estar, anorexia e dor em hipocôndrio direito', 'Ascite, febre ou encefalopatia podem coexistir']],
        ['HAA provável', ['Icterícia nas últimas 8 semanas', 'Bilirrubina >3 mg/dL; AST 50–400 U/L', 'AST/ALT >1,5 e ausência de outra causa provável']],
        ['Biópsia', ['Diagnóstico incerto ou padrão atípico', 'Etiologia concorrente ou história alcoólica duvidosa', 'Preferir via transjugular quando mudar a conduta']],
        ['Alertas imediatos', ['Infecção e sangramento digestivo', 'IRA ou síndrome hepatorrenal', 'Encefalopatia, desnutrição e abstinência']]
      ]
    },
    {
      group: 'mecanismo',
      title: 'Mecanismo da lesão hepática',
      subtitle: 'Do metabolismo do etanol à inflamação, colestase e fibrose',
      pearl: 'A HAA não é apenas toxicidade direta: metabolismo, eixo intestino–fígado, imunidade inata e reserva hepática interagem.',
      cards: [
        ['Metabolismo', ['Etanol → acetaldeído por ADH', 'CYP2E1 aumenta espécies reativas de oxigênio', 'Desequilíbrio NADH/NAD+ favorece esteatose']],
        ['Eixo intestino–fígado', ['Disbiose e maior permeabilidade intestinal', 'Endotoxinas alcançam a circulação portal', 'LPS/TLR4 ativa células de Kupffer']],
        ['Inflamação', ['TNF-α, IL-1β, IL-6 e IL-8', 'Recrutamento neutrofílico e balonização', 'Colestase e resposta ductular amplificam dano']],
        ['Progressão', ['Ativação de células estreladas e fibrose', 'Infecção, vasodilatação e falha de regeneração', 'Pode evoluir com ACLF e falência multiorgânica']]
      ]
    },
    {
      group: 'conduta',
      title: 'Primeiras 24 horas',
      subtitle: 'Diagnosticar, estratificar, oferecer suporte e prevenir complicações',
      pearl: 'Nutrição e busca ativa de infecção não são acessórios: são pilares paralelos à decisão sobre corticoide.',
      cards: [
        ['Confirmar e investigar', ['História alcoólica e tempo de abstinência', 'Bilirrubina, AST/ALT, INR, creatinina e hemograma', 'Ultrassom e investigação etiológica conforme cenário']],
        ['Medidas imediatas', ['Interromper álcool e tratar abstinência', 'Tiamina antes de grande carga de glicose se risco', 'Corrigir volume e eletrólitos de forma individualizada']],
        ['Suporte essencial', ['Meta aproximada de 35 kcal/kg/dia', 'Proteína 1,2–1,5 g/kg/dia; preferir via enteral', 'Tratar ascite, encefalopatia e demais complicações']],
        ['Rastrear complicações', ['Culturas e imagem conforme suspeita infecciosa', 'Sangramento digestivo e hipoglicemia', 'IRA/HRS e síndrome de realimentação']]
      ]
    },
    {
      group: 'scores',
      title: 'Maddrey: gravidade inicial',
      subtitle: 'Função discriminante modificada, mDF',
      pearl: 'Exemplo: TP 22 s, controle 12 s e bilirrubina 15 mg/dL → mDF 61.',
      cards: [
        ['Fórmula', ['mDF = 4,6 × (TP paciente − TP controle)', '+ bilirrubina total em mg/dL', 'Use o TP controle do laboratório']],
        ['Ponto de corte', ['mDF <32: abaixo do limiar histórico', 'mDF ≥32: HAA grave no modelo clássico', 'O valor não mede resposta ao tratamento']],
        ['Uso prático', ['Complementar com MELD e disfunções orgânicas', 'Antes do corticoide, confirmar diagnóstico', 'Excluir contraindicações não controladas']],
        ['Limitações', ['Varia com o TP controle', 'Não incorpora diretamente função renal', 'Não substitui julgamento clínico']]
      ]
    },
    {
      group: 'scores',
      title: 'MELD e MELD-Na',
      subtitle: 'Prognóstico global e estratificação de gravidade',
      pearl: 'MELD >20 define HAA grave na diretriz ACG. Para transplante, confirme o modelo vigente; MELD 3.0 é usado em muitos sistemas.',
      cards: [
        ['Variáveis', ['Bilirrubina, creatinina e INR', 'MELD-Na acrescenta sódio', 'Diálise modifica o tratamento da creatinina']],
        ['Leitura prática', ['Quanto maior o escore, maior o risco', 'MELD >20 sugere HAA grave', 'Recalcule diante de piora renal ou sintética']],
        ['Por que importa?', ['Bom desempenho prognóstico', 'Ajuda a priorizar monitorização e referência', 'Complementa mDF, ABIC e GAHS']],
        ['Aplicação', ['Use calculadora validada e unidades corretas', 'Integre infecção e falências orgânicas', 'Não use isoladamente para prescrever corticoide']]
      ]
    },
    {
      group: 'scores',
      title: 'ABIC',
      subtitle: 'Age, Bilirubin, INR, Creatinine: risco em 90 dias',
      pearl: 'Memória rápida: A-B-I-C = idade + bilirrubina + INR + creatinina.',
      cards: [
        ['Fórmula', ['0,1 × idade + 0,08 × bilirrubina', '+ 0,8 × INR + 0,3 × creatinina', 'Bilirrubina e creatinina em mg/dL']],
        ['Estratos', ['<6,71: baixo risco original', '6,71–9,0: risco intermediário', '>9,0: alto risco']],
        ['Interpretação', ['Quanto maior o ABIC, pior o prognóstico', 'Útil para comunicar risco de curto prazo', 'É prognóstico, não diagnóstico']],
        ['Uso prático', ['Complementa MELD e Maddrey', 'Considere infecção, renal e encefalopatia', 'Não é indicação isolada de prednisolona']]
      ]
    },
    {
      group: 'scores',
      title: 'GAHS',
      subtitle: 'Glasgow Alcoholic Hepatitis Score',
      pearl: 'GAHS ≥9 associa-se a pior prognóstico. É complementar e não autoriza corticoide de forma automática.',
      cards: [
        ['Variáveis', ['Idade e leucócitos', 'Ureia em mmol/L', 'INR ou razão de TP e bilirrubina']],
        ['Pontuação', ['Idade, leucócitos e ureia: 1–2 pontos', 'INR e bilirrubina: 1–3 pontos', 'Total possível: 5–12']],
        ['Ponto de corte', ['GAHS <9: melhor prognóstico relativo', 'GAHS ≥9: maior risco', 'Pode ser calculado no D1 ou D6–9']],
        ['Mensagem TEMI', ['Use junto de mDF e MELD', 'Exclua infecção, sangramento e choque', 'Gravidade não equivale a elegibilidade']]
      ]
    },
    {
      group: 'scores',
      title: 'Lille: resposta ao corticoide',
      subtitle: 'Score dinâmico após início da prednisolona',
      pearl: 'Corticoide sem Lille é uma decisão incompleta: programe a reavaliação antes da primeira dose.',
      cards: [
        ['Quando calcular?', ['Referência clássica: dia 7', 'Dia 4 pode antecipar em protocolos validados', 'Registre a bilirrubina basal']],
        ['Variáveis', ['Idade, albumina e TP', 'Bilirrubina D0 e D4/D7', 'Insuficiência renal no modelo']],
        ['Interpretação', ['Lille ≤0,45: respondedor', 'Lille >0,45: interromper corticoide', 'Lille ≥0,56: não resposta particularmente marcada']],
        ['Por que é crucial?', ['Evita exposição sem benefício', 'Reduz dano infeccioso em não respondedores', 'Direciona prognóstico e transplante']]
      ]
    },
    {
      group: 'conduta',
      title: 'Prednisolona na HAA grave',
      subtitle: 'Passo a passo com trava de segurança',
      pearl: 'Pentoxifilina não é recomendada rotineiramente. NAC IV pode ser considerada como adjuvante em pacientes selecionados.',
      cards: [
        ['Confirmar gravidade', ['MELD >20 e/ou mDF ≥32', 'Diagnóstico provável ou definido', 'Avaliar benefício esperado e objetivos de cuidado']],
        ['Time-out', ['Infecção/sepse ou sangramento não controlados', 'Choque, pancreatite ou injúria renal importante', 'Hiperglicemia grave, HBV ativo ou dúvida diagnóstica']],
        ['Tratar e monitorar', ['Prednisolona 40 mg VO/dia', 'Metilprednisolona 32 mg IV/dia se VO inviável', 'Vigiar infecção, glicemia, renal e sangramento']],
        ['Reavaliar', ['Calcular Lille no dia 7', '≤0,45: completar até 28 dias se seguro', '>0,45: suspender e discutir alternativas']]
      ]
    },
    {
      group: 'conduta',
      title: 'Fluxograma TEMI 360 X',
      subtitle: 'Do diagnóstico ao seguimento',
      pearl: 'Maddrey = gravidade inicial | MELD = prognóstico global | ABIC/GAHS = complemento | Lille = resposta ao corticoide.',
      cards: [
        ['1. Suspeitar e excluir', ['Icterícia recente + exposição alcoólica compatível', 'Confirmar padrão AST/ALT e bilirrubina', 'Excluir DILI, viral, isquemia e obstrução']],
        ['2. Estratificar', ['Calcular MELD e mDF', 'ABIC e GAHS refinam prognóstico', 'Procurar ACLF e falências orgânicas']],
        ['3. Tratar', ['Abstinência, tiamina e nutrição', 'Tratar infecção e complicações', 'Prednisolona somente se grave e elegível']],
        ['4. Reavaliar e seguir', ['Lille no D7 ou D4 conforme protocolo', 'Suspender em não respondedor', 'Tratar AUD e avaliar transplante em selecionados']]
      ]
    }
  ];

  function escapeXml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&apos;');
  }

  function wrapWords(value, maximumCharacters) {
    const words = String(value).split(/\s+/);
    const lines = [];
    let current = '';
    words.forEach((word) => {
      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length > maximumCharacters && current) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    });
    if (current) lines.push(current);
    return lines;
  }

  function svgTextLines(value, x, y, maximumCharacters, options = {}) {
    const lines = wrapWords(value, maximumCharacters);
    const size = options.size || 25;
    const lineHeight = options.lineHeight || Math.round(size * 1.23);
    const weight = options.weight || 600;
    const fill = options.fill || '#173042';
    const anchor = options.anchor || 'start';
    return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Aptos,Segoe UI,Arial,sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${lines.map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`).join('')}</text>`;
  }

  function makeSlideSvg(slide, index) {
    const colors = ['#f36c0a', '#087a7f', '#07324a', '#d9481c'];
    const cardPositions = [
      { x: 48, y: 250 }, { x: 610, y: 250 },
      { x: 48, y: 522 }, { x: 610, y: 522 }
    ];
    const cards = slide.cards.map((card, cardIndex) => {
      const position = cardPositions[cardIndex];
      const color = colors[(index + cardIndex) % colors.length];
      let body = '';
      let cursor = position.y + 100;
      card[1].forEach((bullet) => {
        const lines = wrapWords(bullet, 38).slice(0, 3);
        body += `<circle cx="${position.x + 28}" cy="${cursor - 7}" r="6" fill="${color}"/>`;
        body += `<text x="${position.x + 48}" y="${cursor}" font-family="Aptos,Segoe UI,Arial,sans-serif" font-size="21" font-weight="560" fill="#233947">${lines.map((line, lineIndex) => `<tspan x="${position.x + 48}" dy="${lineIndex === 0 ? 0 : 26}">${escapeXml(line)}</tspan>`).join('')}</text>`;
        cursor += Math.max(54, lines.length * 26 + 20);
      });
      return `<g>
        <rect x="${position.x}" y="${position.y}" width="520" height="242" rx="22" fill="#ffffff" stroke="#d9e0e4" stroke-width="2"/>
        <rect x="${position.x}" y="${position.y}" width="520" height="62" rx="22" fill="${color}"/>
        <rect x="${position.x}" y="${position.y + 40}" width="520" height="22" fill="${color}"/>
        <circle cx="${position.x + 35}" cy="${position.y + 31}" r="22" fill="#ffffff"/>
        <text x="${position.x + 35}" y="${position.y + 39}" text-anchor="middle" font-family="Aptos,Segoe UI,Arial,sans-serif" font-size="25" font-weight="900" fill="#112b3a">${cardIndex + 1}</text>
        ${svgTextLines(card[0], position.x + 72, position.y + 39, 32, { size: 23, weight: 850, fill: '#ffffff' })}
        ${body}
      </g>`;
    }).join('');

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" role="img" aria-labelledby="slide-title-${index} slide-desc-${index}">
      <title id="slide-title-${index}">${escapeXml(slide.title)}</title>
      <desc id="slide-desc-${index}">${escapeXml(slide.subtitle)}</desc>
      <rect width="1600" height="900" fill="#f7f9fb"/>
      <rect width="1600" height="88" fill="#07324a"/>
      <rect x="1180" width="420" height="88" fill="#f36c0a"/>
      <path d="M24 66 A34 34 0 0 1 92 66" fill="none" stroke="#ffffff" stroke-width="9"/>
      <line x1="58" y1="66" x2="80" y2="38" stroke="#f7941d" stroke-width="7" stroke-linecap="round"/>
      <text x="118" y="59" font-family="Aptos,Segoe UI,Arial,sans-serif" font-size="48" font-weight="950" font-style="italic" fill="#ffffff">TURBO TEMI <tspan fill="#f7941d">360 X</tspan></text>
      <text x="1390" y="53" text-anchor="middle" font-family="Aptos,Segoe UI,Arial,sans-serif" font-size="30" font-weight="900" fill="#ffffff">LARANJA MECÂNICA</text>
      ${svgTextLines(slide.title, 54, 154, 55, { size: 48, lineHeight: 52, weight: 950, fill: '#07324a' })}
      ${svgTextLines(slide.subtitle, 56, 215, 88, { size: 27, weight: 600, fill: '#5a6268' })}
      ${cards}
      <g>
        <rect x="1172" y="250" width="378" height="514" rx="24" fill="#eef6f8" stroke="#07324a" stroke-width="3"/>
        <rect x="1172" y="250" width="378" height="76" rx="24" fill="#07324a"/>
        <rect x="1172" y="302" width="378" height="24" fill="#07324a"/>
        <circle cx="1220" cy="288" r="25" fill="#f36c0a"/>
        <text x="1220" y="297" text-anchor="middle" font-family="Aptos,Segoe UI,Arial,sans-serif" font-size="31" font-weight="950" fill="#ffffff">◆</text>
        <text x="1262" y="299" font-family="Aptos,Segoe UI,Arial,sans-serif" font-size="28" font-weight="900" fill="#ffffff">PÉROLA TEMI</text>
        ${svgTextLines(slide.pearl, 1210, 382, 27, { size: 29, lineHeight: 39, weight: 720, fill: '#173042' })}
        <line x1="1210" y1="655" x2="1510" y2="655" stroke="#f36c0a" stroke-width="3" stroke-dasharray="10 8"/>
        <text x="1360" y="704" text-anchor="middle" font-family="Aptos,Segoe UI,Arial,sans-serif" font-size="23" font-weight="850" fill="#07324a">Revisão rápida · UTI · Clínica Médica</text>
      </g>
      <path d="M48 829 H1548" stroke="#f36c0a" stroke-width="3"/>
      <path d="M690 829 h65 l13 -24 l17 52 l17 -38 l14 10 h115" fill="none" stroke="#f36c0a" stroke-width="4" stroke-linejoin="round"/>
      <text x="54" y="874" font-family="Aptos,Segoe UI,Arial,sans-serif" font-size="21" font-weight="650" fill="#59636a">Conteúdo educacional · confirme fórmulas, unidades e protocolo institucional</text>
      <text x="1546" y="874" text-anchor="end" font-family="Aptos,Segoe UI,Arial,sans-serif" font-size="21" font-weight="900" fill="#07324a">ALDENIRMED89 · 2026</text>
    </svg>`;
  }

  function dataUriFromSvg(svg) {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  function slugify(value) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  function buildVisualAtlas() {
    const physiopathology = byId('fisiopatologia');
    if (!physiopathology || byId('atlas-visual')) return;

    const section = document.createElement('section');
    section.className = 'panel visual-atlas';
    section.id = 'atlas-visual';
    section.innerHTML = `
      <div class="section-heading">
        <span class="section-number">02A</span>
        <div>
          <p class="eyebrow">ATLAS VETORIAL · TURBO TEMI 360 X</p>
          <h2>10 mapas widescreen para revisão ativa</h2>
        </div>
      </div>
      <div class="visual-summary">
        <div>
          <b>Série completa em SVG 16:9</b>
          <p>Imagens vetoriais nítidas, produzidas a partir dos dois blocos clínicos e revisadas para reduzir erros de texto. Abra em tela cheia ou baixe cada mapa.</p>
        </div>
        <div class="visual-safety"><b>Texto canônico prevalece</b><span>Use as imagens como síntese; confirme detalhes no conteúdo e nas referências abaixo.</span></div>
      </div>
      <div class="visual-filters" role="group" aria-label="Filtrar mapas">
        <button type="button" data-visual-filter="all" aria-pressed="true">Todos</button>
        <button type="button" data-visual-filter="diagnostico" aria-pressed="false">Diagnóstico</button>
        <button type="button" data-visual-filter="mecanismo" aria-pressed="false">Mecanismo</button>
        <button type="button" data-visual-filter="scores" aria-pressed="false">Escores</button>
        <button type="button" data-visual-filter="conduta" aria-pressed="false">Conduta</button>
      </div>
      <div class="visual-grid" id="visual-grid"></div>
      <p class="visual-note"><b>Nota:</b> as figuras são materiais educacionais autorais em SVG. Não contêm imagens, exames ou dados de pacientes.</p>`;
    physiopathology.insertAdjacentElement('afterend', section);

    const grid = byId('visual-grid');
    slides.forEach((slide, index) => {
      const svg = makeSlideSvg(slide, index + 1);
      const uri = dataUriFromSvg(svg);
      const fileName = `${String(index + 1).padStart(2, '0')}-${slugify(slide.title)}-turbo-temi-360x.svg`;
      const card = document.createElement('figure');
      card.className = 'visual-card';
      card.dataset.group = slide.group;
      card.innerHTML = `
        <a class="visual-open" href="${uri}" target="_blank" rel="noopener" aria-label="Abrir ${escapeXml(slide.title)} em tela cheia">${svg}</a>
        <figcaption>
          <span class="visual-kicker">MAPA ${String(index + 1).padStart(2, '0')} · ${slide.group.toUpperCase()}</span>
          <h3>${escapeXml(slide.title)}</h3>
          <p>${escapeXml(slide.subtitle)}</p>
          <a class="visual-download" href="${uri}" download="${fileName}">Baixar SVG</a>
        </figcaption>`;
      grid.appendChild(card);
    });

    section.querySelectorAll('[data-visual-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        const filter = button.dataset.visualFilter;
        section.querySelectorAll('[data-visual-filter]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
        section.querySelectorAll('.visual-card').forEach((card) => {
          card.hidden = filter !== 'all' && card.dataset.group !== filter;
        });
      });
    });

    const nav = document.querySelector('.section-nav');
    const scoresLink = nav?.querySelector('a[href="#escores"]');
    if (nav && scoresLink && !nav.querySelector('a[href="#atlas-visual"]')) {
      const link = document.createElement('a');
      link.href = '#atlas-visual';
      link.textContent = 'Atlas 360 X';
      nav.insertBefore(link, scoresLink);
    }
  }

  function buildAdditionalScores() {
    const grid = document.querySelector('#escores .calculator-grid');
    const abic = byId('abic-card');
    if (!grid || !abic || byId('meld-card')) return;

    const meld = document.createElement('article');
    meld.className = 'calculator';
    meld.id = 'meld-card';
    meld.innerHTML = `
      <div class="calculator-title"><h3>MELD e MELD-Na</h3><span class="badge badge--critical">Gravidade contemporânea</span></div>
      <p class="formula">MELD = 3,78×ln(bilirrubina) + 11,2×ln(INR) + 9,57×ln(creatinina) + 6,43</p>
      <div class="form-grid form-grid--two">
        <label>Bilirrubina (mg/dL)<input id="meld-bili" type="number" min="0.1" step="0.1" inputmode="decimal"></label>
        <label>INR<input id="meld-inr" type="number" min="0.1" step="0.01" inputmode="decimal"></label>
        <label>Creatinina (mg/dL)<input id="meld-creat" type="number" min="0.1" step="0.01" inputmode="decimal"></label>
        <label>Sódio opcional (mEq/L)<input id="meld-na" type="number" min="100" max="180" step="1" inputmode="numeric"></label>
        <label class="checkbox-label"><input id="meld-dialysis" type="checkbox"> Diálise ≥2 vezes/7 dias ou TRS contínua</label>
      </div>
      <button type="button" data-calc="meld">Calcular MELD</button>
      <div class="result" id="meld-result" aria-live="polite">Preencha bilirrubina, INR e creatinina; sódio é opcional.</div>
      <p class="fine-print"><b>Interpretação para HAA:</b> MELD &gt;20 indica doença grave na diretriz ACG. Esta calculadora apresenta MELD clássico e MELD-Na educacional; confirme o modelo vigente para transplante.</p>`;

    const gahs = document.createElement('article');
    gahs.className = 'calculator';
    gahs.id = 'gahs-card';
    gahs.innerHTML = `
      <div class="calculator-title"><h3>GAHS</h3><span class="badge">Glasgow</span></div>
      <p class="formula">Idade + leucócitos + ureia + INR/razão de TP + bilirrubina = 5–12 pontos</p>
      <div class="form-grid form-grid--two">
        <label>Idade (anos)<input id="gahs-age" type="number" min="18" max="120" step="1"></label>
        <label>Leucócitos (10⁹/L)<input id="gahs-wbc" type="number" min="0" step="0.1" inputmode="decimal"></label>
        <label>Ureia (mmol/L)<input id="gahs-urea" type="number" min="0" step="0.1" inputmode="decimal"></label>
        <label>INR ou razão de TP<input id="gahs-inr" type="number" min="0" step="0.01" inputmode="decimal"></label>
        <label>Bilirrubina (mg/dL)<input id="gahs-bili" type="number" min="0" step="0.1" inputmode="decimal"></label>
      </div>
      <button type="button" data-calc="gahs">Calcular GAHS</button>
      <div class="result" id="gahs-result" aria-live="polite">Preencha os cinco campos.</div>
      <p class="fine-print"><b>Ponto-chave:</b> GAHS ≥9 associa-se a pior prognóstico. O modelo original utiliza ureia em mmol/L e bilirrubina em µmol/L; a página converte bilirrubina de mg/dL.</p>`;

    grid.insertBefore(meld, abic);
    grid.insertBefore(gahs, abic);

    const comparison = document.querySelector('.score-comparison');
    if (comparison && !byId('score-hierarchy')) {
      const hierarchy = document.createElement('div');
      hierarchy.className = 'score-hierarchy';
      hierarchy.id = 'score-hierarchy';
      hierarchy.innerHTML = `
        <article><b>MELD</b><span>Principal marcador contemporâneo de gravidade; &gt;20 = HAA grave.</span></article>
        <article><b>mDF</b><span>Critério histórico inicial; ≥32 indica gravidade.</span></article>
        <article><b>ABIC / GAHS</b><span>Refinam o prognóstico, sem indicar corticoide isoladamente.</span></article>
        <article><b>Lille</b><span>Resposta após prednisolona; &gt;0,45 = interromper.</span></article>`;
      comparison.insertAdjacentElement('beforebegin', hierarchy);
    }
  }

  function updateVersionMarkers() {
    const status = document.querySelector('.status-pill');
    if (status) status.textContent = 'Versão 2.0 · Atlas Turbo TEMI 360 X · 03/09/2026';
    const heroTag = document.querySelector('#flash .tag--dark');
    if (heroTag) heroTag.textContent = 'CINCO SCORES + 10 MAPAS 16:9';
  }

  function bindCalculators() {
    document.querySelectorAll('[data-calc]').forEach((button) => {
      button.addEventListener('click', () => {
        const calculator = button.dataset.calc;
        if (calculator === 'maddrey') calculateMaddrey();
        if (calculator === 'meld') calculateMeld();
        if (calculator === 'abic') calculateAbic();
        if (calculator === 'gahs') calculateGahs();
        if (calculator === 'lille') calculateLille();
      });
    });
  }

  function initialize() {
    buildVisualAtlas();
    buildAdditionalScores();
    updateVersionMarkers();
    bindCalculators();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
