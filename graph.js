/**
 * graph.js — 图数据结构 & SVG 绘制引擎
 * 为 GNN 交互式图解提供所有图可视化
 */

// ===== 工具函数 =====
const SVG_NS = 'http://www.w3.org/2000/svg';

function createSVG(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

// 颜色方案
const COLORS = {
  cyan: '#00d4ff', purple: '#a855f7', pink: '#ec4899',
  green: '#22c55e', orange: '#f97316', yellow: '#eab308',
  red: '#ef4444', blue: '#3b82f6',
};
const NODE_COLORS = [COLORS.cyan, COLORS.purple, COLORS.pink, COLORS.green, COLORS.orange, COLORS.yellow, COLORS.red, COLORS.blue];

// ===== Tooltip =====
const tooltip = document.createElement('div');
tooltip.className = 'g-tooltip';
document.body.appendChild(tooltip);

function showTooltip(e, html) {
  tooltip.innerHTML = html;
  tooltip.classList.add('show');
  tooltip.style.left = (e.clientX + 12) + 'px';
  tooltip.style.top = (e.clientY - 10) + 'px';
}
function hideTooltip() { tooltip.classList.remove('show'); }

// ===== 图绘制基类 =====
class GraphRenderer {
  constructor(svgId) {
    this.svg = document.getElementById(svgId);
    if (!this.svg) return;
    this.nodes = [];
    this.edges = [];
  }

  clear() {
    if (this.svg) this.svg.innerHTML = '';
  }

  drawEdge(x1, y1, x2, y2, color = 'rgba(255,255,255,0.15)', width = 2, dasharray = '') {
    const line = createSVG('line', {
      x1, y1, x2, y2, stroke: color, 'stroke-width': width,
      class: 'svg-edge', 'stroke-dasharray': dasharray,
    });
    this.svg.appendChild(line);
    return line;
  }

  drawNode(x, y, r, color, label, id, meta = '') {
    const g = createSVG('g', { class: 'svg-node', 'data-id': id });
    const circle = createSVG('circle', {
      cx: x, cy: y, r, fill: color, stroke: '#fff', 'stroke-width': 2, opacity: 0.9,
    });
    const text = createSVG('text', {
      x, y: +y + 1, class: 'svg-node-label', 'font-size': r > 20 ? 13 : 10,
    });
    text.textContent = label;
    g.appendChild(circle);
    g.appendChild(text);
    this.svg.appendChild(g);

    // tooltip
    g.addEventListener('mouseenter', (e) => showTooltip(e, `<b>${label}</b>${meta ? '<br>' + meta : ''}`));
    g.addEventListener('mousemove', (e) => {
      tooltip.style.left = (e.clientX + 12) + 'px';
      tooltip.style.top = (e.clientY - 10) + 'px';
    });
    g.addEventListener('mouseleave', hideTooltip);
    return { g, circle, text };
  }
}

// ===== 1. 社交网络图 =====
function drawSocialGraph() {
  const r = new GraphRenderer('social-graph');
  if (!r.svg) return;
  r.clear();

  const people = [
    { id: 0, name: 'Alice', x: 200, y: 60, color: COLORS.cyan },
    { id: 1, name: 'Bob', x: 100, y: 140, color: COLORS.purple },
    { id: 2, name: 'Carol', x: 300, y: 140, color: COLORS.pink },
    { id: 3, name: 'Dave', x: 60, y: 240, color: COLORS.green },
    { id: 4, name: 'Eve', x: 200, y: 240, color: COLORS.orange },
    { id: 5, name: 'Frank', x: 340, y: 240, color: COLORS.yellow },
  ];
  const rels = [[0,1],[0,2],[1,2],[1,3],[2,5],[3,4],[4,5],[1,4]];

  rels.forEach(([a, b]) => {
    r.drawEdge(people[a].x, people[a].y, people[b].x, people[b].y, 'rgba(168,85,247,0.3)', 2);
  });
  people.forEach(p => {
    r.drawNode(p.x, p.y, 22, p.color, p.name.charAt(0), p.id, `name: ${p.name}<br>age: ${20 + p.id * 5}`);
  });
}

// ===== 2. 分子图 (H2O + CH4 近似) =====
function drawMoleculeGraph() {
  const r = new GraphRenderer('molecule-graph');
  if (!r.svg) return;
  r.clear();

  const atoms = [
    { id: 0, elem: 'C', x: 200, y: 150, color: '#555' },
    { id: 1, elem: 'H', x: 120, y: 80, color: '#eee' },
    { id: 2, elem: 'H', x: 280, y: 80, color: '#eee' },
    { id: 3, elem: 'H', x: 120, y: 220, color: '#eee' },
    { id: 4, elem: 'H', x: 280, y: 220, color: '#eee' },
  ];
  const bonds = [[0,1],[0,2],[0,3],[0,4]];

  bonds.forEach(([a, b]) => {
    r.drawEdge(atoms[a].x, atoms[a].y, atoms[b].x, atoms[b].y, 'rgba(255,255,255,0.25)', 3);
  });
  atoms.forEach(a => {
    r.drawNode(a.x, a.y, a.elem === 'C' ? 28 : 20, a.color, a.elem, a.id,
      `element: ${a.elem}<br>valence: ${a.elem === 'C' ? 4 : 1}`);
  });
}

// ===== 3. 引用网络 =====
function drawCitationGraph() {
  const r = new GraphRenderer('citation-graph');
  if (!r.svg) return;
  r.clear();

  const papers = [
    { id: 0, title: 'GCN', x: 200, y: 60, color: COLORS.cyan },
    { id: 1, title: 'GAT', x: 100, y: 150, color: COLORS.purple },
    { id: 2, title: 'GraphSAGE', x: 300, y: 150, color: COLORS.pink },
    { id: 3, title: 'GIN', x: 60, y: 240, color: COLORS.green },
    { id: 4, title: 'MPNN', x: 200, y: 240, color: COLORS.orange },
    { id: 5, title: 'ChebNet', x: 340, y: 240, color: COLORS.yellow },
  ];
  const cites = [[3,1],[4,0],[4,2],[1,0],[2,0],[5,0]];

  // directed edges (arrow-like with opacity gradient)
  cites.forEach(([from, to]) => {
    r.drawEdge(papers[from].x, papers[from].y, papers[to].x, papers[to].y, 'rgba(0,212,255,0.2)', 1.5);
  });
  papers.forEach(p => {
    r.drawNode(p.x, p.y, 20, p.color, p.title.substring(0, 3), p.id, `paper: ${p.title}`);
  });
}

// ===== 4. 表示方法图 + 矩阵 =====
function drawRepGraph() {
  const r = new GraphRenderer('rep-graph');
  if (!r.svg) return;
  r.clear();

  const nodes = [
    { id: 0, x: 160, y: 50, label: '0' },
    { id: 1, x: 60, y: 140, label: '1' },
    { id: 2, x: 260, y: 140, label: '2' },
    { id: 3, x: 100, y: 260, label: '3' },
    { id: 4, x: 220, y: 260, label: '4' },
  ];
  const edges = [[0,1],[0,2],[1,2],[1,3],[2,4],[3,4]];

  edges.forEach(([a, b]) => {
    r.drawEdge(nodes[a].x, nodes[a].y, nodes[b].x, nodes[b].y, 'rgba(168,85,247,0.35)', 2);
  });
  nodes.forEach(n => {
    r.drawNode(n.x, n.y, 22, NODE_COLORS[n.id], n.label, n.id);
  });
}

function buildMatrices() {
  // Adjacency matrix for the rep graph
  const A = [
    [0,1,1,0,0],
    [1,0,1,1,0],
    [1,1,0,0,1],
    [0,1,0,0,1],
    [0,0,1,1,0],
  ];
  // Feature matrix (2D features for display)
  const X = [
    [0.9, 0.2],
    [0.1, 0.8],
    [0.7, 0.5],
    [0.3, 0.9],
    [0.6, 0.1],
  ];
  // Degree matrix
  const D = A.map((row, i) => row.map((v, j) => i === j ? row.reduce((s, x) => s + x, 0) : 0));

  function renderGrid(containerId, matrix, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const n = matrix.length;
    const m = matrix[0].length;
    container.style.gridTemplateColumns = `repeat(${m}, 40px)`;
    container.innerHTML = '';
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        const cell = document.createElement('div');
        cell.className = 'matrix-cell';
        const v = matrix[i][j];
        if (type === 'adj') {
          cell.textContent = v;
          cell.classList.add(v === 1 ? 'one' : 'zero');
          if (i === j) cell.classList.add('diag');
        } else if (type === 'feat') {
          cell.textContent = v.toFixed(1);
          cell.classList.add('val');
        } else {
          cell.textContent = v;
          if (i === j && v > 0) cell.classList.add('diag');
          else cell.classList.add('zero');
        }
        container.appendChild(cell);
      }
    }
  }

  renderGrid('adj-grid', A, 'adj');
  renderGrid('feat-grid', X, 'feat');
  renderGrid('deg-grid', D, 'deg');
}

// matrix tab switching
function initMatrixTabs() {
  const tabs = document.querySelectorAll('.matrix-tab');
  const displays = ['matrix-adj', 'matrix-feat', 'matrix-deg'];
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      displays.forEach((id, j) => {
        const el = document.getElementById(id);
        if (el) el.classList.toggle('hidden', i !== j);
      });
    });
  });
}

// ===== 5. 消息传递图 =====
function drawMPGraph() {
  const r = new GraphRenderer('mp-graph');
  if (!r.svg) return;
  r.clear();

  // Central node + 4 neighbors
  const cx = 250, cy = 200;
  const neighbors = [
    { id: 1, x: 130, y: 100, label: 'A' },
    { id: 2, x: 370, y: 100, label: 'B' },
    { id: 3, x: 130, y: 300, label: 'C' },
    { id: 4, x: 370, y: 300, label: 'D' },
  ];
  const center = { id: 0, x: cx, y: cy, label: 'v' };

  // edges
  neighbors.forEach(n => {
    const edge = r.drawEdge(cx, cy, n.x, n.y, 'rgba(0,212,255,0.25)', 2);
    edge.classList.add('mp-edge');
    edge.dataset.from = n.id;
    edge.dataset.to = 0;
  });

  // neighbor nodes
  neighbors.forEach(n => {
    const { circle } = r.drawNode(n.x, n.y, 24, COLORS.purple, n.label, n.id, `h_${n.label} = [0.${n.id}, 0.${5-n.id}]`);
    circle.classList.add('mp-node');
    circle.dataset.id = n.id;
  });

  // center node
  const { circle: centerCircle } = r.drawNode(cx, cy, 30, COLORS.cyan, 'v', 0, 'h_v = [0.5, 0.5]');
  centerCircle.classList.add('mp-node-center');
  centerCircle.dataset.id = 0;
}

// ===== 6. GCN 可视化矩阵 =====
function drawGCNMatrices() {
  const size = 4; // 4x4 for display
  function createMatVis(containerId, data, highlight) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.style.gridTemplateColumns = `repeat(${data[0].length}, 28px)`;
    el.innerHTML = '';
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[0].length; j++) {
        const cell = document.createElement('div');
        cell.className = 'mat-cell';
        cell.textContent = typeof data[i][j] === 'number' ? data[i][j].toFixed(1) : data[i][j];
        if (highlight && highlight(i, j)) cell.classList.add('active');
        el.appendChild(cell);
      }
    }
  }

  const A_norm = [
    [0.33, 0.25, 0.25, 0.00],
    [0.25, 0.25, 0.00, 0.33],
    [0.25, 0.00, 0.33, 0.25],
    [0.00, 0.33, 0.25, 0.25],
  ];
  const H = [
    [0.9, 0.2],
    [0.1, 0.8],
    [0.7, 0.5],
    [0.3, 0.9],
  ];
  const W = [
    [0.5, 0.3, 0.8],
    [0.2, 0.7, 0.1],
  ];
  const H_out = [
    [0.6, 0.5, 0.8],
    [0.3, 0.7, 0.2],
    [0.6, 0.4, 0.7],
    [0.4, 0.8, 0.3],
  ];

  createMatVis('gcn-adj-vis', A_norm);
  createMatVis('gcn-feat-vis', H);
  createMatVis('gcn-weight-vis', W);
  createMatVis('gcn-output-vis', H_out, (i, j) => true);
}

// ===== 7. GAT 对比图 =====
function drawGATComparison() {
  // GCN side (fixed weights)
  const gcnSvg = document.getElementById('gcn-vs-diagram');
  if (gcnSvg) {
    gcnSvg.innerHTML = '';
    const nodes = [
      { x: 150, y: 50, c: COLORS.cyan },
      { x: 70, y: 140, c: COLORS.purple },
      { x: 230, y: 140, c: COLORS.purple },
      { x: 150, y: 220, c: COLORS.purple },
    ];
    [[0,1],[0,2],[0,3]].forEach(([a, b]) => {
      const line = createSVG('line', {
        x1: nodes[a].x, y1: nodes[a].y, x2: nodes[b].x, y2: nodes[b].y,
        stroke: 'rgba(168,85,247,0.4)', 'stroke-width': 4,
      });
      gcnSvg.appendChild(line);
      // weight label
      const mx = (nodes[a].x + nodes[b].x) / 2;
      const my = (nodes[a].y + nodes[b].y) / 2;
      const t = createSVG('text', {
        x: mx, y: my - 8, 'text-anchor': 'middle', fill: '#888',
        'font-family': "'JetBrains Mono'", 'font-size': '11',
      });
      t.textContent = '1/3';
      gcnSvg.appendChild(t);
    });
    nodes.forEach(n => {
      const c = createSVG('circle', { cx: n.x, cy: n.y, r: 18, fill: n.c, opacity: 0.9 });
      gcnSvg.appendChild(c);
    });
  }

  // GAT side (different attention weights)
  const gatSvg = document.getElementById('gat-vs-diagram');
  if (gatSvg) {
    gatSvg.innerHTML = '';
    const nodes = [
      { x: 150, y: 50, c: COLORS.cyan },
      { x: 70, y: 140, c: COLORS.purple },
      { x: 230, y: 140, c: COLORS.purple },
      { x: 150, y: 220, c: COLORS.purple },
    ];
    const attns = [0.6, 0.1, 0.3]; // attention weights
    const widths = attns.map(a => a * 12 + 1);
    [[0,1],[0,2],[0,3]].forEach(([a, b], i) => {
      const line = createSVG('line', {
        x1: nodes[a].x, y1: nodes[a].y, x2: nodes[b].x, y2: nodes[b].y,
        stroke: `rgba(0,212,255,${attns[i]})`, 'stroke-width': widths[i],
      });
      gatSvg.appendChild(line);
      const mx = (nodes[a].x + nodes[b].x) / 2;
      const my = (nodes[a].y + nodes[b].y) / 2;
      const t = createSVG('text', {
        x: mx + 12, y: my - 4, 'text-anchor': 'middle', fill: COLORS.cyan,
        'font-family': "'JetBrains Mono'", 'font-size': '11', 'font-weight': '700',
      });
      t.textContent = `α=${attns[i].toFixed(1)}`;
      gatSvg.appendChild(t);
    });
    nodes.forEach(n => {
      const c = createSVG('circle', { cx: n.x, cy: n.y, r: 18, fill: n.c, opacity: 0.9 });
      gatSvg.appendChild(c);
    });
  }
}

// ===== 8. GAT 注意力动画图 =====
function drawGATAttentionVis() {
  const r = new GraphRenderer('gat-attention-vis');
  if (!r.svg) return;
  r.clear();

  const cx = 300, cy = 150;
  const neighbors = [
    { id: 1, x: 100, y: 80, label: 'A', attn: 0.5 },
    { id: 2, x: 100, y: 220, label: 'B', attn: 0.2 },
    { id: 3, x: 500, y: 80, label: 'C', attn: 0.1 },
    { id: 4, x: 500, y: 220, label: 'D', attn: 0.2 },
  ];

  neighbors.forEach(n => {
    const w = n.attn * 10 + 1;
    const opacity = 0.3 + n.attn * 0.7;
    const edge = r.drawEdge(n.x, n.y, cx, cy, `rgba(0,212,255,${opacity})`, w);
    edge.classList.add('gat-edge');
    edge.dataset.attn = n.attn;

    const mx = (n.x + cx) / 2;
    const my = (n.y + cy) / 2;
    const label = createSVG('text', {
      x: mx + (n.x < cx ? -15 : 15), y: my,
      'text-anchor': 'middle', fill: COLORS.cyan,
      'font-family': "'JetBrains Mono'", 'font-size': '12', 'font-weight': '700',
      class: 'gat-attn-label',
    });
    label.textContent = `α=${n.attn}`;
    r.svg.appendChild(label);
  });

  neighbors.forEach(n => {
    r.drawNode(n.x, n.y, 22, COLORS.purple, n.label, n.id);
  });
  r.drawNode(cx, cy, 28, COLORS.cyan, 'i', 0);
}

// ===== 9. 应用任务图 =====
function drawAppNodeGraph() {
  const r = new GraphRenderer('app-node-graph');
  if (!r.svg) return;
  r.clear();

  const classColors = [COLORS.cyan, COLORS.pink, COLORS.green];
  const nodes = [
    { x: 175, y: 45, cls: 0 }, { x: 80, y: 110, cls: 0 },
    { x: 270, y: 110, cls: 1 }, { x: 50, y: 200, cls: 1 },
    { x: 175, y: 200, cls: 2 }, { x: 300, y: 200, cls: 2 },
  ];
  const edges = [[0,1],[0,2],[1,3],[2,5],[3,4],[4,5],[1,4],[2,4]];
  edges.forEach(([a, b]) => r.drawEdge(nodes[a].x, nodes[a].y, nodes[b].x, nodes[b].y, 'rgba(255,255,255,0.15)', 1.5));
  nodes.forEach((n, i) => r.drawNode(n.x, n.y, 18, classColors[n.cls], '', i, `class: ${n.cls}`));
}

function drawAppGraphGraph() {
  const r = new GraphRenderer('app-graph-graph');
  if (!r.svg) return;
  r.clear();

  // Two small graphs for graph classification
  function miniGraph(ox, oy, color) {
    const ns = [
      { x: ox, y: oy - 30 }, { x: ox - 30, y: oy + 20 },
      { x: ox + 30, y: oy + 20 },
    ];
    [[0,1],[1,2],[2,0]].forEach(([a, b]) => r.drawEdge(ns[a].x, ns[a].y, ns[b].x, ns[b].y, `${color}44`, 2));
    ns.forEach(n => r.drawNode(n.x, n.y, 14, color, '', ''));
  }
  miniGraph(100, 120, COLORS.cyan);
  miniGraph(250, 120, COLORS.pink);

  // labels
  const t1 = createSVG('text', { x: 100, y: 200, 'text-anchor': 'middle', fill: COLORS.cyan, 'font-size': '13', 'font-weight': '700' });
  t1.textContent = 'Graph A → 类别 0';
  r.svg.appendChild(t1);
  const t2 = createSVG('text', { x: 250, y: 200, 'text-anchor': 'middle', fill: COLORS.pink, 'font-size': '13', 'font-weight': '700' });
  t2.textContent = 'Graph B → 类别 1';
  r.svg.appendChild(t2);

  // Readout arrow
  const pool = createSVG('text', { x: 175, y: 250, 'text-anchor': 'middle', fill: '#888', 'font-size': '11', 'font-family': "'JetBrains Mono'" });
  pool.textContent = 'READOUT: h_G = Σ h_v';
  r.svg.appendChild(pool);
}

function drawAppLinkGraph() {
  const r = new GraphRenderer('app-link-graph');
  if (!r.svg) return;
  r.clear();

  const nodes = [
    { x: 100, y: 80 }, { x: 250, y: 80 },
    { x: 70, y: 200 }, { x: 175, y: 200 }, { x: 280, y: 200 },
  ];
  const existing = [[0,1],[0,2],[1,4],[2,3],[3,4]];
  existing.forEach(([a, b]) => r.drawEdge(nodes[a].x, nodes[a].y, nodes[b].x, nodes[b].y, 'rgba(255,255,255,0.2)', 2));

  // missing link (prediction)
  const missing = r.drawEdge(nodes[0].x, nodes[0].y, nodes[4].x, nodes[4].y, COLORS.cyan, 2, '6 4');
  missing.classList.add('link-pred');

  nodes.forEach((n, i) => r.drawNode(n.x, n.y, 18, i < 2 ? COLORS.cyan : COLORS.purple, '', i));

  // question mark on missing edge
  const mx = (nodes[0].x + nodes[4].x) / 2;
  const my = (nodes[0].y + nodes[4].y) / 2;
  const q = createSVG('text', {
    x: mx, y: my - 10, 'text-anchor': 'middle', fill: COLORS.cyan,
    'font-size': '18', 'font-weight': '900',
  });
  q.textContent = '?';
  r.svg.appendChild(q);
}

// ===== 粒子背景 =====
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.r = Math.random() * 1.5 + 0.5;
      this.alpha = Math.random() * 0.3 + 0.1;
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > w) this.vx *= -1;
      if (this.y < 0 || this.y > h) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,212,255,${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 80; i++) particles.push(new Particle());

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,212,255,${0.06 * (1 - dist / 150)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(animate);
  }
  animate();
}

// ===== 全局初始化 =====
function initAllGraphs() {
  drawSocialGraph();
  drawMoleculeGraph();
  drawCitationGraph();
  drawRepGraph();
  buildMatrices();
  initMatrixTabs();
  drawMPGraph();
  drawGCNMatrices();
  drawGATComparison();
  drawGATAttentionVis();
  drawAppNodeGraph();
  drawAppGraphGraph();
  drawAppLinkGraph();
}

document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initAllGraphs();
});