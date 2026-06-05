document.addEventListener('DOMContentLoaded', () => {
  // Toggle Focus Mode
  const btnFocus = document.getElementById('btn-focus');
  if (btnFocus) {
    btnFocus.addEventListener('click', () => {
      document.body.classList.toggle('focus-mode');
      if (document.body.classList.contains('focus-mode')) {
        btnFocus.innerHTML = '✨';
        btnFocus.title = "Sair do Modo Foco";
      } else {
        btnFocus.innerHTML = '🧘';
        btnFocus.title = "Modo Foco";
      }
    });
  }

  // Toggle Arquitetura Drawer
  const btnDrawer = document.getElementById('btn-drawer');
  const drawer = document.getElementById('arquitetura-drawer');
  const btnCloseDrawer = document.getElementById('drawer-close');

  if (btnDrawer && drawer && btnCloseDrawer) {
    btnDrawer.addEventListener('click', () => {
      drawer.classList.add('open');
    });

    btnCloseDrawer.addEventListener('click', () => {
      drawer.classList.remove('open');
    });
  }

  // Simple Graph Mock initialization if D3 is available
  if (typeof d3 !== 'undefined' && document.getElementById('graph')) {
    const data = {
      nodes: [
        { id: "Antigravity", group: 1, radius: 20 },
        { id: "Medicina Intensiva", group: 2, radius: 15 },
        { id: "Medicina Interna", group: 3, radius: 15 },
        { id: "Ventilação Mecânica", group: 2, radius: 10 },
        { id: "Choque & DVA", group: 2, radius: 10 },
        { id: "AVC Agudo", group: 3, radius: 10 },
        { id: "TEMI", group: 4, radius: 12 },
        { id: "UpDown Hub", group: 5, radius: 12 }
      ],
      links: [
        { source: "Antigravity", target: "Medicina Intensiva" },
        { source: "Antigravity", target: "Medicina Interna" },
        { source: "Antigravity", target: "TEMI" },
        { source: "Antigravity", target: "UpDown Hub" },
        { source: "Medicina Intensiva", target: "Ventilação Mecânica" },
        { source: "Medicina Intensiva", target: "Choque & DVA" },
        { source: "Medicina Interna", target: "AVC Agudo" },
        { source: "TEMI", target: "Medicina Intensiva" }
      ]
    };

    const width = document.getElementById('graph').clientWidth;
    const height = 400;

    const svg = d3.select("#graph")
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", [0, 0, width, height]);

    const simulation = d3.forceSimulation(data.nodes)
      .force("link", d3.forceLink(data.links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .attr("stroke", "rgba(255,255,255,0.2)")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke-width", 2);

    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(data.nodes)
      .join("circle")
      .attr("r", d => d.radius)
      .attr("fill", d => {
        if (d.group === 1) return "#ffc107"; // root
        if (d.group === 2) return "#38bdf8"; // intensiva
        if (d.group === 3) return "#a78bfa"; // interna
        if (d.group === 4) return "#ef4444"; // temi
        return "#4ef0a1"; // updown
      })
      .call(drag(simulation));

    const text = svg.append("g")
      .selectAll("text")
      .data(data.nodes)
      .join("text")
      .text(d => d.id)
      .attr("font-size", 10)
      .attr("fill", "#94a3b8")
      .attr("dx", 15)
      .attr("dy", 4);

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("cx", d => Math.max(d.radius, Math.min(width - d.radius, d.x)))
        .attr("cy", d => Math.max(d.radius, Math.min(height - d.radius, d.y)));
        
      text
        .attr("x", d => Math.max(d.radius, Math.min(width - d.radius, d.x)))
        .attr("y", d => Math.max(d.radius, Math.min(height - d.radius, d.y)));
    });

    function drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
  }
});
