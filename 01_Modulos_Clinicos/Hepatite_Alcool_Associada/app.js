(() => {
  'use strict';

  const byId = (id) => document.getElementById(id);
  const num = (id) => {
    const value = Number.parseFloat(byId(id).value);
    return Number.isFinite(value) ? value : null;
  };
  const format = (value, digits = 2) => new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(value);
  const render = (id, html, className = '') => {
    const target = byId(id);
    target.className = `result ${className}`.trim();
    target.innerHTML = html;
  };

  function calculateMaddrey() {
    const ptPatient = num('mdf-pt-patient');
    const ptControl = num('mdf-pt-control');
    const bilirubin = num('mdf-bili');
    if ([ptPatient, ptControl, bilirubin].some((v) => v === null || v < 0)) {
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
        ? 'Faixa grave (≥32). Avaliar MELD, diagnóstico e contraindicações antes de corticoide.'
        : 'Abaixo do limiar histórico de 32. Corticoide não é indicado apenas por este escore.'}`,
      severe ? 'is-severe' : 'is-ok'
    );
  }

  function calculateAbic() {
    const age = num('abic-age');
    const bilirubin = num('abic-bili');
    const creatinine = num('abic-creat');
    const inr = num('abic-inr');
    if ([age, bilirubin, creatinine, inr].some((v) => v === null || v < 0)) {
      render('abic-result', 'Informe valores válidos em todos os campos.');
      return;
    }
    const score = age * 0.1 + bilirubin * 0.08 + creatinine * 0.3 + inr * 0.8;
    let category = '';
    let cls = '';
    if (score < 6.71) {
      category = 'baixo risco na estratificação original';
      cls = 'is-ok';
    } else if (score <= 9) {
      category = 'risco intermediário na estratificação original';
    } else {
      category = 'alto risco na estratificação original';
      cls = 'is-severe';
    }
    render('abic-result', `<b>ABIC = ${format(score, 2)}</b><br>${category}. Não usar isoladamente para indicar corticoide.`, cls);
  }

  function calculateLille() {
    const age = num('lille-age');
    const albuminGdl = num('lille-albumin');
    const bili0Mgdl = num('lille-bili0');
    const biliFollowMgdl = num('lille-bili7');
    const pt = num('lille-pt');
    const renal = byId('lille-renal').checked ? 1 : 0;

    if ([age, albuminGdl, bili0Mgdl, biliFollowMgdl, pt].some((v) => v === null || v < 0)) {
      render('lille-result', 'Informe valores válidos em todos os campos.');
      return;
    }

    // Formula original: albumina em g/L; bilirrubina em µmol/L;
    // evolução = bilirrubina D0 - bilirrubina D7 (ou D4 quando o protocolo adota D4).
    const albuminGl = albuminGdl * 10;
    const bili0Umol = bili0Mgdl * 17.1;
    const biliFollowUmol = biliFollowMgdl * 17.1;
    const evolution = bili0Umol - biliFollowUmol;

    const linear = 3.19
      - 0.101 * age
      + 0.147 * albuminGl
      + 0.0165 * evolution
      - 0.206 * renal
      - 0.0065 * bili0Umol
      - 0.0096 * pt;

    const lille = Math.exp(-linear) / (1 + Math.exp(-linear));
    const nonResponder = lille > 0.45;

    render(
      'lille-result',
      `<b>Lille = ${format(lille, 3)}</b><br>${nonResponder
        ? 'Não resposta (>0,45): interromper corticoide e reavaliar estratégia.'
        : 'Resposta (≤0,45): pode completar até 28 dias se o tratamento continuar seguro.'}`,
      nonResponder ? 'is-severe' : 'is-ok'
    );
  }

  document.querySelectorAll('[data-calc]').forEach((button) => {
    button.addEventListener('click', () => {
      const calculator = button.dataset.calc;
      if (calculator === 'maddrey') calculateMaddrey();
      if (calculator === 'abic') calculateAbic();
      if (calculator === 'lille') calculateLille();
    });
  });
})();
