document.addEventListener("DOMContentLoaded", async () => {
  // Fetch manifest data
  let topicData = {};
  
  try {
    const response = await fetch("06_Infra_Site_E_Assets/data/home-manifest.json");
    if (response.ok) {
      const data = await response.json();
      topicData = data.topicData;
    } else {
      console.warn("Failed to load home-manifest.json");
    }
  } catch (err) {
    console.warn("CORS or network error fetching home-manifest.json. Are you running locally via file://? Use Live Server.", err);
  }

  const drawer = document.getElementById('drawer');
  const drawerTitle = document.getElementById('drawerTitle');
  const drawerText = document.getElementById('drawerText');
  const drawerTags = document.getElementById('drawerTags');
  const drawerClose = document.getElementById('drawerClose');

  function openDrawer(data) {
    if (!data) return;
    drawerTitle.textContent = data.title || "Tema";
    drawerText.textContent = data.text || "Detalhes do tema.";
    drawerTags.innerHTML = (data.tags || []).map(tag => `<span class="ag-tag">${tag}</span>`).join('');
    drawer.classList.add('open');
  }

  // Interactivity for Knowledge Graph Nodes
  document.querySelectorAll('[data-node]').forEach(node => {
    node.addEventListener('click', () => {
      if(topicData[node.dataset.node]) {
        openDrawer(topicData[node.dataset.node]);
      }
    });
  });

  // Interactivity for Topic Items (Search Box)
  document.querySelectorAll('.topic-item').forEach(item => {
    item.addEventListener('click', () => {
      const title = item.querySelector('strong').textContent;
      const text = item.querySelector('span').textContent;
      const tags = (item.dataset.topic || "").split(' ').slice(0, 5);
      openDrawer({ 
        title, 
        text: `${text} Este item deve virar uma subpágina interligada ao hub de AVC Agudo e aos módulos de Medicina Intensiva/Interna.`, 
        tags 
      });
    });
  });

  if(drawerClose) {
    drawerClose.addEventListener('click', () => drawer.classList.remove('open'));
  }

  // Search filter
  const topicSearch = document.getElementById('topicSearch');
  const topicList = document.getElementById('topicList');
  if(topicSearch && topicList) {
    topicSearch.addEventListener('input', () => {
      const q = topicSearch.value.trim().toLowerCase();
      topicList.querySelectorAll('.topic-item').forEach(item => {
        const text = item.textContent.toLowerCase() + ' ' + (item.dataset.topic || '').toLowerCase();
        item.style.display = text.includes(q) ? 'block' : 'none';
      });
    });
  }

  // Filters for via sections
  document.querySelectorAll('[data-filter]').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const filter = chip.dataset.filter.toLowerCase();
      if(topicSearch) {
        topicSearch.value = filter;
        topicSearch.dispatchEvent(new Event('input'));
      }
      const avcSection = document.getElementById('avc');
      if(avcSection) {
        avcSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Floating Accessibility Buttons
  const focusBtn = document.getElementById('focusToggle');
  if(focusBtn) {
    focusBtn.addEventListener('click', () => {
      document.body.classList.toggle('focus-mode');
    });
  }

  const topBtn = document.getElementById('topButton');
  if(topBtn) {
    topBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});
