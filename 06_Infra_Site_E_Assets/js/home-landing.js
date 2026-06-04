const antigravityNodes = {
  updown: {
    title: "↕️ UpDown Hub",
    text: "Transforma artigos, diretrizes, PDFs e aulas em revisões didáticas, sem cópia literal, com resumo, fluxos, flashcards, questões, mnemônicos e modo leitor.",
    tags: ["Markdown", "Revisão", "TEMI", "R3"]
  },
  biblioteca: {
    title: "📚 Biblioteca IA",
    text: "Acervo de documentos originais: PDFs, DOCX, protocolos, diretrizes e materiais de referência organizados para consulta e integração.",
    tags: ["PDF", "DOCX", "Protocolos", "Fontes"]
  },
  imagens: {
    title: "🖼️ Imagens e Feed",
    text: "Central de cards, infográficos, mapas visuais, fluxogramas e imagens 1080x1920 para revisão rápida e uso no plantão.",
    tags: ["Cards", "Infográficos", "POCUS", "Plantão"]
  },
  apps: {
    title: "🧮 Apps e Calculadoras",
    text: "Ferramentas práticas para UTI, enfermaria e emergência: escores, drogas vasoativas, ventilação, eletrólitos e algoritmos clínicos.",
    tags: ["Calculadoras", "UTI", "Emergência", "Escores"]
  },
  temi: {
    title: "🏆 Trilha TEMI",
    text: "Módulo de preparação para título em Terapia Intensiva, com questões, pegadinhas, casos, trials clássicos e revisão espaçada.",
    tags: ["TEMI", "AMIB", "UTI", "Prova"]
  },
  r3: {
    title: "🧠 Trilha R3 Clínica Médica",
    text: "Preparação para R3 e prática de Medicina Interna avançada, com diagnóstico diferencial, síndromes, casos e raciocínio clínico.",
    tags: ["R3", "Clínica Médica", "DDx", "Enfermaria"]
  }
};

function openAgDrawer(key) {
  const data = antigravityNodes[key];
  if (!data) return;

  const drawer = document.querySelector("#ag-drawer");
  const title = document.querySelector("#ag-drawer-title");
  const text = document.querySelector("#ag-drawer-text");
  const tags = document.querySelector("#ag-drawer-tags");

  title.textContent = data.title;
  text.textContent = data.text;
  tags.innerHTML = data.tags.map(tag => `<span class="ag-tag">${tag}</span>`).join("");
  drawer.classList.add("open");
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-ag-node]").forEach(button => {
    button.addEventListener("click", () => openAgDrawer(button.dataset.agNode));
  });

  const close = document.querySelector("#ag-drawer-close");
  if (close) {
    close.addEventListener("click", () => {
      document.querySelector("#ag-drawer").classList.remove("open");
    });
  }

  const topButton = document.querySelector("#ag-top");
  if (topButton) {
    topButton.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
});
