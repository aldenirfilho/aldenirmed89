import { useState, useCallback } from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ANTIGRAVITY · SIMULADOR CAD v1.0
// Projeto: UpDown / Enciclomedia Médica
// Slug: cad-simulador-protocolo
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const COLORS = {
  bg: "#0A0F1E",
  panel: "#0F172A",
  card: "#1E293B",
  cardHover: "#263248",
  border: "#1E3A5F",
  accent: "#00D4FF",
  accent2: "#7C3AED",
  danger: "#EF4444",
  warning: "#F59E0B",
  success: "#10B981",
  info: "#3B82F6",
  text: "#E2E8F0",
  textMuted: "#94A3B8",
  textDim: "#475569",
};

const Badge = ({ color, children }) => (
  <span style={{
    background: `${color}22`,
    color: color,
    border: `1px solid ${color}55`,
    borderRadius: "6px",
    padding: "2px 10px",
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  }}>{children}</span>
);

const SectionTitle = ({ icon, children, color = COLORS.accent }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
    <span style={{ fontSize: "1.4rem" }}>{icon}</span>
    <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color, letterSpacing: "0.04em", textTransform: "uppercase" }}>
      {children}
    </h2>
  </div>
);

const InputField = ({ label, value, onChange, unit, min, max, step = "any", hint, dangerBelow, dangerAbove }) => {
  const numVal = parseFloat(value);
  const isDangerLow = dangerBelow !== undefined && !isNaN(numVal) && numVal < dangerBelow;
  const isDangerHigh = dangerAbove !== undefined && !isNaN(numVal) && numVal > dangerAbove;
  const isWarning = isDangerLow || isDangerHigh;

  return (
    <div style={{ marginBottom: "14px" }}>
      <label style={{ display: "block", color: COLORS.textMuted, fontSize: "0.8rem", fontWeight: 600, marginBottom: "5px", letterSpacing: "0.03em" }}>
        {label}
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          min={min}
          max={max}
          step={step}
          style={{
            background: COLORS.bg,
            border: `2px solid ${isWarning ? COLORS.danger : COLORS.border}`,
            borderRadius: "8px",
            color: isWarning ? COLORS.danger : COLORS.text,
            padding: "8px 12px",
            fontSize: "1.1rem",
            fontWeight: 700,
            width: "120px",
            outline: "none",
            transition: "border-color 0.2s",
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          }}
        />
        {unit && <span style={{ color: COLORS.textMuted, fontSize: "0.85rem", fontWeight: 600 }}>{unit}</span>}
      </div>
      {hint && <p style={{ margin: "4px 0 0", fontSize: "0.72rem", color: COLORS.textDim }}>{hint}</p>}
      {isWarning && (
        <p style={{ margin: "4px 0 0", fontSize: "0.72rem", color: COLORS.danger, fontWeight: 700 }}>
          ⚠️ {isDangerLow ? `Abaixo do limite seguro (${dangerBelow})` : `Acima do limite seguro (${dangerAbove})`}
        </p>
      )}
    </div>
  );
};

const ResultCard = ({ title, value, unit, color, detail, icon, urgent }) => (
  <div style={{
    background: urgent ? `${COLORS.danger}15` : COLORS.card,
    border: `2px solid ${urgent ? COLORS.danger : color || COLORS.border}`,
    borderRadius: "12px",
    padding: "16px 20px",
    marginBottom: "12px",
    position: "relative",
    overflow: "hidden",
  }}>
    {urgent && (
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: "3px",
        background: `linear-gradient(90deg, ${COLORS.danger}, ${COLORS.warning})`,
      }} />
    )}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <p style={{ margin: 0, fontSize: "0.75rem", color: COLORS.textMuted, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          {icon} {title}
        </p>
        <p style={{ margin: "4px 0 0", fontSize: "1.6rem", fontWeight: 900, color: urgent ? COLORS.danger : (color || COLORS.accent), fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.1 }}>
          {value} <span style={{ fontSize: "0.9rem", fontWeight: 500, color: COLORS.textMuted }}>{unit}</span>
        </p>
      </div>
    </div>
    {detail && (
      <p style={{ margin: "10px 0 0", fontSize: "0.8rem", color: COLORS.textMuted, lineHeight: 1.5 }}>
        {detail}
      </p>
    )}
  </div>
);

const AlertBox = ({ type, children }) => {
  const styles = {
    danger: { bg: `${COLORS.danger}15`, border: COLORS.danger, icon: "🔴" },
    warning: { bg: `${COLORS.warning}15`, border: COLORS.warning, icon: "⚠️" },
    success: { bg: `${COLORS.success}15`, border: COLORS.success, icon: "✅" },
    info: { bg: `${COLORS.info}15`, border: COLORS.info, icon: "ℹ️" },
  };
  const s = styles[type] || styles.info;

  return (
    <div style={{
      background: s.bg,
      border: `1px solid ${s.border}`,
      borderRadius: "10px",
      padding: "12px 16px",
      marginBottom: "10px",
      fontSize: "0.85rem",
      color: COLORS.text,
      lineHeight: 1.6,
    }}>
      {s.icon} {children}
    </div>
  );
};

const Tab = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: active ? COLORS.accent : "transparent",
      color: active ? COLORS.bg : COLORS.textMuted,
      border: `2px solid ${active ? COLORS.accent : COLORS.border}`,
      borderRadius: "8px",
      padding: "8px 18px",
      fontSize: "0.78rem",
      fontWeight: 700,
      cursor: "pointer",
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      transition: "all 0.2s",
      whiteSpace: "nowrap",
    }}
  >
    {label}
  </button>
);

export default function CADSimulator() {
  const [tab, setTab] = useState("ag");

  // AG Calculator
  const [na, setNa] = useState("");
  const [cl, setCl] = useState("");
  const [hco3, setHco3] = useState("");
  const [albumin, setAlbumin] = useState("");
  const [glicemia, setGlicemia] = useState("");
  const [ph, setPh] = useState("");

  // Insulin Calculator
  const [weight, setWeight] = useState("");
  const [currentGlicemia, setCurrentGlicemia] = useState("");
  const [lastGlicemia, setLastGlicemia] = useState("");

  // K+ Decision
  const [kValue, setKValue] = useState("");

  // Transition EV→SC
  const [insulinEV, setInsulinEV] = useState("");
  const [hoursEV, setHoursEV] = useState("");
  const [pHTransition, setPHTransition] = useState("");
  const [hco3Transition, setHco3Transition] = useState("");
  const [agTransition, setAgTransition] = useState("");

  // ─── Calculations ───────────────────────────────

  const calcAG = useCallback(() => {
    const n = parseFloat(na);
    const c = parseFloat(cl);
    const h = parseFloat(hco3);
    if (isNaN(n) || isNaN(c) || isNaN(h)) return null;
    const ag = n - (c + h);
    const alb = parseFloat(albumin);
    const agCorr = !isNaN(alb) ? ag + 2.5 * (4.0 - alb) : null;
    return { ag, agCorr };
  }, [na, cl, hco3, albumin]);

  const calcNaCorr = useCallback(() => {
    const n = parseFloat(na);
    const g = parseFloat(glicemia);
    if (isNaN(n) || isNaN(g)) return null;
    return n + 1.6 * ((g - 100) / 100);
  }, [na, glicemia]);

  const getCADSeverity = useCallback(() => {
    const p = parseFloat(ph);
    const h = parseFloat(hco3);
    if (isNaN(p) && isNaN(h)) return null;
    if (p < 7.0 || h < 10) return { level: "GRAVE", color: COLORS.danger, uti: true };
    if (p < 7.25 || h < 15) return { level: "MODERADA", color: COLORS.warning, uti: false };
    return { level: "LEVE", color: COLORS.success, uti: false };
  }, [ph, hco3]);

  const calcInsulinDose = useCallback(() => {
    const w = parseFloat(weight);
    if (isNaN(w)) return null;
    const bolus = (w * 0.1).toFixed(1);
    const infusion = (w * 0.1).toFixed(1);
    const low = (w * 0.02).toFixed(1);
    return { bolus, infusion, low };
  }, [weight]);

  const getGlicemiaFall = useCallback(() => {
    const curr = parseFloat(currentGlicemia);
    const last = parseFloat(lastGlicemia);
    if (isNaN(curr) || isNaN(last)) return null;
    const fall = last - curr;
    if (fall >= 50 && fall <= 75) return { ok: true, fall };
    if (fall > 75) return { ok: false, too_fast: true, fall };
    return { ok: false, too_slow: true, fall };
  }, [currentGlicemia, lastGlicemia]);

  const getKDecision = useCallback(() => {
    const k = parseFloat(kValue);
    if (isNaN(k)) return null;
    if (k < 3.3) return {
      level: "CRÍTICO", color: COLORS.danger,
      action: "⛔ NÃO iniciar insulina! Repor 20–40 mEq/h de KCl até K⁺ > 3,5 mEq/L",
      insulinOk: false,
      reposition: "KCl 20–40 mEq/h EV",
      urgent: true,
    };
    if (k <= 5.0) return {
      level: "SEGURO", color: COLORS.success,
      action: "✅ Iniciar insulina EV. Repor KCl 20–30 mEq/L de hidratação",
      insulinOk: true,
      reposition: "KCl 20–30 mEq/L em cada litro",
      urgent: false,
    };
    return {
      level: "ELEVADO", color: COLORS.warning,
      action: "⚠️ Iniciar insulina EV. NÃO repor KCl. Monitorar ECG e K⁺ a cada hora.",
      insulinOk: true,
      reposition: "Sem reposição. ECG contínuo.",
      urgent: false,
    };
  }, [kValue]);

  const getTransitionDecision = useCallback(() => {
    const ins = parseFloat(insulinEV);
    const hrs = parseFloat(hoursEV);
    const p = parseFloat(pHTransition);
    const h = parseFloat(hco3Transition);
    const ag = parseFloat(agTransition);

    const criteria = {
      ph: !isNaN(p) ? p > 7.3 : null,
      hco3: !isNaN(h) ? h > 18 : null,
      ag: !isNaN(ag) ? ag < 12 : null,
    };

    const allMet = criteria.ph === true && criteria.hco3 === true && criteria.ag === true;
    const anyFailed = criteria.ph === false || criteria.hco3 === false || criteria.ag === false;

    let ddt = null, basal = null;
    if (!isNaN(ins) && !isNaN(hrs) && hrs > 0) {
      ddt = ((ins / hrs) * 24).toFixed(0);
      basal = (ddt * 0.5).toFixed(0);
    }

    return { criteria, allMet, anyFailed, ddt, basal };
  }, [insulinEV, hoursEV, pHTransition, hco3Transition, agTransition]);

  // ─── Render ─────────────────────────────────────

  const agResult = calcAG();
  const naCorr = calcNaCorr();
  const severity = getCADSeverity();
  const insulinDose = calcInsulinDose();
  const glicFall = getGlicemiaFall();
  const kDecision = getKDecision();
  const transition = getTransitionDecision();

  const tabs = [
    { id: "ag", label: "🔬 Ânion Gap" },
    { id: "k", label: "⚡ Potássio" },
    { id: "insulin", label: "💉 Insulina" },
    { id: "transition", label: "🔄 Transição SC" },
    { id: "severity", label: "📊 Gravidade" },
  ];

  return (
    <div style={{
      background: COLORS.bg,
      minHeight: "100vh",
      fontFamily: "'Segoe UI', 'SF Pro Display', system-ui, sans-serif",
      color: COLORS.text,
      padding: "0",
    }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${COLORS.panel} 0%, #0D1B35 100%)`,
        borderBottom: `1px solid ${COLORS.border}`,
        padding: "20px 24px 16px",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
          <div style={{
            background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accent2})`,
            borderRadius: "10px",
            padding: "6px 10px",
            fontSize: "1.2rem",
            lineHeight: 1,
          }}>🧪</div>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900, color: COLORS.text, letterSpacing: "-0.01em" }}>
              Simulador CAD
            </h1>
            <p style={{ margin: 0, fontSize: "0.7rem", color: COLORS.textMuted }}>
              Projeto Antigravity · Enciclomedia Médica
            </p>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <Badge color={COLORS.accent}>UTI</Badge>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px", marginTop: "12px" }}>
          {tabs.map(t => (
            <Tab key={t.id} label={t.label} active={tab === t.id} onClick={() => setTab(t.id)} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "24px", maxWidth: "720px", margin: "0 auto" }}>

        {/* ── ÂNION GAP ── */}
        {tab === "ag" && (
          <div>
            <SectionTitle icon="🔬" children="Calculadora de Ânion Gap" color={COLORS.accent} />
            <AlertBox type="info">
              AG = Na⁺ − (Cl⁻ + HCO₃⁻) · Normal: 8–12 mEq/L · Corrigido pela albumina em pacientes críticos
            </AlertBox>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <InputField label="Sódio (Na⁺)" value={na} onChange={setNa} unit="mEq/L" min={100} max={170} />
                <InputField label="Cloreto (Cl⁻)" value={cl} onChange={setCl} unit="mEq/L" min={80} max={130} />
                <InputField label="Bicarbonato (HCO₃⁻)" value={hco3} onChange={setHco3} unit="mEq/L" min={1} max={40} dangerBelow={10} />
              </div>
              <div>
                <InputField label="Albumina sérica" value={albumin} onChange={setAlbumin} unit="g/dL" min={1} max={6} hint="Para correção do AG" />
                <InputField label="Glicemia" value={glicemia} onChange={setGlicemia} unit="mg/dL" min={50} max={2000} hint="Para correção do Na⁺" />
                <InputField label="pH arterial" value={ph} onChange={setPh} unit="" min={6.5} max={7.8} step="0.01" dangerBelow={7.0} />
              </div>
            </div>

            {agResult && (
              <div style={{ marginTop: "20px" }}>
                <ResultCard
                  icon="🔬"
                  title="Ânion Gap Calculado"
                  value={agResult.ag.toFixed(1)}
                  unit="mEq/L"
                  color={agResult.ag > 12 ? COLORS.danger : COLORS.success}
                  urgent={agResult.ag > 12}
                  detail={agResult.ag > 12
                    ? "⬆️ AG ELEVADO — compatível com acidose de alto ânion gap (CAD, acidose lática, uremia, intoxicações)"
                    : "✅ AG normal — acidose hiperclorêmica ou ausência de acidose de alto AG"}
                />
                {agResult.agCorr !== null && (
                  <ResultCard
                    icon="📐"
                    title="AG Corrigido pela Albumina"
                    value={agResult.agCorr.toFixed(1)}
                    unit="mEq/L"
                    color={agResult.agCorr > 12 ? COLORS.warning : COLORS.success}
                    detail={`Albumina = ${albumin} g/dL. AG real estimado após correção. Diferença de ${(agResult.agCorr - agResult.ag).toFixed(1)} mEq/L.`}
                  />
                )}
              </div>
            )}

            {naCorr !== null && (
              <ResultCard
                icon="🧂"
                title="Sódio Corrigido pela Glicemia"
                value={naCorr.toFixed(1)}
                unit="mEq/L"
                color={COLORS.info}
                detail={`Na⁺ corrigido = ${na} + 1,6 × [(${glicemia} − 100) / 100]. ${naCorr < 135 ? "Hiponatremia verdadeira presente." : naCorr > 145 ? "Hipernatremia verdadeira — usar SF 0,45%." : "Sódio corrigido normal — SF 0,9% seguro."}`}
              />
            )}

            {!agResult && (
              <AlertBox type="info">
                Preencha Na⁺, Cl⁻ e HCO₃⁻ para calcular o Ânion Gap.
              </AlertBox>
            )}
          </div>
        )}

        {/* ── POTÁSSIO ── */}
        {tab === "k" && (
          <div>
            <SectionTitle icon="⚡" children="Decisão de Potássio" color={COLORS.warning} />
            <AlertBox type="danger">
              🔴 <strong>REGRA DE OURO:</strong> K⁺ &lt; 3,3 mEq/L = NÃO iniciar insulina. Risco de hipocalemia grave e arritmia fatal.
            </AlertBox>

            <InputField
              label="Potássio sérico (K⁺)"
              value={kValue}
              onChange={setKValue}
              unit="mEq/L"
              min={1}
              max={9}
              step="0.1"
              dangerBelow={3.3}
              dangerAbove={5.5}
            />

            {kDecision && (
              <div style={{ marginTop: "16px" }}>
                <div style={{
                  background: `${kDecision.color}18`,
                  border: `2px solid ${kDecision.color}`,
                  borderRadius: "14px",
                  padding: "20px",
                  textAlign: "center",
                  marginBottom: "16px",
                }}>
                  <p style={{ margin: 0, fontSize: "0.7rem", color: COLORS.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700 }}>
                    Status do K⁺
                  </p>
                  <p style={{ margin: "6px 0", fontSize: "2.4rem", fontWeight: 900, color: kDecision.color, fontFamily: "monospace" }}>
                    {kValue} mEq/L
                  </p>
                  <Badge color={kDecision.color}>{kDecision.level}</Badge>
                </div>

                <ResultCard
                  icon={kDecision.insulinOk ? "✅" : "⛔"}
                  title="Insulina EV"
                  value={kDecision.insulinOk ? "LIBERAR" : "AGUARDAR"}
                  color={kDecision.insulinOk ? COLORS.success : COLORS.danger}
                  urgent={!kDecision.insulinOk}
                  detail={kDecision.action}
                />

                <ResultCard
                  icon="🧪"
                  title="Reposição de KCl"
                  value={kDecision.reposition}
                  color={COLORS.warning}
                  detail="Monitorar K⁺ e ECG a cada 1–2 horas nas primeiras 6h do tratamento."
                />

                {parseFloat(kValue) < 3.3 && (
                  <AlertBox type="danger">
                    <strong>PROTOCOLO DE EMERGÊNCIA:</strong> Infundir KCl 10% (1 mEq/mL) diluído — máximo 40 mEq/h em acesso calibroso com monitorização cardíaca contínua. Reavalie K⁺ a cada hora.
                  </AlertBox>
                )}

                <div style={{
                  background: COLORS.card,
                  borderRadius: "12px",
                  padding: "16px",
                  marginTop: "8px",
                }}>
                  <p style={{ margin: "0 0 10px", fontSize: "0.8rem", fontWeight: 700, color: COLORS.textMuted, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    📊 Tabela de referência rápida
                  </p>
                  {[
                    { range: "< 3,3", action: "KCl 20–40 mEq/h · SEM insulina", color: COLORS.danger },
                    { range: "3,3 – 5,0", action: "KCl 20–30 mEq/L de hidratação · COM insulina", color: COLORS.success },
                    { range: "> 5,0", action: "SEM KCl · COM insulina · ECG contínuo", color: COLORS.warning },
                  ].map((row, i) => (
                    <div key={i} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 0",
                      borderBottom: i < 2 ? `1px solid ${COLORS.border}` : "none",
                      gap: "12px",
                    }}>
                      <span style={{ fontFamily: "monospace", fontWeight: 800, color: row.color, fontSize: "0.9rem", minWidth: "70px" }}>{row.range}</span>
                      <span style={{ fontSize: "0.78rem", color: COLORS.textMuted }}>{row.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!kDecision && (
              <AlertBox type="info">
                Insira o valor do K⁺ sérico para receber a recomendação de conduta.
              </AlertBox>
            )}
          </div>
        )}

        {/* ── INSULINA ── */}
        {tab === "insulin" && (
          <div>
            <SectionTitle icon="💉" children="Calculadora de Insulina EV" color={COLORS.accent2} />
            <AlertBox type="warning">
              ⚠️ Nunca iniciar insulina sem confirmar K⁺ &gt; 3,5 mEq/L. Confira na aba Potássio.
            </AlertBox>

            <InputField label="Peso do paciente" value={weight} onChange={setWeight} unit="kg" min={20} max={200} />
            <InputField label="Glicemia ATUAL (horária)" value={currentGlicemia} onChange={setCurrentGlicemia} unit="mg/dL" min={50} max={2000} />
            <InputField label="Glicemia ANTERIOR (hora passada)" value={lastGlicemia} onChange={setLastGlicemia} unit="mg/dL" min={50} max={2000} />

            {insulinDose && (
              <div style={{ marginTop: "16px" }}>
                <ResultCard
                  icon="💉"
                  title="Dose de Infusão Inicial"
                  value={`${insulinDose.infusion} U/h`}
                  unit=""
                  color={COLORS.accent2}
                  detail={`0,1 U/kg/h para ${weight} kg. Preparação: 100 U insulina regular em 100 mL SF 0,9% (1 U/mL).`}
                />
                <ResultCard
                  icon="🎯"
                  title="Dose Mínima (glicemia < 250)"
                  value={`${insulinDose.low} U/h`}
                  unit=""
                  color={COLORS.info}
                  detail={`0,02–0,05 U/kg/h. Usar quando glicemia < 200–250 mg/dL + adicionar SG5% para manter glicemia 150–200.`}
                />
              </div>
            )}

            {glicFall && (
              <div style={{ marginTop: "8px" }}>
                <ResultCard
                  icon="📉"
                  title="Queda Glicêmica na Última Hora"
                  value={`${glicFall.fall > 0 ? "-" : "+"}${Math.abs(glicFall.fall)} mg/dL`}
                  unit=""
                  color={glicFall.ok ? COLORS.success : COLORS.warning}
                  detail={
                    glicFall.ok ? "✅ Queda ideal (50–75 mg/dL/h). Manter taxa atual." :
                    glicFall.too_fast ? "⚠️ Queda muito rápida (>75 mg/dL/h). Reduzir taxa 30–50%." :
                    "⚠️ Queda insuficiente (<50 mg/dL/h). Dobrar taxa de infusão."
                  }
                  urgent={!glicFall.ok}
                />
              </div>
            )}

            <div style={{ background: COLORS.card, borderRadius: "12px", padding: "16px", marginTop: "12px" }}>
              <p style={{ margin: "0 0 10px", fontSize: "0.8rem", fontWeight: 700, color: COLORS.textMuted, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                🎯 Metas do Tratamento
              </p>
              {[
                { meta: "Queda glicêmica", alvo: "50–75 mg/dL/h", icon: "📉" },
                { meta: "Glicemia no tratamento", alvo: "150–200 mg/dL", icon: "🎯" },
                { meta: "K⁺ durante tratamento", alvo: "4,0–5,0 mEq/L", icon: "⚡" },
                { meta: "pH para resolução", alvo: "> 7,30", icon: "🫧" },
                { meta: "HCO₃⁻ para resolução", alvo: "> 18 mEq/L", icon: "🧪" },
                { meta: "AG para resolução", alvo: "< 12 mEq/L", icon: "🔬" },
              ].map((row, i) => (
                <div key={i} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "7px 0",
                  borderBottom: i < 5 ? `1px solid ${COLORS.border}` : "none",
                }}>
                  <span style={{ fontSize: "0.8rem", color: COLORS.textMuted }}>{row.icon} {row.meta}</span>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: COLORS.accent, fontFamily: "monospace" }}>{row.alvo}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TRANSIÇÃO ── */}
        {tab === "transition" && (
          <div>
            <SectionTitle icon="🔄" children="Transição EV → Subcutânea" color={COLORS.success} />
            <AlertBox type="danger">
              🔴 <strong>ERRO FATAL MAIS COMUM:</strong> Suspender EV antes de aplicar SC. Sempre sobrepor 1–2h.
            </AlertBox>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <InputField label="Insulina EV administrada" value={insulinEV} onChange={setInsulinEV} unit="U" min={0} max={500} hint="Total de unidades EV" />
              <InputField label="Horas de infusão" value={hoursEV} onChange={setHoursEV} unit="h" min={1} max={72} />
              <InputField label="pH atual" value={pHTransition} onChange={setPHTransition} unit="" min={6.5} max={7.8} step="0.01" dangerBelow={7.3} />
              <InputField label="HCO₃⁻ atual" value={hco3Transition} onChange={setHco3Transition} unit="mEq/L" min={1} max={40} dangerBelow={18} />
            </div>
            <InputField label="Ânion Gap atual" value={agTransition} onChange={setAgTransition} unit="mEq/L" min={0} max={40} dangerAbove={12} />

            {transition && (
              <div style={{ marginTop: "16px" }}>
                {/* Critérios */}
                <div style={{ background: COLORS.card, borderRadius: "12px", padding: "16px", marginBottom: "12px" }}>
                  <p style={{ margin: "0 0 12px", fontSize: "0.8rem", fontWeight: 700, color: COLORS.textMuted, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    ✅ Checklist de Resolução da CAD
                  </p>
                  {[
                    { key: "ph", label: "pH > 7,30", value: pHTransition },
                    { key: "hco3", label: "HCO₃⁻ > 18 mEq/L", value: hco3Transition },
                    { key: "ag", label: "AG < 12 mEq/L", value: agTransition },
                  ].map(item => {
                    const status = transition.criteria[item.key];
                    return (
                      <div key={item.key} style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 0",
                        borderBottom: `1px solid ${COLORS.border}`,
                      }}>
                        <span style={{ fontSize: "0.82rem", color: COLORS.text }}>{item.label}</span>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          {item.value && <span style={{ fontFamily: "monospace", color: COLORS.textMuted, fontSize: "0.8rem" }}>{item.value}</span>}
                          <span style={{ fontSize: "1rem" }}>
                            {status === null ? "⬜" : status ? "✅" : "❌"}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  <div style={{ marginTop: "12px" }}>
                    {transition.allMet ? (
                      <AlertBox type="success">
                        <strong>CAD RESOLVIDA</strong> — Critérios atingidos. Pode iniciar transição EV→SC se paciente acordado e tolerando VO.
                      </AlertBox>
                    ) : transition.anyFailed ? (
                      <AlertBox type="danger">
                        <strong>CAD NÃO RESOLVIDA</strong> — Manter insulina EV. Não iniciar transição.
                      </AlertBox>
                    ) : (
                      <AlertBox type="info">Preencha pH, HCO₃⁻ e AG para avaliação completa.</AlertBox>
                    )}
                  </div>
                </div>

                {/* Cálculo de dose SC */}
                {transition.ddt && (
                  <>
                    <ResultCard
                      icon="📊"
                      title="Dose Diária Total estimada (DDT)"
                      value={`${transition.ddt} U/dia`}
                      unit=""
                      color={COLORS.accent}
                      detail={`Baseado em ${insulinEV} U em ${hoursEV}h → ${(parseFloat(insulinEV)/parseFloat(hoursEV)).toFixed(1)} U/h × 24h`}
                    />
                    <ResultCard
                      icon="💉"
                      title="Insulina Basal SC sugerida"
                      value={`${transition.basal} U`}
                      unit=""
                      color={COLORS.success}
                      detail={`50% da DDT como basal (NPH 12/12h ou análogo 1x/dia). Restante como prandial. Ajustar conforme resposta.`}
                    />
                  </>
                )}

                <div style={{ background: COLORS.card, borderRadius: "12px", padding: "16px", marginTop: "8px" }}>
                  <p style={{ margin: "0 0 10px", fontSize: "0.8rem", fontWeight: 700, color: COLORS.success, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    🔄 Protocolo de Transição (passo a passo)
                  </p>
                  {[
                    "Confirmar TODOS os critérios de resolução (pH, HCO₃⁻, AG)",
                    "Paciente acordado, orientado e tolerando via oral",
                    "Calcular DDT baseado na taxa EV das últimas 6–8h",
                    "Aplicar insulina basal SC (50% da DDT)",
                    "⏰ Aguardar 1–2 HORAS com bomba EV ainda ligada",
                    "Somente ENTÃO suspender a infusão EV",
                    "Adicionar insulina prandial (ultrarrápida) nas refeições",
                    "Monitorar glicemia capilar 4/4h por 24h",
                  ].map((step, i) => (
                    <div key={i} style={{
                      display: "flex",
                      gap: "10px",
                      padding: "7px 0",
                      borderBottom: i < 7 ? `1px solid ${COLORS.border}` : "none",
                      alignItems: "flex-start",
                    }}>
                      <span style={{
                        minWidth: "24px",
                        height: "24px",
                        background: step.startsWith("⏰") ? `${COLORS.danger}22` : `${COLORS.success}22`,
                        color: step.startsWith("⏰") ? COLORS.danger : COLORS.success,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.7rem",
                        fontWeight: 800,
                      }}>{i + 1}</span>
                      <span style={{ fontSize: "0.8rem", color: step.startsWith("⏰") ? COLORS.danger : COLORS.text, fontWeight: step.startsWith("⏰") ? 700 : 400 }}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── GRAVIDADE ── */}
        {tab === "severity" && (
          <div>
            <SectionTitle icon="📊" children="Classificação de Gravidade" color={COLORS.warning} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <InputField label="pH arterial" value={ph} onChange={setPh} unit="" min={6.5} max={7.8} step="0.01" dangerBelow={7.0} />
              <InputField label="HCO₃⁻" value={hco3} onChange={setHco3} unit="mEq/L" dangerBelow={10} />
            </div>

            {severity ? (
              <div>
                <div style={{
                  background: `${severity.color}18`,
                  border: `2px solid ${severity.color}`,
                  borderRadius: "16px",
                  padding: "24px",
                  textAlign: "center",
                  marginBottom: "16px",
                }}>
                  <p style={{ margin: 0, fontSize: "0.7rem", color: COLORS.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700 }}>
                    Gravidade da CAD
                  </p>
                  <p style={{ margin: "8px 0", fontSize: "2.8rem", fontWeight: 900, color: severity.color }}>
                    {severity.level === "GRAVE" ? "🔴" : severity.level === "MODERADA" ? "🟡" : "🟢"}
                  </p>
                  <Badge color={severity.color}>{severity.level}</Badge>
                  {severity.uti && (
                    <p style={{ margin: "10px 0 0", color: COLORS.danger, fontWeight: 700, fontSize: "0.9rem" }}>
                      ⚠️ INDICAÇÃO DE UTI
                    </p>
                  )}
                </div>

                <div style={{ background: COLORS.card, borderRadius: "12px", padding: "16px" }}>
                  <p style={{ margin: "0 0 12px", fontSize: "0.8rem", fontWeight: 700, color: COLORS.textMuted, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    📋 Critérios de Classificação ADA
                  </p>
                  {[
                    { label: "pH", leve: "7,25–7,30", mod: "7,00–7,24", grave: "< 7,00" },
                    { label: "HCO₃⁻", leve: "15–18", mod: "10–14", grave: "< 10" },
                    { label: "Consciência", leve: "Alerta", mod: "Sonolento", grave: "Estupor/coma" },
                    { label: "Local", leve: "PS/Enf.", mod: "Internação", grave: "UTI" },
                  ].map((row, i) => (
                    <div key={i} style={{
                      display: "grid",
                      gridTemplateColumns: "80px 1fr 1fr 1fr",
                      gap: "8px",
                      padding: "8px 0",
                      borderBottom: i < 3 ? `1px solid ${COLORS.border}` : "none",
                      fontSize: "0.75rem",
                    }}>
                      <span style={{ color: COLORS.textMuted, fontWeight: 700 }}>{row.label}</span>
                      <span style={{ color: COLORS.success, textAlign: "center" }}>{row.leve}</span>
                      <span style={{ color: COLORS.warning, textAlign: "center" }}>{row.mod}</span>
                      <span style={{ color: COLORS.danger, textAlign: "center" }}>{row.grave}</span>
                    </div>
                  ))}
                  <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr 1fr", gap: "8px", marginTop: "8px" }}>
                    <span />
                    <Badge color={COLORS.success}>LEVE</Badge>
                    <Badge color={COLORS.warning}>MODERADA</Badge>
                    <Badge color={COLORS.danger}>GRAVE</Badge>
                  </div>
                </div>
              </div>
            ) : (
              <AlertBox type="info">Preencha pH e HCO₃⁻ para classificar a gravidade da CAD.</AlertBox>
            )}

            <div style={{ background: COLORS.card, borderRadius: "12px", padding: "16px", marginTop: "12px" }}>
              <p style={{ margin: "0 0 10px", fontSize: "0.8rem", fontWeight: 700, color: COLORS.danger, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                🚨 Outras Indicações de UTI
              </p>
              {[
                "Glasgow < 14 ou alteração do nível de consciência",
                "Hipotensão ou choque (PAS < 90 mmHg)",
                "Insuficiência respiratória (SatO₂ < 92%)",
                "Arritmia grave (hipocalemia com ECG alterado)",
                "IAM ou sepse grave como precipitante",
                "Idade > 65 anos com instabilidade",
              ].map((item, i) => (
                <div key={i} style={{
                  padding: "7px 0",
                  borderBottom: i < 5 ? `1px solid ${COLORS.border}` : "none",
                  fontSize: "0.8rem",
                  color: COLORS.text,
                }}>
                  🔴 {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: "32px",
          padding: "16px",
          background: COLORS.card,
          borderRadius: "12px",
          textAlign: "center",
          border: `1px solid ${COLORS.border}`,
        }}>
          <p style={{ margin: 0, fontSize: "0.68rem", color: COLORS.textDim, lineHeight: 1.6 }}>
            ⚠️ <strong style={{ color: COLORS.textMuted }}>Aviso clínico:</strong> Este simulador é uma ferramenta educacional de apoio à decisão.
            Todas as condutas devem ser ajustadas ao contexto clínico individual e protocolo institucional.
            Não substitui avaliação e julgamento médico.<br />
            <span style={{ color: COLORS.accent }}>🧬 Projeto Antigravity · Enciclomedia Médica</span>
          </p>
        </div>
      </div>
    </div>
  );
}
