// Patch opcional para homepage da Enciclopédia Médica Intensiva
// Uso: importe ou cole este objeto no array global de módulos da página principal.
window.ENCICLOPEDIA_MODULES = window.ENCICLOPEDIA_MODULES || [];
window.ENCICLOPEDIA_MODULES.push({
  id: "respirasense-icu",
  title: "RespiraSense ICU",
  subtitle: "Calculadora respiratória, VM protetora, gasometria e ARDS/SARA",
  emoji: "🫁",
  href: "./respirasense-icu/index.html",
  category: "Calculadoras UTI",
  tags: ["UTI", "Ventilação Mecânica", "Gasometria", "SARA", "ARDS", "ROX", "P/F", "Driving Pressure", "CBAF", "VNI", "TEMI"],
  status: "PWA offline",
  priority: 10,
  related: ["ventilacao-mecanica", "gasometria", "sara-ards", "banco-questoes-temi"]
});
